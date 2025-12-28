'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { COUNCIL_CONFIG } from "@shared/council_config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Moon, Sun, Sparkles, Star, MessageSquareQuote, Zap } from "lucide-react";

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
  
  // Get chairman display name
  const chairmanEntry = Object.values(COUNCIL_CONFIG).find(
    (member) => member.model_id === selectedChairman
  );
  const chairmanName = chairmanEntry?.display_name || "The Visionary";
  const chairmanModel = chairmanEntry?.ui_badge || "Gemini 3 Pro";

  // Get all 10 archetypes
  const allArchetypes = Object.values(COUNCIL_CONFIG);
  
  // Get active squad members
  const activeMembers = activeSquad
    .map((id) => Object.values(COUNCIL_CONFIG).find((m) => m.id === id))
    .filter(Boolean);

  // Determine if we're in active state
  const isActiveState = activeSquad.length > 0;

  // LLM Engines - Only 4 (Top Row - Primary Hierarchy)
  const llmEngines = [
    { 
      name: "GPT 5.2", 
      icon: Sparkles, 
      bgColor: "bg-emerald-600",
      iconColor: "text-white"
    },
    { 
      name: "Gemini Pro 3", 
      icon: Star, 
      bgColor: "bg-blue-600",
      iconColor: "text-white"
    },
    { 
      name: "Sonnet 4.5", 
      icon: MessageSquareQuote, 
      bgColor: "bg-orange-600",
      iconColor: "text-white"
    },
    { 
      name: "Grok 4", 
      icon: Zap, 
      bgColor: "bg-neutral-900",
      iconColor: "text-white"
    },
  ];

  const getModelName = (modelId: string) => {
    const parts = modelId.split("/");
    if (parts[0] === "openai") return "GPT 5.2";
    if (parts[0] === "anthropic") return "Sonnet 4.5";
    if (parts[0] === "google") return "Gemini Pro 3";
    if (parts[0] === "x-ai") return "Grok 4";
    return modelId;
  };

  return (
    <div className="w-full bg-slate-900/30 backdrop-blur-xl border-b border-white/10">
      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block">
        {/* Header Container - Glass HUD */}
        <div className="px-8 py-8 flex flex-col gap-8">
          {/* Top Section: Title + Chairman + Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl">My AI Council</h1>
              <p className="text-white/70 text-sm">Multiple LLMs collaborate to answer your questions</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Chairman Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border border-white/30 bg-transparent hover:bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    Chairman: {chairmanName} ({chairmanModel})
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-white/20">
                  {allArchetypes.map((archetype) => (
                    <DropdownMenuItem
                      key={archetype.id}
                      onClick={() => onChairmanChange?.(archetype.model_id)}
                      className="cursor-pointer text-white hover:bg-white/10"
                    >
                      <span className="mr-2 text-lg">{archetype.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold">{archetype.display_name}</span>
                        <span className="text-xs text-white/60">{archetype.ui_badge}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="border border-white/30 bg-transparent hover:bg-white/10 text-white p-2 rounded-md transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* TOP ROW: 4 LLM Engines (Primary Hierarchy) */}
          <AnimatePresence mode="wait">
            {!isActiveState && (
              <motion.div
                key="llm-engines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-12"
              >
                {llmEngines.map((engine) => {
                  const IconComponent = engine.icon;
                  return (
                    <div key={engine.name} className="flex flex-col items-center gap-3 hover:opacity-100 opacity-90 transition-opacity">
                      {/* Large Engine Icon */}
                      <div className={`w-12 h-12 rounded-lg ${engine.bgColor} flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}>
                        <IconComponent className={`w-7 h-7 ${engine.iconColor}`} />
                      </div>
                      {/* Engine Name */}
                      <p className="text-white font-medium text-sm text-center">{engine.name}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {isActiveState && (
              <motion.div
                key="active-engines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-12"
              >
                {activeMembers.map((member) => (
                  <div key={member?.id} className="flex flex-col items-center gap-2">
                    <div className="text-5xl">{member?.icon}</div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm uppercase tracking-wide">{member?.display_name.replace("The ", "")}</p>
                      <p className="text-white/60 text-xs font-mono">{getModelName(member?.model_id || "")}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTTOM ROW: 10 Archetypes (Secondary Hierarchy) */}
          <AnimatePresence mode="wait">
            {!isActiveState && (
              <motion.div
                key="archetypes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-6"
              >
                {allArchetypes.map((archetype) => (
                  <div key={archetype.id} className="flex flex-col items-center gap-2 hover:opacity-100 opacity-70 transition-opacity cursor-pointer group">
                    {/* Small Archetype Icon */}
                    <div className="w-6 h-6 text-lg group-hover:scale-110 transition-transform">{archetype.icon}</div>
                    {/* Archetype Label - Semi-transparent */}
                    <span className="text-white/60 text-[10px] font-mono font-bold uppercase whitespace-nowrap tracking-widest text-center">
                      {archetype.display_name.replace("The ", "")}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {/* Top Row: Menu + Title + Theme */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenSidebar}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity p-2"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">My AI Council</h1>
            <p className="text-white/60 text-xs">Multiple LLMs collaborate</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity p-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Chairman Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border border-white/30 bg-transparent hover:bg-white/10 text-white text-xs font-medium"
            >
              Chairman: {chairmanName}
              <ChevronDown className="w-3 h-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 bg-gray-900 border-white/20">
            {allArchetypes.map((archetype) => (
              <DropdownMenuItem
                key={archetype.id}
                onClick={() => onChairmanChange?.(archetype.model_id)}
                className="cursor-pointer text-white hover:bg-white/10 text-xs"
              >
                <span className="mr-2 text-lg">{archetype.icon}</span>
                {archetype.display_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Top Row: 4 LLM Engines */}
        <AnimatePresence mode="wait">
          {!isActiveState && (
            <motion.div
              key="mobile-llm-engines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              {llmEngines.map((engine) => {
                const IconComponent = engine.icon;
                return (
                  <div key={engine.name} className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition-opacity">
                    <div className={`w-8 h-8 rounded-md ${engine.bgColor} flex items-center justify-center shadow-lg`}>
                      <IconComponent className={`w-5 h-5 ${engine.iconColor}`} />
                    </div>
                    <p className="text-white font-medium text-xs text-center">{engine.name.split(" ")[0]}</p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {isActiveState && (
            <motion.div
              key="mobile-active-engines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              {activeMembers.map((member) => (
                <div key={member?.id} className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{member?.icon}</div>
                  <p className="text-white font-bold text-xs text-center">{member?.display_name.replace("The ", "")}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Row: 10 Archetypes */}
        <AnimatePresence mode="wait">
          {!isActiveState && (
            <motion.div
              key="mobile-archetypes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between gap-2 flex-wrap"
            >
              {allArchetypes.map((archetype) => (
                <div key={archetype.id} className="flex flex-col items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="text-lg">{archetype.icon}</div>
                  <span className="text-white/60 text-[10px] font-mono whitespace-nowrap text-center">
                    {archetype.display_name.split(" ").pop()}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedHeaderComponent;
