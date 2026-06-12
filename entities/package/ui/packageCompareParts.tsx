/** 패키지 비교표·영양정보 모달 공용 아이콘 */

export function PackageCompareHeartIcon({ filled }: { filled: boolean }) {
  const color = filled ? "var(--color-primary)" : "var(--color-text-muted)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PackageCompareCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="목록으로 돌아가기"
      className="flex h-6 w-6 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
