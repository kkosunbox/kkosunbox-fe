"use client";

import Image from "next/image";
import Link from "next/link";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { useRouter, usePathname } from "next/navigation";
import { useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ProfileThumbnail } from "./ProfileThumbnail";
import {
  SwitchHorizontalIcon,
} from "./icons";
import {
  DropdownClipboardIcon,
  DropdownLogoutIcon,
  DropdownPinIcon,
  DropdownPointIcon,
  DropdownUserIcon,
} from "./DropdownMenuIcons";
import {
  MobileDrawerDocumentIcon,
  MobileDrawerHomeIcon,
  MobileDrawerPurchaseIcon,
  MobileDrawerSubscribeIcon,
  MobileDrawerSupportIcon,
} from "./MobileDrawerIcons";

const NAV_ITEMS = [
  { href: "/", label: "홈", Icon: MobileDrawerHomeIcon },
  { href: "/about", label: "꼬순박스 소개", Icon: MobileDrawerDocumentIcon },
  { href: "/subscribe", label: "구독몰", Icon: MobileDrawerSubscribeIcon },
  { href: "/purchase", label: "단품몰", Icon: MobileDrawerPurchaseIcon },
  { href: "/support", label: "고객센터", Icon: MobileDrawerSupportIcon },
];

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
        <div className="relative h-[308px] shrink-0 bg-white">
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
              <Link href="/mypage" onClick={onClose}>
                <ProfileThumbnail imageUrl={profileImageUrl} userId={userId} size="xl" />
              </Link>
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

          {/* 단축 아이콘 3종 */}
          <div className="absolute left-1/2 top-[221px] flex w-[268px] -translate-x-1/2 items-start justify-between">
            <button
              onClick={() => { onClose(); router.push(isLoggedIn ? "/mypage" : "/login"); }}
              className="flex w-[60px] flex-col items-center gap-[9px] [&>svg]:h-8 [&>svg]:w-8"
            >
              <DropdownUserIcon />
              <span className={shortcutLabelClass(isMyPageActive)}>마이페이지</span>
            </button>
            <button
              onClick={() => { onClose(); if (isLoggedIn) { openModal("account-info"); } else { router.push("/login"); } }}
              className="flex w-14 flex-col items-center gap-[9px] [&>svg]:h-8 [&>svg]:w-8"
            >
              <DropdownPinIcon />
              <span className={shortcutLabelClass(false)}>계정정보</span>
            </button>
            <button
              onClick={() => { onClose(); router.push(isLoggedIn ? "/mypage/subscription" : "/login"); }}
              className="flex w-14 flex-col items-center gap-[9px] [&>svg]:h-8 [&>svg]:w-8"
            >
              <DropdownClipboardIcon />
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
                className={[
                  "flex h-[58px] items-center gap-4 rounded-xl px-3 tracking-[-0.02em]",
                  isActive ? "bg-[var(--color-drawer-item-active)]" : "",
                ].join(" ")}
              >
                <Icon />
                <span className={isActive ? "text-[14px] leading-[17px] font-bold text-[var(--color-text)]" : "text-[14px] leading-[17px] font-medium text-[var(--color-text)]"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {isLoggedIn && isInfluencer && (
            <Link
              href="/mypage/point"
              onClick={onClose}
              aria-current={isPointActive ? "page" : undefined}
              className={[
                "flex h-[58px] items-center gap-4 rounded-xl px-3 tracking-[-0.02em]",
                isPointActive ? "bg-[var(--color-drawer-item-active)]" : "",
              ].join(" ")}
            >
              <span className="[&>svg]:h-6 [&>svg]:w-6"><DropdownPointIcon /></span>
              <span className={isPointActive ? "text-[14px] leading-[17px] font-bold text-[var(--color-text)]" : "text-[14px] leading-[17px] font-medium text-[var(--color-text)]"}>
                MY 포인트
              </span>
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={async () => { onClose(); await onLogout(); }}
              className="flex h-[58px] w-full items-center gap-4 px-3 tracking-[-0.02em]"
            >
              <span className="[&>svg]:h-6 [&>svg]:w-6"><DropdownLogoutIcon /></span>
              <span className="text-[14px] leading-[17px] font-medium text-[var(--color-text-secondary)]">로그아웃</span>
            </button>
          )}
        </nav>

        {/* 하단 배너 — 화면이 짧으면 드로워 전체가 스크롤된다 */}
        <div className="mt-auto shrink-0">
          <Image
            src="/images/sidebar-banner-001.png"
            alt="꼬순박스 배너 — 체크리스트 작성하러 가기"
            width={375}
            height={121}
            quality={HIGH_IMAGE_QUALITY}
            className="block"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </>
  );
}
