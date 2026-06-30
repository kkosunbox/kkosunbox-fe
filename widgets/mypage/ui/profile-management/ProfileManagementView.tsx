"use client";

import Link from "next/link";
import type { DogGender } from "@/features/profile/api/types";
import { getProfileDisplayName } from "@/shared/config/profile";
import { sanitizeWeightInput } from "@/shared/lib/profile/weightInput";
import { BreedCombobox, DatePicker } from "@/shared/ui";
import {
  SPECIAL_NOTES_MAX_LENGTH,
  SPECIAL_NOTES_PLACEHOLDER,
  birthDateToValue,
  formatBirthDateDisplayDots,
  formatWeightInput,
} from "./profileManagementHelpers";
import { BaseInput } from "./components/BaseInput";
import { GenderButtons } from "./components/GenderButtons";
import { PetAvatar } from "./components/PetAvatar";
import type { ProfileManagementSectionVM } from "./useProfileManagement";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProfileManagementView({
  router,
  user,
  isCreating,
  draft,
  image,
  deletion,
  save,
  isActionsDisabled,
}: ProfileManagementSectionVM) {
  return (
    <>
      <input {...image.hiddenFileInputProps} />

      {/* ━━━━━━━━ 모바일 ━━━━━━━━ */}
      <div className="lg:hidden relative min-h-screen bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[122px] bg-[var(--color-surface-warm)]" />

        <div className="relative z-10">
          <div className="mx-auto max-w-[640px] flex items-center px-6 pt-6">
            <Link
              href="/mypage"
              aria-label="마이페이지로 돌아가기"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-subtitle-18-sb tracking-tightest text-[var(--color-text)]">
              {isCreating ? "프로필 등록" : "프로필 관리"}
            </h1>
            {!isCreating && (
              <button
                type="button"
                onClick={deletion.handleDeleteProfile}
                disabled={isActionsDisabled}
                className="ml-auto text-body-13-sb text-[var(--color-text-secondary)] underline disabled:opacity-60"
              >
                프로필삭제
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center">
            <PetAvatar
              size={100}
              editSize={32}
              imageUrl={image.profileImageUrl}
              userId={user?.id ?? null}
              onEditClick={image.openFilePicker}
              uploading={image.isUploadingImage}
            />
            <p className="mt-3 text-subtitle-18-b text-[var(--color-text)]">
              {getProfileDisplayName(draft.petName)}
            </p>
          </div>
          {image.imageError && (
            <p className="mt-2 text-center text-caption-12-m text-[var(--color-accent-rust)]">{image.imageError}</p>
          )}

          <div className="mx-auto max-w-[640px] px-6 mt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="m-name" className="text-body-13-m text-[var(--color-text-secondary)]">
                  강아지 이름
                </label>
                <BaseInput
                  id="m-name"
                  type="text"
                  value={draft.petName}
                  onChange={(e) => draft.setPetName(e.target.value)}
                  placeholder="이름"
                  className="!rounded-[8px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="m-breed" className="text-body-13-m text-[var(--color-text-secondary)]">
                  강아지 품종
                </label>
                <BreedCombobox
                  id="m-breed"
                  value={draft.breed}
                  onChange={draft.setBreed}
                  placeholder="ex) 웰시코기"
                  showSearchIcon
                  className="w-full"
                  inputClassName="!h-10 !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] text-body-13-m"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="m-weight" className="text-body-13-m text-[var(--color-text-secondary)]">
                  몸무게
                </label>
                <div className="relative">
                  <input
                    id="m-weight"
                    type="text"
                    inputMode="decimal"
                    value={draft.weight}
                    onChange={(e) => draft.setWeight(sanitizeWeightInput(e.target.value))}
                    placeholder="0"
                    className="h-10 w-full rounded-[8px] border-0 bg-[var(--color-surface-light)] px-3 pr-10 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-body-13-m text-[var(--color-text-secondary)]">
                    kg
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="m-birth" className="text-body-13-m text-[var(--color-text-secondary)]">
                  생년월일
                </label>
                <DatePicker
                  id="m-birth"
                  value={birthDateToValue(draft.birthDate)}
                  onChange={(date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    draft.setBirthDate(`${y}-${m}-${d}`);
                  }}
                  placeholder="생년월일 선택"
                  formatDisplay={formatBirthDateDisplayDots}
                  iconColor="var(--color-text-secondary)"
                  triggerClassName="!w-full !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] !px-3 !text-body-13-m [&>span]:!text-body-13-m [&>span]:!font-medium [&>span]:!tracking-normal"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-body-13-m text-[var(--color-text-secondary)]">성별</span>
                <div className="flex gap-3">
                  {(["male", "female"] as DogGender[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => draft.setGender(value)}
                      className={[
                        "flex h-[42px] flex-1 items-center justify-center rounded-[10px] text-body-14-m transition-colors",
                        draft.gender === value
                          ? "border border-[var(--color-primary)] bg-[var(--color-secondary)] font-semibold text-[var(--color-surface-dark)]"
                          : "bg-[var(--color-ui-inactive-bg)] text-[var(--color-text)]",
                      ].join(" ")}
                    >
                      {value === "male" ? "남" : "여"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="m-feature" className="text-body-13-m text-[var(--color-text-secondary)]">
                  특징
                </label>
                <BaseInput
                  id="m-feature"
                  type="text"
                  value={draft.specialNotes}
                  onChange={(e) => draft.setSpecialNotes(e.target.value)}
                  placeholder={SPECIAL_NOTES_PLACEHOLDER}
                  maxLength={SPECIAL_NOTES_MAX_LENGTH}
                  className="!rounded-[8px]"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[640px] px-6 pt-6 pb-10">
            {save.saveError && (
              <p className="mb-3 text-center text-body-13-m text-[var(--color-accent-rust)]">{save.saveError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isActionsDisabled}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={save.handleSave}
                disabled={isActionsDisabled}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {save.isPending ? "저장 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━ 태블릿·데스크탑 ━━━━━━━━ */}
      <div className="max-lg:hidden relative flex min-h-screen flex-col overflow-x-auto bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[258px] bg-[var(--color-surface-warm)]" />

        <div className="relative z-10 px-6 pb-20 pt-[64px]">
          <div className="mx-auto w-full max-w-profile-management">
            <div className="mb-8 flex items-center gap-1 text-[var(--color-text)]">
              <Link
                href="/mypage"
                aria-label="마이페이지로 돌아가기"
                className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
              >
                <BackIcon />
              </Link>
              <h1 className="text-title-24-sb tracking-tightest">{isCreating ? "프로필 등록" : "프로필 관리"}</h1>
            </div>

            <div className="mx-auto flex w-fit items-start gap-8">
              <aside className="flex w-[180px] shrink-0 flex-col items-center pt-6 lg:pt-12">
                <PetAvatar
                  size={124}
                  editSize={40}
                  imageUrl={image.profileImageUrl}
                  userId={user?.id ?? null}
                  onEditClick={image.openFilePicker}
                  uploading={image.isUploadingImage}
                />
                <p className="mt-3 text-title-24-b text-[var(--color-text)]">{getProfileDisplayName(draft.petName)}</p>
                {!isCreating && (
                  <button
                    type="button"
                    onClick={deletion.handleDeleteProfile}
                    disabled={isActionsDisabled}
                    className="mt-2 text-body-13-m text-[var(--color-accent)] underline disabled:opacity-60"
                  >
                    {deletion.isDeleting ? "삭제 중..." : "프로필 삭제"}
                  </button>
                )}
                {image.imageError && (
                  <p className="mt-3 w-full text-center text-body-12-m text-[var(--color-accent-rust)]">{image.imageError}</p>
                )}
              </aside>

              <div className="flex flex-1 flex-col rounded-[20px] bg-white px-8 pb-7 pt-7 shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-w-[670px] lg:min-h-[480px]">
                <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text-emphasis)]">프로필 정보</h2>

                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
                  <div className="flex items-center gap-4">
                    <label htmlFor="d-name" className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      강아지 이름
                    </label>
                    <BaseInput
                      id="d-name"
                      type="text"
                      value={draft.petName}
                      onChange={(event) => draft.setPetName(event.target.value)}
                      className="flex-1 min-w-0"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label htmlFor="d-breed" className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      강아지 품종
                    </label>
                    <BreedCombobox
                      id="d-breed"
                      value={draft.breed}
                      onChange={draft.setBreed}
                      placeholder="품종 선택"
                      className="flex-1 min-w-0"
                      inputClassName="!border-0 !bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label htmlFor="d-weight" className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      몸무게
                    </label>
                    <BaseInput
                      id="d-weight"
                      type="text"
                      inputMode="decimal"
                      value={formatWeightInput(draft.weight, draft.isWeightFocused)}
                      onFocus={() => draft.setIsWeightFocused(true)}
                      onBlur={() => draft.setIsWeightFocused(false)}
                      onChange={(event) => draft.setWeight(sanitizeWeightInput(event.target.value))}
                      className="flex-1 min-w-0"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label htmlFor="d-birth" className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      생년월일
                    </label>
                    <div className="flex-1 min-w-0">
                      <DatePicker
                        id="d-birth"
                        value={birthDateToValue(draft.birthDate)}
                        onChange={(date) => {
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, "0");
                          const d = String(date.getDate()).padStart(2, "0");
                          draft.setBirthDate(`${y}-${m}-${d}`);
                        }}
                        placeholder="생년월일 선택"
                        formatDisplay={formatBirthDateDisplayDots}
                        iconColor="var(--color-text-secondary)"
                        triggerClassName="!w-full !rounded-[4px] !border-0 !bg-[var(--color-surface-light)] !px-3 !text-body-13-m [&>span]:!text-body-13-m [&>span]:!font-medium [&>span]:!tracking-normal"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">성별</span>
                    <div className="w-[220px]">
                      <GenderButtons gender={draft.gender} onChange={draft.setGender} />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-4">
                    <label htmlFor="d-feature" className="w-[62px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      특징
                    </label>
                    <BaseInput
                      id="d-feature"
                      type="text"
                      value={draft.specialNotes}
                      onChange={(event) => draft.setSpecialNotes(event.target.value)}
                      placeholder={SPECIAL_NOTES_PLACEHOLDER}
                      maxLength={SPECIAL_NOTES_MAX_LENGTH}
                      className="flex-1 min-w-0"
                    />
                  </div>
                </div>

                <div className="mt-auto">
                  {save.saveError && (
                    <p className="mb-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{save.saveError}</p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      disabled={isActionsDisabled}
                      className="inline-flex h-10 w-[132px] items-center justify-center rounded-[8px] bg-[var(--color-ui-inactive-bg)] text-body-14-sb text-white transition-opacity hover:opacity-80 disabled:opacity-60"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={save.handleSave}
                      disabled={isActionsDisabled}
                      className="inline-flex h-10 w-[132px] items-center justify-center rounded-[8px] bg-[var(--color-why-bg)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {save.isPending ? "저장 중..." : "확인"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
