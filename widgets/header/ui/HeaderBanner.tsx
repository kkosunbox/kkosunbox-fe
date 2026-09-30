import Link from "next/link";

export function HeaderBanner({ isBannerCollapsed }: { isBannerCollapsed: boolean }) {
  return (
    <Link
      href="/subscribe?tier=Standard"
      aria-label="꼬순박스 정기구독 15프로 할인 안내"
      className={`fixed inset-x-0 top-0 z-[51] flex h-[30px] max-md:h-[34px] items-center justify-center bg-[var(--color-banner-bg)] transition-[opacity,transform] duration-[225ms] hover:opacity-90 active:opacity-80 ${isBannerCollapsed ? "-translate-y-full" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-[17px] items-center justify-center rounded-[12px] bg-[var(--color-banner-badge-bg)] px-2">
          <span className="text-caption-11-sb tracking-[-0.02em] text-white">정기구독</span>
        </span>
        <span className="text-[13px] font-semibold leading-4 text-white">
          꼬순박스를 15프로 더 저렴하게 만나는 방법 🎉
        </span>
      </div>
    </Link>
  );
}
