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
    company: "OpenAI"
  },
  { 
    name: "Claude", 
    logo: "/claude-logo.jpg",
    company: "Anthropic"
  },
  { 
    name: "Gemini", 
    logo: "/gemini-logo.jpg",
    company: "Google"
  },
  { 
    name: "Grok", 
    logo: "/grok-logo.jpg",
    company: "xAI"
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

        {/* Council Member Avatars - 2x2 grid on mobile, row on desktop */}
        <div className={isMobile ? "grid grid-cols-4 gap-2" : "flex gap-2 items-center"}>
          {COUNCIL_MEMBERS.map((member) => (
            <div
              key={member.name}
              className={`rounded-full flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:bg-white/30 transition-colors ${
                isMobile ? "w-12 h-12" : "w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10"
              }`}
              title={`${member.name} (${member.company})`}
            >
              <img
                src={member.logo}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
