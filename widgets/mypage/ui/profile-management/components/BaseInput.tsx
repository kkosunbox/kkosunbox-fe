import { type InputHTMLAttributes } from "react";

export function BaseInput({
  className = "",
  readOnly = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      className={[
        "h-10 w-full rounded-[4px] border-0 bg-[var(--color-surface-light)] px-3 text-body-13-m text-[var(--color-text)] outline-none",
        readOnly ? "cursor-default text-[var(--color-text-secondary)]" : "",
        className,
      ].join(" ")}
    />
  );
}
