import { Menu, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCouncilMembersForUI,
  getChairmanModelMap,
  getDisplayNameForModel,
} from "@/lib/council_utils";

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

  // Get council members from config
  const councilMembers = getCouncilMembersForUI();
  const chairmanMap = getChairmanModelMap();

  // Map member ID to model ID for display
  const memberToModelMap: Record<string, string> = {
    logician: "openai/gpt-5.2",
    humanist: "anthropic/claude-sonnet-4.5",
    visionary: "google/gemini-3-pro-preview",
    realist: "x-ai/grok-4",
  };

  const currentChairmanName = getDisplayNameForModel(selectedChairman) || "Gemini 3";

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 md:p-6 shadow-lg">
      <div className="flex flex-col gap-5">
        {/* Title and Menu Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
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
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">My AI Council</h1>
              <p className="text-sm md:text-base text-white/90">
                Multiple LLMs collaborate to answer your questions
              </p>
            </div>
          </div>

          {/* Chairman Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 gap-2 flex-shrink-0"
                title="Select Chairman LLM"
              >
                <span className="hidden sm:inline text-sm font-medium">
                  Chairman:
                </span>
                <span className="font-semibold">{currentChairmanName}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {Object.entries(chairmanMap).map(([model, displayName]) => (
                <DropdownMenuItem
                  key={model}
                  onClick={() => onChairmanChange?.(model)}
                  className={selectedChairman === model ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                      {selectedChairman === model && (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span>{displayName}</span>
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

        {/* Council Member Avatars with Labels - 2x2 grid on mobile, row on desktop */}
        <div
          className={
            isMobile
              ? "grid grid-cols-4 gap-3"
              : "flex gap-12 items-end justify-center"
          }
        >
          {councilMembers.map((member) => {
            const modelId = memberToModelMap[member.id];
            return (
              <div
                key={member.id}
                className="flex flex-col items-center gap-2"
                title={`${member.display_name} (${member.ui_badge})`}
              >
                <div
                  className={`rounded-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:bg-white/30 transition-colors ${
                    isMobile ? "w-12 h-12" : "w-14 h-14 md:w-14 md:h-14"
                  }`}
                >
                  <img
                    src={`/${member.icon_provider}-logo.jpg`}
                    alt={member.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`text-white/80 font-medium text-center leading-tight ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  {member.display_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
