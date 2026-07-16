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

export { CheckIcon, RadioCheckedIcon };
