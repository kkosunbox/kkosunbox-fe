import Image from "next/image";
import Link from "next/link";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { Text } from "@/shared/ui";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

function billingDayLabel(nextBillingDate: string): string {
  const day = parseInt(nextBillingDate.slice(8, 10), 10);
  return `매월 ${day}일`;
}

function SubscriptionEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
      <Text
        variant="body-14-m"
        className="leading-5 tracking-[-0.04em] text-[var(--color-text-emphasis)]"
      >
        아직 구독 전이시군요!
        <br />
        꼬순박스 구독으로 건강한 간식을 만나보세요.
      </Text>
      <Link
        href="/subscribe"
        className="inline-flex h-12 w-full max-w-[271px] items-center justify-center rounded-[30px] bg-[var(--color-accent)] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
      >
        구독하러 가기
      </Link>
    </div>
  );
}

export function SubscriptionCard({ subscription }: { subscription: UserSubscriptionDto | null }) {
  if (!subscription) {
    return (
      <div className="flex rounded-[20px] max-md:bg-white max-md:px-5 max-md:py-5 md:bg-[var(--color-surface-light)] md:min-h-[173px] md:px-6 md:py-5">
        <SubscriptionEmpty />
      </div>
    );
  }

  const planTheme = packageThemeForPlan(subscription.plan);

  return (
    <div className="relative rounded-[20px] max-md:bg-white max-md:px-5 max-md:py-5 md:flex md:items-center md:bg-[var(--color-background)] md:min-h-[173px] md:px-6 md:py-5">
      <Link
        href="/mypage/subscription"
        className="absolute right-5 top-5 max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
      >
        구독관리
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative max-md:h-[67px] max-md:w-[91px] md:h-[98px] md:w-[134px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-background)]">
          <Image
            src={TIER_THUMBNAILS[planTheme.tier]}
            alt="꼬순박스 패키지"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex h-[24px] w-fit items-center rounded-full px-[12px] max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white"
            style={{ background: planTheme.colorVar }}
          >
            {planTheme.tierLabel}
          </span>
          <div className="flex items-center gap-2">
            <Text
              variant="subtitle-16-sb"
              mobileVariant="body-14-sb"
              className="tracking-[-0.04em] text-[var(--color-text)]"
            >
              {subscription.plan.name} 구독중
            </Text>
            <span style={{ fontSize: "16px", fontWeight: 700, color: planTheme.colorVar }}>
              {subscription.quantity}BOX
            </span>
          </div>
          <Text
            variant="body-16-m"
            mobileVariant="body-14-m"
            className="text-[var(--color-text-secondary)]"
          >
            결제일 : {billingDayLabel(subscription.nextBillingDate)}
          </Text>
          <Text
            variant="body-16-m"
            mobileVariant="body-14-m"
            className="text-[var(--color-text-secondary)]"
          >
            다음 결제 : {subscription.nextBillingDate.replace(/-/g, ".")}
          </Text>
        </div>
      </div>
    </div>
  );
}
