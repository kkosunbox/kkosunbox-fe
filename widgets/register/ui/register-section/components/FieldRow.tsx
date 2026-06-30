/* ─── 필드 행 래퍼 (라벨 + 입력) ─── */
export function FieldRow({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-0 lg:gap-0">
      <label
        htmlFor={htmlFor}
        className="shrink-0 max-md:w-[72px] md:w-[94px] lg:w-[94px] text-[13px] font-medium leading-[16px] text-[var(--color-text)]"
      >
        {label}
        {required && <span style={{ color: "var(--color-accent-rust)" }}>*</span>}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
