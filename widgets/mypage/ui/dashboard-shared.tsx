import { ReactNode } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

/** 태블릿·데스크톱 마이페이지 대시보드 카드 — Figma 173px 고정 */
export const DASHBOARD_CARD_SURFACE_CLASS =
  "flex flex-col overflow-hidden rounded-[20px] max-lg:bg-white max-lg:px-7 max-lg:py-6 lg:h-[173px] lg:bg-[var(--color-surface-light)] lg:px-8 lg:py-5";

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
  spacing?: "default" | "tight";
}) {
  const linkCls =
    "max-lg:text-body-13-sb lg:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80";

  return (
    <div
      className={[
        "flex items-center justify-between gap-3",
        spacing === "tight"
          ? "mb-4 lg:mb-3"
          : "max-lg:mb-6 lg:mb-4",
      ].join(" ")}
    >
      <Text
        as="h3"
        variant="subtitle-16-sb"
        mobileVariant="subtitle-16-b"
        className="text-[var(--color-text)]"
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
