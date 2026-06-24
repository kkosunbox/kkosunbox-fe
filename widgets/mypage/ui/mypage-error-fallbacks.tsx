import { Text } from "@/shared/ui";
import { DASHBOARD_CARD_SURFACE_CLASS, SectionHeader } from "../lib/dashboard-shared";

function ErrorMessage() {
  return (
    <Text variant="body-13-r" className="text-center text-[var(--color-text-muted)]">
      정보를 불러오지 못했습니다.
      <br />
      잠시 후 다시 시도해 주세요.
    </Text>
  );
}

export function ProfileSectionErrorFallback() {
  return (
    <section className="max-lg:pb-6 max-lg:pt-6 lg:h-[258px] lg:pb-3 lg:pt-3">
      <div className="mx-auto flex h-full w-full max-w-content items-center justify-center max-lg:px-6 lg:px-0">
        <ErrorMessage />
      </div>
    </section>
  );
}

export function SubscriptionCardErrorFallback() {
  return (
    <div className="relative max-lg:mb-5 lg:h-[186px]">
      <div className="flex h-full max-lg:min-h-[199px] items-center justify-center rounded-[20px] bg-[var(--color-surface-light)] px-6 py-5 max-lg:rounded-[16px] lg:h-[186px]">
        <ErrorMessage />
      </div>
    </div>
  );
}

export function CardErrorFallback({ title }: { title: string }) {
  return (
    <div className={DASHBOARD_CARD_SURFACE_CLASS}>
      <SectionHeader title={title} />
      <div className="flex flex-1 items-center justify-center">
        <ErrorMessage />
      </div>
    </div>
  );
}
