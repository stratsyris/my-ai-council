/**
 * AGENTS - Brand vs. Tech Naming Convention with Optimized Branded SVG Icons
 * Separates Role (Brand) from Model (Tech)
 */

import React from 'react';

export interface Agent {
  id: string;
  role: string;
  model: string;
  hint: string;
  icon: (props: React.SVGProps<SVGSVGElement> & { size?: number }) => React.ReactElement;
}

// 1. OpenAI (Logician) - Optimized Swirl Icon
const OpenAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 6.06 6.06 0 0 0 10.28-2.18 5.98 5.98 0 0 0 4-2.9 6.05 6.05 0 0 0-.74-7.1ZM13.26 21a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2 1.17a1.56 1.56 0 0 1 .7 1.37V18.3A4.46 4.46 0 0 1 13.26 21ZM2.25 10.42a4.46 4.46 0 0 1 2.86-2.93l.13.08 4.78 2.75a.8.8 0 0 0 .79 0l5.84-3.37v2.33a1.56 1.56 0 0 1-.8 1.37l-5.26 3.04a4.46 4.46 0 0 1-8.34-3.27Zm15.65 4.15a4.45 4.45 0 0 1-2.87 2.93l-.13-.08-4.78-2.76a.8.8 0 0 0-.79 0l-5.83 3.37v-2.33a1.55 1.55 0 0 1 .8-1.37l5.26-3.04a4.46 4.46 0 0 1 8.34 3.28ZM19.42 10.3a1.56 1.56 0 0 1-.7-1.37V2.85a4.46 4.46 0 0 1 5.16-2.69l-2.02 1.17-4.78 2.76a.8.8 0 0 0-.39.68v4.36ZM11.49 2.5a1.56 1.56 0 0 1 .7 1.37v2.85a4.48 4.48 0 0 1-2.88 1.05l-.14.08-4.78 2.76a.8.8 0 0 0-.39.68V4.36a4.46 4.46 0 0 1 5.15-2.68L11.49 2.5ZM11.49 18.3v-6.07a4.46 4.46 0 0 1 2.87-1.05l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68V2.85a1.56 1.56 0 0 1-.7-1.36L13.51 2.66a4.46 4.46 0 0 1 1.53 2.64v7.7l-3.55 2.05Z" />
  </svg>
);

// 2. Anthropic (Humanist) - Optimized Star Icon
const AnthropicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.41 6.59L15 4.18L12.59 6.59L15 9H9V15H15L12.59 17.41L15 19.82L17.41 17.41L19.82 15L17.41 12.59L19.82 10.18L17.41 7.77V6.59ZM5 9V15H7V9H5ZM17 9V15H19V9H17Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// 3. Google (Visionary) - Optimized Sparkle Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.8,2.2C13.5,6.6 17.4,10.2 21.8,10.2C17.4,10.2 13.5,13.8 13.8,18.2C13.8,18.2 13.8,18.2 13.8,18.2C13.8,22.6 10.2,26.5 10.2,30.9C10.2,26.5 6.6,22.6 6.6,18.2C6.9,13.8 3,10.2 -1.4,10.2C3,10.2 6.9,6.6 6.6,2.2C6.6,2.2 6.6,2.2 6.6,2.2C6.6,-2.2 10.2,-6.1 10.2,-10.5C10.2,-6.1 13.8,-2.2 13.8,2.2Z" transform="translate(1.4 10.5) scale(0.65)" />
  </svg>
);

// 4. X (Realist) - Optimized X Logo
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z" />
  </svg>
);

export const AGENTS: Agent[] = [
  {
    id: "openai",
    role: "The Logician",
    model: "GPT-5.2",
    hint: "Logic & Truth",
    icon: (props) => <OpenAIIcon {...props} />,
  },
  {
    id: "anthropic",
    role: "The Humanist",
    model: "Claude 3.5 Sonnet",
    hint: "Safety & Ethics",
    icon: (props) => <AnthropicIcon {...props} />,
  },
  {
    id: "google",
    role: "The Visionary",
    model: "Gemini 3 Pro",
    hint: "Innovation & Scale",
    icon: (props) => <GoogleIcon {...props} />,
  },
  {
    id: "xai",
    role: "The Realist",
    model: "Grok 4",
    hint: "Speed & Data",
    icon: (props) => <XIcon {...props} />,
  },
];

/**
 * Get agent by ID
 */
export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((agent) => agent.id === id);
}

/**
 * Get agent by model ID (for backwards compatibility)
 */
export function getAgentByModelId(modelId: string): Agent | undefined {
  const modelMap: Record<string, string> = {
    "openai/gpt-5.2": "openai",
    "anthropic/claude-3-5-sonnet": "anthropic",
    "google/gemini-3-pro-preview": "google",
    "xai/grok-4": "xai",
  };

  const agentId = modelMap[modelId];
  return agentId ? getAgentById(agentId) : undefined;
}
