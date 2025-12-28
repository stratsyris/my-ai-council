'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  HeartHandshake,
  Anchor,
  Telescope,
  ShieldAlert,
  Zap,
  TrendingUp,
  Scale,
  Grid,
  Mic,
  BrainCircuit,
  Loader,
} from 'lucide-react';

/**
 * ARCHETYPE ICON & COLOR MAPPING
 * Exact mappings as specified
 */
const ARCHETYPE_CONFIG = {
  logician: {
    name: 'The Logician',
    icon: Cpu,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
  },
  humanist: {
    name: 'The Humanist',
    icon: HeartHandshake,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
  },
  realist: {
    name: 'The Realist',
    icon: Anchor,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500',
    borderColor: 'border-slate-500',
  },
  visionary: {
    name: 'The Visionary',
    icon: Telescope,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
  },
  skeptic: {
    name: 'The Skeptic',
    icon: ShieldAlert,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
  },
  pragmatist: {
    name: 'The Pragmatist',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
  },
  financier: {
    name: 'The Financier',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
  },
  ethicist: {
    name: 'The Ethicist',
    icon: Scale,
    color: 'text-gray-200',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-200',
  },
  architect: {
    name: 'The Architect',
    icon: Grid,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400',
    borderColor: 'border-indigo-400',
  },
  orator: {
    name: 'The Orator',
    icon: Mic,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400',
    borderColor: 'border-amber-400',
  },
};

const ALL_ARCHETYPES = Object.keys(ARCHETYPE_CONFIG) as Array<keyof typeof ARCHETYPE_CONFIG>;

/**
 * PHASE DEFINITIONS
 */
type Phase = 'scanning' | 'selecting' | 'briefing' | 'debating';

const PHASE_MESSAGES: Record<Phase, string> = {
  scanning: 'Scanning query for central tension...',
  selecting: 'Selecting optimal council members...',
  briefing: 'Briefing the council on their roles...',
  debating: 'Council is deliberating...',
};

/**
 * COMPONENT PROPS
 */
interface CommandCenterLoaderProps {
  activeSquad?: string[]; // Array of archetype IDs (e.g., ["logician", "humanist", "visionary", "realist"])
  showTerminal?: boolean; // Show terminal log
}

/**
 * ARCHETYPE NODE COMPONENT
 * Renders a single archetype in the orbit with icon and label
 */
