"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CheckoutPromotionBanner, useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ProfileEditBadge, ProfileThumbnail } from "./ProfileThumbnail";
import {
  SwitchHorizontalIcon,
} from "./icons";
import {
  MenuBookmarkIcon,
  MenuChatIcon,
  MenuClipboardCheckIcon,
  MenuCreditCardIcon,
  MenuDatabaseIcon,
  MenuDocumentTextIcon,
  MenuHomeIcon,
  MenuLogoutIcon,
  MenuShoppingBagIcon,
  MenuShoppingCartIcon,
  MenuUserCircleIcon,
} from "./MenuIcons";

const NAV_ITEMS = [
  { href: "/", label: "홈", Icon: MenuHomeIcon },
  { href: "/about", label: "꼬순박스 소개", Icon: MenuBookmarkIcon },
  { href: "/subscribe", label: "구독몰", Icon: MenuShoppingBagIcon },
  { href: "/products", label: "단품몰", Icon: MenuShoppingCartIcon },
  { href: "/support", label: "고객센터", Icon: MenuChatIcon },
];

// 네비 행 — 아이콘은 currentColor라 활성 시 주황, 비활성 시 회색. 라벨은 항상 본문색.
const navItemClass = (active: boolean) =>
  [
    "flex h-[58px] w-full items-center gap-4 rounded-xl px-3 tracking-[-0.02em]",
    active
      ? "bg-[var(--color-drawer-item-active)] text-[var(--color-cta-button)]"
      : "text-[var(--color-border)]",
  ].join(" ");
const navLabelClass = (active: boolean) =>
  `text-[14px] leading-[17px] text-[var(--color-text)] ${active ? "font-bold" : "font-medium"}`;

