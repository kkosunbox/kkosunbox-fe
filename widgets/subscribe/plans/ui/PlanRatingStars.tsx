const STAR_PATH =
  "M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z";

function Star({ fillPercent, size }: { fillPercent: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={STAR_PATH} fill="var(--color-text-muted)" />
      <path
        d={STAR_PATH}
        fill="var(--color-star)"
        style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
      />
    </svg>
  );
}

interface PlanRatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
}

/** 플랜 평균 평점 별 5개 + 숫자 라벨. fractional fill 지원. */
export default function PlanRatingStars({
  rating,
  size = 18,
  className = "",
}: PlanRatingStarsProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={`별점 ${rating}점`}>
      <span className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} fillPercent={Math.max(0, Math.min(100, (rating - i) * 100))} size={size} />
        ))}
      </span>
      <span className="text-[14px] font-bold leading-[17px] tracking-[-0.05em] text-[var(--color-cta-button)]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
