"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoMain from "@/shared/assets/logo-main@2x.webp";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasProfileRecord } from "@/features/profile/lib/profileStatus";
import { HeaderBanner } from "./HeaderBanner";
import { ProfileThumbnail } from "./ProfileThumbnail";
import { ProfileDropdown } from "./ProfileDropdown";
import { MobileDrawer } from "./MobileDrawer";
import { LogoWhiteIcon } from "./icons";
import { isTransparentRoute } from "@/shared/config/headerVariants";
import { useHeaderScroll } from "./useHeaderScroll";

export default function Header() {
  const { isLoggedIn, user, isAuthLoading, logout } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isScrolled, isBannerCollapsed } = useHeaderScroll(pathname);
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

  const isSolid = !isTransparentRoute(pathname) || isMenuOpen || isScrolled || isHovered;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <HeaderBanner isBannerCollapsed={isBannerCollapsed} />

      {/* 흰색 헤더 전용: 하단 그라데이션 separator */}
      <div
        className={`fixed inset-x-0 max-md:top-[88px] top-[84px] z-[49] h-6 pointer-events-none transition-[opacity,transform] duration-300 ${isBannerCollapsed ? "max-md:-translate-y-[34px] md:-translate-y-[30px]" : ""} ${isSolid ? "opacity-100" : "opacity-0"}`}
        style={{ background: "var(--gradient-header-separator)" }}
        aria-hidden="true"
      />

      <nav
        className={`fixed inset-x-0 max-md:top-[34px] top-[30px] z-50 h-[54px] transition-[background-color,transform] duration-300 ${isBannerCollapsed ? "max-md:-translate-y-[34px] md:-translate-y-[30px]" : ""} ${isSolid ? "bg-white" : "bg-transparent"}`}
        onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 투명 헤더 전용: 헤더 배경 그라디언트 */}
        <div
          className={`absolute inset-0 z-[-1] pointer-events-none transition-opacity duration-300 ${isSolid ? "opacity-0" : "opacity-100"}`}
          style={{ background: "var(--gradient-header-overlay)", backdropFilter: "none" }}
          aria-hidden="true"
        />
        <div className="mx-auto flex h-full max-w-content items-center justify-between max-md:px-6 md:px-[20px] lg:px-0">
          <div className="flex items-center gap-3">
            <button
              className="max-md:flex md:flex lg:hidden items-center justify-center"
              onClick={() => setIsMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke={isSolid ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link href="/" aria-label="꼬순박스 홈" className="inline-flex items-center">
              {isSolid
                ? <Image src={logoMain} alt="꼬순박스 로고" className="h-auto max-h-[28px] w-auto object-contain" priority />
                : <LogoWhiteIcon />
              }
            </Link>
          </div>

          <div className="flex items-center gap-[46px]">
            <Link href="/about" className={`max-md:hidden md:hidden lg:block text-body-14-b transition-colors duration-300 ${isSolid ? "text-[var(--color-text)] hover:text-primary" : "text-white hover:text-white/80"}`}>
              꼬순박스 소개
            </Link>
            <Link href="/subscribe" className={`max-md:hidden md:hidden lg:block text-body-14-b transition-colors duration-300 ${isSolid ? "text-[var(--color-text)] hover:text-primary" : "text-white hover:text-white/80"}`}>
              구독 시작하기
            </Link>
            <Link href="/shop" className={`max-md:hidden md:hidden lg:block text-body-14-b transition-colors duration-300 ${isSolid ? "text-[var(--color-text)] hover:text-primary" : "text-white hover:text-white/80"}`}>
              간식 스토어
            </Link>
            <Link href="/support" className={`max-md:hidden md:hidden lg:block text-body-14-b transition-colors duration-300 ${isSolid ? "text-[var(--color-text)] hover:text-primary" : "text-white hover:text-white/80"}`}>
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
                  <ProfileThumbnail imageUrl={profileImageUrl} userId={user?.id ?? null} size="sm" />
                </button>
                {isProfileOpen && (
                  <ProfileDropdown
                    hasProfile={hasProfile}
                    petName={profile?.name ?? null}
                    email={user?.email ?? null}
                    profileImageUrl={profileImageUrl}
                    userId={user?.id ?? null}
                    onClose={() => setIsProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <Button as={Link} href="/login" size="sm" className="rounded-[4px]" style={{ borderRadius: 4 }}>
                로그인
              </Button>
            )}
          </div>
        </div>
      </nav>

      <MobileDrawer
        open={isMenuOpen}
        onClose={closeMenu}
        isLoggedIn={isLoggedIn}
        isAuthLoading={isAuthLoading}
        userId={user?.id ?? null}
        email={user?.email ?? null}
        profileImageUrl={profileImageUrl}
        hasProfile={hasProfile}
        petName={profile?.name ?? null}
        onLogout={logout}
      />
    </>
  );
}
