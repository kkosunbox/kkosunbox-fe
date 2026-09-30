/* ─── 체크박스 ─── */
export function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] border transition-colors"
      style={{
        borderColor: checked ? "var(--color-checkbox-checked)" : "var(--color-icon-muted)",
        background: checked ? "var(--color-checkbox-checked)" : "transparent",
      }}
    >
      {checked && (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4.1665 10.833L7.49984 14.1663L15.8332 5.83301" stroke="var(--color-surface-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
