"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { MAX_PROFILE_COUNT, type Profile } from "@/features/profile/api/types";

interface Props {
  onClose: () => void;
}

function DefaultPetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M37.2785 37.1373C34.5293 36.2292 29.4393 36.2693 26.7858 37.1139C24.1808 37.9418 22.587 40.5692 22.9069 43.7334C23.054 45.3339 23.6124 46.7856 24.4207 48.0884C25.7689 50.4181 27.567 52.1842 29.7678 53.3181L29.7649 64C25.1334 63.8512 19.5793 63.0969 15.4461 60.4477C11.3073 58.0495 8.72806 53.579 8.15965 48.1904C7.5941 42.8236 8.1825 37.5086 9.75634 32.3876L13.9066 18.8726C16.4144 10.7011 19.6935 2.31382 27.7441 0.484171C30.5833 -0.16139 33.4182 -0.16139 36.2574 0.484171C44.2637 2.30546 47.557 10.6175 50.0563 18.7505L54.2451 32.3859C55.8332 37.5537 56.4188 42.9223 55.8218 48.3376C55.2334 53.666 52.647 58.0712 48.5567 60.4477C44.4265 63.0969 38.8666 63.8512 34.2379 64L34.2351 53.3198C36.4345 52.1842 38.234 50.4181 39.5821 48.0901C40.419 46.7388 40.9903 45.2336 41.1089 43.5645C41.3502 40.5223 39.8349 37.9819 37.2799 37.139L37.2785 37.1373ZM24.3736 29.4809C26.2131 29.6197 27.5141 27.882 27.4856 25.9654C27.457 24.0823 26.1517 22.4985 24.4464 22.5804C22.844 22.6573 21.6844 24.1843 21.6501 25.947C21.6158 27.7098 22.6884 29.3521 24.3736 29.4792V29.4809ZM39.1951 29.5043C41.0589 29.6598 42.3871 27.9055 42.3514 25.9454C42.3157 23.9853 40.9917 22.455 39.2651 22.5537C37.667 22.6456 36.5044 24.186 36.4702 25.9403C36.4359 27.6947 37.5084 29.3621 39.1951 29.5026V29.5043Z"
        fill="white"
      />
    </svg>
  );
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

function ProfileItem({ pet, selected, onSelect }: { pet: Profile; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="flex flex-col items-center gap-2 w-20" type="button">
      <div className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border ${selected ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"}`}>
        {pet.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL
          <img src={pet.profileImageUrl} alt={pet.name ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-text-secondary)]">
            <DefaultPetIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-[2px]">
        {selected && <CheckIcon />}
        <span className="text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text)] text-center truncate max-w-[60px]">
          {pet.name ?? "이름 없음"}
        </span>
      </div>
    </button>
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
  const { profiles, profile, setActiveProfileId } = useProfile();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number>(profile?.id ?? profiles[0]?.id ?? 0);

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
    router.push("/mypage/profile?new=true");
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
          <div className="relative flex w-full items-center justify-center">
            <h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
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
                />
              ))}
              {canAddProfile && <AddProfileItem onClick={handleAddProfile} />}
            </div>

            {/* Guide text */}
            <p className="text-[14px] font-normal leading-[17px] tracking-[-0.04em] text-[rgba(34,34,38,0.82)] text-center">
              관리할 프로필을 선택해 주세요.
            </p>
          </div>

          {/* Confirm button */}
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
        </div>
      </div>
    </div>
  );
}
