/**
 * Frontend utilities for working with the Council Configuration
 * Provides helpers to map between member IDs, model IDs, and display names
 */

import {
  COUNCIL_CONFIG,
  getAllCouncilMembers,
  getCouncilMember,
  getMemberIdFromModelId,
} from "../../../shared/council_config";

/**
 * Get all council members formatted for UI display
 */
export function getCouncilMembersForUI() {
  return getAllCouncilMembers().map((member) => ({
    id: member.id,
    display_name: member.display_name,
    model_id: member.model_id,
    ui_badge: member.ui_badge,
    icon_provider: member.icon_provider,
  }));
}

/**
 * Get a mapping of model IDs to display names for chairman selector
 */
export function getChairmanModelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  getAllCouncilMembers().forEach((member) => {
    map[member.model_id] = member.display_name;
  });
  return map;
}

/**
 * Get display name for a model ID
 */
export function getDisplayNameForModel(modelId: string): string {
  const member = getAllCouncilMembers().find((m) => m.model_id === modelId);
  return member ? member.display_name : "Unknown";
}

/**
 * Get display name for a member ID
 */
export function getDisplayNameForMember(memberId: string): string {
  const member = getCouncilMember(memberId);
  return member ? member.display_name : "Unknown";
}

/**
 * Get icon provider for a model ID
 */
export function getIconProviderForModel(modelId: string): string {
  const member = getAllCouncilMembers().find((m) => m.model_id === modelId);
  return member ? member.icon_provider : "openai";
}

/**
 * Get UI badge for a member ID
 */
export function getUIBadgeForMember(memberId: string): string {
  const member = getCouncilMember(memberId);
  return member ? member.ui_badge : "";
}

/**
 * Get all model IDs in order
 */
export function getAllModelIds(): string[] {
  return getAllCouncilMembers().map((m) => m.model_id);
}

/**
 * Get all member IDs in order
 */
export function getAllMemberIds(): string[] {
  return getAllCouncilMembers().map((m) => m.id);
}

/**
 * Map model ID to member ID
 */
export function mapModelIdToMemberId(modelId: string): string | null {
  return getMemberIdFromModelId(modelId);
}

/**
 * Get full member object by model ID
 */
export function getMemberByModelId(modelId: string) {
  const memberId = getMemberIdFromModelId(modelId);
  return memberId ? getCouncilMember(memberId) : null;
}

/**
 * Get full member object by member ID
 */
export function getMemberById(memberId: string) {
  return getCouncilMember(memberId);
}
