"use client";

import { useState } from "react";
import { COMPARE_PACKAGES, tierLabel, type PackageTier } from "../lib/packageData";
import { PackageCompareCloseButton, PackageCompareHeartIcon } from "./packageCompareParts";

export function PackageCompareTable({
  initialTier,
  onClose,
}: {
  initialTier: PackageTier;
  onClose: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState<PackageTier>(initialTier);
  const [hoveredTier, setHoveredTier] = useState<PackageTier | null>(null);

  const mobilePkg = COMPARE_PACKAGES.find((p) => p.tier === initialTier) ?? COMPARE_PACKAGES[0];

  return (
    <>
      <div className="md:hidden relative overflow-hidden rounded-[20px] bg-white shadow-[4px_4px_24px_0px_rgba(0,0,0,0.25)]">
        <div className="absolute right-5 top-4 z-10">
          <PackageCompareCloseButton onClick={onClose} />
        </div>

        <div
          className="flex h-[52px] items-center justify-center rounded-t-[20px] px-12 text-center text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]"
          style={{ background: mobilePkg.tabActiveBg }}
        >
          {mobilePkg.name}
        </div>

        <div className="flex flex-col px-6 pb-7">
          <div className="flex items-center justify-center py-5">
            <span
              className="inline-block rounded-full px-3 py-[3px] text-body-14-sb text-white"
              style={{ background: mobilePkg.colorVar }}
            >
              {tierLabel(mobilePkg.tier)}
            </span>
          </div>

          <div className="flex items-center justify-center border-t border-[var(--color-text-muted)] px-2 py-4">
            <p
              className="whitespace-pre-line text-center text-body-13-r leading-[17px] text-[var(--color-text)]"
              style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
            >
              &ldquo;{mobilePkg.quote}&rdquo;
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-t border-[var(--color-text-muted)] px-2 py-4">
            {mobilePkg.contents.map((c) => (
              <p
                key={c}
                className="text-center text-body-13-b leading-[20px]"
                style={{ color: mobilePkg.colorVar }}
              >
                {c}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-center border-t border-[var(--color-text-muted)] px-2 py-4">
            <p className="text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
              {mobilePkg.special}
            </p>
          </div>

          <div className="flex items-center justify-center border-t border-[var(--color-text-muted)] px-2 py-4">
            <p className="whitespace-pre-line text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
              {mobilePkg.customization}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 border-t border-[var(--color-text-muted)] pt-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <PackageCompareHeartIcon key={i} filled={i < mobilePkg.hearts} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-md:hidden relative overflow-hidden rounded-[20px] bg-white shadow-[4px_4px_24px_0px_rgba(0,0,0,0.25)] md:w-[680px]">
        <div className="absolute right-6 top-5 z-10">
          <PackageCompareCloseButton onClick={onClose} />
        </div>

        <div className="flex gap-0.5 px-11 pt-14">
          {COMPARE_PACKAGES.map((p) => {
            const isActive = selectedTier === p.tier;
            const isHoverActive = !isActive && hoveredTier === p.tier;
            const showActiveStyle = isActive || isHoverActive;
            return (
              <button
                key={p.tier}
                type="button"
                onClick={() => setSelectedTier(p.tier)}
                onMouseEnter={() => setHoveredTier(p.tier)}
                onMouseLeave={() => setHoveredTier(null)}
                className="h-[37px] flex-1 truncate px-2 font-semibold tracking-[-0.04em] transition-colors"
                style={{
                  borderRadius: "20px 20px 0 0",
                  background: showActiveStyle ? p.tabActiveBg : "var(--color-ui-inactive-bg)",
                  color: showActiveStyle ? "var(--color-text)" : "var(--color-text-secondary)",
                  fontSize: isActive ? "16px" : "14px",
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        <div className="px-11 pb-6">
          <div className="grid grid-cols-3">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex items-center justify-center py-5">
                <span
                  className="inline-block rounded-full px-3 py-[3px] text-body-14-sb text-white"
                  style={{ background: selectedTier === p.tier ? p.colorVar : "var(--color-text-muted)" }}
                >
                  {tierLabel(p.tier)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 border-t border-b border-[var(--color-text-muted)]">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                <p
                  className="whitespace-pre-line text-center text-body-13-r leading-[17px] text-[var(--color-text)]"
                  style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
                >
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
                {p.contents.map((c) => (
                  <p
                    key={c}
                    className={`text-center leading-[20px] ${selectedTier === p.tier ? "text-body-13-b" : "text-body-13-r"}`}
                    style={{ color: selectedTier === p.tier ? p.colorVar : "var(--color-text)" }}
                  >
                    {c}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                <p className="text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
                  {p.special}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                <p className="whitespace-pre-line text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
                  {p.customization}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 py-3">
            {COMPARE_PACKAGES.map((p) => (
              <div key={p.tier} className="flex items-center justify-center gap-1">
                {Array.from({ length: p.hearts }).map((_, i) => (
                  <PackageCompareHeartIcon key={i} filled={selectedTier === p.tier} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
