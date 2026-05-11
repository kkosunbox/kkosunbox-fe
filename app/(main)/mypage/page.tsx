import { Suspense } from "react";
import {
  MypageSection,
  ProfileSectionLoader,
  SubscriptionCardLoader,
  PaymentCardLoader,
  InquiryCardLoader,
  DeliveryCard,
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
      deliveryCard={<DeliveryCard />}
      inquiryCard={
        <Suspense fallback={<CardSkeleton />}>
          <InquiryCardLoader />
        </Suspense>
      }
    />
  );
}
