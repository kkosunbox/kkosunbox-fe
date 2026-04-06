"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { Text } from "@/shared/ui";

const PET = {
  name: "몽몽이",
  birth: "2020.10.27",
  gender: "여자",
  weight: "8kg",
  bio: "부드러운 간식을 좋아해요.",
  attributes: [
    { label: "알러지 유무", value: "닭고기 알러지" },
    { label: "필요 건강 상태", value: "피모 관리" },
    { label: "선호하는 간식", value: "건조간식" },
    { label: "선호하는 제형", value: "천연 껌/뼈" },
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
  card: "국민카드 (1234 - **** - **** - ****)",
  nextDate: "2026.04.21 (카드결제)",
};

const DELIVERY_STEPS = [
  { label: "주문접수", count: 1 },
  { label: "배송준비중", count: 0 },
  { label: "배송중", count: 0 },
  { label: "배송완료", count: 0 },
];

const INQUIRIES = [
  { id: 1, text: "제품 문의드립니다.", date: "26.03.14", status: "처리중" },
  { id: 2, text: "배송 언제쯤 도착하나요?", date: "26.03.12", status: "처리완료" },
  { id: 3, text: "아이가 먹어도 안전한가요?", date: "26.03.12", status: "처리완료" },
];

const INQUIRY_TOTAL_PAGES = 5;

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.5 2.5L11.5 4.5M2 12l1.5-.5 8.5-8.5L9.5 1.5 1.5 10l.5 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 9L9 3M4 3h5v5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 5.5h12a2 2 0 0 1 2 2v17H9a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11h8M12 15h8M12 19h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PackingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M7 11.5h18v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-12Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15.5h18M12 8.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 15.5v4h6v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4.5 10.5h14a2 2 0 0 1 2 2v9h-16v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20.5 14h4l3 4v3.5h-7V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="23.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="23.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DeliveredIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6.5 9.5h19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-19a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 16.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const DELIVERY_ICONS = [OrderIcon, PackingIcon, TruckIcon, DeliveredIcon];

function ActionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent)] transition-opacity hover:opacity-80 md:text-[13px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{children}</span>
      <ArrowLinkIcon />
    </Link>
  );
}

function DashboardCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[22px] bg-[var(--color-surface-light)] px-5 py-5 md:min-h-[176px] md:px-6 md:py-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Text as="h3" variant="subtitle-18-b" mobileVariant="subtitle-16-sb" className="text-[var(--color-text)]">
        {title}
      </Text>
      {href && linkLabel ? <ActionLink href={href}>{linkLabel}</ActionLink> : null}
    </div>
  );
}

function PetAvatar() {
  return (
    <div className="relative shrink-0">
      <div className="relative h-[74px] w-[74px] overflow-hidden rounded-full md:h-[86px] md:w-[86px]">
        <div className="absolute inset-0 rounded-full bg-[var(--color-secondary)]" />
        <div className="absolute inset-[6px] rounded-full bg-[var(--color-premium-light)] opacity-55" />
        <svg viewBox="0 0 86 86" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="43" cy="43" r="43" fill="#F5C84B" />
          <path d="M27 32C27 24 33 18 40 18C46 18 51 22 54 27C56 22 61 18 68 18C75 18 80 24 80 32C80 42 73 48 66 52L61 41L54 38L47 41L34 52C31 46 27 40 27 32Z" fill="#B77246" opacity="0.95" />
          <ellipse cx="43" cy="48" rx="22" ry="24" fill="#FFF8F0" />
          <ellipse cx="35" cy="44" rx="6" ry="8" fill="#B77246" />
          <circle cx="37" cy="43" r="2.3" fill="#2B2B2B" />
          <circle cx="54" cy="43" r="2.3" fill="#2B2B2B" />
          <ellipse cx="46" cy="52" rx="6" ry="5" fill="#2B2B2B" />
          <path d="M43 52v4" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M39 58c2.2 1.8 8.8 1.8 11 0" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        className="absolute bottom-[1px] right-[-2px] flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--color-divider-warm)] bg-white text-[var(--color-text-secondary)] shadow-sm"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

