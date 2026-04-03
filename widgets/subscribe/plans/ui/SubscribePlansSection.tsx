"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { ChecklistRecommendModal } from "@/shared/ui";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";

/* ── Data ──────────────────────────────────────────────────────── */

const PACKAGES = [
  {
    tier: "Basic",
    colorVar: "var(--color-basic)",
    tabActiveBg: "rgba(63, 105, 0, 0.2)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
    quote: "수제 간식이 처음이에요!",
    contents: ["건조 간식 2종", "자연 화식 1종"],
    special: "휴먼그레이드 제철 식재료",
    customization: "알러지 식재료 제외",
    hearts: 3,
  },
  {
    tier: "Standard",
    colorVar: "var(--color-plus)",
    tabActiveBg: "rgba(62, 158, 217, 0.2)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
    quote: "매달 알찬 간식 선물을 원해요",
    contents: ["건조 간식 3종", "자연 화식 1종", "베이커리(머핀/타르트) 1종"],
    special: "휴먼그레이드 + 슈퍼푸드 추가",
    customization: "알러지 제외 + 기호성 반영",
    hearts: 4,
  },
  {
    tier: "Premium",
    colorVar: "var(--color-accent-orange)",
    tabActiveBg: "rgba(238, 104, 26, 0.2)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
    quote: "고급 식단과 맞춤 관리가 필요해요",
    contents: ["건조 간식 3종", "자연 화식 2종", "프리미엄 특식(테린/황태 등) 2종"],
    special: "휴먼그레이드 + 최상급 단백질원",
    customization: "생애주기/건강 고민 맞춤 설계",
    hearts: 5,
  },
] as const;

type Package = (typeof PACKAGES)[number];

const COMPARE_ORDER: Package["tier"][] = ["Premium", "Standard", "Basic"];
const COMPARE_PACKAGES = COMPARE_ORDER.map(
  (t) => PACKAGES.find((p) => p.tier === t)!
);

