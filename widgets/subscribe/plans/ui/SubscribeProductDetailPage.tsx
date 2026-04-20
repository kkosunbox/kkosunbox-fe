"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package-4x.png";
import subscribeItemHeroMobile from "@/widgets/subscribe/plans/assets/subscribe-item-hero-mobile.png";
import subscribeItemHeroTitle from "@/widgets/subscribe/plans/assets/subscribe-item-hero-title.png";
import subscribeItemHeroLeftPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-left-paw.png";
import subscribeItemHeroRightPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-right-paw.png";
import subscribeItem01A from "@/widgets/subscribe/plans/assets/subscribe-item-01-A.png";
import subscribeItem01B from "@/widgets/subscribe/plans/assets/subscribe-item-01-B.png";
import subscribeItem01BB from "@/widgets/subscribe/plans/assets/subscribe-item-01-BB.png";
import subscribeItem01C from "@/widgets/subscribe/plans/assets/subscribe-item-01-C.png";
import subscribeItem01D from "@/widgets/subscribe/plans/assets/subscribe-item-01-D.png";
import subscribeItem02A from "@/widgets/subscribe/plans/assets/subscribe-item-02-A.png";
import subscribeItem02B from "@/widgets/subscribe/plans/assets/subscribe-item-02-B.png";
import subscribeItem02BB from "@/widgets/subscribe/plans/assets/subscribe-item-02-BB.png";
import subscribeItem02C from "@/widgets/subscribe/plans/assets/subscribe-item-02-C.png";
import subscribeItem02D from "@/widgets/subscribe/plans/assets/subscribe-item-02-D.png";
import subscribeItem03A from "@/widgets/subscribe/plans/assets/subscribe-item-03-A.png";
import subscribeItem03B from "@/widgets/subscribe/plans/assets/subscribe-item-03-B.png";
import subscribeItem03BB from "@/widgets/subscribe/plans/assets/subscribe-item-03-BB.png";
import subscribeItem03C from "@/widgets/subscribe/plans/assets/subscribe-item-03-C.png";
import subscribeItem03D from "@/widgets/subscribe/plans/assets/subscribe-item-03-D.png";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "./packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

interface Props {
  initialPlan: SubscriptionPlanDto;
  plans: SubscriptionPlanDto[];
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function discountedPrice(value: number) {
  return Math.floor(value * 0.9);
}

const DETAIL_ASSET_IMAGES: Record<
  PackageTier,
  readonly [StaticImageData, StaticImageData, StaticImageData, StaticImageData, StaticImageData]
> = {
  Premium: [subscribeItem01A, subscribeItem01B, subscribeItem01BB, subscribeItem01C, subscribeItem01D],
  Standard: [subscribeItem02A, subscribeItem02B, subscribeItem02BB, subscribeItem02C, subscribeItem02D],
  Basic: [subscribeItem03A, subscribeItem03B, subscribeItem03BB, subscribeItem03C, subscribeItem03D],
};

type TabKey = "info" | "review" | "delivery" | "support";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "구독정보" },
  { key: "review", label: "구독리뷰" },
  { key: "delivery", label: "배송정보" },
  { key: "support", label: "고객센터" },
];

const SORT_OPTIONS = ["최신순", "평점순", "평점 높은순", "평점 낮은순"] as const;

const TIER_COLOR_VAR: Record<PackageTier, string> = {
  Premium: "var(--color-premium)",
  Standard: "var(--color-plus)",
  Basic: "var(--color-basic)",
};

interface MockReview {
  id: number;
  tier: PackageTier;
  nickname: string;
  email: string;
  date: string;
  rating: number;
  text: string;
  photo: StaticImageData;
  avatarColor: string;
}

