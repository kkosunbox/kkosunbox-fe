// ── 체크리스트 ────────────────────────────────────────────────────

export interface ChecklistOption {
  id: number;
  text: string;       // 선택지 내용
  slug: string;       // 추천 로직 식별자
  sortOrder: number;  // 정렬 순서
}

export interface ChecklistQuestion {
  id: number;
  text: string;                // 질문 내용
  description: string | null;  // 부연 설명
  isMultiSelect: boolean;      // 복수 선택 허용 여부
  sortOrder: number;           // 정렬 순서
  options: ChecklistOption[];
}

/** POST/PATCH 요청 시 답변 입력 형식 */
export interface ChecklistAnswerInput {
  questionId: number;
  optionIds: number[];
}

/** 프로필에 저장된 답변 조회 형식 (GET 응답) */
export interface ChecklistAnswer {
  questionId: number;
  questionText: string;
  selectedOptions: ChecklistOption[];
}

// ── Profile ───────────────────────────────────────────────────────

export type DogGender = "male" | "female";

export interface Profile {
  id: number;
  name: string | null;
  breed: string | null;
  gender: DogGender | null;
  birthDate: string | null;  // YYYY-MM-DD
  weight: number | null;     // kg
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  checklistAnswers: ChecklistAnswer[];
}

// ── 요청 ─────────────────────────────────────────────────────────

/** 프로필 생성 — 모든 필드 선택, checklistAnswers 전달 시 함께 저장 */
export interface CreateProfileRequest {
  name?: string;
  breed?: string;
  gender?: DogGender;
  birthDate?: string;
  weight?: number;
  profileImageUrl?: string;
  checklistAnswers?: ChecklistAnswerInput[];
}

/**
 * 프로필 수정 — 필드를 null로 전달하면 해당 값을 명시적으로 초기화.
 * checklistAnswers 전달 시 기존 답변 전체 교체.
 */
export interface UpdateProfileRequest {
  name?: string | null;
  breed?: string | null;
  gender?: DogGender | null;
  birthDate?: string | null;
  weight?: number | null;
  profileImageUrl?: string | null;
  checklistAnswers?: ChecklistAnswerInput[];
}
