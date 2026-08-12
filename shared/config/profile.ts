export const DEFAULT_PROFILE_NAME = "-";

export function getProfileDisplayName(name: string | null | undefined): string {
  return name?.trim() || DEFAULT_PROFILE_NAME;
}

/**
 * 반려견 생년월일 선택 가능 범위의 하한 — 오늘로부터 30년 전.
 * 기네스 최장수견 기록(29년 5개월)을 살짝 넘겨 잡은 값이라 정상 입력을 막지 않는다.
 */
export const PET_BIRTH_MAX_AGE_YEARS = 30;

/** 생년월일 상한 — 오늘. 미래 날짜는 선택할 수 없다. */
export function getPetBirthMaxDate(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** 생년월일 하한 — `PET_BIRTH_MAX_AGE_YEARS`년 전 오늘. */
export function getPetBirthMinDate(now: Date = new Date()): Date {
  return new Date(
    now.getFullYear() - PET_BIRTH_MAX_AGE_YEARS,
    now.getMonth(),
    now.getDate(),
  );
}
