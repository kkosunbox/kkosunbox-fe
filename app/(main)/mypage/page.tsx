import { Suspense } from "react";
import {
  MypageSection,
  ProfileSectionLoader,
  SubscriptionCardLoader,
  PaymentCardLoader,
  InquiryCardLoader,
  DeliveryCardLoader,
  ProfileSectionSkeleton,
  CardSkeleton,
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
        <Suspense fallback={<CardSkeleton />}>
          <SubscriptionCardLoader />
        </Suspense>
      }
      paymentCard={
        <Suspense fallback={<CardSkeleton />}>
          <PaymentCardLoader />
        </Suspense>
      }
      deliveryCard={
        <Suspense fallback={<CardSkeleton />}>
          <DeliveryCardLoader />
        </Suspense>
      }
      inquiryCard={
        <Suspense fallback={<CardSkeleton />}>
          <InquiryCardLoader />
        </Suspense>
      }
    />
  );
}
