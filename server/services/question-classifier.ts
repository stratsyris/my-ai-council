/**
 * Question Type Classifier
 * Analyzes user queries to determine task type and select optimal council members
 */

export type QuestionType = 
  | "code"           // Technical/Programming questions
  | "creative"       // Writing, design, brainstorming
  | "strategic"      // Business decisions, planning
  | "emotional"      // Advice, support, relationships
  | "financial"      // Money, investment, ROI
  | "ethical"        // Moral dilemmas, principles
  | "technical"      // System design, architecture
  | "analytical"     // Data, research, investigation
  | "practical"      // How-to, implementation, efficiency
  | "general";       // Default fallback

export interface ClassificationResult {
  type: QuestionType;
  confidence: number;
  reasoning: string;
  selectedArchetypes: string[];
}

/**
 * Keywords that indicate each question type
 */
const QUESTION_TYPE_KEYWORDS: Record<QuestionType, string[]> = {
  code: [
    "code", "function", "algorithm", "debug", "error", "bug", "python", "javascript",
    "java", "typescript", "react", "node", "api", "database", "sql", "git", "github",
    "compile", "syntax", "library", "framework", "package", "npm", "pip", "docker",
    "kubernetes", "devops", "ci/cd", "test", "unit test", "integration test"
  ],
  creative: [
    "write", "story", "poem", "song", "design", "art", "creative", "brainstorm",
    "concept", "visual", "logo", "tagline", "slogan",
    "narrative", "plot", "character", "dialogue", "illustration", "sketch"
  ],
  strategic: [
    "strategy", "plan", "roadmap", "goal", "objective", "decision", "business",
    "startup_strategy", "growth", "expansion", "market", "competitor", "positioning",
    "partnership", "acquisition", "merger", "pivot", "direction", "vision"
  ],
  emotional: [
    "feel", "emotion", "relationship", "advice", "support", "help", "struggling",
    "anxious", "depressed", "happy", "sad", "angry", "confused", "lost", "scared",
    "love", "family", "friend", "colleague", "boss", "personal", "mental health"
  ],
  financial: [
    "money", "cost", "price", "budget", "roi", "investment", "profit", "revenue",
    "expense", "salary", "wage", "financial", "accounting", "tax", "loan", "debt",
    "savings", "retirement", "stock", "crypto", "valuation", "burn rate", "invest",
    "return", "capital", "cash flow", "funding", "payback", "yield"
  ],
  ethical: [
    "ethical", "moral", "right", "wrong", "principle", "integrity", "honesty",
    "fairness", "justice", "responsibility", "consequence", "impact", "harm",
    "benefit", "stakeholder", "society", "environment", "sustainability"
  ],
  technical: [
    "architecture", "system", "design", "scalability", "performance", "infrastructure",
    "cloud", "aws", "azure", "gcp", "server", "deployment", "monitoring", "logging",
    "caching", "load balancing", "microservices", "distributed", "latency"
  ],
  analytical: [
    "analyze", "data", "research", "study", "investigate", "evidence", "statistic",
    "metric", "trend", "pattern", "correlation", "hypothesis", "experiment",
    "conclusion", "insight", "finding", "report", "analysis"
  ],
  practical: [
    "how to", "how do", "implement", "build", "create", "make", "do", "accomplish",
    "achieve", "complete", "finish", "start", "begin", "step", "process", "workflow",
    "efficient", "quick", "fast", "shortcut", "hack", "workaround"
  ],
  general: []
};

/**
 * Archetype selection matrix: Maps question types to optimal 4-member combinations
 * Each combination is carefully chosen to provide diverse perspectives for that question type
 */
const ARCHETYPE_SELECTION_MATRIX: Record<QuestionType, string[]> = {
  code: [
    "logician",      // Deep reasoning and technical accuracy
    "architect",     // System design and scalability
    "pragmatist",    // Fast implementation and shortcuts
    "skeptic"        // Red-team the code for bugs
  ],
  creative: [
    "visionary",     // Innovation and novel approaches
    "orator",        // Narrative and persuasion
    "humanist",      // User experience and empathy
    "pragmatist"     // Practical execution
  ],
  strategic: [
    "visionary",     // Big picture and synthesis
    "financier",     // ROI and value analysis
    "skeptic",       // Risk identification
    "orator"         // Communication and alignment
  ],
  emotional: [
    "humanist",      // Empathy and safety
    "ethicist",      // Moral clarity
    "orator",        // Narrative and perspective
    "visionary"      // Creative solutions
  ],
  financial: [
    "financier",     // Economic analysis
    "logician",      // Rigorous reasoning
    "skeptic",       // Risk assessment
    "pragmatist"     // Practical execution
  ],
  ethical: [
    "ethicist",      // Moral clarity
    "humanist",      // Safety and harm reduction
    "logician",      // Rigorous reasoning
    "visionary"      // Synthesis and principles
  ],
  technical: [
    "architect",     // System design
    "logician",      // Deep reasoning
    "pragmatist",    // Implementation efficiency
    "skeptic"        // Risk and failure modes
  ],
  analytical: [
    "logician",      // Deep reasoning
    "skeptic",       // Critical thinking
    "financier",     // Quantitative analysis
    "architect"      // Pattern recognition
  ],
  practical: [
    "pragmatist",    // Fast execution
    "realist",       // Efficiency and constraints
    "logician",      // Problem-solving
    "architect"      // Scalable solutions
  ],
  general: [
    "logician",
    "humanist",
    "visionary",
    "realist"
  ]
};

