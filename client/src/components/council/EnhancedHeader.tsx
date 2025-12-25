import { Menu, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGENTS, getAgentByModelId } from "@/lib/agents";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanModel: string) => void;
}

export default function EnhancedHeader({
  onOpenSidebar,
  isMobile,
  selectedChairman = "google/gemini-3-pro-preview",
  onChairmanChange,
}: EnhancedHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Get current chairman agent
  const currentChairman = getAgentByModelId(selectedChairman);
  const chairmanRole = currentChairman?.role || "The Visionary";
  const chairmanModel = currentChairman?.model || "Gemini 3 Pro";

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 md:p-6 shadow-lg">
      <div className="flex flex-col gap-5">
        {/* Title and Menu Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isMobile && onOpenSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSidebar}
                className="text-white hover:bg-white/20 flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">My AI Council</h1>
              <p className="text-sm md:text-base text-white/90 line-clamp-1">
                Multiple LLMs collaborate to answer your questions
              </p>
            </div>
          </div>

          {/* Chairman Selector - Responsive Text */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 gap-2 flex-shrink-0 whitespace-nowrap text-xs md:text-sm"
                title="Select Chairman LLM"
              >
                <span className="font-medium">
                  {/* Mobile: Show role only */}
                  <span className="md:hidden">
                    {chairmanRole}
                  </span>
                  {/* Desktop: Show role + model + hint */}
                  <span className="hidden md:inline">
                    Chairman: {chairmanRole} ({chairmanModel})
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {AGENTS.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => onChairmanChange?.(agent.id)}
                  className={selectedChairman === agent.id ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                      {selectedChairman === agent.id && (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {agent.role} ({agent.model})
                      </div>
                      {isDesktop && (
                        <div className="text-xs text-muted-foreground">
                          {agent.hint}
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20 flex-shrink-0"
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Council Member Avatars with Responsive Labels */}
        {/* MOBILE: 2x2 Grid Layout (<768px) */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="flex flex-col items-center gap-1"
                title={`${agent.role} (${agent.model})`}
              >
                {/* Mobile Icon: w-10 h-10 */}
                <div className="rounded-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg w-10 h-10">
                  <agent.icon className="w-5 h-5 text-white" />
                </div>

                {/* Mobile Text: Role only, text-[10px] */}
                <span className="text-white text-[10px] font-medium leading-tight text-center">
                  {agent.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP: Horizontal Layout (≥768px) */}
        <div className="hidden md:flex gap-8 items-end justify-center">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col items-center gap-2"
              title={`${agent.role} (${agent.model})`}
            >
              {/* Desktop Icon: w-16 h-16 */}
              <div className="rounded-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:bg-white/30 transition-colors w-16 h-16">
                <agent.icon className="w-10 h-10 text-white" />
              </div>

              {/* Desktop Text: Role (Bold) + Model (Small) */}
              <div className="text-center">
                <span className="text-white text-sm font-bold leading-tight block uppercase">
                  {agent.role}
                </span>
                <span className="text-white/80 text-xs leading-tight block">
                  {agent.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