const MOCK_REVIEWS: MockReview[] = [
  {
    id: 1,
    tier: "Premium",
    nickname: "코기",
    email: "12****@naver.com",
    date: "2026.03.28",
    rating: 5,
    text: "강아지가 입맛이 까다로운 편이라 걱정했는데 꼬순박스 받고 나서 반응이 완전 달라졌어요! 박스 열자마자 냄새 맡고 난리더니 하나 주니까 순식간에 먹어버리네요ㅋㅋ 구성도 다양해서 질리지 않고 급여할 수 있는 게 너무 좋아요. 다음 박스도 기대됩니다!",
    photo: subscribeItem01A,
    avatarColor: "#E8B89B",
  },
  {
    id: 2,
    tier: "Basic",
    nickname: "뭉치",
    email: "12****@naver.com",
    date: "2026.03.28",
    rating: 5,
    text: "요즘 간식 뭐 줄지 고민이었는데 꼬순박스 덕분에 걱정 끝이에요. 성분도 믿을 수 있고 종류가 다양해서 골라 먹이는 재미가 있네요. 특히 프리미엄 간식이 있어서 믿고 구독할 수 있었어요. 꾸준히 구독할 생각이에요!",
    photo: subscribeItem02B,
    avatarColor: "#C9DBB5",
  },
  {
    id: 3,
    tier: "Premium",
    nickname: "구름이",
    email: "12****@naver.com",
    date: "2026.03.28",
    rating: 5,
    text: "강아지가 입맛이 까다로운 편이라 걱정했는데 꼬순박스 받고 나서 반응이 완전 달라졌어요! 박스 열자마자 냄새 맡고 난리더니 하나 주니까 순식간에 먹어버리네요ㅋㅋ 구성도 다양해서 질리지 않고 급여할 수 있는 게 너무 좋아요. 다음 박스도 기대됩니다!",
    photo: subscribeItem03C,
    avatarColor: "#F7D4A7",
  },
  {
    id: 4,
    tier: "Standard",
    nickname: "에릭",
    email: "12****@naver.com",
    date: "2026.03.28",
    rating: 5,
    text: "택배 오자마자 자기 줄 알고 옆에서 계속 기다리는 모습 보고 웃겼어요ㅋㅋ 포장도 깔끔하고 간식 퀄리티가 확실히 일반 간식이랑 다르네요. 먹고 나서도 탈 없이 잘 맞아서 안심하고 먹이고 있어요.",
    photo: subscribeItem02D,
    avatarColor: "#3F3F3F",
  },
];

function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <span
      className="inline-flex items-center tracking-[2px] text-[var(--color-star)]"
      style={{ fontSize: size, lineHeight: 1 }}
      aria-label={`별점 ${rating}점`}
    >
      {"★".repeat(Math.round(rating))}
      {"★".repeat(5 - Math.round(rating))
        .split("")
        .map((_, i) => (
          <span key={i} className="text-[var(--color-text-muted)]">
            ★
          </span>
        ))}
    </span>
  );
}

