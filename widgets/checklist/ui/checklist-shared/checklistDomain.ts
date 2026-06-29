import type {
  ChecklistAnswerInput,
  CreateProfileRequest,
  Profile,
  UpdateProfileRequest,
} from "@/features/profile/api/types";
import type { PetInfo, RecommendedTier } from "../types";

/* ── 날짜 변환 ── */
export function parseProfileBirthDate(
  iso: string | null | undefined,
): Date | null {
  if (!iso?.trim()) return null;
  const day = iso.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function petBirthToIso(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/* ── PetInfo 변환·복제·비교 ── */
export function profileToPetInfo(p: Profile): PetInfo {
  return {
    name: p.name?.trim() ?? "",
    breed: p.breed?.trim() ?? "",
    specialNotes: p.specialNotes?.trim() ?? "",
    birthDate: parseProfileBirthDate(p.birthDate),
    weight:
      p.weight != null && !Number.isNaN(Number(p.weight)) ? String(p.weight) : "",
    gender: p.gender ?? null,
  };
}

export function clonePetInfo(p: PetInfo): PetInfo {
  return {
    name: p.name,
    breed: p.breed,
    specialNotes: p.specialNotes,
    birthDate: p.birthDate ? new Date(p.birthDate.getTime()) : null,
    weight: p.weight,
    gender: p.gender,
  };
}

export function petInfoEqual(a: PetInfo, b: PetInfo): boolean {
  if (
    a.name !== b.name ||
    a.breed !== b.breed ||
    a.specialNotes !== b.specialNotes ||
    a.weight !== b.weight ||
    a.gender !== b.gender
  )
    return false;
  return (a.birthDate?.getTime() ?? null) === (b.birthDate?.getTime() ?? null);
}

export function answersEqual(
  a: Record<number, number[]>,
  b: Record<number, number[]>,
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].map(Number));
  for (const k of keys) {
    const ak = [...(a[k] ?? [])].sort((x, y) => x - y);
    const bk = [...(b[k] ?? [])].sort((x, y) => x - y);
    if (ak.length !== bk.length || !ak.every((x, i) => x === bk[i])) return false;
  }
  return true;
}

/* ── 프로필 요청 페이로드 빌더 (순수) ──
 * petInfo의 trim·parse 규칙을 한 곳으로 모아 create/update 양쪽에서 재사용한다. */
function petWeightToNumber(weight: string): number | null {
  const trimmed = weight.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

/** 프로필 생성용 페이로드 — 값이 있는 필드만 포함(빈 값은 생략). */
export function buildCreateProfileBody(
  petInfo: PetInfo,
  checklistAnswers: ChecklistAnswerInput[],
): CreateProfileRequest {
  const trimmedBreed = petInfo.breed.trim();
  const trimmedNotes = petInfo.specialNotes.trim();
  const weightValue = petWeightToNumber(petInfo.weight);
  const birthIso = petBirthToIso(petInfo.birthDate);
  return {
    name: petInfo.name.trim(),
    checklistAnswers,
    ...(trimmedBreed ? { breed: trimmedBreed } : {}),
    ...(trimmedNotes ? { specialNotes: trimmedNotes } : {}),
    ...(petInfo.gender ? { gender: petInfo.gender } : {}),
    ...(birthIso ? { birthDate: birthIso } : {}),
    ...(weightValue !== null ? { weight: weightValue } : {}),
  };
}

/** 프로필 수정용 공통 페이로드 — 빈 값은 null로 명시 초기화. */
export function buildUpdateProfileBody(petInfo: PetInfo): UpdateProfileRequest {
  return {
    name: petInfo.name.trim(),
    breed: petInfo.breed.trim() || null,
    specialNotes: petInfo.specialNotes.trim() || null,
    gender: petInfo.gender,
    birthDate: petBirthToIso(petInfo.birthDate),
    weight: petWeightToNumber(petInfo.weight),
  };
}

/* ── 추천 tier 폴백 ── */
export function fallbackRecommend(
  answers: ChecklistAnswerInput[],
): RecommendedTier {
  const n = answers.reduce((s, a) => s + a.optionIds.length, 0);
  if (n >= 6) return "premium";
  if (n >= 3) return "standard";
  return "basic";
}

/* ── 상수·타입 ── */
export const EMPTY_PET_INFO: PetInfo = {
  name: "",
  breed: "",
  specialNotes: "",
  birthDate: null,
  weight: "",
  gender: null,
};

export interface Baseline {
  petInfo: PetInfo;
  avatarSrc: string | null;
  answers: Record<number, number[]>;
}
