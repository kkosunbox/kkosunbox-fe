export interface ChecklistFormOptions {
  rewrite?: boolean;
  editQuestionId?: number | null;
  /** 새 프로필 추가 — step 0 빈 폼에서 시작, submit 시 createProfile */
  isNewProfile?: boolean;
  /** 기존 프로필 수정 — step 0에 activeProfile 프리필, 저장 후 모달 닫기 */
  editProfile?: boolean;
}

export interface OpenChecklistFormDetail extends ChecklistFormOptions {
  /**
   * `/checklist` 라우트처럼 모달을 연 직후 `router.replace("/")`로 경로를 바꾸는
   * 리다이렉트 진입을 표시한다. 모달이 그 1회성 경로 변경 때문에 닫히지 않도록 한다.
   */
  viaRedirect?: boolean;
}

export function openChecklistForm(opts?: OpenChecklistFormDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ggosoon:open-checklist-form", { detail: opts ?? {} }),
    );
  }
}
