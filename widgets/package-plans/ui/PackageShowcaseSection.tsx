"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { planDisplayPrice } from "@/features/subscription/lib/planDisplayPrice";
import { PACKAGES, tierFromSubscriptionPlan, type PackageTier } from "@/entities/package";
import { formatKrwPrice } from "@/shared/lib/format";
import { trackSelectItem } from "@/shared/lib/analytics";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import styles from "./PackageShowcase.module.css";
import star from "../assets/review-star.svg";
import truck from "../assets/delivery-truck.svg";
import basicPackageBackground from "../assets/package-showcase-background-basic.png";
import standardPackageBackground from "../assets/package-showcase-background.png";
import premiumPackageBackground from "../assets/package-showcase-background-premium.png";
import basicBox from "../assets/package-basic.png";
import standardBox from "../assets/package-standard.png";
import premiumBox from "../assets/package-premium.png";

const BOX_IMAGES = { Basic: basicBox, Standard: standardBox, Premium: premiumBox };
const PACKAGE_BACKGROUNDS = {
  Basic: basicPackageBackground,
  Standard: standardPackageBackground,
  Premium: premiumPackageBackground,
} satisfies Record<PackageTier, StaticImageData>;

interface IncomingPackageBackground {
  tier: PackageTier;
  ready: boolean;
}

function PackageBackdrop({ tier }: { tier: PackageTier }) {
  const [currentTier, setCurrentTier] = useState(tier);
  const [incoming, setIncoming] = useState<IncomingPackageBackground | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tier === currentTier) {
        setIncoming(null);
        return;
      }

      setIncoming({ tier, ready: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentTier, tier]);

  function finishTransition(nextTier: PackageTier) {
    setCurrentTier(nextTier);
    setIncoming(null);
  }

  return (
    <div className={styles.packageBackdrop} aria-hidden="true">
      <div className={styles.packageBackdropPhoto}>
      <Image
        key={currentTier}
        src={PACKAGE_BACKGROUNDS[currentTier]}
        alt=""
        fill
        quality={HIGH_IMAGE_QUALITY}
        sizes="(min-width: 1288px) 1240px, calc(100vw - 48px)"
        className={styles.packageBackdropImage}
        data-active={!incoming?.ready}
      />
      {incoming && (
        <Image
          key={incoming.tier}
          src={PACKAGE_BACKGROUNDS[incoming.tier]}
          alt=""
          fill
          quality={HIGH_IMAGE_QUALITY}
          sizes="(min-width: 1288px) 1240px, calc(100vw - 48px)"
          className={styles.packageBackdropImage}
          data-active={incoming.ready}
          onLoad={() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              finishTransition(incoming.tier);
              return;
            }
            setIncoming(current => current?.tier === incoming.tier ? { ...current, ready: true } : current);
          }}
          onTransitionEnd={event => {
            if (event.propertyName === "opacity" && incoming.ready) finishTransition(incoming.tier);
          }}
        />
      )}
      </div>
    </div>
  );
}
function Stars({ rating = 5 }: { rating?: number }) {
  return <span className={styles.stars} role="img" aria-label={`평점 5점 만점에 ${rating}점`}>{Array.from({ length: 5 }, (_, index) => <Image key={index} src={star} width={24} height={24} alt="" style={{ clipPath: `inset(0 ${100 - Math.min(1, Math.max(0, rating - index)) * 100}% 0 0)` }} />)}</span>;
}
interface PackageShowcaseProps {
  plans: SubscriptionPlanDto[];
  loading?: boolean;
  error?: boolean;
  initialSelectedTier?: PackageTier | null;
  variant?: "home" | "subscription";
}

