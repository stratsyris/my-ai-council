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
        <div className="flex gap-3 md:gap-8 items-end justify-center">
          {AGENTS.map((agent) => (
            <div key={agent.id} className="flex flex-col items-center flex-1 group cursor-pointer hover:opacity-80 transition-opacity">
              {/* Icon Container: Smaller on mobile (w-10) to prevent cramping */}
              <div className="mb-1 md:mb-2 p-2 md:p-3 bg-white/20 rounded-full text-white backdrop-blur-sm shadow-sm">
                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                  {/* Render the icon as a component */}
                  <agent.icon className="w-full h-full" />
                </div>
              </div>

              {/* Text Labels */}
              <div className="text-center">
                {/* MOBILE: Role Only. Tiny text, tight spacing. NO Model name. */}
                <p className="text-[10px] sm:text-xs font-medium text-white md:hidden leading-tight tracking-tight">
                  {agent.role.replace("The ", "")}
                </p>

                {/* DESKTOP: Full Character Card */}
                <div className="hidden md:block">
                  <p className="text-sm font-bold uppercase tracking-wide text-white">
                    {agent.role}
                  </p>
                  <p className="text-xs text-white/80 mt-0.5">
                    {agent.model}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
