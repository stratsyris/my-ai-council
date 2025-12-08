import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
}

const COUNCIL_MEMBERS = [
  { 
    name: "GPT-5.1", 
    logo: "/gpt-logo.jpg",
    company: "OpenAI",
    displayName: "GPT-5.1"
  },
  { 
    name: "Claude", 
    logo: "/claude-logo.jpg",
    company: "Anthropic",
    displayName: "Sonnet 4.5"
  },
  { 
    name: "Gemini", 
    logo: "/gemini-logo.jpg",
    company: "Google",
    displayName: "Gemini 3 Preview"
  },
  { 
    name: "Grok", 
    logo: "/grok-logo.jpg",
    company: "xAI",
    displayName: "Grok 4"
  },
];

export default function EnhancedHeader({ onOpenSidebar, isMobile }: EnhancedHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 md:p-6 shadow-lg">
      <div className="flex flex-col gap-4">
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
              <h1 className="text-2xl md:text-3xl font-bold">LLM Council</h1>
              <p className="text-sm md:text-base text-white/90">
                Multiple LLMs collaborate to answer your questions
              </p>
            </div>
          </div>

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
        <div className={isMobile ? "grid grid-cols-4 gap-3" : "flex gap-3 items-end"}>
          {COUNCIL_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center gap-1"
              title={`${member.displayName} (${member.company})`}
            >
              <div
                className={`rounded-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:bg-white/30 transition-colors ${
                  isMobile ? "w-12 h-12" : "w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10"
                }`}
              >
                <img
                  src={member.logo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-white/80 font-medium text-center leading-tight ${
                isMobile ? "text-xs" : "text-xs md:text-xs"
              }`}>
                {member.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