export function PackageShowcaseSection({
  plans,
  loading = false,
  error = false,
  initialSelectedTier = null,
  variant = "home",
}: PackageShowcaseProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = plans.find(plan => plan.id === selectedId)
    ?? plans.find(plan => tierFromSubscriptionPlan(plan) === (initialSelectedTier ?? "Standard"))
    ?? plans[0];
  const tier = selected ? tierFromSubscriptionPlan(selected) : "Standard";
  const pkg = PACKAGES.find(item => item.tier === tier)!;
  const price = selected ? planDisplayPrice(selected) : null;
  // One card per tier, in the same order as the comparison table.
  const sorted = PACKAGES.flatMap(pkg => {
    const plan = plans.find(item => tierFromSubscriptionPlan(item) === pkg.tier);
    return plan ? [plan] : [];
  });

  return (
    <section className={styles.packages} data-variant={variant} aria-labelledby="package-intro-title">
      <div className={`${styles.container} ${styles.packageIntro}`}>
        <h2 id="package-intro-title" className={styles.heading}>
          {variant === "subscription"
            ? <>우리 강아지에게 맞는 <span>구독을 선택하세요</span></>
            : <><span>꼬순박스를</span> 정기구독으로 만나보세요.</>}
        </h2>
        <p className={styles.productDescription}>
          {variant === "subscription"
            ? "꼬순박스가 엄선한 건강한 재료로, 매달 새로운 행복을 보내드려요."
            : "맛과 영양을 생각해 구성한 다양한 수제 간식을 정해진 주기에 맞춰 신선하게 보내드려요."}
        </p>
      </div>
      <div className={`${styles.container} ${styles.packagePanel}`}>
        <PackageBackdrop tier={tier} />
        <div className={styles.packageHero}>
          <div className={styles.packageCopy}>
            <div className={styles.packageBadges}>
              <span className={styles.tierBadge} data-tier={tier}>{pkg.name.replace(/ 패키지 BOX$/, "")}</span>
              <span className={styles.shippingBadge}><Image src={truck} alt="" width={24} height={24} />무료배송</span>
              {selected && tier === "Standard" && <span className={styles.popularBadge}>인기 PICK 🌟</span>}
            </div>
            <h2 id="package-title">{(selected?.name ?? pkg.name).replace(/ BOX$/, "")}</h2>
            <p className={styles.packageDescription}>{pkg.contents.join(" ")}</p>
            {price && (
              <div className={styles.packagePrice}>
                <span>월 요금제</span>
                <span className={styles.packageCurrentPrice}>
                  {!!price.discountPct && <em>{price.discountPct}%</em>}
                  <strong>{formatKrwPrice(price.price)}</strong>
                </span>
                {price.strikePrice !== null && <del>{formatKrwPrice(price.strikePrice)}</del>}
              </div>
            )}
            {selected && !selected.isSalesPaused ? (
              <Link href={`/subscribe/detail?planId=${selected.id}`} className={styles.outlineButton}
                onClick={() => trackSelectItem({ plan_tier: selected.name })}>
                제품 보러가기
              </Link>
            ) : (
              <button type="button" className={styles.outlineButton} disabled>
                {loading ? "패키지 불러오는 중" : selected?.isSalesPaused ? "현재 신청이 어려워요" : "패키지 준비 중"}
              </button>
            )}
          </div>
        </div>
        <div className={styles.packageCards}>
          {loading ? Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={styles.packageSkeleton} aria-label="패키지 불러오는 중" />
          )) : sorted.length ? sorted.map(plan => {
            const cardTier = tierFromSubscriptionPlan(plan);
            const cardPrice = planDisplayPrice(plan);
            return (
              <button key={plan.id} type="button" aria-pressed={selected?.id === plan.id}
                aria-controls="package-title" onClick={() => setSelectedId(plan.id)} className={styles.packageCard}>
                <span className={styles.packageCardImage} data-tier={cardTier}>
                  <Image src={BOX_IMAGES[cardTier]} alt="" width={160} height={148} sizes="(max-width: 767px) 116px, (max-width: 1199px) 240px, 160px" />
                  {cardTier === "Standard" && <span className={styles.popularCardBadge}>인기 PICK 🌟</span>}
                </span>
                <span className={styles.packageCardCopy}>
                  <strong>{plan.name}</strong>
                  <span className={styles.cardDiscount}>
                    {!!cardPrice.discountPct && <em>{cardPrice.discountPct}%</em>}
                    {cardPrice.strikePrice !== null && <del>{formatKrwPrice(cardPrice.strikePrice)}</del>}
                  </span>
                  <span className={styles.cardPrice}>월 요금제 <b>{formatKrwPrice(cardPrice.price)}</b></span>
                  {plan.averageRating > 0 && (
                    <span className={styles.cardRating}><Stars rating={plan.averageRating} /><span>{plan.averageRating.toFixed(1)}</span></span>
                  )}
                  {(plan.isSalesPaused || plan.averageRating <= 0) && (
                    <span className={styles.cardAction}>{plan.isSalesPaused ? "현재 신청이 어려워요" : "구성 살펴보기"}</span>
                  )}
                </span>
              </button>
            );
          }) : (
            <p className={styles.empty}>
              {error ? "패키지 정보를 불러오지 못했습니다." : "현재 신청 가능한 패키지가 없습니다."}
              {variant === "subscription"
                ? <button type="button" onClick={() => window.location.reload()}>새로고침</button>
                : <Link href="/subscribe">구독몰에서 확인하기</Link>}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
