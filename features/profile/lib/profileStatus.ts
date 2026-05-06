import type { Profile } from "@/features/profile/api/types";

export function hasProfileRecord(profile: Profile | null | undefined): profile is Profile {
  return profile != null;
}

export function hasChecklistAnswers(profile: Profile | null | undefined): boolean {
  return (profile?.checklistAnswers?.length ?? 0) > 0;
}
