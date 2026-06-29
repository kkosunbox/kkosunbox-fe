import { describe, it, expect } from "vitest";
import {
  parseProfileBirthDate,
  petBirthToIso,
  profileToPetInfo,
  petInfoEqual,
  answersEqual,
  buildCreateProfileBody,
  buildUpdateProfileBody,
  fallbackRecommend,
  computeInitialState,
  getChecklistCtaLabel,
  isChecklistCtaDisabled,
  EMPTY_PET_INFO,
} from "@/widgets/checklist/ui/checklist-form/checklistFormHelpers";
import type { PetInfo } from "@/widgets/checklist/ui/types";
import type {
  ChecklistQuestion,
  Profile,
} from "@/features/profile/api/types";

// ── 픽스처 ────────────────────────────────────────────────────────────
function pet(overrides: Partial<PetInfo> = {}): PetInfo {
  return { ...EMPTY_PET_INFO, ...overrides };
}

const Q1: ChecklistQuestion = {
  id: 101,
  text: "어떤 간식을 좋아하나요?",
  shortText: null,
  description: null,
  isMultiSelect: false,
  sortOrder: 1,
  options: [
    { id: 1001, text: "육포", slug: "jerky", sortOrder: 1, isExclusive: false },
    { id: 1002, text: "비스킷", slug: "biscuit", sortOrder: 2, isExclusive: false },
  ],
};
const Q2: ChecklistQuestion = {
  id: 102,
  text: "알레르기가 있나요?",
  shortText: null,
  description: null,
  isMultiSelect: false,
  sortOrder: 2,
  options: [
    { id: 2001, text: "없음", slug: "none", sortOrder: 1, isExclusive: false },
    { id: 2002, text: "닭고기", slug: "chicken", sortOrder: 2, isExclusive: false },
  ],
};
const QUESTIONS = [Q1, Q2];

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 1,
    name: "쿠키",
    breed: "포메라니안",
    gender: "female",
    birthDate: "2020-01-01",
    weight: 3.5,
    profileImageUrl: "https://img.example/avatar.png",
    specialNotes: "활발해요",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    checklistAnswers: [],
    ...overrides,
  };
}

