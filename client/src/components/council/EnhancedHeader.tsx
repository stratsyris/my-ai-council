'use client';

import React, { useState } from 'react';
import { 
  Monitor, Handshake, Telescope, Anchor, Shield, Wrench, 
  DollarSign, Scale, Triangle, Mic, 
  ChevronDown, Sun, Moon, Sparkles, Star, MessageSquare, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // The 10 Archetypes (Bottom Row)
  const archetypes = [
    { icon: Monitor, label: "LOGICIAN" },
    { icon: Handshake, label: "HUMANIST" },
    { icon: Telescope, label: "VISIONARY" },
    { icon: Anchor, label: "REALIST" },
    { icon: Shield, label: "SKEPTIC" },
    { icon: Wrench, label: "PRAGMATIST" },
    { icon: DollarSign, label: "FINANCIER" },
    { icon: Scale, label: "ETHICIST" },
    { icon: Triangle, label: "ARCHITECT" },
    { icon: Mic, label: "ORATOR" },
  ];

  // The 4 Engines (Top Row)
  const engines = [
    { 
      id: 'gpt', 
      name: 'GPT 5.2', 
      icon: Sparkles, 
      color: 'bg-emerald-600', 
      glow: 'shadow-emerald-500/20' 
    },
    { 
      id: 'gemini', 
      name: 'Gemini 3 Pro', 
      icon: Star, 
      color: 'bg-blue-600', 
      glow: 'shadow-blue-500/20' 
    },
    { 
      id: 'claude', 
      name: 'Sonnet 4.5', 
      icon: MessageSquare, 
      color: 'bg-orange-600', 
      glow: 'shadow-orange-500/20' 
    },
    { 
      id: 'grok', 
      name: 'Grok 4', 
      icon: Zap, 
      color: 'bg-gray-800', 
      glow: 'shadow-gray-500/20' 
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* GLASS CONTAINER 
        - bg-black/75: Dark tint for contrast
        - backdrop-blur-xl: Heavy frost effect
        - border-b: Subtle glass edge
      */}
      <div className="w-full bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-start justify-between">
            
            {/* LEFT: Branding */}
            <div className="flex flex-col pt-1">
              <h1 className="text-xl font-bold text-white tracking-tight">
                My AI Council
              </h1>
              <span className="text-[10px] text-white/40 font-mono mt-0.5">
                SYSTEM ONLINE // V 2.4.0
              </span>
            </div>

            {/* CENTER: The Command Deck */}
            <div className="flex flex-col items-center justify-center flex-1 mx-8">
              
              {/* ROW 1: Engine Status Badges (Top) */}
              <div className="flex flex-col items-center mb-3">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-2">
                  Powered By Top LLMs:
                </span>
                
                <div className="flex items-center gap-4">
                  {engines.map((engine) => (
                    <div 
                      key={engine.id} 
                      className="flex items-center gap-2 px-1 py-1 pr-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default group"
                    >
                      {/* The Colorful Icon Box */}
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg ${engine.color} ${engine.glow} text-white`}>
                        <engine.icon size={16} fill="currentColor" className="opacity-90" />
                      </div>
                      
                      {/* The Model Name */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/90 leading-none">
                          {engine.name.split(' ')[0]}
                        </span>
                        <span className="text-[8px] text-white/50 font-mono leading-none mt-0.5">
                          {engine.name.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIVIDER LINE */}
              <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

              {/* ROW 2: Archetype HUD (Bottom) */}
              <div className="flex items-center gap-5">
                {archetypes.map((arch, index) => (
                  <div key={index} className="flex flex-col items-center group cursor-pointer">
                    <arch.icon 
                      className="w-5 h-5 text-white/40 group-hover:text-white transition-colors duration-300" 
                      strokeWidth={1.5}
                    />
                    <span className="text-[8px] font-bold tracking-[0.2em] text-white/30 mt-1 group-hover:text-white/80 transition-colors">
                      {arch.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT: Chairman & Settings */}
            <div className="flex items-center gap-3 pt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/80 font-medium group"
                  >
                    <span>Chairman: {chairmanName}</span>
                    <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white" />
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
                className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;
