import Image, { type StaticImageData } from "next/image";
import {
  QuantityMinusIcon,
  QuantityPlusIcon,
} from "@/shared/ui";
import {
  TIER_BOX_IMAGES,
  type PackageTier,
} from "@/entities/package";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { MOCK_CART_COUNT } from "@/shared/config/cartMock";

type CartProduct = {
  tier: PackageTier;
  name: string;
  price: string;
  image: StaticImageData;
};

const PRODUCTS: CartProduct[] = [
  {
    tier: "Premium",
    name: "프리미엄 패키지 BOX",
    price: "25,000원",
    image: TIER_BOX_IMAGES.Premium,
  },
  {
    tier: "Standard",
    name: "스탠다드 패키지 BOX",
    price: "20,000원",
    image: TIER_BOX_IMAGES.Standard,
  },
];

const TIER_STYLE: Record<PackageTier, string> = {
  Basic: "bg-[var(--color-basic)]",
  Standard: "bg-[var(--color-plus)]",
  Premium: "bg-[var(--color-accent-orange)]",
};

const TIER_LABEL: Record<PackageTier, string> = {
  Basic: "베이직",
  Standard: "스탠다드",
  Premium: "프리미엄",
};

function SelectedCheck({ size = "normal" }: { size?: "normal" | "large" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-accent)] ${
        size === "large" ? "h-6 w-6" : "h-5 w-5"
      }`}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.25 10L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ChevronDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 9L12 16L19 9" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15 5L5 15" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5L15 15" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PriceSummaryBar() {
  const summary = [
    { label: "주문상품금액", desktopValue: "25,000원", mobileValue: "25,000원" },
    { label: "총 할인금액", desktopValue: "0원", mobileValue: "0원" },
    { label: "총 배송비", desktopValue: "0원", mobileValue: "0원" },
    { label: "총 주문금액", desktopValue: "25,000원", mobileValue: "0원", emphasis: true },
  ];

  return (
    <section className="w-full bg-[var(--color-top-band-bg)] text-white" aria-label="장바구니 주문 금액 요약">
      <div className="mx-auto flex w-full max-md:h-[128px] max-md:px-6 md:h-14 md:max-w-[742px] md:items-center md:justify-between">
        {summary.map((item, index) => (
          <div key={item.label} className="contents">
            {index > 0 && (
              <span className="flex items-center self-center text-subtitle-16-sb max-md:w-5 max-md:justify-center md:block">
                {index === 3 ? "=" : index === 2 ? "−" : "+"}
              </span>
            )}
            <div className="flex min-w-0 flex-1 items-center justify-center max-md:flex-col max-md:gap-2 md:flex-none md:gap-3">
              <span className={`whitespace-nowrap tracking-[-0.04em] max-md:text-body-13-m md:text-subtitle-16-sb ${item.emphasis ? "text-[var(--color-banner-bg)]" : "text-white"}`}>
                {item.label}
              </span>
              <span className={`whitespace-nowrap tracking-[-0.04em] max-md:text-body-20-sb md:text-subtitle-16-sb ${item.emphasis ? "text-[var(--color-banner-bg)] md:text-subtitle-20-b" : "text-white"}`}>
                <span className="max-md:hidden">{item.desktopValue}</span>
                <span className="md:hidden">{item.mobileValue}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductRow({ product, index }: { product: CartProduct; index: number }) {
  const mobileProduct = index === 1
    ? { ...product, tier: "Premium" as const, name: "프리미엄 패키지 BOX", price: "25,000원", image: TIER_BOX_IMAGES.Premium }
    : product;

  return (
    <article className={`flex w-full max-md:gap-3 max-md:py-9 md:min-h-[188px] md:items-center md:gap-6 md:px-6 ${index < PRODUCTS.length - 1 ? "border-b border-[var(--color-text-muted)]" : ""}`}>
      <SelectedCheck />
      <div className="relative shrink-0 overflow-hidden rounded-[14px] max-md:h-[118px] max-md:w-[122px] md:h-[148px] md:w-[160px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          quality={HIGH_IMAGE_QUALITY}
          sizes="(max-width: 767px) 122px, 160px"
          className={`object-cover ${index === 1 ? "max-md:hidden" : ""}`}
        />
        {index === 1 && (
          <Image
            src={mobileProduct.image}
            alt={mobileProduct.name}
            fill
            quality={HIGH_IMAGE_QUALITY}
            sizes="122px"
            className="object-cover md:hidden"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 max-md:flex-col max-md:gap-3 md:min-h-[148px] md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <span className={`w-fit rounded-full px-3 py-1 text-body-14-sb text-white ${TIER_STYLE[product.tier]} ${index === 1 ? "max-md:bg-[var(--color-accent-orange)]" : ""}`}>
            <span className="max-md:hidden">{TIER_LABEL[product.tier]}</span>
            <span className="md:hidden">{TIER_LABEL[mobileProduct.tier]}</span>
          </span>
          <h2 className="whitespace-nowrap text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text-emphasis)] max-sm:text-body-14-sb">
            <span className="max-md:hidden">{product.name}</span>
            <span className="md:hidden">{mobileProduct.name}</span>
          </h2>
          <p className="text-price-16-eb text-[var(--color-text-price)]">
            월 요금제 <span className="max-md:hidden">{product.price}</span><span className="md:hidden">{mobileProduct.price}</span>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="상품 수량 감소"><QuantityMinusIcon /></button>
            <span className="min-w-3 text-center text-body-12-m text-[var(--color-text)]">1</span>
            <button type="button" aria-label="상품 수량 증가"><QuantityPlusIcon /></button>
          </div>
        </div>
        <strong className="text-price-20-eb text-[var(--color-text-price)] max-md:hidden md:self-end md:pb-4">{product.price}</strong>
      </div>
    </article>
  );
}

function MobilePaymentSummary() {
  return (
    <section className="md:hidden mt-7" aria-labelledby="cart-payment-title">
      <div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-4">
        <h2 id="cart-payment-title" className="text-subtitle-18-b">결제정보</h2>
        <ChevronDown />
      </div>
      <dl className="space-y-4 border-b border-[var(--color-text-muted)] py-6 text-body-14-m">
        <div className="flex justify-between"><dt>주문상품금액</dt><dd>25,000원</dd></div>
        <div className="flex justify-between"><dt>총 쿠폰 할인금액</dt><dd>-5,000원</dd></div>
        <div className="flex justify-between"><dt>총 배송비</dt><dd>-0원</dd></div>
      </dl>
      <div className="flex items-center justify-between py-5">
        <span className="text-subtitle-16-b">월 요금제</span>
        <strong className="text-price-20-eb-lh24">20,000원</strong>
      </div>
      <div className="flex items-center gap-3 pb-6">
        <SelectedCheck size="large" />
        <span className="text-body-16-m text-[var(--color-text-secondary)]">모두 동의합니다.</span>
        <ChevronDown />
      </div>
      <button type="button" className="h-[52px] w-full rounded-[9px] bg-[var(--color-cta-button)] text-subtitle-18-b text-white">
        {MOCK_CART_COUNT}건 주문하기
      </button>
    </section>
  );
}

function DesktopOrderSummary() {
  return (
    <aside className="max-md:hidden w-[315px] shrink-0 border-l border-[var(--color-text-muted)] pl-[52px]" aria-labelledby="cart-order-summary-title">
      <div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-5">
        <h2 id="cart-order-summary-title" className="text-subtitle-18-b">주문예상금액</h2>
        <ChevronDown />
      </div>
      <dl className="space-y-4 border-b border-[var(--color-text-muted)] py-6 text-body-14-m">
        <div className="flex justify-between"><dt>총 선택상품금액</dt><dd>25,000원</dd></div>
        <div className="flex justify-between"><dt>총 쿠폰 할인금액</dt><dd>-0원</dd></div>
        <div className="flex justify-between"><dt>총 배송비</dt><dd><span className="line-through">4,000원</span></dd></div>
      </dl>
      <div className="flex items-center justify-between py-5">
        <span className="text-subtitle-16-b">월 요금제</span>
        <strong className="text-price-20-eb-lh24">25,000원</strong>
      </div>
      <button type="button" className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white">{MOCK_CART_COUNT}건 주문하기</button>
      <div className="mt-6 overflow-hidden rounded-[8px]">
        <Image
          src="/images/sidebar-banner-001.png"
          alt="꼬순박스 배너 — 체크리스트 작성하러 가기"
          width={375}
          height={126}
          quality={HIGH_IMAGE_QUALITY}
          className="h-auto w-full"
          sizes="263px"
        />
      </div>
    </aside>
  );
}

export default function CartSection() {
  return (
    <div className="flex flex-1 flex-col bg-white max-md:pt-[88px] md:pt-[84px]">
      <PriceSummaryBar />
      <div className="mx-auto flex w-full max-w-content flex-1 max-md:px-6 max-md:py-9 md:gap-[52px] md:px-8 md:py-10 lg:px-0">
        <section className="min-w-0 flex-1" aria-labelledby="cart-title">
          <div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-5">
            <h1 id="cart-title" className="text-subtitle-18-b">장바구니</h1>
            <ChevronDown />
          </div>
          <div className="mt-5 flex h-14 items-center justify-between rounded-[14px] bg-[var(--color-surface-light)] px-6 max-md:h-[52px] max-md:px-5">
            <div className="flex items-center gap-3"><SelectedCheck /><span className="text-subtitle-16-sb">전체</span></div>
            <button type="button" className="flex h-9 items-center gap-2 rounded-[6px] border border-[var(--color-text-muted)] bg-white px-4 text-body-13-m text-[var(--color-text-secondary)]" aria-label="선택한 상품 삭제">
              <CloseIcon /> 삭제
            </button>
          </div>
          <div>
            {PRODUCTS.map((product, index) => <ProductRow key={`${product.tier}-${index}`} product={product} index={index} />)}
          </div>
          <MobilePaymentSummary />
        </section>
        <DesktopOrderSummary />
      </div>
    </div>
  );
}
