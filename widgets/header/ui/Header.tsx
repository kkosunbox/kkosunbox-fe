"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logoMain from "@/shared/assets/logo-main.svg";
import { Button, DefaultPetIcon, useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasProfileRecord } from "@/features/profile/lib/profileStatus";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "꼬순박스 소개" },
  { href: "/subscribe", label: "구독 시작하기" },
  { href: "/support", label: "고객센터" },
];

function PawIcon() {
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.628 19.9066C12.5425 19.5202 10.5032 19.4694 8.46841 19.8864C6.33134 20.3243 4.1827 19.4635 3.26846 17.8575C2.29908 16.1545 3.26845 12.7081 6.93609 12.0329C8.22029 11.2363 7.62118 8.38709 11.869 8.38696C15.9012 8.886 15.6609 12.0076 16.8019 12.7081C19.7461 13.2481 20.8206 15.9327 19.9998 17.5768C19.1718 19.235 16.8095 20.3109 14.628 19.9066Z" fill="var(--color-primary)" />
      <path d="M16.3793 6.5262C15.5738 7.04803 14.5665 7.05402 13.9078 6.57407C12.1488 5.2945 12.6168 1.98527 14.7401 0.725848C15.5251 0.260065 16.4886 0.287557 17.1218 0.756716C18.813 2.01048 18.419 5.20438 16.3801 6.52604L16.3793 6.5262Z" fill="var(--color-primary)" />
      <path d="M3.40327 11.2764C2.92024 11.1244 2.52469 10.8785 2.20292 10.5746C1.26635 9.69046 0.794662 8.55528 0.885203 7.43174C0.919981 6.99863 1.08339 6.59974 1.38529 6.26808C1.81923 5.79115 2.57434 5.67259 3.27177 5.94043C5.21172 6.68596 6.3018 9.39874 5.23307 10.7937C4.8568 11.2851 4.14959 11.5117 3.40377 11.277L3.40327 11.2764Z" fill="var(--color-primary)" />
      <path d="M7.50051 6.44657C5.25798 5.36219 4.53088 2.01632 6.23512 0.655354C6.83239 0.178055 7.73601 0.106901 8.52281 0.480942C10.715 1.52225 11.5168 4.74987 9.90256 6.21327C9.31652 6.74473 8.35692 6.86072 7.50051 6.44657Z" fill="var(--color-primary)" />
      <path d="M21.4313 11.5992C20.6481 11.7212 19.2252 11.0096 18.9357 10.4458C18.7261 10.0372 18.6842 9.59484 18.7727 9.144C18.9863 8.0565 19.701 7.0862 20.7703 6.39622C21.2002 6.11906 21.8173 6.22309 22.2177 5.85616C22.2034 5.83908 23.4807 5.63 23.7475 6.22126C24.4882 7.86306 23.5647 11.2672 21.4313 11.5992Z" fill="var(--color-primary)" />
      <path d="M19 18.9974C17.669 17.8332 17.5674 15.2281 16.7165 14.7308C16.2205 14.4411 15.5849 14.8844 15.2835 15.3419C14.7528 16.1482 13.7157 16.6739 12.8424 16.3963C12.1329 16.1706 11.5254 15.6683 11.2652 15.1081C10.8562 14.2296 10.9713 13.406 11.254 12.6149C11.6733 11.4405 10.0624 9.68758 9 9.26663C9.82088 8.20205 11.9925 8.32101 13.2074 8.51725C14.2417 8.68401 15.2564 9.46185 15.7618 10.6108C16.0642 11.2982 16.3665 12.1106 17.0666 12.4319C17.9671 12.8457 19.4937 13.6775 19.9083 14.6851C20.5289 16.1941 20.3806 18.3863 19 18.9974Z" fill="var(--color-text)" />
      <path d="M2.45134 7.88587C4.43501 8.72835 5.53691 10.5795 4.83169 11.1427C4.5029 11.4048 3.75789 11.4832 3.37647 11.3009C1.99401 10.6397 1.04306 9.37593 0.907959 8.02069C1.26568 7.649 1.96871 7.68002 2.45242 7.88551L2.45134 7.88587Z" fill="var(--color-text)" />
      <path d="M9.38159 12.6464C9.71545 13.6063 9.33606 14.5946 8.66329 14.7894C8.25862 14.9062 7.75151 14.8051 7.43789 14.5883C6.50081 13.941 6.01048 13.0845 6.28743 12.1288C7.43634 11.9544 7.41133 11.317 7.8198 10.9675C8.68985 11.1833 9.14511 11.9622 9.38285 12.6474L9.38159 12.6464Z" fill="var(--color-text)" />
      <path d="M23.6104 6.08474C21.4365 7.29205 22.6292 7.2842 20.66 8.55505C20.2491 8.81957 18.9663 8.91267 18.9995 8.10582C18.9276 6.86304 22.1129 4.40882 23.6104 6.08474Z" fill="var(--color-text)" />
    </svg>
  );
}

function SwitchHorizontalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 16H17M17 16L14 13M17 16L14 19" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8H7M7 8L10 5M7 8L10 11" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="var(--color-border)" strokeWidth="1.5" />
      <path d="M12 8V16M8 12H16" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileThumbnail({ imageUrl, size }: { imageUrl: string | null; size: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-[54px] w-[54px]" }[size];
  const iconClass = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-8 w-8" }[size];

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-[var(--color-secondary)]`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)]">
          <DefaultPetIcon className={iconClass} />
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ hasProfile, petName, email, profileImageUrl, onClose }: { hasProfile: boolean; petName: string | null; email: string | null; profileImageUrl: string | null; onClose: () => void }) {
  const { logout } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  const isPaymentActive = pathname.startsWith("/mypage/payment");
  const isMypageActive = pathname.startsWith("/mypage") && !isPaymentActive && !pathname.startsWith("/mypage/withdraw");

  const menuItemClass = (active: boolean) =>
    [
      "w-full h-[52px] px-[30px] flex items-center text-left tracking-[-0.02em] transition-colors",
      active
        ? "text-body-14-b text-[var(--color-primary)] bg-[var(--color-card-premium)]"
        : "text-body-14-m text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-primary)]",
    ].join(" ");

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleSwitchProfile = () => {
    onClose();
    openModal("profile-switch");
  };

  const handleAddProfile = () => {
    onClose();
    router.push("/mypage/dog-profile?new=true");
  };

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[280px] rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden py-1">
      <div className="flex flex-col">
        {/* 프로필 헤더 */}
        <div className="flex items-center px-[30px] py-4">
          <ProfileThumbnail imageUrl={profileImageUrl} size="lg" />
          <div className="ml-4 min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              {hasProfile ? (
                <>
                  <span className="text-body-16-sb text-[var(--color-text)] truncate">{getProfileDisplayName(petName)}</span>
                  <button onClick={handleSwitchProfile} aria-label="프로필 변경" className="shrink-0">
                    <SwitchHorizontalIcon />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddProfile}
                  className="flex items-center gap-1 text-body-16-sb text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                >
                  <span className="truncate">프로필 등록하기</span>
                  <PlusCircleIcon />
                </button>
              )}
            </div>
            {email && (
              <p className="mt-1 text-body-14-m text-[var(--color-text-secondary)] truncate">
                {email}
              </p>
            )}
          </div>
        </div>

        <button onClick={() => { onClose(); router.push("/mypage"); }} className={menuItemClass(isMypageActive)}>
          마이페이지
        </button>
        <button onClick={() => { onClose(); openModal("account-info"); }} className={menuItemClass(false)}>
          계정정보
        </button>
        <button onClick={() => { onClose(); router.push("/mypage/payment"); }} className={menuItemClass(isPaymentActive)}>
          결제관리
        </button>
        <button onClick={handleLogout} className={menuItemClass(false)}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const { isLoggedIn, user, isAuthLoading } = useAuth();
  const { profile } = useProfile();
  const { openModal } = useModal();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileImageUrl = profile?.profileImageUrl ?? null;
  const hasProfile = hasProfileRecord(profile);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 h-[54px] bg-white shadow-[0_3px_30px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-full max-w-content items-center justify-between max-md:px-6 md:px-0">
          <div className="flex items-center gap-3">
            <button
              className="max-md:flex md:hidden items-center justify-center"
              onClick={() => setIsMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link href="/" aria-label="꼬순박스 홈">
              <Image src={logoMain} alt="꼬순박스 로고" priority />
            </Link>
          </div>
          <div className="flex items-center gap-[46px]">
            <Link href="/about" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              꼬순박스 소개
            </Link>
            <Link href="/subscribe" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              구독 시작하기
            </Link>
            <Link href="/support" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              고객센터
            </Link>
            {isAuthLoading ? (
              <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            ) : isLoggedIn ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  aria-label="프로필 메뉴"
                  aria-expanded={isProfileOpen}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <ProfileThumbnail imageUrl={profileImageUrl} size="sm" />
                </button>
                {isProfileOpen && (
                  <ProfileDropdown
                    hasProfile={hasProfile}
                    petName={profile?.name ?? null}
                    email={user?.email ?? null}
                    profileImageUrl={profileImageUrl}
                    onClose={() => setIsProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <Button as={Link} href="/login" size="sm">
                로그인
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* Top section — user / login */}
        <div className="flex items-center justify-between bg-[var(--color-surface-warm)] px-6 py-5">
          {isAuthLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--color-secondary)] animate-pulse" />
              <div className="h-4 w-24 rounded bg-[var(--color-secondary)] animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/mypage" onClick={closeMenu}>
                <ProfileThumbnail imageUrl={profileImageUrl} size="md" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  {hasProfile ? (
                    <>
                      <Link href="/mypage" onClick={closeMenu} className="text-body-16-m text-[var(--color-text)] truncate">
                        {getProfileDisplayName(profile?.name)}
                      </Link>
                      <button
                        onClick={() => { closeMenu(); openModal("profile-switch"); }}
                        aria-label="프로필 변경"
                        className="shrink-0"
                      >
                        <SwitchHorizontalIcon />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { closeMenu(); router.push("/mypage/dog-profile?new=true"); }}
                      className="flex items-center gap-1 text-body-16-m text-[var(--color-text-secondary)] min-w-0"
                    >
                      <span className="truncate">프로필 등록하기</span>
                      <PlusCircleIcon />
                    </button>
                  )}
                </div>
                {user?.email && (
                  <p className="mt-0.5 text-body-13-r text-[var(--color-text-secondary)] truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" onClick={closeMenu} className="flex items-center gap-3">
              <ProfileThumbnail imageUrl={null} size="md" />
              <span className="text-body-16-m text-[var(--color-text)]">로그인 하기</span>
            </Link>
          )}
          <button
            onClick={closeMenu}
            aria-label="메뉴 닫기"
            className="flex items-center justify-center p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center gap-4 px-6 py-5 text-body-16-m text-[var(--color-text)]"
            >
              <PawIcon />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
