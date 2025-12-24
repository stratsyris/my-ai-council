import { Lightbulb } from "lucide-react";

interface EvolutionBoxProps {
  evolutionLogic: string;
}

export default function EvolutionBox({ evolutionLogic }: EvolutionBoxProps) {
  return (
    <div className="relative mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-lg overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 opacity-10 text-amber-400">
        <Lightbulb className="w-24 h-24" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <h4 className="font-bold text-amber-900 text-sm">The Evolution</h4>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap break-words">
          {evolutionLogic}
        </p>
      </div>
    </div>
  );
}
