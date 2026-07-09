import { ReactNode } from "react";
import { Text } from "@/shared/ui";

interface MypageSectionProps {
  profileSection: ReactNode;
  subscriptionCard: ReactNode;
  paymentCard: ReactNode;
  deliveryCard: ReactNode;
  inquiryCard: ReactNode;
}

export default function MypageSection({
  profileSection,
  subscriptionCard,
  paymentCard,
  deliveryCard,
  inquiryCard,
}: MypageSectionProps) {
  return (
    <div className="flex flex-1 flex-col pt-[var(--header-offset)]">
      {/* 상단 — 크림 배경 */}
      <div className="shrink-0 bg-support-faq-surface">
        {profileSection}
      </div>

      {/* 하단 — 흰색 배경 (콘텐츠가 짧아도 main 영역 하단까지 채움) */}
      <div className="flex flex-1 flex-col bg-white pb-12 lg:pb-16">
        <section className="max-lg:pt-6 lg:pt-8">
          <div className="mx-auto w-full max-w-content max-lg:px-6 lg:px-0">
            <Text
              as="h2"
              variant="title-20-sb"
              className="leading-[100%] tracking-[-0.04em] text-[var(--color-text)] max-lg:text-subtitle-16-b max-lg:leading-[20px] max-lg:tracking-normal max-lg:mb-6 lg:mb-5"
            >
              마이페이지
            </Text>

            <div className="grid grid-cols-1 gap-6 max-lg:auto-rows-auto lg:grid-cols-2 lg:auto-rows-[173px] lg:gap-8">
              {subscriptionCard}
              {paymentCard}
              {deliveryCard}
              {inquiryCard}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
