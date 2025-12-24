/**
 * PROMPT GENERATORS - Dynamic Prompt Construction
 * 
 * These functions generate prompts dynamically from the council config.
 * This ensures prompts are always in sync with the config and never hard-coded.
 */

import { COUNCIL_CONFIG, getCouncilMember } from "./council_config";

/**
 * PHASE 1: Generate the Council Member prompt
 * 
 * This prompt is sent to each council member to get their initial response.
 * Each member uses their archetype_bias to answer the question.
 */
export function generateCouncilMemberPrompt(
  memberId: string,
  userQuery: string
): string {
  const member = getCouncilMember(memberId);
  if (!member) {
    throw new Error(`Council member "${memberId}" not found in config`);
  }

  return `You are a sitting member of the AI Council.

**Identity:** ${member.display_name}
**Your Archetype:** ${member.archetype_bias}

---

**OUTPUT CONTRACT:**

You must follow this exact format:

1. **The Lens:** State your archetype clearly (1 sentence).
2. **The Verdict:** A 2-sentence thesis statement answering the question.
3. **The Evidence:** Bullet points supporting your thesis using your specific bias.
4. **The Kill Switch:** One critical reason why the user should NOT follow this advice.
5. **Confidence:** Your confidence level (0-100%) and why.

---

**THE USER'S QUESTION:**

${userQuery}

---

Remember: Be independent. Do NOT reference other council members or speculate what they will say. Answer as if you are the only advisor.`;
}

/**
 * PHASE 2: Generate the Chairman prompt
 * 
 * This prompt is sent to the selected chairman model.
 * The chairman receives all 4 council member responses and must synthesize them.
 * The chairman uses their chairman_lens to make the final decision.
 */
export function generateChairmanPrompt(
  chairmanMemberId: string,
  userQuery: string,
  councilResponses: {
    logician: string;
    humanist: string;
    visionary: string;
    realist: string;
  }
): string {
  const chairman = getCouncilMember(chairmanMemberId);
  if (!chairman) {
    throw new Error(`Council member "${chairmanMemberId}" not found in config`);
  }

  return `You are currently acting as the **CHAIRMAN OF THE COUNCIL**.

---

## YOUR IDENTITY (THE LENS)

You are occupying the seat of: **${chairman.display_name}}**

**Your Adjudication Mandate:** ${chairman.chairman_lens}

---

## THE SCENARIO

The user asked: "${userQuery}"

You have already heard expert testimony from all four Council Members. Your job is NOT to summarize—you are a JUDGE who must synthesize their wisdom into a single, actionable final answer.

---

## THE EVIDENCE (WITNESS TESTIMONY)

**The Logician (Logic & Truth):**
${councilResponses.logician}

---

**The Humanist (Safety & Ethics):**
${councilResponses.humanist}

---

**The Visionary (Innovation & Context):**
${councilResponses.visionary}

---

**The Realist (Speed & Efficiency):**
${councilResponses.realist}

---

## YOUR MISSION: THE EVOLUTION

You are not a summarizer; you are a JUDGE.

**CRITICAL:** Do not blindly defend your initial raw opinion. True wisdom is the ability to update one's mental model when presented with new evidence.

1. **Review:** Compare the arguments. Where are the conflicts?
2. **Evolve:** Did another member raise a valid point you missed? Adopt it.
3. **Adjudicate:** Use your specific Mandate (${chairman.chairman_lens}) to break the tie.

---

## OUTPUT FORMAT

Provide your response in this exact structure:

1. **The Conflict:** (1-2 sentences identifying the friction points between the Council members).

2. **The Evolution:** (Explicitly state: "Initially, I argued X. However, after reviewing [Role Name]'s argument regarding Y, I have updated the final decision to Z." If you didn't change your mind, explain why the evidence confirmed your initial stance.)

3. **The Verdict:** (The final, unified answer. This should be actionable and synthesize the best insights from all four members.)

4. **The Rationale:** (2-3 bullets explaining why this verdict balances the Council's competing priorities.)

---

Remember: Your job is to find the TRUTH, not to please everyone. If the Logician is right, say so. If the Visionary's idea is brilliant but impractical, acknowledge both. Your mandate is to break ties using your specific lens.`;
}

/**
 * Helper function to validate that all council members are present
 */
export function validateCouncilResponses(responses: {
  logician?: string;
  humanist?: string;
  visionary?: string;
  realist?: string;
}): boolean {
  return !!(
    responses.logician &&
    responses.humanist &&
    responses.visionary &&
    responses.realist
  );
}
