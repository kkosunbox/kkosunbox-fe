export function HeaderBanner({ isBannerCollapsed }: { isBannerCollapsed: boolean }) {
  return (
    <div className={`fixed inset-x-0 top-0 z-[51] flex h-[30px] max-md:h-[34px] items-center justify-center bg-[var(--color-banner-bg)] transition-transform duration-[225ms] ${isBannerCollapsed ? "-translate-y-full" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center h-[17px] px-[9px] rounded-[12px] bg-[var(--color-banner-badge-bg)]">
          <span className="text-caption-11-sb tracking-[-0.02em] text-white">OPEN</span>
        </span>
        <span className="text-body-13-eb text-white">
          꼬순박스 그랜드 오픈! <span className="font-medium">정기구독 서비스 시작</span>
        </span>
      </div>
    </div>
  );
}
