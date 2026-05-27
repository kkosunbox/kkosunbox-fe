import { Suspense } from "react";
import {
  MypageSection,
  ProfileSectionLoader,
  SubscriptionCardLoader,
  PaymentCardLoader,
  InquiryCardLoader,
  DeliveryCardLoader,
  ProfileSectionSkeleton,
  SubscriptionCardSkeleton,
  PaymentCardSkeleton,
  DeliveryCardSkeleton,
  InquiryCardSkeleton,
} from "@/widgets/mypage";

export default function MyPage() {
  return (
    <MypageSection
      profileSection={
        <Suspense fallback={<ProfileSectionSkeleton />}>
          <ProfileSectionLoader />
        </Suspense>
      }
      subscriptionCard={
        <Suspense fallback={<SubscriptionCardSkeleton />}>
          <SubscriptionCardLoader />
        </Suspense>
      }
      paymentCard={
        <Suspense fallback={<PaymentCardSkeleton />}>
          <PaymentCardLoader />
        </Suspense>
      }
      deliveryCard={
        <Suspense fallback={<DeliveryCardSkeleton />}>
          <DeliveryCardLoader />
        </Suspense>
      }
      inquiryCard={
        <Suspense fallback={<InquiryCardSkeleton />}>
          <InquiryCardLoader />
        </Suspense>
      }
    />
  );
}
