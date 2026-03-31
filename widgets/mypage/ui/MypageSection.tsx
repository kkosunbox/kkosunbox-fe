"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import loginBannerHd from "@/shared/assets/login-banner-hd.png";
import { Text } from "@/shared/ui";

/* ─────────────────────────────
   Mock data
───────────────────────────── */
const PET = {
  name: "몽뭉이",
  age: "3세",
  gender: "여자",
  weight: "8kg",
  bio: "부드러운 간식을 좋아해요.",
  attributes: [
    { label: "알러지 유무",    value: "닭고기 알러지" },
    { label: "필요 건강 상태", value: "피모 관리" },
    { label: "선호하는 간식",  value: "건조간식" },
    { label: "선호하는 제형",  value: "천연 껌/뼈" },
  ],
};

const SUBSCRIPTION = {
  tier: "Premium",
  name: "프리미엄 패키지 구독중",
  startDate: "2026.01.21",
  billingDay: "매달 21일",
};

const PAYMENT = {
  method: "신용카드 결제",
  card: "국민카드 ( 1234 - **** - **** - **** )",
  nextDate: "2026.04.21 (카드결제)",
};

const DELIVERY_STEPS = [
  { label: "주문접수",   count: 1 },
  { label: "배송준비중", count: 0 },
  { label: "배송중",    count: 0 },
  { label: "배송완료",  count: 0 },
];

const INQUIRIES = [
  { id: 1, text: "제품 문의드립니다.",         date: "26.03.14", status: "처리중"  },
  { id: 2, text: "배송 언제쯤 도착하나요?",   date: "26.03.12", status: "처리완료" },
  { id: 3, text: "아이가 먹어도 안전한가요?", date: "26.03.12", status: "처리완료" },
];

const INQUIRY_TOTAL_PAGES = 5;

/* ─────────────────────────────
   Icons
───────────────────────────── */
function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.5 2.5L11.5 4.5M2 12l1.5-.5 8.5-8.5L9.5 1.5 1.5 10l.5 2z"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 10h12M9 14h12M9 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PackingIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 15h22" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 15v3.5h6V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="9" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 13h5l3 5v6h-8V13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8"  cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DeliveredIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 16l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const DELIVERY_ICONS = [<OrderIcon />, <PackingIcon />, <TruckIcon />, <DeliveredIcon />];

