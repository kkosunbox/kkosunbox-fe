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
    <div className="min-h-screen bg-[var(--color-background)] pb-12 md:pb-16">
      {profileSection}

      <section className="pt-4 md:pt-5">
        <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
          <div className="md:rounded-[30px] md:bg-white md:px-8 md:py-7 md:shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
            <Text
              as="h2"
              variant="title-20-sb"
              mobileVariant="subtitle-16-b"
              className="mb-4 leading-[100%] tracking-[-0.04em] text-[var(--color-text)] max-md:leading-[20px] max-md:tracking-normal md:mb-5"
            >
              마이페이지
            </Text>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
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
