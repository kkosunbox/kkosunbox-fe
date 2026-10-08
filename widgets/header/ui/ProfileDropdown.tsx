"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ProfileEditBadge, ProfileThumbnail } from "./ProfileThumbnail";
import {
  SwitchHorizontalIcon,
  PlusCircleIcon,
} from "./icons";
import {
  MenuUserCircleIcon,
  MenuCreditCardIcon,
  MenuClipboardCheckIcon,
  MenuDocumentTextIcon,
  MenuDatabaseIcon,
  MenuLogoutIcon,
} from "./MenuIcons";

export function ProfileDropdown({
  hasProfile,
  petName,
  email,
  profileImageUrl,
  userId,
  isInfluencer,
  onClose,
}: {
  hasProfile: boolean;
  petName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  userId?: number | null;
  isInfluencer: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  const isSubscriptionActive = pathname.startsWith("/mypage/subscription");
  const isOrdersActive = pathname.startsWith("/orders");
  const isPointActive = pathname.startsWith("/mypage/point");
  const isMypageActive = pathname.startsWith("/mypage") && !isSubscriptionActive && !isPointActive && !pathname.startsWith("/mypage/withdraw");

  const menuItemClass = (active: boolean) =>
    [
      "w-full h-[52px] px-6 flex items-center gap-3 text-left tracking-[-0.02em] transition-colors",
      active
        ? "text-body-14-b text-[var(--color-cta-button)]"
        : "text-body-14-m text-[var(--color-text-tertiary)] hover:text-[var(--color-cta-button)] [&>svg]:text-[var(--color-border)] hover:[&>svg]:text-[var(--color-cta-button)]",
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

  const handleEditProfile = () => {
    onClose();
    openChecklistForm(hasProfile ? { editProfile: true } : { isNewProfile: true });
  };

  return (
    <div className="absolute right-0 top-[calc(100%+35px)] z-50 w-72 rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden">
      <div className="flex flex-col pb-[6px]">
        {/* 프로필 헤더 */}
        <div className="flex h-[90px] items-center gap-[14px] rounded-[10px_10px_0_0] bg-[var(--color-profile-menu-surface)] px-5">
          <div className="relative shrink-0">
            <div className="overflow-hidden rounded-full border border-[var(--color-text-muted)]">
              <ProfileThumbnail imageUrl={profileImageUrl} userId={userId} size="lg" />
            </div>
            <ProfileEditBadge onClick={handleEditProfile} className="-right-0.5 bottom-0" />
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
          <MenuUserCircleIcon />
          마이페이지
        </button>
        <button onClick={() => { onClose(); openModal("account-info"); }} className={menuItemClass(false)}>
          <MenuCreditCardIcon />
          계정정보
        </button>
        <button onClick={() => { onClose(); router.push("/mypage/subscription"); }} className={menuItemClass(isSubscriptionActive)}>
          <MenuClipboardCheckIcon />
          구독관리
        </button>
        <button onClick={() => { onClose(); router.push("/orders"); }} className={menuItemClass(isOrdersActive)}>
          <MenuDocumentTextIcon />
          주문내역
        </button>
        {isInfluencer && (
          <button onClick={() => { onClose(); router.push("/mypage/point"); }} className={menuItemClass(isPointActive)}>
            <MenuDatabaseIcon />
            MY 포인트
          </button>
        )}
        <button onClick={handleLogout} className={menuItemClass(false)}>
          <MenuLogoutIcon />
          로그아웃
        </button>
      </div>
    </div>
  );
}
