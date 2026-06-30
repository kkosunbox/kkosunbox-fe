/* ─── 체크박스 ─── */
export function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] border transition-colors"
      style={{
        borderColor: checked ? "var(--color-accent)" : "var(--color-icon-muted)",
        background: checked ? "var(--color-accent)" : "transparent",
      }}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
