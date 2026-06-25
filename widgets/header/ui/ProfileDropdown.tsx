"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ProfileThumbnail } from "./ProfileThumbnail";
import {
  SwitchHorizontalIcon,
  PlusCircleIcon,
  DropdownUserIcon,
  DropdownPinIcon,
  DropdownClipboardIcon,
  DropdownLogoutIcon,
} from "./icons";

export function ProfileDropdown({
  hasProfile,
  petName,
  email,
  profileImageUrl,
  userId,
  onClose,
}: {
  hasProfile: boolean;
  petName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  userId?: number | null;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  const isSubscriptionActive = pathname.startsWith("/mypage/subscription");
  const isMypageActive = pathname.startsWith("/mypage") && !isSubscriptionActive && !pathname.startsWith("/mypage/withdraw");

  const menuItemClass = (active: boolean) =>
    [
      "w-full h-[52px] px-6 flex items-center gap-3 text-left tracking-[-0.02em] transition-colors",
      active
        ? "text-body-14-b text-[var(--color-primary)]"
        : "text-body-14-m text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]",
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
    openChecklistForm({ isNewProfile: true });
  };

  return (
    <div className="absolute right-0 top-[calc(100%+23px)] z-50 w-72 rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden">
      <div className="flex flex-col pb-[6px]">
        {/* 프로필 헤더 — 그라디언트 배경 */}
        <div
          className="flex h-[90px] items-center gap-4 rounded-[10px_10px_0_0] px-5"
          style={{ background: "var(--gradient-dropdown-header)" }}
        >
          <div className="shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]">
            <ProfileThumbnail imageUrl={profileImageUrl} userId={userId} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              {hasProfile ? (
                <>
                  <span className="text-body-14-sb text-[var(--color-text)] truncate">{getProfileDisplayName(petName)}</span>
                  <button onClick={handleSwitchProfile} aria-label="프로필 변경" className="shrink-0">
                    <SwitchHorizontalIcon />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddProfile}
                  className="flex items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors min-w-0"
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
          <DropdownUserIcon />
          마이페이지
        </button>
        <button onClick={() => { onClose(); openModal("account-info"); }} className={menuItemClass(false)}>
          <DropdownPinIcon />
          계정정보
        </button>
        <button onClick={() => { onClose(); router.push("/mypage/subscription"); }} className={menuItemClass(isSubscriptionActive)}>
          <DropdownClipboardIcon />
          구독관리
        </button>
        <button onClick={handleLogout} className={menuItemClass(false)}>
          <DropdownLogoutIcon />
          로그아웃
        </button>
      </div>
    </div>
  );
}
