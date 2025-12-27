import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DispatchBrief {
  task_category: string;
  dispatch_strategy: string;
  assignments: {
    Logician: string;
    Humanist: string;
    Visionary: string;
    Realist: string;
  };
}

interface TaskAnalysisCardProps {
  dispatchBrief: DispatchBrief;
}

export default function TaskAnalysisCard({ dispatchBrief }: TaskAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!dispatchBrief) return null;

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 p-4 mb-4">
      <Button
        variant="ghost"
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-left">
          <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Task Analysis: {dispatchBrief.task_category}
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              {dispatchBrief.dispatch_strategy}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
            Member Assignments:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(dispatchBrief.assignments).map(([member, assignment]) => (
              <div
                key={member}
                className="bg-white dark:bg-slate-900/50 rounded-lg p-3 border border-amber-100 dark:border-amber-900/50"
              >
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                  {member}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  {assignment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