// ── 날짜 변환 ─────────────────────────────────────────────────────────
describe("petBirthToIso / parseProfileBirthDate", () => {
  it("Date → YYYY-MM-DD (zero-pad)", () => {
    expect(petBirthToIso(new Date(2020, 0, 5))).toBe("2020-01-05");
    expect(petBirthToIso(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("null → null", () => {
    expect(petBirthToIso(null)).toBeNull();
  });

  it("ISO → Date 라운드트립, 잘못된 값은 null", () => {
    const d = parseProfileBirthDate("2020-01-05");
    expect(d).not.toBeNull();
    expect(petBirthToIso(d)).toBe("2020-01-05");
    expect(parseProfileBirthDate("")).toBeNull();
    expect(parseProfileBirthDate(null)).toBeNull();
    expect(parseProfileBirthDate("not-a-date")).toBeNull();
  });
});

// ── 페이로드 빌더 (이번 리팩토링 DRY 핵심) ────────────────────────────
describe("buildCreateProfileBody — 값 있는 필드만 포함", () => {
  it("이름 trim + 빈 값 필드는 생략", () => {
    const body = buildCreateProfileBody(
      pet({ name: "  보리  ", breed: "", specialNotes: "", weight: "", gender: null, birthDate: null }),
      [{ questionId: 101, optionIds: [1001] }],
    );
    expect(body).toEqual({
      name: "보리",
      checklistAnswers: [{ questionId: 101, optionIds: [1001] }],
    });
    // 빈 값 키는 아예 존재하지 않아야 한다(undefined 아님)
    expect("breed" in body).toBe(false);
    expect("gender" in body).toBe(false);
    expect("birthDate" in body).toBe(false);
    expect("weight" in body).toBe(false);
    expect("specialNotes" in body).toBe(false);
  });

  it("값이 있으면 trim/parse하여 포함", () => {
    const body = buildCreateProfileBody(
      pet({
        name: "보리",
        breed: " 푸들 ",
        specialNotes: " 메모 ",
        weight: "4.2",
        gender: "male",
        birthDate: new Date(2021, 5, 1),
      }),
      [],
    );
    expect(body).toEqual({
      name: "보리",
      checklistAnswers: [],
      breed: "푸들",
      specialNotes: "메모",
      weight: 4.2,
      gender: "male",
      birthDate: "2021-06-01",
    });
  });

  it("weight가 숫자로 파싱 불가하면 생략", () => {
    const body = buildCreateProfileBody(pet({ name: "보리", weight: "abc" }), []);
    expect("weight" in body).toBe(false);
  });
});

describe("buildUpdateProfileBody — 빈 값은 null로 명시 초기화", () => {
  it("빈 값 → null, name은 trim", () => {
    expect(
      buildUpdateProfileBody(
        pet({ name: " 보리 ", breed: "", specialNotes: "", weight: "", gender: null, birthDate: null }),
      ),
    ).toEqual({
      name: "보리",
      breed: null,
      specialNotes: null,
      gender: null,
      birthDate: null,
      weight: null,
    });
  });

  it("값이 있으면 trim/parse", () => {
    expect(
      buildUpdateProfileBody(
        pet({ name: "보리", breed: " 푸들 ", specialNotes: " 메모 ", weight: "4.2", gender: "female", birthDate: new Date(2021, 5, 1) }),
      ),
    ).toEqual({
      name: "보리",
      breed: "푸들",
      specialNotes: "메모",
      gender: "female",
      birthDate: "2021-06-01",
      weight: 4.2,
    });
  });

  it("weight 파싱 불가 → null", () => {
    expect(buildUpdateProfileBody(pet({ name: "보리", weight: "abc" })).weight).toBeNull();
  });
});

// ── 추천 tier 폴백 ────────────────────────────────────────────────────
describe("fallbackRecommend — 선택 총 개수 임계값", () => {
  const make = (counts: number[]) =>
    counts.map((c, i) => ({ questionId: i + 1, optionIds: Array.from({ length: c }, (_, k) => k + 1) }));

  it("총 6개 이상 → premium", () => {
    expect(fallbackRecommend(make([3, 3]))).toBe("premium");
    expect(fallbackRecommend(make([6]))).toBe("premium");
  });
  it("총 3~5개 → standard", () => {
    expect(fallbackRecommend(make([3]))).toBe("standard");
    expect(fallbackRecommend(make([2, 3]))).toBe("standard");
  });
  it("총 3개 미만 → basic", () => {
    expect(fallbackRecommend(make([2]))).toBe("basic");
    expect(fallbackRecommend([])).toBe("basic");
  });
});

// ── 초기 상태 복원 (분기 매트릭스) ────────────────────────────────────
describe("computeInitialState", () => {
  it("isNewProfile → 빈 폼 · step 0", () => {
    const s = computeInitialState({
      questions: QUESTIONS,
      options: { isNewProfile: true },
      isLoggedIn: true,
      activeProfile: profile(),
    });
    expect(s.petInfo).toEqual(EMPTY_PET_INFO);
    expect(s.avatarSrc).toBeNull();
    expect(s.answers).toEqual({});
    expect(s.initialStep).toBe(0);
  });

  it("editProfile + 로그인 + 프로필 → 프로필 프리필 · step 0", () => {
    const p = profile();
    const s = computeInitialState({
      questions: QUESTIONS,
      options: { editProfile: true },
      isLoggedIn: true,
      activeProfile: p,
    });
    expect(s.petInfo).toEqual(profileToPetInfo(p));
    expect(s.avatarSrc).toBe(p.profileImageUrl);
    expect(s.initialStep).toBe(0);
  });

  it("일반 로그인(이름 있음) → 답변 복원 · step 1", () => {
    const p = profile({
      checklistAnswers: [
        {
          questionId: 101,
          questionText: "어떤 간식을 좋아하나요?",
          selectedOptions: [
            { id: 1001, text: "육포", slug: "jerky", sortOrder: 1, isExclusive: false },
          ],
        },
      ],
    });
    const s = computeInitialState({
      questions: QUESTIONS,
      options: {},
      isLoggedIn: true,
      activeProfile: p,
    });
    expect(s.answers).toEqual({ 101: [1001] });
    expect(s.initialStep).toBe(1);
  });

  it("일반 로그인(이름 없음) → step 0", () => {
    const s = computeInitialState({
      questions: QUESTIONS,
      options: {},
      isLoggedIn: true,
      activeProfile: profile({ name: "" }),
    });
    expect(s.initialStep).toBe(0);
  });

  it("rewrite → step 1", () => {
    const s = computeInitialState({
      questions: QUESTIONS,
      options: { rewrite: true },
      isLoggedIn: false,
      activeProfile: null,
    });
    expect(s.initialStep).toBe(1);
  });

  it("editQuestionId → 해당 질문 스텝(index+1)", () => {
    const s = computeInitialState({
      questions: QUESTIONS,
      options: { editQuestionId: 102 },
      isLoggedIn: false,
      activeProfile: null,
    });
    expect(s.initialStep).toBe(2);
  });

  it("editQuestionId가 목록에 없으면 무시", () => {
    const s = computeInitialState({
      questions: QUESTIONS,
      options: { editQuestionId: 999 },
      isLoggedIn: false,
      activeProfile: null,
    });
    expect(s.initialStep).toBe(0);
  });
});

// ── CTA 표현 로직 ─────────────────────────────────────────────────────
describe("getChecklistCtaLabel", () => {
  it("step 0 · 편집모드 저장중/대기", () => {
    expect(getChecklistCtaLabel({ step: 0, isEditProfileMode: true, isSaving: true, lastQuestionStep: 2 })).toBe("저장 중…");
    expect(getChecklistCtaLabel({ step: 0, isEditProfileMode: true, isSaving: false, lastQuestionStep: 2 })).toBe("저장");
  });
  it("step 0 · 일반 → 작성하기", () => {
    expect(getChecklistCtaLabel({ step: 0, isEditProfileMode: false, isSaving: false, lastQuestionStep: 2 })).toBe("체크리스트 작성하기");
  });
  it("마지막 질문 → 결과보기, 중간 → 다음", () => {
    expect(getChecklistCtaLabel({ step: 2, isEditProfileMode: false, isSaving: false, lastQuestionStep: 2 })).toBe("결과보기");
    expect(getChecklistCtaLabel({ step: 1, isEditProfileMode: false, isSaving: false, lastQuestionStep: 2 })).toBe("다음");
  });
});

describe("isChecklistCtaDisabled", () => {
  const base = { isSaving: false, step: 0, isStep0NameValid: true, qLen: 2, isCurrentQuestionAnswered: true };
  it("저장중이면 항상 disabled", () => {
    expect(isChecklistCtaDisabled({ ...base, isSaving: true })).toBe(true);
  });
  it("step 0 · 이름 미입력 → disabled, 입력 → enabled", () => {
    expect(isChecklistCtaDisabled({ ...base, step: 0, isStep0NameValid: false })).toBe(true);
    expect(isChecklistCtaDisabled({ ...base, step: 0, isStep0NameValid: true })).toBe(false);
  });
  it("질문 스텝 · 미응답 → disabled, 응답 → enabled", () => {
    expect(isChecklistCtaDisabled({ ...base, step: 1, isCurrentQuestionAnswered: false })).toBe(true);
    expect(isChecklistCtaDisabled({ ...base, step: 1, isCurrentQuestionAnswered: true })).toBe(false);
  });
});

// ── isDirty 비교 함수 ─────────────────────────────────────────────────
describe("petInfoEqual / answersEqual", () => {
  it("동일 PetInfo → true, 한 필드라도 다르면 false", () => {
    expect(petInfoEqual(pet({ name: "보리" }), pet({ name: "보리" }))).toBe(true);
    expect(petInfoEqual(pet({ name: "보리" }), pet({ name: "콩" }))).toBe(false);
  });
  it("birthDate는 시각(timestamp) 동일성으로 비교", () => {
    expect(petInfoEqual(pet({ birthDate: new Date(2020, 0, 1) }), pet({ birthDate: new Date(2020, 0, 1) }))).toBe(true);
    expect(petInfoEqual(pet({ birthDate: new Date(2020, 0, 1) }), pet({ birthDate: new Date(2020, 0, 2) }))).toBe(false);
    expect(petInfoEqual(pet({ birthDate: null }), pet({ birthDate: null }))).toBe(true);
  });
  it("answersEqual은 옵션 순서에 무관", () => {
    expect(answersEqual({ 1: [2, 1] }, { 1: [1, 2] })).toBe(true);
    expect(answersEqual({ 1: [1] }, { 1: [1, 2] })).toBe(false);
    expect(answersEqual({ 1: [1] }, { 2: [1] })).toBe(false);
    expect(answersEqual({}, {})).toBe(true);
  });
});
