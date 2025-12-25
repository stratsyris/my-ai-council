import { Menu, ChevronDown, Sun, Moon } from "lucide-react";
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
    role: "The Logician",
    model: "GPT-5.2",
    icon: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 6.06 6.06 0 0 0 10.28-2.18 5.98 5.98 0 0 0 4-2.9 6.05 6.05 0 0 0-.74-7.1ZM13.26 21a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2 1.17a1.56 1.56 0 0 1 .7 1.37V18.3A4.46 4.46 0 0 1 13.26 21ZM2.25 10.42a4.46 4.46 0 0 1 2.86-2.93l.13.08 4.78 2.75a.8.8 0 0 0 .79 0l5.84-3.37v2.33a1.56 1.56 0 0 1-.8 1.37l-5.26 3.04a4.46 4.46 0 0 1-8.34-3.27Zm15.65 4.15a4.45 4.45 0 0 1-2.87 2.93l-.13-.08-4.78-2.76a.8.8 0 0 0-.79 0l-5.83 3.37v-2.33a1.55 1.55 0 0 1 .8-1.37l5.26-3.04a4.46 4.46 0 0 1 8.34 3.28ZM19.42 10.3a1.56 1.56 0 0 1-.7-1.37V2.85a4.46 4.46 0 0 1 5.16-2.69l-2.02 1.17-4.78 2.76a.8.8 0 0 0-.39.68v4.36ZM11.49 2.5a1.56 1.56 0 0 1 .7 1.37v2.85a4.48 4.48 0 0 1-2.88 1.05l-.14.08-4.78 2.76a.8.8 0 0 0-.39.68V4.36a4.46 4.46 0 0 1 5.15-2.68L11.49 2.5ZM11.49 18.3v-6.07a4.46 4.46 0 0 1 2.87-1.05l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68V2.85a1.56 1.56 0 0 1-.7-1.36L13.51 2.66a4.46 4.46 0 0 1 1.53 2.64v7.7l-3.55 2.05Z"/></svg>
  },
  {
    id: "anthropic",
    role: "The Humanist",
    model: "Claude Sonnet 4.5",
    icon: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path fillRule="evenodd" clipRule="evenodd" d="M17.41 6.59L15 4.18L12.59 6.59L15 9H9V15H15L12.59 17.41L15 19.82L17.41 17.41L19.82 15L17.41 12.59L19.82 10.18L17.41 7.77V6.59ZM5 9V15H7V9H5ZM17 9V15H19V9H17Z"/></svg>
  },
  {
    id: "google",
    role: "The Visionary",
    model: "Gemini 3 Pro",
    icon: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13.8 2.2c-.3 4.4 3.6 8 8 8-4.4 0-8.3 3.6-8.6 8 0 0 0 0 0 0 0 4.4-3.6 8.3-8 8.7 0-4.4-3.6-8.3-8-8.7.3-4.4 3.9-8 8.3-8 0 0 0 0 0 0 0-4.4 3.6-8.3 8-8.7 0 4.4 3.6 8.3 8.3 8.7z" transform="translate(1.4 10.5) scale(0.65)"/></svg>
  },
  {
    id: "xai",
    role: "The Realist",
    model: "Grok 4",
    icon: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z"/></svg>
  }
];

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanId: string) => void;
}

export default function EnhancedHeader({
  onOpenSidebar,
  isMobile,
  selectedChairman = "google",
  onChairmanChange,
}: EnhancedHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Get current chairman agent
  const currentChairman = AGENTS.find((a) => a.id === selectedChairman) || AGENTS[2];
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
                  {/* Desktop: Show role + model */}
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
