/**
 * AGENTS - Brand vs. Tech Naming Convention with Branded SVG Icons
 * Skin Second: Replacing placeholder icons with branded SVGs
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

// OpenAI Swirl Icon - Branded SVG
const OpenAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a1.558 1.558 0 0 1 .6983 1.37v6.0769a4.4611 4.4611 0 0 1-5.1548 2.6821zM2.248 10.4234a4.4555 4.4555 0 0 1 2.8573-2.9356l.1323.0767 4.7783 2.7582a.7948.7948 0 0 0 .7904 0l5.835-3.3711v2.3336a1.5581 1.5581 0 0 1-.7952 1.3653l-5.263 3.0368a4.46 4.46 0 0 1-8.3351-3.264zm15.6515 4.143a4.4514 4.4514 0 0 1-2.8669 2.9308l-.1323-.0767-4.7831-2.7582a.7948.7948 0 0 0-.7904 0l-5.8302 3.3663v-2.3336a1.5534 1.5534 0 0 1 .7952-1.3653l5.263-3.0368a4.465 4.465 0 0 1 8.3447 3.2735zM19.4225 10.3a1.558 1.558 0 0 1-.6983-1.37V2.8531a4.4656 4.4656 0 0 1 5.1548-2.687l-2.02 1.1639-4.7831 2.7582a.7948.7948 0 0 0-.3927.6813v4.3643zm-7.9376-7.7944l2.02-1.1686a1.558 1.558 0 0 1 .6983 1.37v2.853a4.47 4.47 0 0 1-2.8716 1.0457l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v-4.3643zm-7.9329 7.7896v-6.0721a4.4604 4.4604 0 0 1 2.8716-1.0456l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813V2.8531a1.5581 1.5581 0 0 1-.6983-1.3653L2.02 2.6565a4.4656 4.4656 0 0 1 1.5322 2.639z" />
  </svg>
);

// Anthropic Star Icon - Branded SVG
const AnthropicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

// Google Sparkle Icon - Branded SVG
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
);

// X Logo - Branded SVG
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
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
