"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logoMain from "@/shared/assets/logo-main.svg";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "꼬순박스 소개" },
  { href: "/subscribe", label: "구독 시작하기" },
  { href: "/support", label: "고객센터" },
];

function PawIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="15.5" rx="5" ry="4" fill="var(--color-primary)" />
      <ellipse cx="6.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="10" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="14" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="17.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
    </svg>
  );
}

function DefaultPetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M37.2785 37.1373C34.5293 36.2292 29.4393 36.2693 26.7858 37.1139C24.1808 37.9418 22.587 40.5692 22.9069 43.7334C23.054 45.3339 23.6124 46.7856 24.4207 48.0884C25.7689 50.4181 27.567 52.1842 29.7678 53.3181L29.7649 64C25.1334 63.8512 19.5793 63.0969 15.4461 60.4477C11.3073 58.0495 8.72806 53.579 8.15965 48.1904C7.5941 42.8236 8.1825 37.5086 9.75634 32.3876L13.9066 18.8726C16.4144 10.7011 19.6935 2.31382 27.7441 0.484171C30.5833 -0.16139 33.4182 -0.16139 36.2574 0.484171C44.2637 2.30546 47.557 10.6175 50.0563 18.7505L54.2451 32.3859C55.8332 37.5537 56.4188 42.9223 55.8218 48.3376C55.2334 53.666 52.647 58.0712 48.5567 60.4477C44.4265 63.0969 38.8666 63.8512 34.2379 64L34.2351 53.3198C36.4345 52.1842 38.234 50.4181 39.5821 48.0901C40.419 46.7388 40.9903 45.2336 41.1089 43.5645C41.3502 40.5223 39.8349 37.9819 37.2799 37.139L37.2785 37.1373ZM24.3736 29.4809C26.2131 29.6197 27.5141 27.882 27.4856 25.9654C27.457 24.0823 26.1517 22.4985 24.4464 22.5804C22.844 22.6573 21.6844 24.1843 21.6501 25.947C21.6158 27.7098 22.6884 29.3521 24.3736 29.4792V29.4809ZM39.1951 29.5043C41.0589 29.6598 42.3871 27.9055 42.3514 25.9454C42.3157 23.9853 40.9917 22.455 39.2651 22.5537C37.667 22.6456 36.5044 24.186 36.4702 25.9403C36.4359 27.6947 37.5084 29.3621 39.1951 29.5026V29.5043Z"
        fill="white"
      />
      <path
        d="M5.91505 29.3653C3.36291 29.5175 0.745087 28.1294 0.106697 25.1508C-0.498845 22.321 1.61198 17.7519 2.94161 15.3687C5.23524 11.2562 10.9036 2.34373 15.7665 3.22176C12.6403 8.00159 11.2307 12.1024 9.50831 17.6967L5.91505 29.367V29.3653Z"
        fill="white"
      />
      <path
        d="M63.9001 25.0837C63.2645 28.1743 60.6053 29.519 58.0803 29.3601L54.4528 17.5694C52.7604 12.0688 51.3536 8.00139 48.2402 3.22992C53.0603 2.33182 58.7287 11.1824 61.058 15.3685C62.3319 17.658 64.4842 22.2455 63.9015 25.0837H63.9001Z"
        fill="white"
      />
      <path
        d="M36.5476 42.4958C37.5173 43.5829 33.4227 49.7157 31.1891 48.3326C29.4939 47.2823 28.09 45.6701 27.4044 43.5645C27.3216 43.3086 27.3016 42.7818 27.4002 42.5911C28.0086 41.417 35.5835 41.417 36.5476 42.4974V42.4958Z"
        fill="white"
      />
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

function ProfileThumbnail({ imageUrl, size }: { imageUrl: string | null; size: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-[54px] w-[54px]" }[size];
  const iconClass = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-8 w-8" }[size];

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-[var(--color-secondary)]`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-text-secondary)]">
          <DefaultPetIcon className={iconClass} />
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ user, petName, profileImageUrl, onClose }: { user: { email: string } | null; petName: string | null; profileImageUrl: string | null; onClose: () => void }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showPetName, setShowPetName] = useState(false);

  const isPaymentActive = pathname.startsWith("/mypage/subscription");
  const isMypageActive = pathname.startsWith("/mypage") && !isPaymentActive;

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

  const displayName = showPetName ? (petName ?? "사용자") : (user?.email ?? "사용자");

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[280px] rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden py-1">
      <div className="flex flex-col">
        {/* 프로필 헤더 */}
        <div className="flex h-[73px] items-center px-[30px]">
          <ProfileThumbnail imageUrl={profileImageUrl} size="lg" />
          <div className="flex items-center gap-1 ml-4 min-w-0">
            <span className="text-body-16-sb text-[var(--color-text)] truncate">{displayName}</span>
            <button onClick={() => setShowPetName((v) => !v)} aria-label="이름 전환" className="shrink-0">
              <SwitchHorizontalIcon />
            </button>
          </div>
        </div>

        <button onClick={() => { onClose(); router.push("/mypage"); }} className={menuItemClass(isMypageActive)}>
          마이페이지
        </button>
        <button onClick={() => { onClose(); router.push("/mypage/subscription"); }} className={menuItemClass(isPaymentActive)}>
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
  const { isLoggedIn, user } = useAuth();
  const { profile } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileImageUrl = profile?.profileImageUrl ?? null;

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
            {isLoggedIn ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  aria-label="프로필 메뉴"
                  aria-expanded={isProfileOpen}
                  className="hover:opacity-80 transition-opacity"
                >
                  <ProfileThumbnail imageUrl={profileImageUrl} size="sm" />
                </button>
                {isProfileOpen && (
                  <ProfileDropdown user={user} petName={profile?.name ?? null} profileImageUrl={profileImageUrl} onClose={() => setIsProfileOpen(false)} />
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
          <Link
            href={isLoggedIn ? "/mypage" : "/login"}
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <ProfileThumbnail imageUrl={isLoggedIn ? profileImageUrl : null} size="md" />
            <span className="text-body-16-m text-[var(--color-text)]">
              {isLoggedIn ? "마이페이지" : "로그인 하기"}
            </span>
          </Link>
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
