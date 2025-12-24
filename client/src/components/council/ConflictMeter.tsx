import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ConflictMeterProps {
  level: "Low" | "High";
}

export default function ConflictMeter({ level }: ConflictMeterProps) {
  const isHigh = level === "High";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isHigh
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-green-100 text-green-700 border border-green-300"
      }`}
    >
      {isHigh ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      <span>Conflict: {level}</span>
    </div>
  );
}
