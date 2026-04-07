import { ReactNode } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[20px] max-md:bg-white max-md:px-7 max-md:py-6 md:bg-[var(--color-surface-light)] md:min-h-[173px] md:px-8 md:py-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Text
        as="h3"
        variant="subtitle-16-sb"
        mobileVariant="subtitle-16-b"
        className="text-[var(--color-text)]"
      >
        {title}
      </Text>
      {href && linkLabel ? (
        <Link
          href={href}
          className="max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
