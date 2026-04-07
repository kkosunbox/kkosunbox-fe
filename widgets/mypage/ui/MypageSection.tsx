import { Text } from "@/shared/ui";
import { ProfileSection } from "./ProfileSection";
import { SubscriptionCard } from "./SubscriptionCard";
import { PaymentCard } from "./PaymentCard";
import { DeliveryCard } from "./DeliveryCard";
import { InquiryCard } from "./InquiryCard";

export default function MypageSection() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12 md:pb-16">
      <ProfileSection />

      <section className="pt-4 md:pt-5">
        <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
          {/* 데스크톱: 흰색 카드 래퍼 / 모바일: 투명(크림 배경) */}
          <div className="md:rounded-[30px] md:bg-white md:px-5 md:py-5 md:shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
            <Text
              as="h2"
              variant="title-24-b"
              mobileVariant="subtitle-16-b"
              className="mb-4 text-[var(--color-text)] md:mb-5"
            >
              마이페이지
            </Text>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3">
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
