"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 API가 제공하는 동적 URL이다. */
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSubscriptionPlans, type SubscriptionPlanDto } from "@/features/subscription/api";
import { useReferral } from "@/features/referral/model";
import { getProductCategories, getProducts, type ProductCategoryDto, type ProductDto } from "@/features/product/api";
import { PackageShowcaseSection } from "@/widgets/package-plans";
import { formatKrwPrice } from "@/shared/lib/format";
import { openKakaoChannelChat } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { FAQ_ITEMS } from "@/shared/config/faqItems";
import logo from "@/shared/assets/logo-main.svg";
import brandStoryPackage from "../assets/brand-story-package.png";
import subscriptionDogTreat from "../assets/subscription-dog-treat.png";
import stepProfile from "../assets/subscription-step-01-profile.svg";
import stepPlan from "../assets/subscription-step-02-plan.svg";
import stepPayment from "../assets/subscription-step-03-payment-date.svg";
import stepDelivery from "../assets/subscription-step-04-delivery.svg";
import chevron from "../assets/chevron-down.svg";
import coupon from "../assets/product-banner-coupon.png";
import salmonYogurtBall from "../assets/product-salmon-yogurt-ball.png";
import kkomiChips from "../assets/product-kkomi-chips.png";
import beefMeal from "../assets/product-beef-meal.png";
import duckYogurtBall from "../assets/product-duck-yogurt-ball.png";
import styles from "./HomeRedesign.module.css";
import ReviewsSection from "./HomeReviews";
import "@/shared/config/homeRedesignTokens.css";

const STEPS = [
  { number: "01", title: "프로필 작성", description: "강아지 정보를 입력해주세요.", image: stepProfile },
  { number: "02", title: "구독 선택", description: "딱 맞는 꼬순박스를 추천드려요.", image: stepPlan },
  { number: "03", title: "결제일 지정", description: <>결제 되는 날 꼬순박스가<br />출발해요</>, image: stepPayment },
  { number: "04", title: "집앞 배송", description: <>아이스박스에 담겨 신선하게<br />배송돼요</>, image: stepDelivery },
] as const;
const PRODUCT_ART: Array<{ matches: RegExp; image: StaticImageData }> = [
  { matches: /연어.*요거트|요거트.*연어/, image: salmonYogurtBall },
  { matches: /꼬미칩/, image: kkomiChips },
  { matches: /소고기.*화식|화식.*소고기/, image: beefMeal },
  { matches: /오리.*요거트|요거트.*오리/, image: duckYogurtBall },
];

function ProductArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="26" viewBox="0 0 16 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d={direction === "left" ? "M14 2L2 12.6667L14 23.3333" : "M2 2L14 12.6667L2 23.3333"} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandStorySection() {
  return <section className={styles.story} aria-labelledby="brand-story-title"><div className={`${styles.container} ${styles.storyGrid}`}>
    <div><h2 id="brand-story-title" className={styles.heading}><span>매일 먹는 간식이니까</span><br />더 꼼꼼하게 생각했습니다.</h2>
      <p className={styles.storyDescription}>꼬순박스를 만드는 우리도 같은 보호자입니다. 잘 먹는 것도 중요하지만,<br className={styles.desktopSentenceBreak} />{" "}어떤 재료로 어떻게 만들었는지도 중요하다는 걸 잘 알고 있습니다.<br /><br />그래서 맛은 물론, 원료와 영양까지 꼼꼼하게 살펴 우리 강아지에게 안심하고 줄 수 있는 간식을 만듭니다.</p>
      <Link href="/about" className={`${styles.outlineButton} ${styles.storyButton}`}>꼬순박스 이야기</Link></div>
    <figure className={styles.storyVisual}>
      <Image src={brandStoryPackage} alt="꼬순박스 스탠다드 패키지와 수제간식 구성" quality={HIGH_IMAGE_QUALITY} className={styles.storyImage} sizes="(min-width: 1288px) 586px, (min-width: 1200px) 46vw, (min-width: 768px) 586px, calc(100vw - 48px)" />
      <figcaption className={styles.storyCaption}><strong>꼬순박스, 먹여보면 다릅니다.</strong><span>스탠다드 패키지 구성</span></figcaption>
    </figure>
  </div></section>;
}
function SubscriptionStepsSection() {
  return <section className={styles.steps} aria-labelledby="steps-title"><div className={`${styles.container} ${styles.stepsGrid}`}>
    <div className={styles.stepsContent}><h2 id="steps-title" className={styles.heading}><span className={styles.white}>이렇게 간편하게</span><br />매달 우리 아이의 영양을 챙겨주세요.</h2>
      <p className={styles.stepsDescription}>복잡한 과정은 줄이고, 더 중요한 것에만 집중했어요.<br />{" "}지금부터 4단계로 간편하게 시작해보세요.</p>
      <ol className={styles.stepCards}>{STEPS.map(step => <li key={step.number}><Image src={step.image} alt="" width={63} height={63} /><div><strong>{step.number}.</strong><h3>{step.title}</h3></div><p>{step.description}</p></li>)}</ol></div>
    <Image src={subscriptionDogTreat} alt="꼬순박스 간식을 기다리는 강아지" quality={HIGH_IMAGE_QUALITY} className={styles.stepsImage} sizes="(min-width: 768px) 455px, calc(100vw - 48px)" />
  </div></section>;
}
function ProductShowcaseSection({ products, categories, loading, error }: { products: ProductDto[]; categories: ProductCategoryDto[]; loading: boolean; error: boolean }) {
  const [categoryId, setCategoryId] = useState<number | null>(null); const [start, setStart] = useState(0);
  const filtered = useMemo(() => {
    const matching = products.filter(product => categoryId === null || product.categoryId === categoryId);
    const rank = (name: string) => { const index = PRODUCT_ART.findIndex(art => art.matches.test(name)); return index < 0 ? PRODUCT_ART.length : index; };
    return [...matching].sort((a, b) => rank(a.name) - rank(b.name));
  }, [products, categoryId]);
  const visible = filtered.slice(start, start + 4);
  return <section className={styles.products} aria-labelledby="products-title"><div className={styles.container}>
    <Link href="/products" className={styles.productBanner}><span>첫 만남은 가볍게, <strong>꼬순박스를 단품으로 만나보기</strong></span><Image src={coupon} alt="" width={217} height={77} /></Link>
    <h2 id="products-title" className={styles.heading}><span>마음에 드는 간식만</span> 골라서 만나보세요.</h2><p className={styles.productDescription}>꼬순박스에서 만나보던 수제 간식을 원하는 제품만 골라 단품으로 만나보세요.</p>
    <div className={styles.tabs} role="group" aria-label="상품 카테고리">{[{ id: null, name: "전체" }, ...categories].map(item => <button key={item.id ?? "all"} type="button" aria-pressed={categoryId === item.id} onClick={() => { setCategoryId(item.id); setStart(0); }}>{item.name}</button>)}</div>
    <div className={styles.productCarousel}>
      <div className={styles.productCards}>{loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.productSkeleton} aria-label="상품 불러오는 중" />) : visible.length ? visible.map(product => {
        const art = PRODUCT_ART.find(item => item.matches.test(product.name))?.image; const unavailable = product.isSoldOut || product.isSalesPaused;
        const content = <><div className={styles.productImage}>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : art ? <Image src={art} alt={product.name} fill sizes="(min-width: 1288px) 290px, (min-width: 768px) 23vw, 44vw" quality={HIGH_IMAGE_QUALITY} /> : <span>이미지 준비 중</span>}{unavailable && <span className={styles.unavailable}>{product.isSoldOut ? "품절" : "판매 중지"}</span>}</div><h3>{product.name}</h3><p>{product.description?.trim() || "꼬순박스가 정성껏 만든 건강한 수제간식"}</p><span className={styles.productPrice}>{product.originalPrice != null && product.originalPrice > product.price && <em>{Math.round((1 - product.price / product.originalPrice) * 100)}%</em>}<strong>{formatKrwPrice(product.price)}</strong>{product.originalPrice != null && product.originalPrice > product.price && <del>{formatKrwPrice(product.originalPrice)}</del>}</span></>;
        const rating = product.reviewCount > 0 && product.averageRating > 0 ? (
          <div className={styles.productRating} aria-label={`평점 ${product.averageRating.toFixed(1)}점, 리뷰 ${product.reviewCount}건`}>
            <span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" fill="var(--color-star)" />
              </svg>
              {product.averageRating.toFixed(1)}
            </span>
            <span className={styles.productReviewCount}>리뷰 {product.reviewCount.toLocaleString("ko-KR")}건</span>
          </div>
        ) : null;
        return unavailable ? <article key={product.id}>{content}{rating}</article> : <Link key={product.id} href={`/purchase/detail?productId=${product.id}`}>{content}{rating}</Link>;
      }) : <p className={styles.empty}>{error ? "상품 정보를 불러오지 못했습니다." : "해당 카테고리에 판매 중인 상품이 없습니다."} <Link href="/products">단품몰에서 확인하기</Link></p>}</div>
      <nav className={styles.productControls} aria-label="단품 상품 페이지">
        <button type="button" aria-label="이전 상품" disabled={start === 0} onClick={() => setStart(value => Math.max(0, value - 1))}><ProductArrow direction="left" /></button>
        <button type="button" aria-label="다음 상품" disabled={start + 4 >= filtered.length} onClick={() => setStart(value => Math.min(Math.max(0, filtered.length - 4), value + 1))}><ProductArrow direction="right" /></button>
      </nav>
    </div>
  </div></section>;
}
function FaqSection() {
  const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0].question);
  const items = FAQ_ITEMS.slice(0, 5);
  return <section className={styles.faq} aria-labelledby="faq-title"><div className={styles.container}>
    <h2 id="faq-title" className={`${styles.heading} text-black`}><span>꼬순박스에 대해</span> 궁금하신가요?</h2><p className={styles.faqDescription}>꼬순박스에 대해 궁금한 것이 있으시면 언제든지 문의해주세요.</p>
    <div className={styles.faqGrid}><div className={styles.faqItems}>{items.map((item, index) => {
      const expanded = open === item.question; const id = `home-faq-${index}`;
      return <div key={item.question} className={styles.faqItem} data-open={expanded}><h3><button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? null : item.question)}><span><em>Q.</em> {item.question}</span><Image src={chevron} alt="" width={24} height={24} /></button></h3><div id={id} hidden={!expanded} className={styles.answer}>{item.fullAnswer}</div></div>;
    })}</div><aside className={styles.contact}><Image src={logo} alt="꼬순박스" width={132} height={44} /><h3>더 질문이 있으신가요?</h3><p>원하는 답변을 찾지 못하셨나요?<br />언제든지 문의해주세요.</p><button type="button" onClick={openKakaoChannelChat}>카카오톡 상담하기</button><Link href="/support">고객센터</Link></aside></div>
  </div></section>;
}
export default function HomeRedesign() {
  const { refCode, hasDisplayableReferralOffer } = useReferral();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]); const [products, setProducts] = useState<ProductDto[]>([]); const [productCategories, setProductCategories] = useState<ProductCategoryDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(true); const [productsLoading, setProductsLoading] = useState(true);
  const [plansError, setPlansError] = useState(false); const [productsError, setProductsError] = useState(false);
  useEffect(() => { let alive = true;
    getSubscriptionPlans(undefined, hasDisplayableReferralOffer ? refCode ?? undefined : undefined).then(response => { if (alive) { setPlans(response.plans); setPlansError(false); } }).catch(() => { if (alive) { setPlans([]); setPlansError(true); } }).finally(() => { if (alive) setPlansLoading(false); });
    return () => { alive = false; };
  }, [refCode, hasDisplayableReferralOffer]);
  useEffect(() => { let alive = true;
    Promise.all([
      getProducts().then(response => ({ products: response.products, failed: false })).catch(() => ({ products: [] as ProductDto[], failed: true })),
      getProductCategories().then(response => response.categories).catch(() => [] as ProductCategoryDto[]),
    ]).then(([productsResult, categories]) => { if (alive) { setProducts(productsResult.products); setProductCategories(categories); setProductsError(productsResult.failed); } }).finally(() => { if (alive) setProductsLoading(false); });
    return () => { alive = false; };
  }, []);
  return <div className={styles.home}><BrandStorySection /><SubscriptionStepsSection /><ReviewsSection plans={plans} /><PackageShowcaseSection plans={plans} loading={plansLoading} error={plansError} /><ProductShowcaseSection products={products} categories={productCategories} loading={productsLoading} error={productsError} /><FaqSection /></div>;
}