export function MobileDrawer({
  open,
  onClose,
  isLoggedIn,
  isAuthLoading,
  userId,
  email,
  profileImageUrl,
  hasProfile,
  petName,
  isInfluencer,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  userId?: number | null;
  email?: string | null;
  profileImageUrl: string | null;
  hasProfile: boolean;
  petName?: string | null;
  isInfluencer: boolean;
  onLogout: () => Promise<void>;
}) {
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  // 단축 아이콘 active 경로 (계정정보는 모달이라 경로 active가 없음)
  const isMyPageActive = pathname === "/mypage";
  const isSubscriptionActive = pathname.startsWith("/mypage/subscription");
  const isPointActive = pathname.startsWith("/mypage/point");
  const isOrdersActive = pathname.startsWith("/orders");
  const shortcutLabelClass = (active: boolean) =>
    `tracking-[-0.02em] ${
      active
        ? "text-[14px] leading-[17px] font-bold text-[var(--color-primary)]"
        : "text-[14px] leading-[17px] font-medium text-[var(--color-text-menu-label)]"
    }`;

  return (
    <>
      {/* 딤 오버레이 */}
      <div
        className={`fixed inset-0 z-[59] bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 사이드바 드로워 */}
      <div
        className={`fixed left-0 top-0 z-[60] flex h-full w-full max-w-[375px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* 상단 섹션 — 375×897 모바일 메뉴 명세 기준 */}
        <div className="relative h-[308px] shrink-0 overflow-hidden bg-[var(--color-drawer-header-bg)]">
          {/* 장식 도형 (Figma Vector 5936:35448 / 5936:35450) */}
          <svg
            aria-hidden="true"
            width="360"
            height="326"
            viewBox="0 0 360 326"
            fill="none"
            className="pointer-events-none absolute left-[-244px] top-[-43px] text-[var(--color-profile-menu-surface)]"
          >
            <path d="M137.867 320.807C156.382 315.159 175.137 307.247 192.546 304.1C226.791 297.903 260.28 296.186 291.722 283.747C353.929 259.125 379.371 186.475 342.217 130.739L290.814 53.5845C255.065 -0.10418 181.04 -12.0915 122.109 11.5569C89.1067 24.8268 68.4045 57.9168 62.2414 92.6384C57.0182 122.064 45.0356 146.77 24.1742 167.785C0.62222 191.49 -5.70972 223.71 5.13165 254.608C24.2687 309.128 79.5144 338.645 137.823 320.792L137.867 320.807Z" fill="currentColor" />
          </svg>
          <svg
            aria-hidden="true"
            width="301"
            height="306"
            viewBox="0 0 301 306"
            fill="none"
            className="pointer-events-none absolute left-[277px] top-[56px] text-[var(--color-profile-menu-surface)]"
          >
            <path d="M156.792 288.468C142.588 278.933 128.764 267.422 114.853 260.287C87.4895 246.245 59.615 236.185 36.2269 217.585C-10.0431 180.777 -12.8811 112.808 32.8597 75.2314L96.1554 23.2064C140.183 -13.0007 205.856 -4.1091 249.605 31.0341C274.099 50.7374 283.098 84.0376 279.385 114.98C276.238 141.204 280.019 165.173 292.257 188.305C306.078 214.402 303.15 243.273 286.041 266.612C255.846 307.792 201.546 318.549 156.833 288.467L156.792 288.468Z" fill="currentColor" />
          </svg>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="absolute right-6 top-14 flex h-6 w-6 items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* 프로필 이미지 */}
          <div className="absolute left-1/2 top-[69px] -translate-x-1/2">
            {isLoggedIn ? (
              <>
                {/* 이미지만 있고 alt=""(장식용)라 링크에 접근 가능한 이름이 없었다
                    (Lighthouse link-name, 2026-09-11 실측). 닫기 버튼과 동일한 패턴으로 aria-label 부여. */}
                <Link href="/mypage" onClick={onClose} aria-label="마이페이지">
                  <ProfileThumbnail imageUrl={profileImageUrl} userId={userId} size="xl" />
                </Link>
                <ProfileEditBadge
                  onClick={() => { onClose(); openChecklistForm(hasProfile ? { editProfile: true } : { isNewProfile: true }); }}
                  className="bottom-0 right-0"
                />
              </>
            ) : (
              <ProfileThumbnail imageUrl={null} userId={null} size="xl" />
            )}
          </div>
          {/* 이름 / 로그인 텍스트 */}
          <div className="absolute left-1/2 top-[145px] flex -translate-x-1/2 items-center gap-1 whitespace-nowrap">
            {isAuthLoading ? (
              <div className="h-6 w-24 animate-pulse rounded bg-[var(--color-secondary)]" />
            ) : isLoggedIn ? (
              hasProfile ? (
                <>
                  <span className="text-[20px] leading-[26px] font-semibold text-[var(--color-text)]">
                    {getProfileDisplayName(petName)}
                  </span>
                  <button
                    onClick={() => { onClose(); openModal("profile-switch"); }}
                    aria-label="프로필 변경"
                    className="shrink-0 [&>svg]:h-4 [&>svg]:w-4"
                  >
                    <SwitchHorizontalIcon />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onClose(); openChecklistForm({ isNewProfile: true }); }}
                  className="text-[20px] leading-[26px] font-semibold text-[var(--color-text-secondary)]"
                >
                  프로필 등록하기
                </button>
              )
            ) : (
              <Link href="/login" onClick={onClose} className="text-[20px] leading-[26px] font-semibold text-[var(--color-text)]">
                로그인 하기
              </Link>
            )}
          </div>

          {/* 이메일 */}
          {isLoggedIn && email && (
            <p className="absolute left-1/2 top-[175px] -translate-x-1/2 whitespace-nowrap text-[14px] leading-[18px] font-medium text-[var(--color-text-secondary)]">{email}</p>
          )}

          {/* 단축 아이콘 카드 */}
          <div className="absolute inset-x-6 top-[207px] flex h-[86px] items-start justify-between rounded-xl bg-white px-[30px] pt-[17px]">
            <button
              onClick={() => { onClose(); router.push(isLoggedIn ? "/mypage" : "/login"); }}
              className="flex w-[60px] flex-col items-center gap-2 text-[var(--color-menu-shortcut-icon)]"
            >
              <MenuUserCircleIcon />
              <span className={shortcutLabelClass(isMyPageActive)}>마이페이지</span>
            </button>
            <button
              onClick={() => { onClose(); if (isLoggedIn) { openModal("account-info"); } else { router.push("/login"); } }}
              className="flex w-14 flex-col items-center gap-2 text-[var(--color-menu-shortcut-icon)]"
            >
              <MenuCreditCardIcon />
              <span className={shortcutLabelClass(false)}>계정정보</span>
            </button>
            <button
              onClick={() => { onClose(); router.push(isLoggedIn ? "/mypage/subscription" : "/login"); }}
              className="flex w-14 flex-col items-center gap-2 text-[var(--color-menu-shortcut-icon)]"
            >
              <MenuClipboardCheckIcon />
              <span className={shortcutLabelClass(isSubscriptionActive)}>구독관리</span>
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="shrink-0 border-t border-[var(--color-divider-neutral)]" />

        {/* 네비게이션 */}
        <nav className="mx-7 mb-[26px] flex shrink-0 flex-col gap-1 pt-[11px]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const { Icon } = item;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={navItemClass(isActive)}
              >
                <Icon />
                <span className={navLabelClass(isActive)}>{item.label}</span>
              </Link>
            );
          })}
          {isLoggedIn && (
            <Link
              href="/orders"
              onClick={onClose}
              aria-current={isOrdersActive ? "page" : undefined}
              className={navItemClass(isOrdersActive)}
            >
              <MenuDocumentTextIcon />
              <span className={navLabelClass(isOrdersActive)}>주문내역</span>
            </Link>
          )}
          {isLoggedIn && isInfluencer && (
            <Link
              href="/mypage/point"
              onClick={onClose}
              aria-current={isPointActive ? "page" : undefined}
              className={navItemClass(isPointActive)}
            >
              <MenuDatabaseIcon />
              <span className={navLabelClass(isPointActive)}>MY 포인트</span>
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={async () => { onClose(); await onLogout(); }}
              className={navItemClass(false)}
            >
              <MenuLogoutIcon />
              <span className={navLabelClass(false)}>로그아웃</span>
            </button>
          )}
        </nav>

        {/* 하단 배너 — 화면이 짧으면 드로워 전체가 스크롤된다 */}
        <div className="mt-auto shrink-0">
          <CheckoutPromotionBanner rounded={false} />
        </div>
      </div>
    </>
  );
}
