import { ReactNode } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

/** 마이페이지 대시보드 카드 — 데스크탑: 크림 배경 위 흰 카드(Figma 173px 고정) / 모바일·태블릿: 회색 카드 min 199px */
export const DASHBOARD_CARD_SURFACE_CLASS =
  "flex flex-col overflow-hidden max-lg:min-h-[199px] max-lg:rounded-[16px] max-lg:bg-[var(--color-surface-light)] max-lg:px-7 max-lg:py-6 lg:h-[173px] lg:rounded-[20px] lg:bg-white lg:pt-6 lg:pr-[21px] lg:pb-5 lg:pl-8";

/** Figma chip2 — 결제등록/변경 (88×24, padding 4px 8px, bg #2F2F2F) */
export const PAYMENT_REGISTER_CHIP_BUTTON_CLASS =
  "inline-flex h-6 w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-text)] px-2 py-1 text-body-13-m leading-4 text-white transition-opacity hover:opacity-90";

/** Figma chip2 (Accent 변형) — 구독관리 상단 결제등록/변경 (88×24, padding 4px 8px, bg #7FB3FF) */
export const PAYMENT_REGISTER_CHIP_BUTTON_ACCENT_CLASS =
  "inline-flex h-6 w-[88px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent)] px-2 py-1 text-body-13-m leading-4 text-white transition-opacity hover:opacity-90";

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[DASHBOARD_CARD_SURFACE_CLASS, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel,
  onLinkClick,
  spacing = "default",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  spacing?: "default" | "tight" | "wide";
}) {
  const linkCls =
    "max-lg:text-body-13-sb max-lg:text-[var(--color-accent)] lg:text-body-14-sb-tight lg:leading-[1.3] lg:tracking-normal lg:text-[var(--color-text-secondary)] underline transition-opacity hover:opacity-80";

  const spacingCls =
    spacing === "wide"
      ? "max-lg:mb-6 lg:mb-6"
      : spacing === "tight"
        ? "mb-4 lg:mb-3"
        : "max-lg:mb-6 lg:mb-4";

  return (
    <div
      className={["flex items-center justify-between gap-3", spacingCls].join(" ")}
    >
      <Text
        as="h3"
        variant="subtitle-16-b"
        className="text-[var(--color-text)] lg:leading-[19px]"
      >
        {title}
      </Text>
      {onLinkClick && linkLabel ? (
        <button type="button" onClick={onLinkClick} className={linkCls}>
          {linkLabel}
        </button>
      ) : href && linkLabel ? (
        <Link href={href} className={linkCls}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
