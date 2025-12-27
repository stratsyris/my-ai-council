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

// Local AGENTS constant with inline SVGs - self-contained branding
const AGENTS = [
  {
    id: "openai",
    modelId: "openai/gpt-5.2",
    role: "The Logician",
    model: "GPT-5.2",
    icon: (p: any) => (
      <svg viewBox="0 0 512 509.641" fill="currentColor" {...p}>
        <path d="M115.612 0h280.776C459.975 0 512 52.026 512 115.612v278.416c0 63.587-52.025 115.613-115.612 115.613H115.612C52.026 509.641 0 457.615 0 394.028V115.612C0 52.026 52.026 0 115.612 0z"/>
        <path fill="#fff" d="M213.235 306.019l178.976-180.002v.169l51.695-51.763c-.924 1.32-1.86 2.605-2.785 3.89-39.281 54.164-58.46 80.649-43.07 146.922l-.09-.101c10.61 45.11-.744 95.137-37.398 131.836-46.216 46.306-120.167 56.611-181.063 14.928l42.462-19.675c38.863 15.278 81.392 8.57 111.947-22.03 30.566-30.6 37.432-75.159 22.065-112.252-2.92-7.025-11.67-8.795-17.792-4.263l-124.947 92.341zm-25.786 22.437l-.033.034L68.094 435.217c7.565-10.429 16.957-20.294 26.327-30.149 26.428-27.803 52.653-55.359 36.654-94.302-21.422-52.112-8.952-113.177 30.724-152.898 41.243-41.254 101.98-51.661 152.706-30.758 11.23 4.172 21.016 10.114 28.638 15.639l-42.359 19.584c-39.44-16.563-84.629-5.299-112.207 22.313-37.298 37.308-44.84 102.003-1.128 143.81z"/>
      </svg>
    ),
  },
  {
    id: "anthropic",
    modelId: "anthropic/claude-sonnet-4.5",
    role: "The Humanist",
    model: "Claude Sonnet 4.5",
    icon: (p: any) => (
      <svg viewBox="0 0 512 512" fill="currentColor" {...p}>
        <rect width="512" height="512" rx="111" fill="#D97757"/>
        <g fill="#fff">
          <path d="M256 80c9.9 0 18 8.1 18 18v0c0 9.9-8.1 18-18 18s-18-8.1-18-18v0c0-9.9 8.1-18 18-18zm0 0"/>
          <path d="M256 416c-9.9 0-18-8.1-18-18v0c0-9.9 8.1-18 18-18s18 8.1 18 18v0c0 9.9-8.1 18-18 18zm0 0"/>
          <path d="M80 256c0 9.9-8.1 18-18 18s-18-8.1-18-18 8.1-18 18-18 18 8.1 18 18zm0 0"/>
          <path d="M432 256c0-9.9 8.1-18 18-18s18 8.1 18 18-8.1 18-18 18-18-8.1-18-18zm0 0"/>
          <path d="M134.627 134.627c7 7 7 18.36 0 25.36l0 0c-7 7-18.36 7-25.36 0s-7-18.36 0-25.36l0 0c7-7 18.36-7 25.36 0zm0 0"/>
          <path d="M377.373 377.373c-7-7-7-18.36 0-25.36l0 0c7-7 18.36-7 25.36 0s7 18.36 0 25.36l0 0c-7 7-18.36 7-25.36 0zm0 0"/>
          <path d="M377.373 134.627c7 7 18.36 7 25.36 0s7-18.36 0-25.36l0 0c-7-7-18.36-7-25.36 0s-7 18.36 0 25.36l0 0zm0 0"/>
          <path d="M134.627 377.373c-7 7-18.36 7-25.36 0s-7-18.36 0-25.36l0 0c7-7 18.36-7 25.36 0s7 18.36 0 25.36l0 0zm0 0"/>
        </g>
      </svg>
    ),
  },
  {
    id: "google",
    modelId: "google/gemini-3-pro-preview",
    role: "The Visionary",
    model: "Gemini 3 Pro",
    icon: (p: any) => (
      <svg viewBox="0 0 100 100" fill="currentColor" {...p}>
        <path d="M50 10 L70 30 L50 50 L30 30 Z" fill="#4285F4"/>
        <path d="M70 30 L90 50 L70 70 L50 50 Z" fill="#EA4335"/>
        <path d="M50 50 L70 70 L50 90 L30 70 Z" fill="#FBBC04"/>
        <path d="M30 30 L50 50 L30 70 L10 50 Z" fill="#34A853"/>
      </svg>
    ),
  },
  {
    id: "xai",
    modelId: "x-ai/grok-4",
    role: "The Realist",
    model: "Grok 4",
    icon: (p: any) => (
      <svg viewBox="0 0 512 512" fill="currentColor" {...p}>
        <rect width="512" height="512" rx="111" fill="#000"/>
        <circle cx="256" cy="256" r="80" fill="none" stroke="#fff" strokeWidth="32"/>
        <line x1="180" y1="180" x2="332" y2="332" stroke="#fff" strokeWidth="32" strokeLinecap="round"/>
      </svg>
    ),
  }
];

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanId: string) => void;
}

const EnhancedHeaderComponent: React.FC<EnhancedHeaderProps> = ({
  onOpenSidebar,
  isMobile = false,
  selectedChairman = "google/gemini-3-pro-preview",
  onChairmanChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const currentAgent = AGENTS.find((a) => a.modelId === selectedChairman) || AGENTS[2];

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
          {AGENTS.map((agent) => (
            <div key={agent.id} className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
              <div className="mb-1 p-2 bg-white/20 rounded-full text-white backdrop-blur-sm shadow-sm">
                <div className="w-6 h-6 flex items-center justify-center">
                  <agent.icon className="w-full h-full" />
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
            {AGENTS.map((agent) => (
              <div key={agent.id} className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
                <div className="mb-2 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm shadow-sm transition-all">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <agent.icon className="w-full h-full" />
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
