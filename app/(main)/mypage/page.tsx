import { Suspense } from "react";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
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
  ProfileSectionErrorFallback,
  SubscriptionCardErrorFallback,
  CardErrorFallback,
} from "@/widgets/mypage";

export default function MyPage() {
  return (
    <MypageSection
      profileSection={
        <ErrorBoundary fallback={<ProfileSectionErrorFallback />}>
          <Suspense fallback={<ProfileSectionSkeleton />}>
            <ProfileSectionLoader />
          </Suspense>
        </ErrorBoundary>
      }
      subscriptionCard={
        <ErrorBoundary fallback={<SubscriptionCardErrorFallback />}>
          <Suspense fallback={<SubscriptionCardSkeleton />}>
            <SubscriptionCardLoader />
          </Suspense>
        </ErrorBoundary>
      }
      paymentCard={
        <ErrorBoundary fallback={<CardErrorFallback title="결제관리" />}>
          <Suspense fallback={<PaymentCardSkeleton />}>
            <PaymentCardLoader />
          </Suspense>
        </ErrorBoundary>
      }
      deliveryCard={
        <ErrorBoundary fallback={<CardErrorFallback title="배송관리" />}>
          <Suspense fallback={<DeliveryCardSkeleton />}>
            <DeliveryCardLoader />
          </Suspense>
        </ErrorBoundary>
      }
      inquiryCard={
        <ErrorBoundary fallback={<CardErrorFallback title="문의관리" />}>
          <Suspense fallback={<InquiryCardSkeleton />}>
            <InquiryCardLoader />
          </Suspense>
        </ErrorBoundary>
      }
    />
  );
}