/**
 * Classify a user question to determine task type and select optimal council members
 */
export function classifyQuestion(userQuery: string): ClassificationResult {
  const lowerQuery = userQuery.toLowerCase();
  
  // Score each question type based on keyword matches
  const scores: Record<QuestionType, number> = {
    code: 0,
    creative: 0,
    strategic: 0,
    emotional: 0,
    financial: 0,
    ethical: 0,
    technical: 0,
    analytical: 0,
    practical: 0,
    general: 0
  };

  // Calculate scores
  for (const [type, keywords] of Object.entries(QUESTION_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        scores[type as QuestionType]++;
      }
    }
  }

  // Find the best match
  let bestType: QuestionType = "general";
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as QuestionType;
    }
  }

  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? bestScore / totalScore : 0;

  // Get selected archetypes for this question type
  const selectedArchetypes = ARCHETYPE_SELECTION_MATRIX[bestType];

  return {
    type: bestType,
    confidence,
    reasoning: `Detected ${bestType} question with ${bestScore} keyword matches (${(confidence * 100).toFixed(0)}% confidence)`,
    selectedArchetypes
  };
}

/**
 * Get specialized secret prompts for each archetype based on question type
 */
export function getSpecializedPrompts(
  questionType: QuestionType,
  selectedArchetypes: string[]
): Record<string, string> {
  const prompts: Record<string, string> = {};

  const promptTemplates: Record<QuestionType, Record<string, string>> = {
    code: {
      logician: "Focus on technical correctness, edge cases, and potential bugs. Validate the logic rigorously.",
      architect: "Consider scalability, maintainability, and long-term architecture. Will this scale to 10x?",
      pragmatist: "Find the fastest, most efficient implementation. What's the 80/20 solution?",
      skeptic: "Red-team this code. What could go wrong? Where are the vulnerabilities?"
    },
    creative: {
      visionary: "Push beyond conventional thinking. What's the most innovative approach?",
      orator: "How do we tell this story compellingly? What's the narrative arc?",
      humanist: "Who is the audience? What resonates emotionally? What creates connection?",
      pragmatist: "How do we execute this quickly? What's the MVP version?"
    },
    strategic: {
      visionary: "What's the big picture? How does this fit into a larger vision?",
      financier: "What's the ROI? Is this a good investment? What's the payback period?",
      skeptic: "What could go wrong? What are the competitive threats?",
      orator: "How do we communicate this strategy to stakeholders?"
    },
    emotional: {
      humanist: "Lead with empathy. What is this person really feeling? How can we help?",
      ethicist: "What's the right thing to do? What are the moral dimensions?",
      orator: "How do we frame this in a way that's healing and constructive?",
      visionary: "What's a creative solution that addresses the root cause?"
    },
    financial: {
      financier: "What's the financial impact? Calculate ROI, payback period, and risk-adjusted returns.",
      logician: "Validate the numbers. Are the assumptions sound? What's the sensitivity analysis?",
      skeptic: "What could go wrong financially? What's the downside scenario?",
      pragmatist: "What's the fastest path to profitability? What can we cut?"
    },
    ethical: {
      ethicist: "What's the principled path forward? What are the long-term implications?",
      humanist: "Who gets hurt? How do we minimize harm?",
      logician: "What does the evidence say? What are the logical implications?",
      visionary: "How do we synthesize competing values into a coherent principle?"
    },
    technical: {
      architect: "Design for scale, resilience, and elegance. What's the foundational architecture?",
      logician: "Validate technical feasibility. Are there unsolvable problems?",
      pragmatist: "What's the fastest way to deploy this? What can we defer?",
      skeptic: "What are the failure modes? How do we handle edge cases?"
    },
    analytical: {
      logician: "Dig deep into the data. What patterns emerge? What's statistically significant?",
      skeptic: "Question the assumptions. Could the data be misleading? What's the alternative explanation?",
      financier: "What's the business impact of these findings? What's the ROI?",
      architect: "How do these insights inform system design? What patterns should we optimize for?"
    },
    practical: {
      pragmatist: "What's the fastest way to get this done? What's the 48-hour solution?",
      realist: "What are the real constraints? What's actually achievable?",
      logician: "What's the most efficient path? Where are the bottlenecks?",
      architect: "How do we build this so it doesn't create technical debt?"
    },
    general: {
      logician: "Provide logical analysis and identify potential issues.",
      humanist: "Consider user impact and safety implications.",
      visionary: "Suggest creative alternatives and novel approaches.",
      realist: "Focus on practical implementation and efficiency."
    }
  };

  const templates = promptTemplates[questionType] || promptTemplates.general;

  for (const archetype of selectedArchetypes) {
    prompts[archetype] = templates[archetype] || templates[selectedArchetypes[0]];
  }

  return prompts;
}

/**
 * Get archetype display names for logging
 */
export function getArchetypeDisplayNames(archetypeIds: string[]): string[] {
  const displayNames: Record<string, string> = {
    logician: "The Logician",
    humanist: "The Humanist",
    visionary: "The Visionary",
    realist: "The Realist",
    skeptic: "The Skeptic",
    pragmatist: "The Pragmatist",
    financier: "The Financier",
    ethicist: "The Ethicist",
    architect: "The Architect",
    orator: "The Orator"
  };

  return archetypeIds.map(id => displayNames[id] || id);
}
