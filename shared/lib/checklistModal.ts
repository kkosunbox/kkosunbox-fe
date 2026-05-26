export interface ChecklistFormOptions {
  rewrite?: boolean;
  editQuestionId?: number | null;
}

export function openChecklistForm(opts?: ChecklistFormOptions) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ggosoon:open-checklist-form", { detail: opts ?? {} }),
    );
  }
}
