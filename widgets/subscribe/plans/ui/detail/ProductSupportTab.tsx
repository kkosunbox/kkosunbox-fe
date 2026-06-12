import Link from "next/link";
import { SupportSection } from "@/widgets/support/faq";

export default function ProductSupportTab({ variant }: { variant: "mobile" | "desktop" }) {
  if (variant === "mobile") {
    return (
      <>
        <div className="px-6 pt-6">
          <Link
            href="/support"
            className="inline-flex items-center gap-1 text-body-16-sb text-[var(--color-text-emphasis)]"
          >
            고객센터
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <SupportSection showBanner={false} />
      </>
    );
  }

  return (
    <>
      <div className="pt-10 pb-2 md:px-6 lg:px-0">
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-body-20-sb text-[var(--color-text-emphasis)]"
        >
          고객센터
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <SupportSection showBanner={false} />
    </>
  );
}