const ArchetypeNode: React.FC<{
  id: string;
  angle: number;
  isActive: boolean;
  radius: number;
}> = ({ id, angle, isActive, radius }) => {
  const config = ARCHETYPE_CONFIG[id as keyof typeof ARCHETYPE_CONFIG];
  const Icon = config.icon;

  // Calculate position on circle
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <motion.g
      initial={{ opacity: 0.3 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Node circle background */}
      <motion.circle
        cx={x}
        cy={y}
        r={isActive ? 24 : 20}
        fill={isActive ? '#1f2937' : '#111827'}
        stroke={isActive ? config.color.replace('text-', '#') : '#374151'}
        strokeWidth={isActive ? 2 : 1}
        animate={{
          r: isActive ? 24 : 20,
          strokeWidth: isActive ? 2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon (rendered as SVG path would be complex, so we'll use a simple circle with letter) */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`text-xs font-bold ${config.color} select-none`}
        fill={config.color.replace('text-', '#')}
      >
        {id.charAt(0).toUpperCase()}
      </text>

      {/* Label below node */}
      <text
        x={x}
        y={y + 40}
        textAnchor="middle"
        className="text-xs fill-gray-400 select-none"
        fontSize="10"
      >
        {config.name.split(' ')[1]}
      </text>
    </motion.g>
  );
};

/**
 * DATA PACKET COMPONENT
 * Small animated circle traveling along a path
 */
const DataPacket: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
  color: string;
}> = ({ fromX, fromY, toX, toY, delay, color }) => {
  return (
    <motion.circle
      cx={fromX}
      cy={fromY}
      r={3}
      fill={color}
      animate={{
        cx: [fromX, toX],
        cy: [fromY, toY],
        opacity: [1, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
      }}
    />
  );
};

/**
 * MAIN COMMAND CENTER LOADER COMPONENT
 */
export const CommandCenterLoader: React.FC<CommandCenterLoaderProps> = ({
  activeSquad = ['logician', 'humanist', 'visionary', 'realist'],
  showTerminal = true,
}) => {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [logs, setLogs] = useState<string[]>([PHASE_MESSAGES.scanning]);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [latency, setLatency] = useState(42);

  // Cycle through phases
  useEffect(() => {
    const phases: Phase[] = ['scanning', 'selecting', 'briefing', 'debating'];
    let currentPhaseIndex = 0;

    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      const newPhase = phases[currentPhaseIndex];
      setPhase(newPhase);

      // Add log entry
      setLogs((prev) => [
        ...prev.slice(-2), // Keep last 2 logs
        PHASE_MESSAGES[newPhase],
      ]);

      // Simulate latency changes
      setLatency(Math.floor(Math.random() * 100) + 20);

      // Flash conflict detection on "selecting" phase
      if (newPhase === 'selecting') {
        setConflictDetected(true);
        setTimeout(() => setConflictDetected(false), 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate positions for archetypes in orbit
  const archetypePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; angle: number }> = {};
    const radius = 120;

    ALL_ARCHETYPES.forEach((id, index) => {
      const angle = (index / ALL_ARCHETYPES.length) * 360;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      positions[id] = { x, y, angle };
    });

    return positions;
  }, []);

  // Calculate data packet positions for active squad
  const dataPackets = useMemo(() => {
    const packets: Array<{
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      delay: number;
      color: string;
      id: string;
    }> = [];

    activeSquad.forEach((memberId, index) => {
      const pos = archetypePositions[memberId];
      if (pos) {
        packets.push({
          fromX: 0,
          fromY: 0,
          toX: pos.x,
          toY: pos.y,
          delay: index * 0.3,
          color: ARCHETYPE_CONFIG[memberId as keyof typeof ARCHETYPE_CONFIG].color.replace(
            'text-',
            '#'
          ),
          id: memberId,
        });
      }
    });

    return packets;
  }, [activeSquad, archetypePositions]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* TOP PANE: System Status HUD */}
      <motion.div
        className="px-6 py-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          {/* Core Conflict Status */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">CORE_CONFLICT:</span>
            <motion.span
              className={`px-2 py-1 rounded ${
                conflictDetected ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'
              }`}
              animate={{
                boxShadow: conflictDetected ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
              }}
            >
              {conflictDetected ? '[DETECTED]' : '[BALANCED]'}
            </motion.span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">LATENCY:</span>
            <motion.span
              className="text-blue-300"
              key={latency}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {latency}ms
            </motion.span>
          </div>

          {/* Security Status */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SECURITY:</span>
            <span className="text-green-300">ENCRYPTED</span>
          </div>
        </div>
      </motion.div>

      {/* MIDDLE PANE: Network Graph */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox="-300 -300 600 600"
          className="absolute inset-0"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="600" height="600" x="-300" y="-300" fill="url(#grid)" />

          {/* SVG Connections from Chairman to Active Members */}
          {activeSquad.map((memberId) => {
            const pos = archetypePositions[memberId];
            if (!pos) return null;

            return (
              <motion.line
                key={`line-${memberId}`}
                x1={0}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke={ARCHETYPE_CONFIG[memberId as keyof typeof ARCHETYPE_CONFIG].color.replace(
                  'text-',
                  '#'
                )}
                strokeWidth="1.5"
                opacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
            );
          })}

          {/* Data Packets traveling along connections */}
          {phase === 'debating' &&
            dataPackets.map((packet) => (
              <DataPacket
                key={`packet-${packet.id}`}
                fromX={packet.fromX}
                fromY={packet.fromY}
                toX={packet.toX}
                toY={packet.toY}
                delay={packet.delay}
                color={packet.color}
              />
            ))}

          {/* Chairman Node (Center) */}
          <motion.g
            animate={{
              filter: phase === 'debating' ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))' : 'none',
            }}
          >
            <circle cx={0} cy={0} r={32} fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />

            {/* Chairman Icon */}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl fill-blue-400"
              fontSize="24"
            >
              ⚡
            </text>
          </motion.g>

          {/* Archetype Nodes in Orbit */}
          {ALL_ARCHETYPES.map((id, index) => {
            const angle = (index / ALL_ARCHETYPES.length) * 360;
            const isActive = activeSquad.includes(id);

            return (
              <ArchetypeNode
                key={id}
                id={id}
                angle={angle}
                isActive={isActive}
                radius={120}
              />
            );
          })}
        </svg>

        {/* Phase Indicator Overlay */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="text-sm font-mono text-slate-300 mb-4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {phase.toUpperCase()}
          </motion.div>
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Loader className="w-8 h-8 text-blue-400 mx-auto" />
          </motion.div>
        </motion.div>
      </div>

      {/* BOTTOM PANE: Terminal Log */}
      {showTerminal && (
        <motion.div
          className="px-6 py-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm font-mono text-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-slate-500 mb-2">PROCESS LOG:</div>
          <div className="space-y-1 max-h-20 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {logs.map((log, index) => (
                <motion.div
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-slate-400 flex items-center gap-2"
                >
                  <span className="text-green-400">›</span>
                  <span>{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CommandCenterLoader;
