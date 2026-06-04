"use client";

import { useState, type CSSProperties } from "react";
import { PackageCompareTable } from "./PackageDetailView";
import type { PackageTier } from "./packageData";

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
      <path d="M12 11V17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill="white" />
    </svg>
  );
}

interface PackageNutritionGuideProps {
  initialTier: PackageTier;
  bubbleClassName?: string;
}

export default function PackageNutritionGuide({
  initialTier,
  bubbleClassName = "h-auto w-[130px]",
}: PackageNutritionGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  function openModal(e: React.MouseEvent) {
    e.stopPropagation();
    setIsOpen(true);
  }

  return (
    <>
      {/* 클릭 영역 44×44로 확장 — SVG 아이콘 시각 위치(center)는 기존과 동일 */}
      <button
        type="button"
        onClick={openModal}
        aria-label="영양정보 확인"
        className="absolute right-[15px] top-[14px] z-10 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-80 active:opacity-70"
      >
        <InfoIcon />
      </button>

      {/* 말풍선 — 클릭 가능, 배경 이미지 이벤트 차단 */}
      <div
        className="absolute right-[25px] top-8 z-20 -translate-y-full max-md:translate-x-[41px] md:translate-x-[57px] cursor-pointer"
        onClick={openModal}
      >
        <div className="animate-float" style={{ "--float-distance": "-5px" } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/please-info-check.png"
            alt="영양정보 확인"
            width={130}
            height={55}
            className={bubbleClassName}
            decoding="async"
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="my-auto w-full max-w-[400px] md:max-w-[680px]"
            onClick={(e) => e.stopPropagation()}
          >
            <PackageCompareTable initialTier={initialTier} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
