"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 API가 제공하는 동적 URL이다. */
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSubscriptionPlans, type SubscriptionPlanDto } from "@/features/subscription/api";
import { planDisplayPrice } from "@/features/subscription/lib/planDisplayPrice";
import { useReferral } from "@/features/referral/model";
import { getProducts, type ProductDto } from "@/features/product/api";
import { PACKAGES, tierFromSubscriptionPlan, type PackageTier } from "@/entities/package";
import { FAQ_ITEMS } from "@/shared/config/faqItems";
import { formatKrwPrice } from "@/shared/lib/format";
import { openKakaoChannelChat } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import logo from "@/shared/assets/logo-main.svg";
import brandStoryPackage from "../assets/brand-story-package.png";
import subscriptionDogTreat from "../assets/subscription-dog-treat.png";
import stepProfile from "../assets/subscription-step-01-profile.svg";
import stepPlan from "../assets/subscription-step-02-plan.svg";
import stepPayment from "../assets/subscription-step-03-payment-date.svg";
import stepDelivery from "../assets/subscription-step-04-delivery.svg";
import reviewDogBowl from "../assets/review-dog-bowl.png";
import reviewDogProducts from "../assets/review-dog-products.png";
import profile1 from "../assets/review-profile-01.webp";
import profile2 from "../assets/review-profile-02.webp";
import profile3 from "../assets/review-profile-03.webp";
import profile4 from "../assets/review-profile-04.webp";
import star from "../assets/review-star.svg";
import chevron from "../assets/chevron-down.svg";
import arrow from "../assets/product-arrow.svg";
import truck from "../assets/delivery-truck.svg";
import basicPackageBackground from "../assets/package-showcase-background-basic.png";
import standardPackageBackground from "../assets/package-showcase-background.png";
import premiumPackageBackground from "../assets/package-showcase-background-premium.png";
import basicBox from "../assets/package-basic.png";
import standardBox from "../assets/package-standard.png";
import premiumBox from "../assets/package-premium.png";
import coupon from "../assets/product-banner-coupon.png";
import salmonYogurtBall from "../assets/product-salmon-yogurt-ball.png";
import kkomiChips from "../assets/product-kkomi-chips.png";
import beefMeal from "../assets/product-beef-meal.png";
import duckYogurtBall from "../assets/product-duck-yogurt-ball.png";
import styles from "./HomeRedesign.module.css";
import "@/shared/config/homeRedesignTokens.css";

const STEPS = [
  { number: "01", title: "프로필 작성", description: "강아지 정보를 입력해주세요.", image: stepProfile },
  { number: "02", title: "구독 선택", description: "딱 맞는 꼬순박스를 추천드려요.", image: stepPlan },
  { number: "03", title: "결제일 지정", description: <>결제 되는 날 꼬순박스가<br />출발해요</>, image: stepPayment },
  { number: "04", title: "집앞 배송", description: <>아이스박스에 담겨 신선하게<br />배송돼요</>, image: stepDelivery },
] as const;
// 기존 공개 후기 원문 발췌. 동일 보호자의 추가 발췌에도 원래 이름을 유지한다.
const REVIEWS = [
  { name: "콩콩", tier: "Premium", label: "프리미엄", profile: profile1, text: "원래 간식 진짜 가리는 애라서 이것저것 다 사봤는데 이건 처음으로 먼저 달라고 찾아요!" },
  { name: "보리", tier: "Standard", label: "스탠다드", profile: profile2, text: "알러지 때문에 간식 고르는 게 항상 스트레스였는데 여기는 맞춤으로 추천해줘서 너무 편하고 좋아요." },
  { name: "루루", tier: "Standard", label: "스탠다드", profile: profile4, text: "처음엔 반신반의하면서 시작했는데 지금은 간식 시간만 되면 눈빛이 완전 달라져요ㅋㅋ" },
  { name: "보리", tier: "Standard", label: "스탠다드", profile: profile2, text: "성분도 깔끔해서 믿고 먹일 수 있고 무엇보다 아이가 너무 잘 먹어서 계속 구독 중입니다." },
  { name: "몽땅", tier: "Basic", label: "베이직", profile: profile3, text: "일반 간식 주면 꼭 항상 반 정도 남기던 애인데 이건 끝까지 다 먹어요. 특히 종류가 다양해서 질려하지 않는 게 가장 좋아요." },
  { name: "콩콩", tier: "Premium", label: "프리미엄", profile: profile1, text: "특히 수제라 그런지 냄새부터 다르고 먹고 나서도 탈이 없어서 너무 만족하고 있어요." },
] as const;
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
    <div className={styles.packageBackdrop}>
      <Image
        key={currentTier}
        src={PACKAGE_BACKGROUNDS[currentTier]}
        alt=""
        fill
        quality={HIGH_IMAGE_QUALITY}
        sizes="100vw"
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
          sizes="100vw"
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
  );
}
const PRODUCT_ART: Array<{ matches: RegExp; image: StaticImageData }> = [
  { matches: /연어.*요거트|요거트.*연어/, image: salmonYogurtBall },
  { matches: /꼬미칩/, image: kkomiChips },
  { matches: /소고기.*화식|화식.*소고기/, image: beefMeal },
  { matches: /오리.*요거트|요거트.*오리/, image: duckYogurtBall },
];
const CATEGORIES = ["전체", "요거트볼", "껌류", "칩류", "화식"] as const;
type Category = (typeof CATEGORIES)[number];
const FAQ_CATEGORIES = ["전체", "배송문의", "상품문의"] as const;

