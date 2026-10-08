import { ReactNode } from "react";
import { Text } from "@/shared/ui";

interface MypageSectionProps {
  profileSection: ReactNode;
  greetingBanner: ReactNode;
  subscriptionCard: ReactNode;
  paymentCard: ReactNode;
  deliveryCard: ReactNode;
  inquiryCard: ReactNode;
}

/**
 * 모바일·태블릿: 상단 크림 배경 프로필 + 하단 흰색 배경 카드 목록 (세로 스택)
 * 데스크탑·와이드: 크림 배경 위 좌측 프로필 패널(278px) + 우측 인사 배너·카드 2×2 (헤더 1240px 컨테이너와 정렬)
 */
export default function MypageSection({
  profileSection,
  greetingBanner,
  subscriptionCard,
  paymentCard,
  deliveryCard,
  inquiryCard,
}: MypageSectionProps) {
  return (
    <div className="flex flex-1 flex-col pt-[var(--header-offset)] lg:bg-support-faq-surface">
      <div className="max-lg:contents lg:mx-auto lg:flex lg:w-[calc(100%_-_80px)] lg:max-w-[1240px] lg:items-stretch lg:gap-7 lg:pt-11 lg:pb-[93px]">
        {/* 모바일·태블릿: 상단 크림 배경 / 데스크탑: 좌측 프로필 패널 (우측 컬럼 높이에 맞춰 stretch) */}
        <div className="shrink-0 bg-support-faq-surface lg:w-[278px] lg:bg-transparent">
          {profileSection}
        </div>

        {/* 모바일·태블릿: 하단 흰색 배경 (콘텐츠가 짧아도 main 영역 하단까지 채움) / 데스크탑: 우측 컬럼 */}
        <div className="flex flex-1 flex-col bg-white max-lg:pb-12 lg:min-w-0 lg:bg-transparent">
          <section className="max-lg:pt-6">
            <div className="mx-auto w-full max-lg:max-w-content max-lg:px-6">
              <Text
                as="h2"
                variant="subtitle-16-b"
                className="leading-[20px] text-[var(--color-text)] max-lg:mb-6 lg:sr-only"
              >
                마이페이지
              </Text>

              <div className="max-lg:hidden lg:mb-7">{greetingBanner}</div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
                {subscriptionCard}
                {paymentCard}
                {deliveryCard}
                {inquiryCard}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
