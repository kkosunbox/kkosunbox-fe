"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { Text } from "@/shared/ui";

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
   Cancel Confirm Modal
───────────────────────────── */
function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-white px-7 py-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-subtitle-18-eb text-[var(--color-text)]">
          구독을 취소하시겠어요?
        </h2>
        <p className="mb-7 text-body-14-r text-[var(--color-text-secondary)]">
          취소 후에는 현재 결제 기간이 끝날 때까지
          <br />
          서비스를 이용할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full border border-[var(--color-divider-warm)] text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            유지하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full text-body-14-sb text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-text-secondary)" }}
          >
            취소하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Change Plan Modal
───────────────────────────── */
function ChangePlanModal({
  targetTier,
  colorVar,
  onConfirm,
  onClose,
}: {
  targetTier: Tier;
  colorVar: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-white px-7 py-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-subtitle-18-eb text-[var(--color-text)]">
          구독 플랜을 변경할까요?
        </h2>
        <p className="mb-1 text-body-14-r text-[var(--color-text-secondary)]">
          <span className="font-semibold" style={{ color: colorVar }}>
            {targetTier} 패키지
          </span>
          로 변경됩니다.
        </p>
        <p className="mb-7 text-body-13-r text-[var(--color-text-secondary)]">
          다음 결제일부터 새 플랜이 적용됩니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full border border-[var(--color-divider-warm)] text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full text-body-14-sb text-white transition-opacity hover:opacity-90"
            style={{ background: colorVar }}
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionManagementSection() {
  const router = useRouter();
  const [currentTier, setCurrentTier] = useState<Tier>(CURRENT_SUBSCRIPTION.tier);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [changingTo, setChangingTo] = useState<{ tier: Tier; colorVar: string } | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const currentPkg = PACKAGES.find((p) => p.tier === currentTier)!;

  function handleCancel() {
    setShowCancelModal(false);
    setCancelled(true);
  }

  function handleChangePlan(tier: Tier, colorVar: string) {
    if (tier === currentTier) return;
    setChangingTo({ tier, colorVar });
  }

  function handleConfirmChange() {
    if (!changingTo) return;
    setCurrentTier(changingTo.tier);
    setCancelled(false);
    setChangingTo(null);
  }

  return (
    <>
      {showCancelModal && (
        <CancelModal onConfirm={handleCancel} onClose={() => setShowCancelModal(false)} />
      )}
      {changingTo && (
        <ChangePlanModal
          targetTier={changingTo.tier}
          colorVar={changingTo.colorVar}
          onConfirm={handleConfirmChange}
          onClose={() => setChangingTo(null)}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* Page header */}
        <div className="mx-auto max-w-content max-md:px-4 md:px-0 pb-2 pt-6 md:pt-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1 text-subtitle-16-sb text-[var(--color-text)] hover:opacity-70"
          >
            <ChevronLeftIcon />
            구독관리
          </button>

          {/* Current subscription card */}
          <div
            className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-[90px] w-[68px] shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={mockTempPackage}
                  alt={`${currentTier} 패키지 이미지`}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div>
                <span
                  className="mb-2 inline-flex items-center rounded-full px-3 py-1 text-caption-12-b text-white"
                  style={{ background: currentPkg.colorVar }}
                >
                  {cancelled ? "구독 취소됨" : currentTier}
                </span>
                <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
                  {cancelled ? `${currentTier} 패키지` : currentPkg.name}
                </Text>
                {!cancelled && (
                  <>
                    <Text variant="body-14-r" className="mt-1 text-[var(--color-text-secondary)]">
                      {CURRENT_SUBSCRIPTION.startDate} ~
                    </Text>
                    <Text variant="body-14-r" className="text-[var(--color-text-secondary)]">
                      결제일 : {CURRENT_SUBSCRIPTION.billingDay}
                    </Text>
                  </>
                )}
                {cancelled && (
                  <Text variant="body-14-r" className="mt-1 text-[var(--color-text-secondary)]">
                    구독이 취소되었습니다.
                  </Text>
                )}
              </div>
            </div>

            {!cancelled && (
              <div className="flex gap-2 md:shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="flex h-[40px] flex-1 items-center justify-center rounded-full border border-[var(--color-divider-warm)] px-5 text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80 md:flex-none"
                >
                  구독 취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("subscription-plans");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex h-[40px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 md:flex-none"
                  style={{ background: "var(--color-accent)" }}
                >
                  구독 변경
                </button>
              </div>
            )}
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
                      onClick={() => handleChangePlan(pkg.tier, pkg.colorVar)}
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
