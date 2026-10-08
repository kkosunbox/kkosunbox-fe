import { formatKrwPrice } from "@/shared/lib/format";
import {
  getPackageProgressPercent,
  PACKAGE_PANEL_MARKERS,
  PACKAGE_SHEET_MARKERS,
  type PackageProgress,
} from "../lib/packageProgress";

interface Props {
  progress: PackageProgress;
  /** panel: PC 패널·모달 (라벨 두 줄 12px), sheet: 모바일 바텀시트 (라벨 한 줄 10px) */
  variant?: "panel" | "sheet";
}

function Marker({ reached, left }: { reached: boolean; left: number }) {
  if (reached) {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" className="absolute top-0 -translate-x-1/2" style={{ left: `${left}%` }}>
        <path d="M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" fill="var(--color-cta-button)" stroke="var(--color-cta-button)" strokeWidth="3" />
        <path d="M5.15385 8.95897L7.44309 11.2012C7.83621 11.5863 8.46658 11.5814 8.85364 11.1902L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-[var(--color-text-secondary)] bg-white"
      style={{ left: `${left}%` }}
    />
  );
}

/** 내 패키지 진행바 — 최소 주문 금액·무료배송 두 마커를 디자인 고정 위치에 둔다 */
export function PackageProgressBar({ progress, variant = "panel" }: Props) {
  const positions = variant === "panel" ? PACKAGE_PANEL_MARKERS : PACKAGE_SHEET_MARKERS;
  const percent = getPackageProgressPercent(progress, positions);
  const markers = [
    { left: positions[0], reached: progress.minimumReached, amount: progress.minimum, label: "주문가능" },
    { left: positions[1], reached: progress.isFree, amount: progress.threshold, label: "무료배송" },
  ];

  return (
    <div className="relative">
      <div className="relative h-[18px]">
        <div
          role="progressbar"
          aria-label="내 패키지 주문 금액"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-valuetext={`${formatKrwPrice(progress.amount)} 담음`}
          className="absolute inset-x-0 top-[5px] h-2 overflow-hidden rounded-full bg-[var(--color-package-progress-track)]"
        >
          <div
            className={`h-full min-w-0.5 bg-[var(--color-cta-button)] transition-[width] duration-300 ${percent >= 100 ? "rounded-full" : "rounded-l-full"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {markers.map((marker) => <Marker key={marker.label} reached={marker.reached} left={marker.left} />)}
      </div>
      <div className={`relative mt-1.5 ${variant === "panel" ? "h-7" : "h-3"}`}>
        {markers.map((marker) => (
          <p
            key={marker.label}
            className={`absolute top-0 -translate-x-1/2 whitespace-nowrap text-center leading-[1.2] tracking-[-0.04em] text-[var(--color-text)] ${variant === "panel" ? "text-[12px] font-bold" : "text-[10px] font-semibold"}`}
            style={{ left: `${marker.left}%` }}
          >
            {formatKrwPrice(marker.amount)}
            {variant === "panel" ? <br /> : " "}
            {marker.label}
          </p>
        ))}
      </div>
    </div>
  );
}

/** 진행바 아래 안내 문구 — 금액만 주황 세미볼드 */
export function PackageProgressMessage({ progress }: { progress: PackageProgress }) {
  const accent = "font-semibold text-[var(--color-cta-button)]";
  if (progress.isFree) return <>무료배송 혜택이 적용되었어요!</>;
  if (progress.amount === 0) return <><span className={accent}>{formatKrwPrice(progress.minimum)}</span> 이상 시 주문이 가능합니다.</>;
  if (!progress.minimumReached && progress.remainingToMinimum > 0) return <><span className={accent}>{formatKrwPrice(progress.remainingToMinimum)}</span> 더 담으면 주문이 가능해요.</>;
  if (progress.remainingToFree > 0) return <><span className={accent}>{formatKrwPrice(progress.remainingToFree)}</span> 더 주문하면 무료배송이에요.</>;
  return <>주문이 가능합니다.</>;
}
