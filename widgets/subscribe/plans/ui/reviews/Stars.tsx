// 리뷰 별점 표시. 0.5 단위 반올림으로 full/half/empty 아이콘을 조합한다.
// SubscribeProductDetailPage에서 분리. 색상은 토큰(--color-star/--color-text-muted)으로 통일.

function FullStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="var(--color-star)"
      />
    </svg>
  );
}

function HalfStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="var(--color-star)"
      />
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="var(--color-star)"
      />
      <path
        d="M14.81 8.63L12 2V17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63Z"
        fill="var(--color-text-muted)"
      />
    </svg>
  );
}

function EmptyStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="var(--color-text-muted)"
      />
    </svg>
  );
}

export default function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  const normalized = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const fullCount = Math.floor(normalized);
  const hasHalf = normalized - fullCount >= 0.5;
  const emptyCount = 5 - fullCount - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`별점 ${normalized}점`}>
      {Array.from({ length: fullCount }).map((_, idx) => (
        <FullStarIcon key={`full-${idx}`} size={size} />
      ))}
      {hasHalf ? <HalfStarIcon key="half" size={size} /> : null}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <EmptyStarIcon key={`empty-${idx}`} size={size} />
      ))}
    </span>
  );
}