/* ─────────────────────────────
   Shared Card wrapper
───────────────────────────── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["rounded-2xl bg-white p-5 md:p-6", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/* ─────────────────────────────
   Pet avatar placeholder
───────────────────────────── */
function PetAvatar() {
  return (
    <div className="relative shrink-0">
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full md:h-[88px] md:w-[88px]"
        style={{ background: "var(--color-secondary)" }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12"   cy="15.5" rx="5"   ry="4"   fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="6.5"  cy="10.5" rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="10"   cy="8.5"  rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="14"   cy="8.5"  rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="17.5" cy="10.5" rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--color-text-muted)] bg-white text-[var(--color-text-secondary)] shadow-sm"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

/* ─────────────────────────────
   Profile Section
───────────────────────────── */
function ProfileSection() {
  return (
    <section className="py-6 md:py-8" style={{ background: "var(--color-secondary)" }}>
      <div className="mx-auto max-w-content px-4 md:px-8">
        <Card>
          {/* ── Top row: avatar + name/stats + (desktop) attributes ── */}
          <div className="flex gap-5 md:gap-0">
            {/* Left: avatar + info */}
            <div className="flex flex-1 items-start gap-4 md:pr-6">
              <PetAvatar />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Text
                    as="h2"
                    variant="title-24-b"
                    mobileVariant="subtitle-18-b"
                    className="text-[var(--color-text)]"
                  >
                    {PET.name}
                  </Text>
                  <Link
                    href="/mypage/profile"
                    className="shrink-0 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] md:text-[13px]"
                  >
                    <span className="max-md:hidden">프로필 관리 &gt;</span>
                    <span className="md:hidden">정보변경 &gt;</span>
                  </Link>
                </div>
                <Text variant="body-14-r" mobileVariant="body-13-r" className="mt-1 text-[var(--color-text-secondary)]">
                  {PET.age} &nbsp;|&nbsp; {PET.gender} &nbsp;|&nbsp; {PET.weight}
                </Text>
                <Text variant="body-14-r" mobileVariant="body-13-r" className="mt-1 text-[var(--color-text-secondary)]">
                  {PET.bio}
                </Text>
              </div>
            </div>

            {/* Divider — desktop only */}
            <div className="max-md:hidden mx-2 w-px self-stretch bg-[var(--color-divider-warm)]" />

            {/* Right: attributes — desktop only */}
            <div className="max-md:hidden flex-1 pl-6 flex flex-col justify-center gap-0">
              {PET.attributes.map((attr, i) => (
                <div
                  key={attr.label}
                  className={[
                    "flex items-center justify-between py-2.5",
                    i < PET.attributes.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
                  ].join(" ")}
                >
                  <Text variant="body-14-r" className="text-[var(--color-text-secondary)]">
                    {attr.label}
                  </Text>
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <Text variant="body-14-m" className="font-semibold text-[var(--color-text)]">
                      {attr.value}
                    </Text>
                    <PencilIcon />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attributes — mobile only */}
          <div className="md:hidden mt-4 flex flex-col border-t border-[var(--color-divider-warm)] pt-1">
            {PET.attributes.map((attr, i) => (
              <div
                key={attr.label}
                className={[
                  "flex items-center justify-between py-2.5",
                  i < PET.attributes.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
                ].join(" ")}
              >
                <Text variant="body-13-r" className="text-[var(--color-text-secondary)]">
                  {attr.label}
                </Text>
                <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <Text variant="body-13-r" className="font-semibold text-[var(--color-text)]">
                    {attr.value}
                  </Text>
                  <PencilIcon />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────
   Subscription Card
───────────────────────────── */
function SubscriptionCard() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold text-white"
          style={{ background: "var(--color-premium)" }}
        >
          {SUBSCRIPTION.tier}
        </span>
        <Link href="/subscribe" className="text-[13px] text-[var(--color-accent)] hover:underline">
          <span className="max-md:hidden">구독관리</span>
          <span className="md:hidden">구독변경하기</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-[90px] w-[68px] shrink-0 overflow-hidden rounded-xl">
          <Image src={loginBannerHd} alt="꼬순박스 프리미엄 패키지" fill className="object-cover object-center" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
            {SUBSCRIPTION.name}
          </Text>
          <Text variant="body-14-r" className="text-[var(--color-text-secondary)]">
            {SUBSCRIPTION.startDate} ~
          </Text>
          <Text variant="body-14-r" className="text-[var(--color-text-secondary)]">
            결제일 : {SUBSCRIPTION.billingDay}
          </Text>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────────
   Payment Card
───────────────────────────── */
function PaymentCard() {
  const ROW = "flex items-start gap-4";
  const LABEL_W = "w-[72px] shrink-0 text-[var(--color-text-secondary)]";

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Text as="h3" variant="subtitle-18-b" mobileVariant="subtitle-16-sb" className="text-[var(--color-text)]">
          결제관리
        </Text>
        <Link href="/mypage/payment" className="text-[13px] text-[var(--color-accent)] hover:underline">
          결제관리
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className={ROW}>
          <Text variant="body-14-r" className={LABEL_W}>결제수단</Text>
          <Text variant="body-14-m" className="text-[var(--color-text)]">{PAYMENT.method}</Text>
        </div>

        <div className={ROW}>
          <Text variant="body-14-r" className={LABEL_W}>간편결제</Text>
          <div className="flex flex-col gap-2">
            <Text variant="body-14-r" className="text-[var(--color-text)]">{PAYMENT.card}</Text>
            <button
              type="button"
              className="self-start rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              결제등록/변경
            </button>
          </div>
        </div>

        <div className={ROW}>
          <Text variant="body-14-r" className={LABEL_W}>다음 결제일</Text>
          <Text variant="body-14-m" className="text-[var(--color-text)]">{PAYMENT.nextDate}</Text>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────────
   Delivery Card
───────────────────────────── */
function DeliveryCard() {
  return (
    <Card>
      <Text as="h3" variant="subtitle-18-b" mobileVariant="subtitle-16-sb" className="mb-5 text-[var(--color-text)]">
        배송관리
      </Text>
      <div className="grid grid-cols-4 gap-2">
        {DELIVERY_STEPS.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center gap-2">
            <div className="text-[var(--color-text-secondary)]">
              {DELIVERY_ICONS[i]}
            </div>
            <Text
              variant="body-13-r"
              className="text-center text-[var(--color-text)] leading-tight"
            >
              {step.label}
            </Text>
            <Text
              as="span"
              variant="title-24-b"
              mobileVariant="subtitle-20-b"
              className="text-[var(--color-primary)]"
            >
              {step.count}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────────────────────────
   Inquiry Card
───────────────────────────── */
function InquiryCard() {
  const [page, setPage] = useState(1);

  return (
    <Card>
      <Text as="h3" variant="subtitle-18-b" mobileVariant="subtitle-16-sb" className="mb-4 text-[var(--color-text)]">
        문의관리
      </Text>

      <div>
        {INQUIRIES.map((inq, i) => (
          <div
            key={inq.id}
            className={[
              "flex items-center gap-3 py-3",
              i < INQUIRIES.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
            ].join(" ")}
          >
            <Text variant="body-14-r" mobileVariant="body-13-r" className="flex-1 truncate text-[var(--color-text)]">
              {inq.text}
            </Text>
            <Text variant="body-13-r" className="shrink-0 text-[var(--color-text-secondary)]">
              {inq.date}
            </Text>
            <Text
              variant="body-13-r"
              className={[
                "w-[44px] shrink-0 text-right",
                inq.status === "처리중"
                  ? "text-[var(--color-accent-orange)]"
                  : "text-[var(--color-text-secondary)]",
              ].join(" ")}
            >
              {inq.status}
            </Text>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav className="mt-4 flex items-center justify-center gap-0.5" aria-label="문의 페이지 탐색">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="이전 페이지"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-surface-light)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {Array.from({ length: INQUIRY_TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            aria-current={page === p ? "page" : undefined}
            className={[
              "h-7 w-7 rounded-full text-[13px] font-medium transition-colors",
              page === p
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]",
            ].join(" ")}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(INQUIRY_TOTAL_PAGES, p + 1))}
          disabled={page === INQUIRY_TOTAL_PAGES}
          aria-label="다음 페이지"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-surface-light)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </Card>
  );
}

/* ─────────────────────────────
   Main export
───────────────────────────── */
export default function MypageSection() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ProfileSection />

      <div className="mx-auto max-w-content px-4 py-8 md:px-8 md:py-10">
        <Text as="h2" variant="title-24-b" className="mb-5 text-[var(--color-text)]">
          마이페이지
        </Text>

        {/*
          DOM order: SubscriptionCard → PaymentCard → DeliveryCard → InquiryCard
          · Mobile  (grid-cols-1): 구독 → 결제 → 배송 → 문의  ✓
          · Desktop (grid-cols-2): col1=[구독,배송], col2=[결제,문의]  ✓
        */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SubscriptionCard />
          <PaymentCard />
          <DeliveryCard />
          <InquiryCard />
        </div>
      </div>
    </div>
  );
}