function ProfileInfoList({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "mt-4 border-t border-[var(--color-divider-warm)] pt-2" : "min-w-0 flex-1 pl-8"}>
      {PET.attributes.map((attr, index) => (
        <div
          key={attr.label}
          className={[
            "flex items-center justify-between gap-3 py-2.5",
            index < PET.attributes.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Text variant={mobile ? "body-13-r" : "body-14-r"} className="text-[var(--color-text-secondary)]">
            {attr.label}
          </Text>
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Text
              variant={mobile ? "body-13-r" : "body-14-m"}
              className="text-right font-semibold text-[var(--color-text)]"
            >
              {attr.value}
            </Text>
            <ArrowLinkIcon />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSection() {
  return (
    <section className="pt-6 md:pt-7">
      <div className="mx-auto max-w-content px-4 md:px-8">
        <div className="rounded-[28px] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(185,148,116,0.06)] md:px-7 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0">
            <div className="flex min-w-0 flex-1 items-start gap-4 md:pr-8">
              <PetAvatar />
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <Text as="h1" variant="title-24-b" mobileVariant="subtitle-18-b" className="text-[var(--color-text)]">
                    {PET.name}
                  </Text>
                  <ActionLink href="/mypage/profile" className="shrink-0 max-md:hidden">
                    프로필 관리
                  </ActionLink>
                </div>
                <Text
                  variant="body-14-r"
                  mobileVariant="body-13-r"
                  className="mt-1 text-[var(--color-text-secondary)]"
                >
                  {PET.birth} &nbsp; | &nbsp; {PET.gender} &nbsp; | &nbsp; {PET.weight}
                </Text>
                <Text
                  variant="body-14-r"
                  mobileVariant="body-13-r"
                  className="mt-1 text-[var(--color-text-secondary)]"
                >
                  {PET.bio}
                </Text>
                <ActionLink href="/mypage/profile" className="mt-3 md:hidden">
                  정보변경
                </ActionLink>
              </div>
            </div>

            <div className="max-md:hidden mx-4 w-px self-stretch bg-[var(--color-divider-warm)]" />
            <div className="md:hidden h-px bg-[var(--color-divider-warm)]" />

            <div className="max-md:hidden flex min-w-0 flex-1 items-center">
              <ProfileInfoList />
            </div>
          </div>
          <div className="md:hidden">
            <ProfileInfoList mobile />
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscriptionCard() {
  return (
    <DashboardCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="inline-flex h-[22px] items-center rounded-full px-[10px] text-[11px] font-bold text-white md:text-[12px]"
          style={{ background: "var(--color-premium)" }}
        >
          {SUBSCRIPTION.tier}
        </span>
        <ActionLink href="/mypage/subscription">구독변경</ActionLink>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-[90px] w-[68px] shrink-0 overflow-hidden rounded-[12px] bg-white">
          <Image src={mockTempPackage} alt="꼬순박스 프리미엄 패키지" fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
            {SUBSCRIPTION.name}
          </Text>
          <Text variant="body-14-r" className="mt-2 text-[var(--color-text-secondary)]">
            {SUBSCRIPTION.startDate} ~
          </Text>
          <Text variant="body-14-r" className="mt-1 text-[var(--color-text-secondary)]">
            결제일 : {SUBSCRIPTION.billingDay}
          </Text>
        </div>
      </div>
    </DashboardCard>
  );
}

function PaymentRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <Text
        variant="body-13-r"
        className="w-[64px] shrink-0 pt-[2px] text-[var(--color-text-secondary)] md:w-[72px]"
      >
        {label}
      </Text>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function PaymentCard() {
  return (
    <DashboardCard>
      <SectionHeader title="결제관리" href="/mypage/payment" linkLabel="결제관리" />

      <div className="flex flex-col gap-3.5">
        <PaymentRow label="결제수단">
          <Text variant="body-14-m" className="text-[var(--color-text)]">
            {PAYMENT.method}
          </Text>
        </PaymentRow>

        <PaymentRow label="간편결제">
          <div className="flex flex-wrap items-center gap-2">
            <Text variant="body-14-r" className="text-[var(--color-text)]">
              {PAYMENT.card}
            </Text>
            <button
              type="button"
              className="inline-flex h-[22px] items-center rounded-[4px] bg-[var(--color-accent)] px-2 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 md:text-[11px]"
            >
              결제등록/변경
            </button>
          </div>
        </PaymentRow>

        <PaymentRow label="다음 결제일">
          <Text variant="body-14-r" className="text-[var(--color-text)]">
            {PAYMENT.nextDate}
          </Text>
        </PaymentRow>
      </div>
    </DashboardCard>
  );
}

function DeliveryCard() {
  return (
    <DashboardCard>
      <SectionHeader title="배송관리" href="/mypage/profile" linkLabel="배송지 관리" />
      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {DELIVERY_STEPS.map((step, index) => {
          const Icon = DELIVERY_ICONS[index];
          return (
            <div key={step.label} className="flex flex-col items-center gap-2 text-center">
              <div className="text-[var(--color-text-secondary)]">
                <Icon />
              </div>
              <Text variant="body-13-r" className="leading-[1.3] text-[var(--color-text)]">
                {step.label}
              </Text>
              <Text as="span" variant="subtitle-20-b" className="text-[var(--color-primary)]">
                {step.count}
              </Text>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function InquiryCard() {
  const [page, setPage] = useState(1);

  return (
    <DashboardCard>
      <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" />

      <div>
        {INQUIRIES.map((inq, index) => (
          <div
            key={inq.id}
            className={[
              "grid grid-cols-[minmax(0,1fr)_56px_52px] items-center gap-x-3 py-1.5 md:grid-cols-[minmax(0,1fr)_62px_58px]",
              index < INQUIRIES.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Text variant="body-13-r" className="truncate text-[var(--color-text)]">
              {inq.text}
            </Text>
            <Text variant="caption-12-r" className="text-right text-[var(--color-text-secondary)]">
              {inq.date}
            </Text>
            <Text
              variant="caption-12-r"
              className={[
                "text-right",
                inq.status === "처리중"
                  ? "text-[var(--color-accent-orange)]"
                  : "text-[var(--color-text-secondary)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {inq.status}
            </Text>
          </div>
        ))}
      </div>

      <nav className="mt-4 flex items-center justify-center gap-1 text-[var(--color-text-secondary)]" aria-label="문의 페이지 탐색">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          aria-label="이전 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: INQUIRY_TOTAL_PAGES }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={[
              "min-w-[16px] text-[11px] leading-none transition-colors md:text-[12px]",
              page === pageNumber ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(INQUIRY_TOTAL_PAGES, prev + 1))}
          disabled={page === INQUIRY_TOTAL_PAGES}
          aria-label="다음 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronRightIcon />
        </button>
      </nav>
    </DashboardCard>
  );
}

export default function MypageSection() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12 md:pb-16">
      <ProfileSection />

      <section className="pt-4 md:pt-5">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <div className="rounded-[30px] bg-white px-4 py-5 shadow-[0_8px_30px_rgba(185,148,116,0.06)] md:px-5 md:py-5">
            <Text as="h2" variant="title-24-b" mobileVariant="subtitle-18-b" className="mb-4 text-[var(--color-text)] md:mb-5">
              마이페이지
            </Text>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SubscriptionCard />
              <PaymentCard />
              <DeliveryCard />
              <InquiryCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
