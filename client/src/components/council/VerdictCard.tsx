import { Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ConflictMeter from "./ConflictMeter";
import EvolutionBox from "./EvolutionBox";
import CopyButton from "./CopyButton";
import { VerdictCardData } from "@/lib/verdict_types";

interface VerdictCardProps {
  data: VerdictCardData;
  chairmanName: string;
  chairmanIcon?: React.ReactNode;
}

export default function VerdictCard({
  data,
  chairmanName,
  chairmanIcon,
}: VerdictCardProps) {
  return (
    <div className="mb-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Header with premium styling */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3 border-b border-amber-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-amber-900 text-base">
              ⚖️ CHAIRMAN'S VERDICT
            </h3>
          </div>
          <ConflictMeter level={data.conflict_level} />
        </div>

        {/* Chairman info */}
        <div className="text-xs text-amber-800 font-semibold">
          Ruling by {chairmanName}
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4 w-full overflow-visible">
        {/* Primary Conflict */}
        <div className="bg-white/60 rounded p-3 border border-amber-200/50">
          <p className="text-xs font-semibold text-amber-700 mb-1">
            POINT OF CONTENTION
          </p>
          <p className="text-sm text-gray-700 break-words">
            {data.primary_conflict}
          </p>
        </div>

        {/* Evolution Box - The Magic Moment */}
        <EvolutionBox evolutionLogic={data.evolution_logic} />

        {/* Final Verdict */}
        <div className="bg-white/80 rounded p-4 border border-amber-200/50">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-bold text-gray-900 text-sm">The Ruling</h4>
            <CopyButton text={data.final_verdict_markdown} />
          </div>
          <div className="prose prose-sm max-w-none text-sm text-gray-700 break-words overflow-visible w-full">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="break-words whitespace-pre-wrap mb-2 overflow-visible">
                    {children}
                  </p>
                ),
                li: ({ children }) => (
                  <li className="break-words whitespace-pre-wrap ml-4 overflow-visible">
                    {children}
                  </li>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 overflow-visible">{children}</ul>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900 overflow-visible">
                    {children}
                  </strong>
                ),
              }}
            >
              {data.final_verdict_markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
