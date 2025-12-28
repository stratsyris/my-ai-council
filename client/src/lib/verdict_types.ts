/**
 * Verdict Card Types
 * Shared types for the verdict card component
 */

export interface VerdictCardData {
  conflict_level: "Low" | "High";
  primary_conflict: string;
  evolution_logic: string;
  weighing_of_souls?: string; // Optional: The reasoning behind which member's argument was strongest
  final_verdict_markdown: string;
}
