export const DEFAULT_PROFILE_NAME = "멍멍이";

export function getProfileDisplayName(name: string | null | undefined): string {
  return name?.trim() || DEFAULT_PROFILE_NAME;
}
