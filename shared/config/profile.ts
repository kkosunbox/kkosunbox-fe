export const DEFAULT_PROFILE_NAME = "-";

export function getProfileDisplayName(name: string | null | undefined): string {
  return name?.trim() || DEFAULT_PROFILE_NAME;
}
