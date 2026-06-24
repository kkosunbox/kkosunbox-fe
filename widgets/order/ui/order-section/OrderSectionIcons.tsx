export function ChevronIcon({ open, size = 24 }: { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: open ? "matrix(1,0,0,-1,0,0)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderCheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="var(--color-accent)" strokeWidth="1.5" />
      <path
        d="M5.5 9L8 11.5L12.5 6.5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6L4.5 8.5L10 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RadioCheckedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="var(--color-accent)" />
      <rect x="5" y="5" width="10" height="10" rx="5" fill="var(--color-accent)" />
    </svg>
  );
}

export function QuantityMinusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--color-text-muted)" fillOpacity="0.3" />
      <path d="M8 12H16" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function QuantityPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--color-text-muted)" fillOpacity="0.3" />
      <path d="M12 15L12 9" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 12L9 12" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="var(--color-text)" strokeWidth="1.5" />
      <path d="M2 10H22" stroke="var(--color-text)" strokeWidth="1.5" />
    </svg>
  );
}

export function BillingRegisteredIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { CheckIcon, RadioCheckedIcon };