export default function SubscribeProductDetailPage({ initialPlan, plans }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [activeSort, setActiveSort] = useState<(typeof SORT_OPTIONS)[number]>("최신순");

  const sortedPlans = useMemo(() => [...plans].sort(comparePlansForDisplayOrder), [plans]);
  const selectedTheme = packageThemeForPlan(selectedPlan);
  const selectedTier = tierFromSubscriptionPlan(selectedPlan);
  const selectedPackage = PACKAGES.find((pkg) => pkg.tier === selectedTier) ?? PACKAGES[0];
  const detailImages = DETAIL_ASSET_IMAGES[selectedTier];
  const previewImages = useMemo(() => Array.from({ length: 8 }, () => mockTempPackage), []);

  const basePrice = selectedPlan.monthlyPrice;
  const salePrice = discountedPrice(basePrice) * quantity;

  function handleSelectPlan(plan: SubscriptionPlanDto) {
    setSelectedPlan(plan);
    setQuantity(1);
    router.replace(`/subscribe/detail?planId=${plan.id}`, { scroll: false });
  }

  const activeTierLabel = selectedTheme.tierLabel;

  return (
    <section className="bg-white md:pb-16">
      {/* Mobile layout (Figma-aligned) */}
      <div className="md:hidden">
        <Image
          src={subscribeItemHeroMobile}
          alt="구독 상세 소개 배너"
          className="mb-2 h-auto w-full"
          priority
        />

        <div className="px-6">
          <div className="mb-3 flex items-center justify-center gap-3 py-2">
            {sortedPlans.map((plan) => {
              const theme = packageThemeForPlan(plan);
              const isActive = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className="rounded-full px-3 py-1 text-body-14-sb text-white"
                  style={{ background: isActive ? theme.colorVar : "var(--color-text-muted)" }}
                >
                  {theme.tierLabel}
                </button>
              );
            })}
          </div>

          <div className="rounded-[20px] bg-[var(--color-surface-warm)] p-4 max-md:min-h-[327px]">
            <span
              className="inline-flex rounded-full px-3 py-1 text-body-14-sb text-white"
              style={{ background: selectedTheme.colorVar }}
            >
              {activeTierLabel}
            </span>
            <div className="mt-4 flex min-h-[200px] items-center justify-center">
              <Image
                src={mockTempPackage}
                alt={`${selectedPlan.name} 대표 이미지`}
                className="h-[172px] w-auto object-contain"
              />
            </div>
          </div>

          <h2 className="mt-[30px] text-[24px] font-semibold leading-[29px] tracking-[-0.04em] text-[var(--color-text-emphasis)] capitalize">
            {selectedPlan.name}
          </h2>

          <div className="mt-[12px] flex items-baseline gap-3">
            <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] text-[var(--color-surface-dark)] capitalize">
              월 요금제
            </span>
            <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
              {formatWon(basePrice)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[24px] leading-none text-[var(--color-star)]">★★★★☆</span>
            <span className="text-[14px] font-normal leading-[21px] tracking-[-0.02em] text-[var(--color-text-secondary)] underline">
              12개 리뷰
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {previewImages.slice(0, 3).map((imgSrc, idx) => (
              <div
                key={idx}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] bg-[var(--color-surface-warm)]"
              >
                <Image src={imgSrc} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[4px]">
              <Image src={previewImages[3]!} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-body-13-sb text-white">
                더보기
                <br />
                +{Math.max(0, previewImages.length - 4)}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품구성</span>
              <span
                className="max-w-[220px] text-left text-[14px] font-bold leading-[17px]"
                style={{ color: selectedTheme.colorVar }}
              >
                {selectedPackage.contents.join(" ")}
              </span>
            </div>

            <div className="mt-[26px] grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송방법</span>
              <div>
                <p className="text-[13px] font-medium leading-[140%] text-[var(--color-text)]">
                  우체국택배
                </p>
                <p className="mt-2 text-[13px] font-normal leading-[140%] text-[var(--color-text-secondary)]">
                  2시 이전 주문 당일출고, 토요일도 배송가능
                </p>
              </div>
            </div>

            <div className="mt-[22px] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품수량</span>
              <div className="flex h-[34px] w-[102px] items-center justify-between rounded-[5px] border border-[var(--color-text-muted)] bg-white px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 감소"
                >
                  -
                </button>
                <span className="text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6">
            <button
              type="button"
              onClick={() => router.push(`/order?planId=${selectedPlan.id}`)}
              className="flex h-12 w-full items-center justify-center rounded-[30px] text-subtitle-16-sb text-white"
              style={{ background: "var(--color-accent)" }}
            >
              구독하기
            </button>
          </div>

          <div className="mt-4 border-b border-[var(--color-text-muted)] pb-3">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-13-sb text-[var(--color-text)]"
                          : "text-body-13-m text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && (
                      <span className="mx-1 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "info" && (
          <div className="pt-5">
            <div className="relative left-1/2 w-screen -translate-x-1/2">
              <div className="mx-auto w-full">
                {detailImages.map((imageSrc, index) => (
                  <Image
                    key={`${selectedTier}-${index}`}
                    src={imageSrc}
                    alt={`${selectedPlan.name} 구독정보 상세 이미지 ${index + 1}`}
                    className="h-auto w-full"
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="px-6 pt-6 pb-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2 text-[16px] font-bold leading-[19px] text-[var(--color-text-emphasis)]"
              >
                꼬순박스 리뷰
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] font-medium text-[var(--color-text)]"
              >
                {activeSort}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 5.25L7 8.75L10.5 5.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {previewImages.slice(0, 3).map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-surface-warm)]"
                >
                  <Image src={imgSrc} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {previewImages.length > 3 && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[6px]">
                  <Image
                    src={previewImages[3]!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-body-13-sb text-white">
                    더보기
                    <br />
                    +{previewImages.length - 3}
                  </div>
                </div>
              )}
            </div>

            <ul className="space-y-6">
              {MOCK_REVIEWS.map((review) => (
                <li
                  key={review.id}
                  className="border-b border-[var(--color-text-muted)] pb-6 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[54px] w-[54px] shrink-0 rounded-full border border-[var(--color-text-muted)]"
                      style={{ background: review.avatarColor }}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold leading-[14px] text-white"
                          style={{ background: TIER_COLOR_VAR[review.tier] }}
                        >
                          {review.tier}
                        </span>
                        <Stars rating={review.rating} size={24} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[14px] leading-[130%]">
                        <span className="font-semibold text-[var(--color-text)]">
                          {review.nickname}
                        </span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {review.email}
                        </span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-[9px] pl-[66px] text-[14px] font-medium leading-[20px] tracking-[-0.04em] text-[var(--color-text)]">
                    {review.text}
                  </p>
                  <div className="mt-4 pl-[66px]">
                    <div className="h-[100px] w-[100px] overflow-hidden rounded-[12px] border border-[var(--color-text-muted)]">
                      <Image
                        src={review.photo}
                        alt={`${review.nickname} 리뷰 사진`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="리뷰 페이지네이션">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)]"
                aria-label="이전 페이지"
              >
                ‹
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type="button"
                  className={
                    page === 1
                      ? "flex h-8 w-8 items-center justify-center text-[14px] font-semibold text-[var(--color-text)]"
                      : "flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)]"
                  }
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)]"
                aria-label="다음 페이지"
              >
                ›
              </button>
            </nav>
          </div>
        )}

        {(activeTab === "delivery" || activeTab === "support") && (
          <div className="px-6 py-16 text-center">
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              준비 중인 컨텐츠입니다.
            </p>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="max-md:hidden">
        <div
          className="relative mx-auto mb-5 flex h-[160px] w-full items-center justify-center overflow-hidden px-4 text-center"
          style={{ background: "var(--gradient-checklist-hero)" }}
        >
          <Image
            src={subscribeItemHeroLeftPaw}
            alt=""
            className="pointer-events-none absolute left-[24%] top-1/2 h-auto w-[82px] -translate-y-1/2"
          />
          <Image
            src={subscribeItemHeroRightPaw}
            alt=""
            className="pointer-events-none absolute left-[71%] top-1/2 h-auto w-[74px] -translate-y-1/2"
          />
          <div className="relative z-10">
            <Image
              src={subscribeItemHeroTitle}
              alt="구독 전, 제품을 확인해보세요"
              className="mx-auto mb-2 h-auto w-[362px] max-w-full"
            />
            <p
              className="text-[16px] font-normal leading-5 tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
            >
              우리 아이를 위한 선택, 성분과 특징을 더 꼼꼼하게 확인해보세요.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[var(--max-width-content)]">
          <div className="mb-8 md:min-h-[64px] flex items-center gap-3 border-b border-[var(--color-text-muted)] pb-5">
            <span className="text-body-16-sb text-[var(--color-text-muted)]">구독선택</span>
            <div className="flex flex-wrap gap-2">
              {sortedPlans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const isActive = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className="rounded-full px-3 py-1 text-body-14-sb text-white transition-opacity hover:opacity-90"
                    style={{
                      background: isActive ? theme.colorVar : "var(--color-text-muted)",
                    }}
                  >
                    {theme.tierLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 xl:mx-auto xl:w-[1013px] xl:grid-cols-[508px_438px] xl:justify-between xl:gap-0">
            <div className="mx-auto min-w-0 w-full max-w-[508px] xl:mx-0">
              <div className="relative overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)] p-8">
                <span
                  className="absolute left-6 top-6 rounded-full px-3 py-1 text-body-14-sb text-white"
                  style={{ background: selectedTheme.colorVar }}
                >
                  {selectedTheme.tierLabel}
                </span>
                <div className="flex min-h-[440px] items-center justify-center">
                  <Image
                    src={mockTempPackage}
                    alt={`${selectedPlan.name} 대표 이미지`}
                    className="h-[280px] w-auto max-w-full object-contain"
                  />
                </div>
              </div>
              <div className="mt-5 flex w-full items-center gap-3">
                {previewImages.slice(0, 4).map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-warm)]"
                  >
                    <Image src={imgSrc} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px]">
                  <Image src={previewImages[4]!} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-body-13-sb text-white">
                    더보기
                    <br />
                    +{Math.max(0, previewImages.length - 5)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto min-w-0 w-full max-w-[438px] xl:mx-0">
              <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.04em] text-[var(--color-text-emphasis)]">
                {selectedPlan.name}
              </h2>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[24px] leading-none text-[var(--color-star)]">★★★★☆</span>
                <span className="text-body-13-r text-[var(--color-text-secondary)]">12개 리뷰</span>
              </div>
              <div className="mb-5 flex items-center gap-2">
                <span className="text-body-20-sb tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  월 요금제
                </span>
                <span className="text-[16px] font-semibold leading-8 tracking-[-0.05em] text-[var(--color-text-secondary)] line-through">
                  {formatWon(basePrice)}
                </span>
                <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  {formatWon(discountedPrice(basePrice))}
                </span>
              </div>
              <div className="mb-8 border-t border-[var(--color-text-muted)] pt-7">
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품구성</span>
                    <span className="justify-self-start max-w-[220px] text-left text-body-14-b leading-[17px]" style={{ color: selectedTheme.colorVar }}>
                      {selectedPackage.contents.join(" ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">배송방법</span>
                    <div className="justify-self-start max-w-[220px] text-left">
                      <p className="text-body-13-m leading-[140%] text-[var(--color-text)]">우체국택배</p>
                      <p className="text-body-13-r leading-[140%] text-[var(--color-text-secondary)] mt-2">
                        2시 이전 주문 당일출고, 토요일도 배송가능
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품수량</span>
                    <div className="justify-self-start flex h-[34px] items-center gap-3 rounded-[5px] border border-[var(--color-text-muted)] px-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
                        aria-label="수량 감소"
                      >
                        -
                      </button>
                      <span className="min-w-3 text-center text-[12px] font-medium leading-[14px]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--color-text-muted)] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-body-20-sb text-[var(--color-text)]">총 합계</span>
                  <span className="text-body-20-sb text-[var(--color-text)]">{formatWon(salePrice)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/order?planId=${selectedPlan.id}`)}
                  className="flex h-[48px] w-full items-center justify-center md:mt-8 rounded-[30px] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: selectedTheme.colorVar }}
                >
                  구독하기
                </button>
              </div>
            </div>
          </div>

          <div className="md:mt-[54px] border-b border-[var(--color-text-muted)] pb-4">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-20-sb text-[var(--color-text)]"
                          : "text-body-20-sb text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && (
                      <span className="mx-2 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {activeTab === "info" && (
            <div className="pt-5 md:pt-20">
              <div className="mx-auto w-full md:max-w-[800px]">
                {detailImages.map((imageSrc, index) => (
                  <Image
                    key={`${selectedTier}-${index}`}
                    src={imageSrc}
                    alt={`${selectedPlan.name} 구독정보 상세 이미지 ${index + 1}`}
                    className="h-auto w-full"
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="pt-10 pb-20">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-2 text-[20px] font-bold leading-[24px] text-[var(--color-text-emphasis)]"
                >
                  꼬순박스 리뷰
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-3 text-[14px] leading-[17px]">
                  {SORT_OPTIONS.map((opt, idx) => (
                    <Fragment key={opt}>
                      <button
                        type="button"
                        onClick={() => setActiveSort(opt)}
                        className={
                          activeSort === opt
                            ? "font-semibold text-[var(--color-text-emphasis)]"
                            : "font-normal text-[var(--color-text-secondary)]"
                        }
                      >
                        {opt}
                      </button>
                      {idx < SORT_OPTIONS.length - 1 && (
                        <span className="text-[var(--color-text-muted)]">|</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>

              <div className="mb-10 flex items-center gap-4">
                {previewImages.slice(0, 4).map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-warm)]"
                  >
                    <Image src={imgSrc} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {previewImages.length > 4 && (
                  <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[8px]">
                    <Image
                      src={previewImages[4]!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-subtitle-16-sb text-white">
                      더보기
                      <br />
                      +{previewImages.length - 4}
                    </div>
                  </div>
                )}
              </div>

              <ul>
                {MOCK_REVIEWS.map((review) => (
                  <li
                    key={review.id}
                    className="flex items-start gap-6 border-b border-[var(--color-text-muted)] py-6 last:border-b-0"
                  >
                    <div className="flex flex-1 items-start gap-4">
                      <div
                        className="h-12 w-12 shrink-0 rounded-full"
                        style={{ background: review.avatarColor }}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold leading-[14px] text-white"
                            style={{ background: TIER_COLOR_VAR[review.tier] }}
                          >
                            {review.tier}
                          </span>
                          <Stars rating={review.rating} size={20} />
                        </div>
                        <div className="mb-3 flex items-center gap-3 text-[13px] leading-[16px]">
                          <span className="font-semibold text-[var(--color-text)]">
                            {review.nickname}
                          </span>
                          <span className="text-[var(--color-text-secondary)]">
                            {review.email}
                          </span>
                          <span className="text-[var(--color-text-secondary)]">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-[14px] font-normal leading-[22px] text-[var(--color-text)]">
                          {review.text}
                        </p>
                      </div>
                    </div>
                    <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[8px]">
                      <Image
                        src={review.photo}
                        alt={`${review.nickname} 리뷰 사진`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="리뷰 페이지네이션"
              >
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)]"
                  aria-label="이전 페이지"
                >
                  ‹
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      page === 1
                        ? "flex h-9 w-9 items-center justify-center text-[15px] font-semibold text-[var(--color-text)]"
                        : "flex h-9 w-9 items-center justify-center text-[15px] text-[var(--color-text-secondary)]"
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)]"
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              </nav>
            </div>
          )}

          {(activeTab === "delivery" || activeTab === "support") && (
            <div className="py-20 text-center">
              <p className="text-body-16-r text-[var(--color-text-secondary)]">
                준비 중인 컨텐츠입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
