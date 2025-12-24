/**
 * Verdict Card Types
 * Shared types for the verdict card component
 */

export interface VerdictCardData {
  conflict_level: "Low" | "High";
  primary_conflict: string;
  evolution_logic: string;
  final_verdict_markdown: string;
}
