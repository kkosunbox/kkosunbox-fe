export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
export const SPECIAL_NOTES_PLACEHOLDER = "예) 푸드퍼즐 간식을 좋아해요.";
export const SPECIAL_NOTES_MAX_LENGTH = 200;

export function birthDateInputValue(profileBirth: string | null | undefined): string {
  if (!profileBirth?.trim()) return "";
  const day = profileBirth.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

export function formatBirthDateDisplayDots(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function birthDateToValue(birth: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
  const [y, m, d] = birth.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatWeightInput(value: string, isFocused: boolean): string {
  if (isFocused) return value;
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? `${value}kg` : value;
}

export function weightInputValue(profileWeight: number | null | undefined): string {
  return profileWeight !== null && profileWeight !== undefined ? String(profileWeight) : "";
}

export type WeightParseResult =
  | { ok: true; trimmedWeight: string; parsedWeight: number | undefined }
  | { ok: false; errorMessage: string };

export function parseWeightForSave(weight: string): WeightParseResult {
  const trimmedWeight = weight.trim();
  const parsedWeight = trimmedWeight ? parseFloat(trimmedWeight) : NaN;
  if (trimmedWeight && Number.isNaN(parsedWeight)) {
    return { ok: false, errorMessage: "몸무게는 숫자로 입력해 주세요." };
  }
  return {
    ok: true,
    trimmedWeight,
    parsedWeight: trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : undefined,
  };
}
