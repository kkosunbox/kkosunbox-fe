import Image from "next/image";
import Link from "next/link";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { Text } from "@/shared/ui";
import { SUBSCRIPTION } from "./mypage-mock";

export function SubscriptionCard() {
  return (
    <div className="relative rounded-[20px] max-md:bg-white max-md:px-5 max-md:py-5 md:bg-[var(--color-background)] md:min-h-[173px] md:px-6 md:py-5">
      <Link
        href="/mypage/subscription"
        className="absolute right-5 top-5 max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
      >
        구독관리
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative max-md:h-[67px] max-md:w-[91px] md:h-[98px] md:w-[134px] shrink-0 overflow-hidden rounded-[12px] bg-white">
          <Image
            src={mockTempPackage}
            alt="꼬순박스 프리미엄 패키지"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex h-[24px] w-fit items-center rounded-full px-[12px] max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white"
            style={{ background: "var(--color-accent-orange)" }}
          >
            {SUBSCRIPTION.tier}
          </span>
          <Text
            variant="subtitle-16-sb"
            mobileVariant="body-14-sb"
            className="tracking-[-0.04em] text-[var(--color-text)]"
          >
            {SUBSCRIPTION.name}
          </Text>
          <Text
            variant="body-16-m"
            mobileVariant="body-14-m"
            className="text-[var(--color-text-secondary)]"
          >
            {SUBSCRIPTION.startDate} ~
          </Text>
          <Text
            variant="body-16-m"
            mobileVariant="body-14-m"
            className="text-[var(--color-text-secondary)]"
          >
            결제일 : {SUBSCRIPTION.billingDay}
          </Text>
        </div>
      </div>
    </div>
  );
}
