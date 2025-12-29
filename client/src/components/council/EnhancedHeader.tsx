'use client';

import React from 'react';
import { 
  Monitor, Handshake, Telescope, Anchor, Shield, Wrench, 
  DollarSign, Scale, Triangle, Mic, 
  ChevronDown, Sun, Moon, Sparkles, Star, MessageSquare, Zap 
} from 'lucide-react';
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { COUNCIL_CONFIG } from "@shared/council_config";

interface EnhancedHeaderProps {
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanId: string) => void;
  activeSquad?: string[];
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  selectedChairman = "google/gemini-3-pro-preview",
  onChairmanChange,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Get chairman display name
  const chairmanEntry = Object.values(COUNCIL_CONFIG).find(
    (member) => member.model_id === selectedChairman
  );
  const chairmanName = chairmanEntry?.display_name || "The Visionary";

  // Get all 10 archetypes
  const allArchetypes = Object.values(COUNCIL_CONFIG);

  // The 10 Archetypes
  const archetypes = [
    { icon: Monitor, label: "THE LOGICIAN" },
    { icon: Handshake, label: "THE HUMANIST" },
    { icon: Telescope, label: "THE VISIONARY" },
    { icon: Anchor, label: "THE REALIST" },
    { icon: Shield, label: "THE SKEPTIC" },
    { icon: Wrench, label: "THE PRAGMATIST" },
    { icon: DollarSign, label: "THE FINANCIER" },
    { icon: Scale, label: "THE ETHICIST" },
    { icon: Triangle, label: "THE ARCHITECT" },
    { icon: Mic, label: "THE ORATOR" },
  ];

  // The 4 LLM Engines
  const engines = [
    { 
      id: 'gpt', 
      name: 'GPT 5.2', 
      icon: Sparkles, 
      color: 'bg-emerald-600'
    },
    { 
      id: 'gemini', 
      name: 'Gemini Pro 3', 
      icon: Star, 
      color: 'bg-blue-600'
    },
    { 
      id: 'claude', 
      name: 'Sonnet 4.5', 
      icon: MessageSquare, 
      color: 'bg-orange-600'
    },
    { 
      id: 'grok', 
      name: 'Grok 4', 
      icon: Zap, 
      color: 'bg-gray-800'
    }
  ];

  return (
    <div className="w-full bg-black/40 backdrop-blur-2xl border-b border-white/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* Bordered Glass Panel - True Glassmorphism */}
        <div className="border border-white/30 rounded-xl backdrop-blur-xl bg-white/10 p-6 shadow-2xl">
          
          {/* Main Layout: Left | Center | Right */}
          <div className="flex items-start justify-between gap-6">
            
            {/* LEFT: Branding Section */}
            <div className="flex flex-col min-w-fit">
              <h1 className="text-lg font-bold text-white tracking-tight">
                My AI Council
              </h1>
              <p className="text-xs text-white/70 mt-1">
                Multiple LLMs collaborate to answer your questions
              </p>
            </div>

            {/* CENTER: Command Deck */}
            <div className="flex-1 flex flex-col items-center gap-4">
              
              {/* TOP: 4 LLM Engines */}
              <div className="flex items-center justify-center gap-6">
                {engines.map((engine) => {
                  const IconComponent = engine.icon;
                  return (
                    <div key={engine.id} className="flex flex-col items-center gap-2">
                      {/* Engine Icon Badge */}
                      <div className={`w-12 h-12 rounded-lg ${engine.color} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {/* Engine Name */}
                      <span className="text-xs font-semibold text-white text-center whitespace-nowrap">
                        {engine.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM: 10 Archetypes - Single Row */}
              <div className="flex items-center justify-center gap-4 w-full">
                {archetypes.map((arch, index) => {
                  const IconComponent = arch.icon;
                  return (
                    <div key={index} className="flex flex-col items-center gap-1 group cursor-pointer flex-shrink-0">
                      <IconComponent 
                        className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" 
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] font-semibold text-white/50 group-hover:text-white/80 transition-colors text-center whitespace-nowrap">
                        {arch.label}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT: Chairman & Settings */}
            <div className="flex items-center gap-3 min-w-fit">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 h-auto"
                  >
                    <span className="text-xs">Chairman: {chairmanName}</span>
                    <ChevronDown className="w-3 h-3 ml-2" />
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
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default EnhancedHeader;
