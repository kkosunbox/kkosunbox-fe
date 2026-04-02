"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logoMain from "@/shared/assets/logo-main.svg";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";

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

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="white" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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

function ProfileDropdown({ user, onClose }: { user: { name: string } | null; onClose: () => void }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPaymentActive = pathname.startsWith("/mypage/subscription");
  const isMypageActive = pathname.startsWith("/mypage") && !isPaymentActive;

  const menuItemClass = (active: boolean) =>
    [
      "w-full h-[52px] px-[30px] flex items-center text-left tracking-[-0.02em] transition-colors",
      active
        ? "text-body-14-sb text-[var(--color-primary)] bg-[var(--color-card-premium)]"
        : "text-body-14-m text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-warm)]",
    ].join(" ");

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden py-1">
      <div className="flex flex-col gap-1">
        {/* 프로필 헤더 */}
        <div className="flex h-[73px] items-center px-[30px]">
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[var(--color-text-secondary)] border border-[var(--color-text-muted)] overflow-hidden">
            <UserIcon />
          </div>
          <div className="flex items-center gap-1 ml-4 min-w-0">
            <span className="text-body-16-sb text-[var(--color-text)] truncate">{user?.name ?? "사용자"}</span>
            <SwitchHorizontalIcon />
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center justify-center"
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
          <div className="flex items-center gap-8">
            <Link href="/about" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-[var(--color-primary)]">
              꼬순박스 소개
            </Link>
            <Link href="/subscribe" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-[var(--color-primary)]">
              구독 시작하기
            </Link>
            <Link href="/support" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-[var(--color-primary)]">
              고객센터
            </Link>
            {isLoggedIn ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  aria-label="프로필 메뉴"
                  aria-expanded={isProfileOpen}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-secondary)] hover:opacity-80 transition-opacity"
                >
                  <UserIcon />
                </button>
                {isProfileOpen && (
                  <ProfileDropdown user={user} onClose={() => setIsProfileOpen(false)} />
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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-secondary)]">
              <UserIcon />
            </div>
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
