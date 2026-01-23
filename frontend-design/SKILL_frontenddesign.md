---
name: antigravity-frontend-design
version: 3.2
description: Master frontend design skill for Antigravity. Produces elite, production-grade frontend interfaces optimized for engagement, usability, and decisive action. Integrates behavioral science, modern UX research, mobile/desktop best practices, and opinionated visual design while avoiding generic AI aesthetics.
license: See LICENSE.txt
scope: frontend | ui | ux | behavioral-design | interaction-design
---

# Antigravity Frontend Design Skill — Master Specification

---

## 1. Core Mandate

This skill designs **interfaces that work on the human nervous system**.

Not just visually impressive.  
Not just usable.  
But **psychologically aligned, behaviorally effective, and operationally excellent**.

Every interface must satisfy **three simultaneous criteria**:

1. **Engagement** – Capture and hold attention  
2. **Clarity** – Reduce cognitive effort  
3. **Action** – Enable confident decision-making  

Failure in any one dimension is unacceptable.

---

## 2. Design Context Classification (Critical)

Before any design or code is produced, the interface MUST be classified into one of the following **context modes**.

This classification governs all downstream decisions.

### Mode A — Behavioral / Marketing Interfaces  
**Examples:** Websites, Landing pages, Funnels, Sales pages  

**Primary Objective:**  
> **Trigger belief, motivation, and action**

---

### Mode B — Product / Application Interfaces  
**Examples:** SaaS dashboards, Internal tools, Mobile apps, Admin panels  

**Primary Objective:**  
> **Enable speed, accuracy, and sustained usability**

---

### Mode C — Hybrid Interfaces  
**Examples:** Onboarding flows, Activation screens, Upgrade / paywall experiences  

**Primary Objective:**  
> **Transition users from curiosity to commitment**

---

## 3. Global Non-Negotiable Principles

These apply to **all modes**.

### 3.1 Intentionality Over Neutrality
Every design must commit to a clear point of view.
- Neutral design is forbidden
- “Safe” layouts are rejected
- Familiarity without intention is failure

---

### 3.2 Cognitive Load Minimization
Based on modern UX research and neuroscience:
- Limit simultaneous choices
- Group related actions
- Use progressive disclosure
- Prefer recognition over recall

If a user must “think hard,” the design has failed.

---

### 3.3 Trust Precedes Logic
Trust is created through:
- Consistent spacing
- Clean typography
- Predictable interaction patterns
- Calm visual rhythm
- Absence of visual chaos

---

### 3.4 Accessibility Is Mandatory
Inclusivity is a mark of quality, not a feature request.
- **Contrast:** WCAG AA minimum for all text
- **Targets:** 44px minimum touch targets on mobile
- **Navigation:** Fully keyboard navigable (Tab / Enter / Space)
- **Semantics:** Proper HTML elements (`<button>` not `<div>`)

---

## 4. Mode-Specific Design Doctrine

### MODE A — Behavioral / Webpage Design

**Goal:** Create psychological momentum toward action.

- **Single dominant CTA** per viewport
- **Hick’s Law:** aggressively limit options
- **Directional cues:** layout, motion, and visual flow guide the eye
- **No fake urgency:** use legitimate temporal motivation only

---

### MODE B — Product / Application Design

**Goal:** Enable speed, accuracy, and confidence.

- **Dual-context excellence:** First-class Mobile and Desktop experiences
- **Thumb-reachable** primary actions on mobile
- **Information density** balanced with clarity (no clutter)
- **Friction engineering:**  
  - Zero friction for repetitive tasks  
  - Intentional friction for destructive or irreversible actions  

---

### MODE C — Hybrid Interfaces

**Goal:** Transition psychology.

- Reduce anxiety with reassurance and progress indicators
- Clarify the *next value* immediately
- Reinforce user identity (“You are now a pro user”)

---

## 5. Component State Doctrine (Mandatory)

Agents often hallucinate the “happy path” and ignore reality.  
Every component must explicitly handle **all five states**:

1. **Ideal State** – Fully populated with complete data  
2. **Loading State** – Skeletons or subtle spinners (avoid blocking modals)  
3. **Empty State** – First-run experience that drives the next action  
4. **Error State** – Inline, contextual, and recoverable  
5. **Partial State** – Graceful behavior with minimal or edge-case data  

If any state is undefined, the component is incomplete.

---

## 6. Typography System (Global)

- Typography carries hierarchy, not color alone
- Distinctive display fonts are encouraged
- Body fonts must prioritize legibility

**Forbidden unless explicitly justified:**
- Inter  
- Roboto  
- Generic SaaS font stacks  

---

## 7. Color & Visual System

- Commit to a dominant tonal direction
- Use color **semantically** (state, priority, action)
- CSS variables / Design Tokens are required
- High contrast is mandatory for accessibility

---

## 8. Motion & Interaction Standards

Motion must:
- Communicate state
- Reinforce hierarchy
- Clarify cause and effect

**Rules:**  
Fewer animations, higher impact.  
No decorative motion that slows the user down.

---

## 9. Code & Implementation Standards

All generated code must be:

- **Production-grade:** No demo shortcuts
- **Maintainable:** Componentized and typed
- **Accessible by default:** ARIA where required
- **Performance-aware:** Minimal re-renders and payload size

Beautiful UI with sloppy code is rejected.

---

## 10. Optional Strength Modules (Enable Per Project)

### 10.1 Conversion Optimization Module
- A/B-friendly component structure
- CTA hierarchy testing
- Microcopy optimization

### 10.2 Brand Expression Module
- Strong visual motifs
- Custom components
- Signature interactions

### 10.3 Performance-First Module
- Minimal JS payloads
- Lazy loading strategies
- Mobile CPU / GPU sensitivity

---

## 11. Explicit Anti-Patterns (Hard Bans)

Never produce:
- Template SaaS layouts
- Generic dashboards
- Predictable hero → feature → CTA flows
- UI kit defaults
- “Looks fine” design

If it feels familiar, redesign it.

---

## 12. Design Failure Conditions (Enforced)

A design is considered **failed** if **any** of the following are true:

- The user must read instructions to proceed
- Multiple primary CTAs compete visually
- The core action is not reachable within one interaction
- Empty states provide no guidance
- Error states are vague or terminal
- The interface looks acceptable but is not memorable

If a failure condition is met, the design must be reworked.

---

## 13. Output Quality Bar

A successful Antigravity frontend:

- Feels intentional and expensive
- Guides behavior without explanation
- Scales across devices gracefully
- Cannot be mistaken for generic software

---

## 14. Technical Constraints (Project Specific)

*Define these before generation to ensure code validity.*

- **Framework:** [React / Vue / Svelte / HTMX / etc.]
- **Styling:** [Tailwind / CSS Modules / Styled Components]
- **Motion:** [Framer Motion / GSAP / CSS]
- **Icons:** [Lucide / Heroicons / Phosphor]

---

## 15. Final Doctrine

Design is **applied psychology**.

Antigravity interfaces exist to:
- Reduce hesitation
- Increase agency
- Enable momentum
- Respect the user’s time and cognition

Anything less is failure.
