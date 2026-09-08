export default function FreeShippingBadge({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "image";
}) {
  const isImageBadge = variant === "image";

  return (
    <span
      className={`flex shrink-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-[24px] border font-semibold ${
        isImageBadge
          ? "h-[18px] w-[59px] border-[var(--color-surface-light)] px-1 text-[10px] leading-3 text-white"
          : "h-[22px] w-[76px] border-[var(--color-text-muted)] px-1 text-[12px] leading-[17px] text-[var(--color-text-secondary)]"
      } ${className}`}
    >
      {isImageBadge ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="9.33366" cy="9.62492" r="1.16667" stroke="currentColor" />
          <circle cx="5.24967" cy="9.62492" r="1.16667" stroke="currentColor" />
          <path
            d="M11.6663 6.125V5.43896C11.6663 5.13517 11.5283 4.84786 11.291 4.65809L8.74967 2.625H6.41634V6.70833H2.91634M6.41634 2.625V3.79167H2.33301V7.875C2.33301 8.8415 3.11651 9.625 4.08301 9.625M9.91634 3.79167H9.33301V6.125H11.6663M11.6663 6.125V8.45833C11.6663 9.10267 11.144 9.625 10.4997 9.625M8.16634 9.625H6.41634"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="10.6673" cy="10.9998" r="1.33333" stroke="currentColor" />
          <circle cx="5.99935" cy="10.9998" r="1.33333" stroke="currentColor" />
          <path
            d="M13.3327 7V6.14729C13.3327 5.84351 13.1946 5.55619 12.9574 5.36642L9.99935 3H7.33268V7.66667H3.33268M7.33268 3V4.33333H2.66602V9C2.66602 10.1046 3.56145 11 4.66602 11M11.3327 4.33333H10.666V7H13.3327M13.3327 7V9.66667C13.3327 10.403 12.7357 11 11.9993 11M9.33268 11H7.33268"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className={`inline-flex items-center leading-none ${isImageBadge ? "h-3" : "h-4"}`}>
        무료배송
      </span>
    </span>
  );
}
