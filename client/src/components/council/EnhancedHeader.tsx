import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Council members with emoji icons from config
const AGENTS = [
  {
    id: "logician",
    modelId: "openai/gpt-5.2",
    role: "The Logician",
    model: "GPT-5.2",
    icon: "🖥️",
  },
  {
    id: "humanist",
    modelId: "anthropic/claude-sonnet-4.5",
    role: "The Humanist",
    model: "Claude Sonnet 4.5",
    icon: "🤝",
  },
  {
    id: "visionary",
    modelId: "google/gemini-3-pro-preview",
    role: "The Visionary",
    model: "Gemini 3 Pro",
    icon: "🔭",
  },
  {
    id: "realist",
    modelId: "x-ai/grok-4",
    role: "The Realist",
    model: "Grok 4",
    icon: "⚓",
  }
];

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanId: string) => void;
  activeSquad?: string[]; // Array of archetype IDs currently debating
}

const EnhancedHeaderComponent: React.FC<EnhancedHeaderProps> = ({
  onOpenSidebar,
  isMobile = false,
  selectedChairman = "google/gemini-3-pro-preview",
  onChairmanChange,
  activeSquad = [],
}) => {
  const { theme, toggleTheme } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const currentAgent = AGENTS.find((a) => a.modelId === selectedChairman) || AGENTS[2];
  
  // Map archetype IDs to AGENTS for display
  const archetypeToAgent: Record<string, any> = {
    logician: AGENTS[0],
    humanist: AGENTS[1],
    visionary: AGENTS[2],
    realist: AGENTS[3],
  };
  
  // Show active squad if available, otherwise show default 4
  const displayAgents = activeSquad.length > 0 
    ? activeSquad.map(id => archetypeToAgent[id]).filter(Boolean)
    : AGENTS;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 md:px-6 py-3 md:py-6 shadow-lg">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden space-y-2">
        {/* Top Row: Menu + Title + Theme */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenSidebar}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg flex-1">My AI Council</h1>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.707 5.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM9 17a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4.536-.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm2.828 2.828a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-white/90 text-xs">Multiple LLMs collaborate to answer your questions</p>

        {/* Council Members: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2">
          {displayAgents.map((agent) => (
            <div key={agent.id} className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
              <div className="mb-1 p-2 bg-white/20 rounded-full text-white backdrop-blur-sm shadow-sm">
                <div className="w-6 h-6 flex items-center justify-center text-lg">
                  {agent.icon}
                </div>
              </div>
              <p className="text-[9px] font-medium text-white text-center leading-tight">
                {agent.role.replace("The ", "")}
              </p>
            </div>
          ))}
        </div>

        {/* Chairman Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-white border-white/30 hover:bg-white/10 text-xs h-9"
            >
              Chairman: {currentAgent.role.replace("The ", "")}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {AGENTS.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => onChairmanChange?.(agent.modelId)}
                className={selectedChairman === agent.modelId ? "bg-accent" : ""}
              >
                {agent.role} - {agent.model}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Left: Title & Council Members */}
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-2xl mb-2">My AI Council</h1>
          <p className="text-white/90 text-sm mb-4">Multiple LLMs collaborate to answer your questions</p>

          {/* Council Members Grid */}
          <div className="flex gap-4 justify-start">
            {displayAgents.map((agent) => (
              <div key={agent.id} className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
                <div className="mb-2 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm shadow-sm transition-all">
                  <div className="w-8 h-8 flex items-center justify-center text-2xl">
                    {agent.icon}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-wide text-white">{agent.role}</p>
                  <p className="text-xs text-white/80 mt-0.5">{agent.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chairman Dropdown & Theme Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10 text-sm whitespace-nowrap"
              >
                Chairman: {currentAgent.role.replace("The ", "")} ({currentAgent.model})
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {AGENTS.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => onChairmanChange?.(agent.modelId)}
                  className={selectedChairman === agent.modelId ? "bg-accent" : ""}
                >
                  {agent.role} - {agent.model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={toggleTheme}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.707 5.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM9 17a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4.536-.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm2.828 2.828a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeaderComponent;
