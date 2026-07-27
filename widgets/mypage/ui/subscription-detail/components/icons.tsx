import { useId } from "react";

export function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M9 11L12 14L15 11M12 14L12 4"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function PencilIcon() {
  // mask id는 컴포넌트가 한 페이지에 여러 번 렌더돼도 충돌하지 않도록 인스턴스마다 고유하게 만든다.
  const maskId = useId();

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="2" y="2.01489" width="16" height="16" fill="black">
        <rect fill="white" x="2" y="2.01489" width="16" height="16" />
        <path d="M15.5118 4.50209C14.861 3.85249 13.8057 3.85249 13.1548 4.50209L4 13.6389V16.0149H6.33334L15.5118 6.85447C16.1627 6.20488 16.1627 5.15168 15.5118 4.50209Z" />
      </mask>
      <path
        d="M12.1548 5.50012L11.625 6.03097L13.982 8.38336L14.5118 7.85251L15.0416 7.32165L12.6846 4.96927L12.1548 5.50012ZM15.5118 4.50209L16.5715 3.44038V3.44038L15.5118 4.50209ZM6.33334 16.0149V17.5149C6.73065 17.5149 7.11174 17.3573 7.39295 17.0766L6.33334 16.0149ZM4 16.0149H2.5C2.5 16.8433 3.17157 17.5149 4 17.5149V16.0149ZM4 13.6389L2.94039 12.5772C2.65844 12.8585 2.5 13.2405 2.5 13.6389H4ZM13.1548 4.50209L14.2144 5.56379C14.2798 5.49859 14.3869 5.49859 14.4522 5.56379L15.5118 4.50209L16.5715 3.44038C15.335 2.2064 13.3316 2.2064 12.0952 3.44038L13.1548 4.50209ZM15.5118 4.50209L14.4522 5.56379C14.5159 5.62736 14.5159 5.7292 14.4522 5.79277L15.5118 6.85447L16.5715 7.91618C17.8095 6.68056 17.8095 4.676 16.5715 3.44038L15.5118 4.50209ZM15.5118 6.85447L14.4522 5.79277L5.27373 14.9532L6.33334 16.0149L7.39295 17.0766L16.5715 7.91618L15.5118 6.85447ZM6.33334 16.0149V14.5149H4V16.0149V17.5149H6.33334V16.0149ZM13.1548 4.50209L12.0952 3.44038L2.94039 12.5772L4 13.6389L5.05961 14.7006L14.2144 5.56379L13.1548 4.50209ZM4 13.6389H2.5V16.0149H4H5.5V13.6389H4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path d="M11 5L15 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export { ChevronIcon };
