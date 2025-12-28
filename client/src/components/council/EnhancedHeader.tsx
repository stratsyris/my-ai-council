'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { COUNCIL_CONFIG } from "@shared/council_config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanId: string) => void;
  activeSquad?: string[];
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
  
  // Get chairman display name
  const chairmanEntry = Object.values(COUNCIL_CONFIG).find(
    (member) => member.model_id === selectedChairman
  );
  const chairmanName = chairmanEntry?.display_name || "The Visionary";
  const chairmanModel = chairmanEntry?.ui_badge || "Gemini 3 Pro";

  // Get all 10 archetypes for idle state
  const allArchetypes = Object.values(COUNCIL_CONFIG);
  
  // Get active squad members for active state
  const activeMembers = activeSquad
    .map((id) => Object.values(COUNCIL_CONFIG).find((m) => m.id === id))
    .filter(Boolean);

  // Determine if we're in active state
  const isActiveState = activeSquad.length > 0;

  // LLM Providers data
  const llmProviders = [
    { name: "GPT", model: "GPT-5.2", logo: "🔷", color: "from-green-400 to-green-600" },
    { name: "Gemini", model: "Gemini 3 Pro", logo: "🔵", color: "from-blue-400 to-blue-600" },
    { name: "Claude", model: "Claude 4.5", logo: "🟠", color: "from-orange-400 to-orange-600" },
    { name: "Grok", model: "Grok 4", logo: "❌", color: "from-gray-300 to-gray-500" },
  ];

  const getModelName = (modelId: string) => {
    const parts = modelId.split("/");
    if (parts[0] === "openai") return "GPT-5.2";
    if (parts[0] === "anthropic") return "Claude 4.5";
    if (parts[0] === "google") return "Gemini 3 Pro";
    if (parts[0] === "x-ai") return "Grok 4";
    return modelId;
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block">
        {/* Taller Command Deck Container - h-40 */}
        <div className="h-40 px-6 py-4 flex flex-col justify-between">
          {/* Top Row: Title + Chairman Dropdown + Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl">My AI Council</h1>
              <p className="text-white/80 text-sm">Multiple LLMs collaborate to answer your questions</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Chairman Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm"
                  >
                    Chairman: {chairmanName} ({chairmanModel})
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {allArchetypes.map((archetype) => (
                    <DropdownMenuItem
                      key={archetype.id}
                      onClick={() => onChairmanChange?.(archetype.model_id)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{archetype.icon}</span>
                      {archetype.display_name} ({archetype.ui_badge})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-white hover:opacity-80 transition-opacity p-2"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.707 5.657a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM9 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Row 1: All 10 Archetype Icons */}
          <AnimatePresence mode="wait">
            {!isActiveState && (
              <motion.div
                key="row1-idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-6"
              >
                {allArchetypes.map((archetype) => (
                  <div key={archetype.id} className="flex flex-col items-center gap-1 hover:opacity-100 opacity-70 transition-opacity">
                    <div className="text-3xl">{archetype.icon}</div>
                    <span className="text-white/90 text-xs font-mono font-bold uppercase whitespace-nowrap">
                      {archetype.display_name.split(" ").pop()}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {isActiveState && (
              <motion.div
                key="row1-active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-8"
              >
                {activeMembers.map((member) => (
                  <div key={member?.id} className="flex flex-col items-center gap-2">
                    <div className="text-4xl">{member?.icon}</div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">{member?.display_name}</p>
                      <p className="text-white/70 text-xs">{getModelName(member?.model_id || "")}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 2: LLM Providers (Engines) - Only show in idle state */}
          <AnimatePresence mode="wait">
            {!isActiveState && (
              <motion.div
                key="row2-engines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-white/60 text-xs font-mono">POWERED BY TOP LLMs:</p>
                <div className="flex items-center gap-6">
                  {llmProviders.map((provider, idx) => (
                    <div key={provider.name} className="flex items-center gap-2">
                      <div className="text-2xl">{provider.logo}</div>
                      <span className="text-white/80 text-xs font-mono">{provider.name}</span>
                      {idx < llmProviders.length - 1 && (
                        <span className="text-white/40 ml-2">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden px-4 py-3 space-y-3">
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
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">My AI Council</h1>
            <p className="text-white/70 text-xs">Multiple LLMs collaborate</p>
          </div>
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
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.707 5.657a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM9 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Chairman Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              Chairman: {chairmanName}
              <ChevronDown className="w-3 h-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {allArchetypes.map((archetype) => (
              <DropdownMenuItem
                key={archetype.id}
                onClick={() => onChairmanChange?.(archetype.model_id)}
                className="cursor-pointer text-xs"
              >
                <span className="mr-2">{archetype.icon}</span>
                {archetype.display_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Row 1: Archetype Icons - Compact */}
        <AnimatePresence mode="wait">
          {!isActiveState && (
            <motion.div
              key="mobile-row1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              {allArchetypes.map((archetype) => (
                <div key={archetype.id} className="flex flex-col items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="text-xl">{archetype.icon}</div>
                  <span className="text-white/80 text-xs font-mono whitespace-nowrap">
                    {archetype.display_name.split(" ").pop()}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {isActiveState && (
            <motion.div
              key="mobile-row1-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              {activeMembers.map((member) => (
                <div key={member?.id} className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{member?.icon}</div>
                  <p className="text-white font-bold text-xs text-center">{member?.display_name}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: LLM Providers - Mobile */}
        <AnimatePresence mode="wait">
          {!isActiveState && (
            <motion.div
              key="mobile-row2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-white/60 text-xs font-mono">POWERED BY TOP LLMs:</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {llmProviders.map((provider, idx) => (
                  <div key={provider.name} className="flex items-center gap-1">
                    <div className="text-lg">{provider.logo}</div>
                    <span className="text-white/80 text-xs font-mono">{provider.name}</span>
                    {idx < llmProviders.length - 1 && (
                      <span className="text-white/40 ml-1">|</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedHeaderComponent;
