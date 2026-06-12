"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth";
import { deleteProfile } from "@/features/profile/api/profileApi";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { MAX_PROFILE_COUNT, type Profile } from "@/features/profile/api/types";
import { getProfileDisplayName } from "@/shared/config/profile";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { deleteConfirmAlertOptions } from "@/shared/lib/modal/alertPresets";
import DefaultPetIcon from "../DefaultPetIcon";
import FallbackAvatar from "../FallbackAvatar";

interface Props {
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12.5 1.5L1.5 12.5" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M1.5 1.5L12.5 12.5" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="var(--color-primary)" strokeWidth="1" fill="none" />
      <path
        d="M5.5 8L7 9.5L10.5 6"
        stroke="var(--color-primary)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="16" height="16" rx="8" fill="var(--color-text-secondary)" />
      <path d="M5 11L11 5M5 5L11 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileAvatar({ pet }: { pet: Profile }) {
  if (pet.profileImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL
      <img src={pet.profileImageUrl} alt={pet.name ?? ""} className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)]">
      <DefaultPetIcon className="h-[41px] w-[41px]" />
    </div>
  );
}

function ProfileItem({
  pet,
  selected,
  onSelect,
  onDelete,
}: {
  pet: Profile;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex w-20 flex-col items-center gap-2">
      <div className="relative h-20 w-20 shrink-0">
        <button
          type="button"
          onClick={onSelect}
          className={`box-border h-20 w-20 overflow-hidden rounded-full ${
            selected
              ? "border-[3px] border-[var(--color-cta-button)]"
              : "border border-[var(--color-text-muted)]"
          }`}
        >
          <ProfileAvatar pet={pet} />
        </button>
        <button
          type="button"
          aria-label={`${getProfileDisplayName(pet.name)} 프로필 삭제`}
          onClick={onDelete}
          className="absolute top-[2px] right-0 flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <DeleteIcon />
        </button>
      </div>
      <div className="flex items-center justify-center gap-0.5">
        {selected && <CheckIcon />}
        <span className="max-w-20 truncate text-center text-body-14-sb-tight tracking-[-0.04em] text-[var(--color-text)]">
          {getProfileDisplayName(pet.name)}
        </span>
      </div>
    </div>
  );
}

function AddProfileItem({ onClick, userId }: { onClick: () => void; userId?: number | null }) {
  return (
    <button onClick={onClick} className="flex w-20 flex-col items-center gap-2" type="button">
      <div className="h-20 w-20 overflow-hidden rounded-full border border-[var(--color-text-muted)]">
        <FallbackAvatar userId={userId} size={80} />
      </div>
      <span className="max-w-20 truncate text-center text-body-14-sb-tight tracking-[-0.04em] text-[var(--color-text)]">
        프로필 추가
      </span>
    </button>
  );
}

export default function ProfileSwitchModal({ onClose }: Props) {
  const { user } = useAuth();
  const { profiles, profile, setActiveProfileId, refreshProfile } = useProfile();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [selectedId, setSelectedId] = useState<number>(profile?.id ?? profiles[0]?.id ?? 0);

  const isEmpty = profiles.length === 0;
  const isChanged = selectedId !== profile?.id;
  const canAddProfile = profiles.length < MAX_PROFILE_COUNT;

  const handleConfirm = () => {
    if (isChanged) {
      setActiveProfileId(selectedId);
    }
    onClose();
  };

  const handleAddProfile = () => {
    if (!canAddProfile) return;
    onClose();
    openChecklistForm({ isNewProfile: true });
  };

  const handleDeleteProfile = (pet: Profile) => {
    openAlert(
      deleteConfirmAlertOptions(
        "프로필을 삭제하시겠습니까?",
        () => {
          void handleConfirmDeleteProfile(pet);
        },
        "작성된 내용은 복구되지 않습니다.",
      ),
    );
  };

  const handleConfirmDeleteProfile = async (pet: Profile) => {
    showLoading("프로필을 삭제하고 있습니다...");
    let errorMessage: string | null = null;
    try {
      await deleteProfile(pet.id);
      await refreshProfile();
      if (selectedId === pet.id) {
        const remaining = profiles.filter((p) => p.id !== pet.id);
        setSelectedId(remaining[0]?.id ?? 0);
      }
    } catch (error) {
      errorMessage = getErrorMessage(error, "프로필 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      hideLoading();
    }
    if (errorMessage) {
      openAlert({ title: errorMessage });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="프로필 변경"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[416px] rounded-[24px] bg-white shadow-[0px_6px_20px_rgba(78,78,78,0.8)]">
        <div className="flex flex-col items-center gap-3 p-7">
          <div className="relative flex w-full items-center">
            <h2 className="pr-8 text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
              프로필 변경
            </h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex justify-center gap-4 py-2">
              {profiles.map((pet) => (
                <ProfileItem
                  key={pet.id}
                  pet={pet}
                  selected={selectedId === pet.id}
                  onSelect={() => setSelectedId(pet.id)}
                  onDelete={() => handleDeleteProfile(pet)}
                />
              ))}
              {canAddProfile && <AddProfileItem onClick={handleAddProfile} userId={user?.id ?? null} />}
            </div>

            <p className="w-full text-center text-[14px] font-normal leading-[17px] tracking-[-0.04em] text-[var(--color-text)]">
              {isEmpty ? "아직 등록된 프로필이 없어요." : "관리할 프로필을 선택해 주세요."}
            </p>
          </div>

          {isEmpty ? (
            <button
              type="button"
              onClick={handleAddProfile}
              className="h-12 w-full rounded-[8px] bg-[var(--color-btn-dark-warm)] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
            >
              프로필 등록하기
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="h-12 w-full rounded-[8px] bg-[var(--color-btn-dark-warm)] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
