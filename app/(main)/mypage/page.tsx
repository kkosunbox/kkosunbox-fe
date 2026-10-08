import { Suspense } from "react";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import {
  MypageSection,
  ProfileSectionLoader,
  GreetingBannerLoader,
  SubscriptionCardLoader,
  PaymentCardLoader,
  InquiryCardLoader,
  DeliveryCardLoader,
  ProfileSectionSkeleton,
  GreetingBannerSkeleton,
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
      greetingBanner={
        <Suspense fallback={<GreetingBannerSkeleton />}>
          <GreetingBannerLoader />
        </Suspense>
      }
      subscriptionCard={
        <ErrorBoundary fallback={<SubscriptionCardErrorFallback />}>
          <Suspense fallback={<SubscriptionCardSkeleton />}>
            <SubscriptionCardLoader />
          </Suspense>
        </ErrorBoundary>
      }
      paymentCard={
        <ErrorBoundary fallback={<CardErrorFallback title="주문관리" />}>
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
