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
    <div className="min-h-screen bg-[var(--color-background)] pb-12 lg:pb-16">
      {profileSection}

      <section className="pt-4 lg:pt-5">
        <div className="mx-auto w-full max-w-content max-lg:px-6 lg:px-0">
          <div className="lg:rounded-[30px] lg:bg-white lg:px-8 lg:py-7 lg:shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
            <Text
              as="h2"
              variant="title-20-sb"
              className="mb-4 leading-[100%] tracking-[-0.04em] text-[var(--color-text)] max-lg:text-subtitle-16-b max-lg:leading-[20px] max-lg:tracking-normal lg:mb-5"
            >
              마이페이지
            </Text>

            <div className="grid grid-cols-1 gap-4 max-lg:auto-rows-auto lg:grid-cols-2 lg:auto-rows-[173px] lg:gap-5">
              {subscriptionCard}
              {paymentCard}
              {deliveryCard}
              {inquiryCard}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
