import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { COUNCIL_CONFIG } from "@shared/council_config";
import { motion, AnimatePresence } from "framer-motion";

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

  // Determine if we're in active state (has active squad) or idle state
  const isActiveState = activeSquad.length > 0;

  // Get model assignments for active members
  const getModelName = (modelId: string) => {
    const parts = modelId.split("/");
    if (parts[0] === "openai") return "GPT-5.2";
    if (parts[0] === "anthropic") return "Claude 4.5";
    if (parts[0] === "google") return "Gemini 3 Pro";
    if (parts[0] === "x-ai") return "Grok 4";
    return modelId;
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 md:px-6 py-3 md:py-6 shadow-lg">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden space-y-3">
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
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.707 5.657a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM9 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* STATE 1: IDLE - All 10 Archetypes */}
        <AnimatePresence mode="wait">
          {!isActiveState && (
            <motion.div
              key="idle-state"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {/* All 10 Archetype Icons in 2 rows of 5 */}
              <div className="grid grid-cols-5 gap-2">
                {allArchetypes.map((member: any, idx: number) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, filter: "grayscale(0%)" }}
                      className="text-2xl opacity-50 hover:opacity-100 transition-all cursor-pointer"
                    >
                      {member.icon}
                    </motion.div>
                    <p className="text-xs text-white font-semibold text-center mt-1 truncate w-full">
                      {member.display_name.split(" ")[1]}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* System Online Badge */}
              <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-center">
                <p className="text-xs text-white font-mono">
                  ✓ System Online: Calibrated with Gemini 3 Pro • Claude 4.5 • GPT-5.2 • Grok 4
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATE 2: ACTIVE - 4 Active Members */}
        <AnimatePresence mode="wait">
          {isActiveState && (
            <motion.div
              key="active-state"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {/* Active Squad Grid */}
              <div className="grid grid-cols-2 gap-2">
                {activeMembers.map((member: any, idx: number) => (
                  <motion.div
                    key={member?.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{member?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {member?.display_name.split(" ")[1]}
                        </p>
                        <p className="text-xs text-white/80 truncate">
                          {getModelName(member?.model_id || "")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chairman Selector */}
        <div className="flex items-center justify-between gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-xs text-white font-semibold">Chairman:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white text-xs h-auto py-1 px-2 hover:bg-white/20"
              >
                {chairmanName}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.values(COUNCIL_CONFIG)
                .slice(0, 4)
                .map((member) => (
                  <DropdownMenuItem
                    key={member.model_id}
                    onClick={() => onChairmanChange?.(member.model_id)}
                    className="text-xs cursor-pointer"
                  >
                    {member.display_name} ({getModelName(member.model_id)})
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div>
          <h1 className="text-white font-bold text-2xl">My AI Council</h1>
          <p className="text-white/80 text-sm">Multiple LLMs collaborate to answer your questions</p>
        </div>

        {/* Center: STATE 1 (IDLE) or STATE 2 (ACTIVE) */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!isActiveState && (
              <motion.div
                key="idle-desktop"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                {/* All 10 Archetypes in 1 row */}
                <div className="flex items-center justify-center gap-3">
                  {allArchetypes.map((member: any, idx: number) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.15, filter: "grayscale(0%)" }}
                      className="text-3xl opacity-50 hover:opacity-100 transition-all cursor-pointer"
                      title={member.display_name}
                    >
                      {member.icon}
                    </motion.div>
                  ))}
                </div>

                {/* System Online Badge */}
                <div className="flex justify-center">
                  <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-1">
                    <p className="text-xs text-white font-mono">
                      ✓ System Online: Calibrated with Gemini 3 Pro • Claude 4.5 • GPT-5.2 • Grok 4
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isActiveState && (
              <motion.div
                key="active-desktop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-4"
              >
                {activeMembers.map((member: any, idx: number) => (
                  <motion.div
                    key={member?.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-fit"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{member?.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {member?.display_name}
                        </p>
                        <p className="text-xs text-white/80">
                          {getModelName(member?.model_id || "")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Chairman Selector + Theme Toggle */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white border border-white/30 hover:bg-white/10 text-sm"
              >
                Chairman: {chairmanName} ({chairmanModel})
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.values(COUNCIL_CONFIG)
                .slice(0, 4)
                .map((member) => (
                  <DropdownMenuItem
                    key={member.model_id}
                    onClick={() => onChairmanChange?.(member.model_id)}
                    className="cursor-pointer"
                  >
                    {member.display_name} ({getModelName(member.model_id)})
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={toggleTheme}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
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
    </div>
  );
};

export default EnhancedHeaderComponent;
