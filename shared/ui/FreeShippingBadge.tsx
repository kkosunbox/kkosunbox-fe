export default function FreeShippingBadge({
  className = "",
  withIcon = true,
}: {
  className?: string;
  withIcon?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-[24px] border font-semibold ${
        withIcon
          ? "h-[22px] w-[76px] px-1"
          : "h-[22px] w-[58px] px-1.5"
      } border-[var(--color-text-muted)] text-[12px] leading-[17px] text-[var(--color-text-secondary)] ${className}`}
    >
      {withIcon ? (
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
      ) : null}
      <span className="inline-flex h-4 items-center leading-none">무료배송</span>
    </span>
  );
}
