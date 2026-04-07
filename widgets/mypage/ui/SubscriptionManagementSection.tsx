"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { Text, useModal } from "@/shared/ui";

/* ─────────────────────────────
   Mock data
───────────────────────────── */
const CURRENT_SUBSCRIPTION = {
  tier: "Premium" as Tier,
  name: "프리미엄 패키지 구독중",
  startDate: "2026.01.21",
  billingDay: "매달 21일",
};

type Tier = "Basic" | "Standard" | "Premium";

const PACKAGES: {
  tier: Tier;
  colorVar: string;
  name: string;
  items: string[];
  price: string;
  priceNum: number;
}[] = [
  {
    tier: "Basic",
    colorVar: "var(--color-basic)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
    priceNum: 15000,
  },
  {
    tier: "Standard",
    colorVar: "var(--color-plus)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
    priceNum: 20000,
  },
  {
    tier: "Premium",
    colorVar: "var(--color-premium)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
    priceNum: 25000,
  },
];

/* ─────────────────────────────
   Icons
───────────────────────────── */
function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
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

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionManagementSection() {
  const router = useRouter();
  const { openModal } = useModal();
  const [currentTier, setCurrentTier] = useState<Tier>(CURRENT_SUBSCRIPTION.tier);
  const [cancelled, setCancelled] = useState(false);

  const currentPkg = PACKAGES.find((p) => p.tier === currentTier)!;

  function handleOpenCancelModal() {
    openModal("subscription-cancel", () => setCancelled(true));
  }

  function handleOpenSubscribeModal(tier: Tier) {
    if (tier === currentTier && !cancelled) return;
    openModal("subscription-restart", () => {
      setCurrentTier(tier);
      setCancelled(false);
    });
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Upper band — warm peach background (Figma #FFF2E5) */}
        <div style={{ background: "var(--color-surface-peach)" }}>
          <div className="mx-auto max-w-content max-md:px-4 md:px-0 pb-8 pt-6 md:pt-10">
            {/* Back button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-1 text-subtitle-20-b text-[var(--color-text)] hover:opacity-70"
            >
              <ChevronLeftIcon />
              구독관리
            </button>

            {/* Current subscription card */}
            <div className="flex flex-col gap-4 rounded-[20px] bg-white max-md:p-5 md:flex-row md:items-center md:justify-between md:px-10 md:py-6">
              <div className="flex items-center gap-10">
                {/* Package image — landscape */}
                <div className="relative max-md:h-[72px] max-md:w-[100px] md:h-[98px] md:w-[134px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={mockTempPackage}
                    alt={`${currentTier} 패키지 이미지`}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                {/* Info column */}
                <div className="flex flex-col gap-2">
                  <span
                    className="inline-flex w-fit items-center rounded-full px-3 py-1 text-body-14-sb text-white"
                    style={{ background: currentPkg.colorVar }}
                  >
                    {cancelled ? "구독 취소됨" : currentTier}
                  </span>
                  <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
                    {cancelled ? `${currentTier} 패키지` : currentPkg.name}
                  </Text>
                  {!cancelled && (
                    <>
                      <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                        {CURRENT_SUBSCRIPTION.startDate} ~
                      </Text>
                      <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                        결제일 : {CURRENT_SUBSCRIPTION.billingDay}
                      </Text>
                    </>
                  )}
                  {cancelled && (
                    <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                      구독이 취소되었습니다.
                    </Text>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {!cancelled && (
                <div className="flex gap-2 md:shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenCancelModal}
                    className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-80 md:flex-none"
                    style={{ background: "var(--color-text-muted)" }}
                  >
                    구독 취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("subscription-plans");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 md:flex-none"
                    style={{ background: "var(--color-accent)" }}
                  >
                    구독 변경
                  </button>
                </div>
              )}
              {cancelled && (
                <button
                  type="button"
                  onClick={() => handleOpenSubscribeModal(currentTier)}
                  className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 md:flex-none"
                  style={{ background: "var(--color-accent)" }}
                >
                  구독 재시작
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plans section */}
        <div id="subscription-plans" className="mx-auto max-w-content max-md:px-4 md:px-0 py-10">
          <Text as="h2" variant="subtitle-18-b" className="mb-6 text-[var(--color-text)]">
            구독 추가하기
          </Text>

          <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-5">
            {PACKAGES.map((pkg) => {
              const isCurrentPlan = !cancelled && pkg.tier === currentTier;

              return (
                <div
                  key={pkg.tier}
                  className="flex flex-col rounded-[20px] px-6 pb-7 pt-5 shadow-sm"
                  style={{
                    background: "var(--color-background)",
                    ...(isCurrentPlan ? { boxShadow: `0 0 0 2px ${pkg.colorVar}` } : {}),
                  }}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-4 py-1 text-body-14-sb leading-[1] text-white"
                        style={{ background: pkg.colorVar }}
                      >
                        {pkg.tier}
                      </span>
                      {isCurrentPlan && (
                        <span
                          className="text-price-16-b"
                          style={{ color: pkg.colorVar }}
                        >
                          이용중
                        </span>
                      )}
                    </div>
                    <button aria-label={`${pkg.tier} 패키지 상세 정보`} className="flex items-center justify-center">
                      <InfoIcon />
                    </button>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <Image
                      src={mockTempPackage}
                      alt={`${pkg.name} 이미지`}
                      className="h-[140px] w-auto object-contain md:h-[120px]"
                    />
                  </div>

                  <Text
                    as="h3"
                    variant="subtitle-18-b"
                    mobileVariant="subtitle-18-b"
                    className="mb-4 text-[var(--color-text)]"
                  >
                    {pkg.name}
                  </Text>

                  <ul className="mb-6 flex flex-col gap-3">
                    {pkg.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-body-14-m leading-[1] text-[var(--color-text)]"
                      >
                        <CheckIcon color={pkg.colorVar} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-5 mt-auto flex items-center justify-between border-t border-[var(--color-divider-warm)] pt-5">
                    <span className="text-body-14-b text-[var(--color-text)]">
                      월 요금제
                    </span>
                    <span className="text-price-20-eb text-[var(--color-text)]">
                      {pkg.price}
                    </span>
                  </div>

                  {isCurrentPlan ? (
                    <div
                      className="flex h-[52px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white opacity-70"
                      style={{ background: pkg.colorVar }}
                    >
                      현재 구독중
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenSubscribeModal(pkg.tier)}
                      className="flex h-[52px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
                      style={{ background: pkg.colorVar }}
                    >
                      구독하기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