/* ── Icons ─────────────────────────────────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--color-icon-muted)" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="var(--color-icon-muted)" />
    </svg>
  );
}

/* 하트: 채움=--color-primary(#C97A3D), 빈 하트=#DDDDDD */
function HeartIcon({ filled }: { filled: boolean }) {
  const color = filled ? "var(--color-primary)" : "#DDDDDD";
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

/* ── Package Detail View ────────────────────────────────────────── */

function PackageDetailView({
  selectedTier,
  onSelectTier,
  onClose,
}: {
  selectedTier: Package["tier"];
  onSelectTier: (tier: Package["tier"]) => void;
  onClose: () => void;
}) {
  const pkg = PACKAGES.find((p) => p.tier === selectedTier)!;

  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      style={{ background: "var(--color-surface-warm)" }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="목록으로 돌아가기"
        className="absolute right-6 top-5 z-10 flex h-6 w-6 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-stretch lg:min-h-[570px]">

        {/* ── Left panel ── */}
        <div className="flex w-full flex-col px-7 pt-5 pb-7 lg:w-[327px] lg:shrink-0">

          {/* Badge — 카드와 동일한 mb-2.5 간격 */}
          <div className="mb-2.5">
            <span
              className="rounded-full px-3 py-1 text-[14px] font-semibold leading-[17px] text-white"
              style={{ background: pkg.colorVar }}
            >
              {pkg.tier}
            </span>
          </div>

          {/* Image — 카드와 동일한 h-[150px] + mb-[56px] */}
          <div className="mb-[56px] flex justify-center">
            <Image
              src={mockTempPackage}
              alt={`${pkg.name} 이미지`}
              className="h-[150px] w-auto object-contain"
            />
          </div>

          {/* Name — 카드와 동일한 mb-7.5 */}
          <h2 className="mb-7.5 text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)]">
            {pkg.name}
          </h2>

          {/* Features — 카드와 동일한 gap-[14px] gap-2 mb-7 */}
          <ul className="mb-7 flex flex-col gap-[14px]">
            {pkg.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[13px] font-medium leading-[16px] text-black"
              >
                <CheckIcon color={pkg.colorVar} />
                {item}
              </li>
            ))}
          </ul>

          {/* Price — 카드와 동일한 mt-auto border-t border-white pt-3 mb-7 */}
          <div className="mt-auto mb-7 flex items-center justify-between border-t border-white pt-3">
            <span className="text-[14px] font-bold text-black">월 요금제</span>
            <span className="text-[20px] font-extrabold leading-[32px] tracking-[-0.05em] text-[var(--color-surface-dark)]">
              {pkg.price}
            </span>
          </div>

          {/* CTA */}
          <button
            type="button"
            className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: pkg.colorVar }}
          >
            구독하기
          </button>
        </div>

        {/* ── Right: white card floating inside warm panel ── */}
        {/* Figma: top 61px / bottom 32px / right 28px / left 0 */}
        <div className="flex flex-1 flex-col p-4 pb-6 lg:pb-8 lg:pl-0 lg:pr-7 lg:pt-[61px]">
          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] bg-white">

            {/* Tabs */}
            <div className="flex gap-0.5 px-6 pt-8">
              {COMPARE_PACKAGES.map((p) => (
                <button
                  key={p.tier}
                  type="button"
                  onClick={() => onSelectTier(p.tier)}
                  className="h-[37px] flex-1 truncate px-2 font-semibold tracking-[-0.04em] transition-colors text-[13px]"
                  style={{
                    borderRadius: "20px 20px 0 0",
                    background: selectedTier === p.tier ? p.tabActiveBg : "#EAEAEA",
                    color: selectedTier === p.tier ? "#2F2F2F" : "#999999",
                    fontSize: selectedTier === p.tier ? "14px" : "13px",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Tab bottom separator */}
            <div className="mx-6 h-px bg-[#DDDDDD]" />

            {/* Comparison table */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[360px] px-6">

                {/* Tier badge row */}
                <div className="grid grid-cols-3">
                  {COMPARE_PACKAGES.map((p) => (
                    <div key={p.tier} className="flex items-center justify-center py-5">
                      <span
                        className="inline-block rounded-full px-3 py-[3px] text-[13px] font-semibold text-white"
                        style={{
                          background: selectedTier === p.tier ? p.colorVar : "#DDDDDD",
                        }}
                      >
                        {p.tier}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quote row */}
                <div className="grid grid-cols-3 divide-x divide-[#DDDDDD] border-t border-b border-[#DDDDDD]">
                  {COMPARE_PACKAGES.map((p) => (
                    <div
                      key={p.tier}
                      className="flex items-center justify-center px-2 py-3"
                    >
                      <p
                        className="text-center text-[13px] leading-[17px] text-[var(--color-text)]"
                        style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
                      >
                        &ldquo;{p.quote}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>

                {/* Contents row */}
                <div className="grid grid-cols-3 divide-x divide-[#DDDDDD] border-b border-[#DDDDDD]">
                  {COMPARE_PACKAGES.map((p) => (
                    <div
                      key={p.tier}
                      className="flex flex-col items-center justify-center gap-0.5 px-2 py-3"
                    >
                      {p.contents.map((c, i) => (
                        <p
                          key={c}
                          className="text-center text-[13px] leading-[18px] text-[var(--color-text)]"
                          style={{
                            fontWeight:
                              p.tier === "Premium" && i === p.contents.length - 1 ? 700 : 400,
                          }}
                        >
                          {c}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Special row */}
                <div className="grid grid-cols-3 divide-x divide-[#DDDDDD] border-b border-[#DDDDDD]">
                  {COMPARE_PACKAGES.map((p) => (
                    <div
                      key={p.tier}
                      className="flex items-center justify-center px-2 py-3"
                    >
                      <p
                        className="text-center text-[13px] leading-[16px]"
                        style={{
                          color: p.tier === "Premium" ? "var(--color-accent-orange)" : "var(--color-text)",
                          fontWeight: p.tier === "Premium" ? 600 : 400,
                        }}
                      >
                        {p.special}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Customization row */}
                <div className="grid grid-cols-3 divide-x divide-[#DDDDDD] border-b border-[#DDDDDD]">
                  {COMPARE_PACKAGES.map((p) => (
                    <div
                      key={p.tier}
                      className="flex items-center justify-center px-2 py-3"
                    >
                      <p className="text-center text-[13px] leading-[16px] text-[var(--color-text)]">
                        {p.customization}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Hearts row */}
                <div className="grid grid-cols-3 divide-x divide-[#DDDDDD] py-3">
                  {COMPARE_PACKAGES.map((p) => (
                    <div
                      key={p.tier}
                      className="flex items-center justify-center gap-1"
                    >
                      {Array.from({ length: p.hearts }).map((_, i) => (
                        <HeartIcon key={i} filled={selectedTier === p.tier} />
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main Section ───────────────────────────────────────────────── */

export default function SubscribePlansSection() {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Package["tier"] | null>(null);

  const isChecklistDone = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => localStorage.getItem("kkosun_checklist_done") === "true",
    () => true,
  );
  const showModal = !isChecklistDone && !isDismissed;

  function handleClose() {
    setIsDismissed(true);
  }

  function handleConfirm() {
    setIsDismissed(true);
    router.push("/checklist");
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="bg-white pb-16 md:pt-0 md:pb-20">
        <div className="mx-auto px-6 md:px-0">
          {/* Hero image */}
          <div className="mb-10 text-center md:mb-8">
            <Image
              src={SubscribePlansHeroImageMobile}
              alt="Subscribe Plans Hero"
              className="md:hidden block w-[100vw] max-w-none relative left-1/2 -translate-x-1/2"
            />
            <Image
              src={SubscribePlansHeroImage}
              alt="Subscribe Plans Hero"
              className="max-md:hidden w-full h-auto"
            />
          </div>

          {selectedTier ? (
            <div className="mx-auto w-full max-w-[var(--max-width-content)]">
              <PackageDetailView
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                onClose={() => setSelectedTier(null)}
              />
            </div>
          ) : (
            /* Package cards */
            <div className="mx-auto max-w-content flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.tier}
                  className="flex flex-col rounded-[20px] bg-[var(--color-background)] px-7 pb-7 pt-5"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-[14px] font-semibold leading-[17px] text-white"
                      style={{ background: pkg.colorVar }}
                    >
                      {pkg.tier}
                    </span>
                    <button
                      aria-label={`${pkg.tier} 패키지 상세 정보`}
                      className="flex items-center justify-center"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  <div className="mb-[56px] flex justify-center">
                    <Image
                      src={mockTempPackage}
                      alt={`${pkg.name} 이미지`}
                      className="h-[150px] w-auto object-contain"
                    />
                  </div>

                  <h2 className="mb-7.5 text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)]">
                    {pkg.name}
                  </h2>

                  <ul className="mb-7 flex flex-col gap-[14px]">
                    {pkg.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[13px] font-medium leading-[16px] text-black"
                      >
                        <CheckIcon color={pkg.colorVar} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-7 mt-auto flex items-center justify-between border-t border-white pt-3">
                    <span className="text-[14px] font-bold text-black">월 요금제</span>
                    <span className="text-[20px] font-extrabold leading-[32px] tracking-[-0.05em] text-[var(--color-surface-dark)]">
                      {pkg.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTier(pkg.tier)}
                    className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: pkg.colorVar }}
                  >
                    구독하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