function Stars({ rating = 5 }: { rating?: number }) {
  return <span className={styles.stars} role="img" aria-label={`평점 5점 만점에 ${rating}점`}>{Array.from({ length: 5 }, (_, index) => <Image key={index} src={star} width={24} height={24} alt="" style={{ clipPath: `inset(0 ${100 - Math.min(1, Math.max(0, rating - index)) * 100}% 0 0)` }} />)}</span>;
}
function BrandStorySection() {
  return <section className={styles.story} aria-labelledby="brand-story-title"><div className={`${styles.container} ${styles.storyGrid}`}>
    <div><h2 id="brand-story-title" className={styles.heading}><span>까다로운 입맛과 예민한 건강</span>을 위해,<br />결국 보호자가 직접 만들었습니다.</h2>
      <p className={styles.storyDescription}>&apos;기호성 최고&apos;라는 간식 다 사줘봤지만, 며칠 먹다 외면하기 일쑤였습니다.<br />수많은 고민 끝에 간식을 직접 만들고 엄선해 보기로 했습니다.</p>
      <Link href="/about" className={`${styles.outlineButton} ${styles.storyButton}`}>브랜드 스토리 보러가기</Link></div>
    <Image src={brandStoryPackage} alt="꼬순박스 수제간식은 까다롭게 직접 만들었습니다. 스탠다드 패키지 구성" quality={HIGH_IMAGE_QUALITY} className={styles.storyImage} sizes="(min-width: 1288px) 586px, (min-width: 1200px) 46vw, (min-width: 768px) 586px, calc(100vw - 48px)" />
  </div></section>;
}
function SubscriptionStepsSection() {
  return <section className={styles.steps} aria-labelledby="steps-title"><div className={`${styles.container} ${styles.stepsGrid}`}>
    <div className={styles.stepsContent}><h2 id="steps-title" className={styles.heading}><span className={styles.white}>이렇게 간편하게</span><br />매달 우리 아이의 영양을 챙겨주세요.</h2>
      <p className={styles.stepsDescription}>복잡한 과정은 줄이고, 더 중요한 것에만 집중했어요.<br />지금부터 4단계로 간편하게 시작해보세요.</p>
      <ol className={styles.stepCards}>{STEPS.map(step => <li key={step.number}><Image src={step.image} alt="" width={63} height={63} /><div><strong>{step.number}.</strong><h3>{step.title}</h3></div><p>{step.description}</p></li>)}</ol></div>
    <Image src={subscriptionDogTreat} alt="꼬순박스 간식을 기다리는 강아지" quality={HIGH_IMAGE_QUALITY} className={styles.stepsImage} sizes="(min-width: 768px) 455px, calc(100vw - 48px)" />
  </div></section>;
}
function ReviewsSection() {
  return <section className={styles.reviews} aria-labelledby="reviews-title"><div className={styles.container}>
    <div className={styles.reviewsIntro}><div><h2 id="reviews-title" className={styles.heading}><span>실제 고객님들의</span><br />생생한 구매평입니다.</h2><p className={styles.reviewsDescription}>{`'기호성 최고'라는 간식 다 사줘봤지만, 며칠 먹다 외면하기 일쑤였습니다.`}<br />수많은 고민 끝에 간식을 직접 만들고 엄선해 보기로 했습니다.</p></div><div className={styles.reviewPhotos}><Image src={reviewDogBowl} alt="꼬순박스를 먹는 강아지" width={164} height={191} sizes="164px" /><Image src={reviewDogProducts} alt="꼬순박스 간식과 함께 있는 강아지" width={211} height={211} sizes="211px" /></div></div>
    <div className={styles.reviewCards}>{REVIEWS.map((review, index) => <article key={`${review.name}-${index}`} data-nosnippet aria-label={`${review.name} 보호자님의 후기 발췌`}><Image src={review.profile} alt="" width={38} height={38} className={styles.avatar} /><div className={styles.reviewBody}><div className={styles.reviewMeta}><span className={styles.tierBadge} data-tier={review.tier}>{review.label}</span><Stars /></div><p title={review.text}>{review.text}</p><span className="sr-only">{review.name} 보호자님</span></div></article>)}</div>
  </div></section>;
}
function PackageShowcaseSection({ plans, loading, error }: { plans: SubscriptionPlanDto[]; loading: boolean; error: boolean }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = plans.find(plan => plan.id === selectedId) ?? plans.find(plan => tierFromSubscriptionPlan(plan) === "Standard") ?? plans[0];
  const tier = selected ? tierFromSubscriptionPlan(selected) : "Standard";
  const pkg = PACKAGES.find(item => item.tier === tier)!;
  const price = selected ? planDisplayPrice(selected) : null;
  const sorted = [...plans].sort((a, b) => ["Basic", "Standard", "Premium"].indexOf(tierFromSubscriptionPlan(a)) - ["Basic", "Standard", "Premium"].indexOf(tierFromSubscriptionPlan(b))).slice(0, 3);
  return <section className={styles.packages} aria-labelledby="package-title"><PackageBackdrop tier={tier} /><div className={styles.container}>
    <div className={styles.packageHero}><div className={styles.packageCopy}>
      <div className={styles.packageBadges}><span className={styles.tierBadge} data-tier={tier}>{pkg.name.replace(/ 패키지 BOX$/, "")}</span><span className={styles.shippingBadge}><Image src={truck} alt="" width={24} height={24} />무료배송</span></div>
      <h2 id="package-title">{(selected?.name ?? pkg.name).replace(/ BOX$/, "")}</h2><p className={styles.packageDescription}>{selected?.description?.trim() || pkg.contents.join(" ")}</p>
      {price && <div className={styles.packagePrice}><span>월 요금제</span>{!!price.discountPct && <em>{price.discountPct}%</em>}<strong>{formatKrwPrice(price.price)}</strong>{price.strikePrice && <del>{formatKrwPrice(price.strikePrice)}</del>}</div>}
      {selected && !selected.isSalesPaused ? <Link href={`/subscribe/detail?planId=${selected.id}`} className={styles.outlineButton}>제품 보러가기</Link> : <button className={styles.outlineButton} disabled>{loading ? "패키지 불러오는 중" : selected?.isSalesPaused ? "현재 신청이 어려워요" : "패키지 준비 중"}</button>}
    </div></div>
    <div className={styles.packageCards}>{loading ? Array.from({ length: 3 }, (_, i) => <div key={i} className={styles.packageSkeleton} aria-label="패키지 불러오는 중" />) : sorted.length ? sorted.map(plan => {
      const cardTier = tierFromSubscriptionPlan(plan); const cardPrice = planDisplayPrice(plan);
      return <button key={plan.id} type="button" aria-pressed={selected?.id === plan.id} onClick={() => setSelectedId(plan.id)} className={styles.packageCard}><span className={styles.packageCardImage} data-tier={cardTier}><Image src={BOX_IMAGES[cardTier]} alt="" width={160} height={148} sizes="240px" /></span><span className={styles.packageCardCopy}><strong>{plan.name}</strong><span className={styles.cardDiscount}>{!!cardPrice.discountPct && <em>{cardPrice.discountPct}%</em>}{cardPrice.strikePrice && <del>{formatKrwPrice(cardPrice.strikePrice)}</del>}</span><span className={styles.cardPrice}>월 요금제 <b>{formatKrwPrice(cardPrice.price)}</b></span>{plan.averageRating > 0 ? <span className={styles.cardRating}><Stars rating={plan.averageRating} /><span>{plan.averageRating.toFixed(1)}</span></span> : <span className={styles.cardAction}>{plan.isSalesPaused ? "현재 신청이 어려워요" : "구성 살펴보기"}</span>}</span></button>;
    }) : <p className={styles.empty}>{error ? "패키지 정보를 불러오지 못했습니다." : "현재 신청 가능한 패키지가 없습니다."} <Link href="/subscribe">구독몰에서 확인하기</Link></p>}</div>
  </div></section>;
}
function ProductShowcaseSection({ products, loading, error }: { products: ProductDto[]; loading: boolean; error: boolean }) {
  const [category, setCategory] = useState<Category>("전체"); const [start, setStart] = useState(0);
  const filtered = useMemo(() => {
    const matching = products.filter(product => category === "전체" || product.name.includes(category === "껌류" ? "껌" : category === "칩류" ? "칩" : category));
    const rank = (name: string) => { const index = PRODUCT_ART.findIndex(art => art.matches.test(name)); return index < 0 ? PRODUCT_ART.length : index; };
    return [...matching].sort((a, b) => rank(a.name) - rank(b.name));
  }, [products, category]);
  const visible = filtered.slice(start, start + 4);
  return <section className={styles.products} aria-labelledby="products-title"><div className={styles.container}>
    <Link href="/products" className={styles.productBanner}><span>첫 만남은 가볍게, <strong>꼬순박스를 단품으로 만나보기</strong></span><Image src={coupon} alt="" width={217} height={77} /></Link>
    <h2 id="products-title" className={styles.heading}><span>원하는 제품만</span> 자유롭게 간편하게 구매하세요.</h2><p className={styles.productDescription}>체크리스트 후 우리 아이에게 적절한 패키지 박스를 추천받을 수 있습니다!</p>
    <div className={styles.tabs} role="group" aria-label="상품 카테고리">{CATEGORIES.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setStart(0); }}>{item}</button>)}</div>
    <div className={styles.productCarousel}><button type="button" className={`${styles.carouselArrow} ${styles.previous}`} aria-label="이전 상품" disabled={start === 0} onClick={() => setStart(value => Math.max(0, value - 1))}><Image src={arrow} alt="" width={48} height={48} /></button>
      <div className={styles.productCards}>{loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.productSkeleton} aria-label="상품 불러오는 중" />) : visible.length ? visible.map(product => {
        const art = PRODUCT_ART.find(item => item.matches.test(product.name))?.image; const unavailable = product.isSoldOut || product.isSalesPaused;
        const content = <><div className={styles.productImage}>{art ? <Image src={art} alt={product.name} fill sizes="(min-width: 1288px) 290px, (min-width: 768px) 23vw, 44vw" quality={HIGH_IMAGE_QUALITY} /> : product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <span>이미지 준비 중</span>}{unavailable && <span className={styles.unavailable}>{product.isSoldOut ? "품절" : "판매 중지"}</span>}</div><h3>{product.name}</h3><p>{product.description?.trim() || "꼬순박스가 정성껏 만든 건강한 수제간식"}</p><span className={styles.productPrice}>{product.originalPrice != null && product.originalPrice > product.price && <em>{Math.round((1 - product.price / product.originalPrice) * 100)}%</em>}<strong>{formatKrwPrice(product.price)}</strong>{product.originalPrice != null && product.originalPrice > product.price && <del>{formatKrwPrice(product.originalPrice)}</del>}</span></>;
        return unavailable ? <article key={product.id}>{content}</article> : <Link key={product.id} href={`/purchase/detail?productId=${product.id}`}>{content}</Link>;
      }) : <p className={styles.empty}>{error ? "상품 정보를 불러오지 못했습니다." : "해당 카테고리에 판매 중인 상품이 없습니다."} <Link href="/products">단품몰에서 확인하기</Link></p>}</div>
      <button type="button" className={`${styles.carouselArrow} ${styles.next}`} aria-label="다음 상품" disabled={start + 4 >= filtered.length} onClick={() => setStart(value => Math.min(Math.max(0, filtered.length - 4), value + 1))}><Image src={arrow} alt="" width={48} height={48} /></button>
    </div>
  </div></section>;
}
function FaqSection() {
  const [category, setCategory] = useState<(typeof FAQ_CATEGORIES)[number]>("전체"); const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0].question);
  const items = FAQ_ITEMS.filter(item => category === "전체" || (category === "배송문의" ? /배송|주소/.test(item.question) : /플랜|보관|원산지|간식/.test(item.question))).slice(0, 5);
  return <section className={styles.faq} aria-labelledby="faq-title"><div className={styles.container}>
    <h2 id="faq-title" className={styles.heading}><span>꼬순박스에 대해</span> 궁금하신가요?</h2><p className={styles.faqDescription}>꼬순박스에 대해 궁금한 것이 있으시면 언제든지 문의해주세요.</p>
    <div className={styles.tabs} role="group" aria-label="FAQ 카테고리">{FAQ_CATEGORIES.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setOpen(null); }}>{item}</button>)}</div>
    <div className={styles.faqGrid}><div className={styles.faqItems}>{items.map(item => {
      const expanded = open === item.question; const id = `home-faq-${FAQ_ITEMS.indexOf(item)}`;
      return <div key={item.question} className={styles.faqItem} data-open={expanded}><h3><button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? null : item.question)}><span><em>Q.</em> {item.question}</span><Image src={chevron} alt="" width={24} height={24} /></button></h3><div id={id} hidden={!expanded} className={styles.answer}>{item.answer}</div></div>;
    })}</div><aside className={styles.contact}><Image src={logo} alt="꼬순박스" width={132} height={44} /><h3>더 질문이 있으신가요?</h3><p>원하는 답변을 찾지 못하셨나요?<br />언제든지 문의해주세요.</p><button type="button" onClick={openKakaoChannelChat}>카카오톡 상담하기</button><Link href="/inquiry">고객센터</Link></aside></div>
  </div></section>;
}
export default function HomeRedesign() {
  const { refCode } = useReferral();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]); const [products, setProducts] = useState<ProductDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(true); const [productsLoading, setProductsLoading] = useState(true);
  const [plansError, setPlansError] = useState(false); const [productsError, setProductsError] = useState(false);
  useEffect(() => { let alive = true;
    getSubscriptionPlans(undefined, refCode ?? undefined).then(response => { if (alive) { setPlans(response.plans); setPlansError(false); } }).catch(() => { if (alive) { setPlans([]); setPlansError(true); } }).finally(() => { if (alive) setPlansLoading(false); });
    return () => { alive = false; };
  }, [refCode]);
  useEffect(() => { let alive = true;
    getProducts().then(response => { if (alive) { setProducts(response.products); setProductsError(false); } }).catch(() => { if (alive) { setProducts([]); setProductsError(true); } }).finally(() => { if (alive) setProductsLoading(false); });
    return () => { alive = false; };
  }, []);
  return <div className={styles.home}><BrandStorySection /><SubscriptionStepsSection /><ReviewsSection /><PackageShowcaseSection plans={plans} loading={plansLoading} error={plansError} /><ProductShowcaseSection products={products} loading={productsLoading} error={productsError} /><FaqSection /></div>;
}
