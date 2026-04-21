import { Text } from "@/shared/ui";
import { ProfileSection } from "./ProfileSection";
import { SubscriptionCard } from "./SubscriptionCard";
import { PaymentCard } from "./PaymentCard";
import { DeliveryCard } from "./DeliveryCard";
import { InquiryCard } from "./InquiryCard";
import type { ChecklistQuestion, Profile } from "@/features/profile/api/types";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import type { BillingInfo } from "@/features/billing/api/types";
import type { InquiryDto } from "@/features/inquiry/api/types";

interface MypageSectionProps {
  profile: Profile | null;
  checklistQuestions: ChecklistQuestion[];
  subscription: UserSubscriptionDto | null;
  billingInfo: BillingInfo | null;
  inquiries: InquiryDto[];
}

export default function MypageSection({
  profile,
  checklistQuestions,
  subscription,
  billingInfo,
  inquiries,
}: MypageSectionProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12 md:pb-16">
      <ProfileSection profile={profile} checklistQuestions={checklistQuestions} />

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
              <SubscriptionCard subscription={subscription} />
              <PaymentCard billingInfo={billingInfo} subscription={subscription} />
              <DeliveryCard />
              <InquiryCard inquiries={inquiries} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
