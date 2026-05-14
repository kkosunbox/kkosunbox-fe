"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/features/profile/api/profileApi";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { MAX_PROFILE_COUNT, type Profile } from "@/features/profile/api/types";
import { getProfileDisplayName } from "@/shared/config/profile";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import DefaultPetIcon from "../DefaultPetIcon";

interface Props {
  onClose: () => void;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="var(--color-primary)" strokeWidth="1" fill="none" />
      <path d="M5.5 8L7 9.5L10.5 6" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="10" x2="20" y2="30" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="20" x2="30" y2="20" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="8" fill="#999999"/>
      <path d="M5 11L11 5M5 5L11 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ProfileItem({ pet, selected, onSelect, onDelete }: { pet: Profile; selected: boolean; onSelect: () => void; onDelete: () => void }) {
  return (
    <div className="relative flex flex-col items-center gap-2 w-20">
      <div className="relative h-20 w-20 shrink-0">
        <button
          type="button"
          onClick={onSelect}
          className={`h-20 w-20 overflow-hidden rounded-full border ${selected ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"}`}
        >
          {pet.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL
            <img src={pet.profileImageUrl} alt={pet.name ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)]">
              <DefaultPetIcon className="h-10 w-10" />
            </div>
          )}
        </button>
        <button
          type="button"
          aria-label={`${getProfileDisplayName(pet.name)} 프로필 삭제`}
          onClick={onDelete}
          className="absolute top-0.5 right-0.5 flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <DeleteIcon />
        </button>
      </div>
      <div className="flex items-center gap-[2px]">
        {selected && <CheckIcon />}
        <span className="text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text)] text-center truncate max-w-[60px]">
          {getProfileDisplayName(pet.name)}
        </span>
      </div>
    </div>
  );
}

function AddProfileItem({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 w-20" type="button">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
        <AddIcon />
      </div>
      <span className="text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text-tertiary)] text-center">
        프로필 추가
      </span>
    </button>
  );
}

export default function ProfileSwitchModal({ onClose }: Props) {
  const { profiles, profile, setActiveProfileId, refreshProfile } = useProfile();
  const router = useRouter();
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
    router.push("/mypage/dog-profile?new=true");
  };

  const handleDeleteProfile = (pet: Profile) => {
    openAlert({
      title: "애견 프로필을 삭제할까요?",
      description: "애견 프로필을 삭제하시겠습니까?\n작성된 내용은 복구되지 않습니다.",
      primaryLabel: "삭제하기",
      secondaryLabel: "취소하기",
      onPrimary: () => { void handleConfirmDeleteProfile(pet); },
    });
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-[416px] rounded-[24px] bg-white shadow-[0px_4px_8px_rgba(16,24,64,0.08)]">
        <div className="flex flex-col items-center px-7 pt-7 pb-7 gap-3">
          {/* Header */}
          <div className="relative flex w-full items-center justify-start">
            <h2 className="pr-8 text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
              프로필 변경
            </h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 flex h-6 w-6 items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 1.5L1.5 12.5" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
                <path d="M1.5 1.5L12.5 12.5" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Profile list */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-center gap-4 flex-wrap py-2">
              {profiles.map((pet) => (
                <ProfileItem
                  key={pet.id}
                  pet={pet}
                  selected={selectedId === pet.id}
                  onSelect={() => setSelectedId(pet.id)}
                  onDelete={() => handleDeleteProfile(pet)}
                />
              ))}
              {canAddProfile && <AddProfileItem onClick={handleAddProfile} />}
            </div>

            {/* Guide text */}
            <p className="text-[14px] font-normal leading-[17px] tracking-[-0.04em] text-[rgba(34,34,38,0.82)] text-center">
              {isEmpty ? "아직 등록된 프로필이 없어요." : "관리할 프로필을 선택해 주세요."}
            </p>
          </div>

          {/* Confirm / Add button */}
          {isEmpty ? (
            <button
              onClick={handleAddProfile}
              className="w-full h-[48px] rounded-[30px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white bg-[var(--color-primary)] hover:opacity-90 transition-colors"
            >
              프로필 등록하기
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!isChanged}
              className={`w-full h-[48px] rounded-[30px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-colors ${
                isChanged
                  ? "bg-[var(--color-primary)] hover:opacity-90"
                  : "bg-[var(--color-border)]"
              }`}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
