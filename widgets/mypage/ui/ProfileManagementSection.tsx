"use client";

import { useEffect, useRef, useState, useTransition, type InputHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProfile, deleteProfile, updateProfile } from "@/features/profile/api/profileApi";
import { MAX_PROFILE_COUNT, type DogGender, type Profile } from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";
import { getProfileDisplayName } from "@/shared/config/profile";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { BreedCombobox, DatePicker, DefaultPetIcon, useLoadingOverlay, useModal } from "@/shared/ui";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const SPECIAL_NOTES_PLACEHOLDER = "예) 푸드퍼즐 간식을 좋아해요.";
const SPECIAL_NOTES_MAX_LENGTH = 200;

function birthDateInputValue(profileBirth: string | null | undefined): string {
  if (!profileBirth?.trim()) return "";
  const day = profileBirth.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

function formatBirthDateDisplayDots(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function birthDateToValue(birth: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
  const [y, m, d] = birth.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sanitizeWeightInput(value: string): string {
  const numeric = value.replace(/[^\d.]/g, "");
  const [integer = "", ...fractions] = numeric.split(".");
  if (fractions.length === 0) return integer;
  return `${integer}.${fractions.join("")}`;
}

function formatWeightInput(value: string, isFocused: boolean): string {
  if (isFocused) return value;
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? `${value}kg` : value;
}

interface ProfileManagementSectionProps {
  profile: Profile | null;
  subscription: UserSubscriptionDto | null;
  isNewProfile?: boolean;
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21.5205 6.42383C21.945 6.46921 22.2837 6.66391 22.5527 6.86914C22.837 7.08606 23.1418 7.39377 23.4551 7.70703L24.626 8.87891L24.6475 8.89941L24.6562 8.91016C24.9589 9.21268 25.254 9.50624 25.4639 9.78125C25.6984 10.0886 25.9189 10.4864 25.9189 11C25.9189 11.5136 25.6984 11.9114 25.4639 12.2188C25.2469 12.5031 24.9393 12.8078 24.626 13.1211L14.4326 23.3154C14.2755 23.4725 14.0713 23.6886 13.8076 23.8379C13.5439 23.9872 13.2536 24.0506 13.0381 24.1045L9.05078 25.1016C8.90291 25.1385 8.6815 25.1968 8.4873 25.2158C8.28067 25.236 7.82868 25.2425 7.45996 24.874C7.09145 24.5055 7.09798 24.0536 7.11816 23.8467C7.13717 23.6523 7.19545 23.4301 7.23242 23.2822L8.22852 19.2949C8.2824 19.0794 8.34678 18.7891 8.49609 18.5254L8.61816 18.3389C8.74905 18.1631 8.8998 18.0191 9.01758 17.9014L19.2119 7.70703C19.5253 7.39369 19.8299 7.08607 20.1143 6.86914C20.4216 6.63466 20.8195 6.41416 21.333 6.41406L21.5205 6.42383Z"
        stroke="#999999"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M18 9.00065L22 6.33398L26 10.334L23.3333 14.334L18 9.00065Z" fill="#999999" />
    </svg>
  );
}

function PetAvatar({
  size = 124,
  editSize = 40,
  imageUrl,
  onEditClick,
  disabled,
  uploading,
}: {
  size?: number;
  editSize?: number;
  imageUrl: string | null;
  onEditClick: () => void;
  disabled?: boolean;
  uploading?: boolean;
}) {
  const iconSize = size <= 64 ? "w-[60%] h-[60%]" : "w-[60%] h-[60%]";

  return (
    <div className="relative shrink-0">
      <div
        role="button"
        tabIndex={0}
        aria-label="프로필 사진 변경"
        onClick={() => { if (!disabled && !uploading) onEditClick(); }}
        onKeyDown={(e) => { if (!disabled && !uploading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onEditClick(); } }}
        className="cursor-pointer overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)]"
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            width={size}
            height={size}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)]">
            <DefaultPetIcon className={iconSize} />
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={onEditClick}
        disabled={disabled || uploading}
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] shadow-[0_4px_10px_rgba(92,70,52,0.12)] disabled:opacity-50"
        style={{ width: editSize, height: editSize }}
      >
        {uploading ? (
          <span
            className="inline-block animate-spin rounded-full border-2 border-[var(--color-text-secondary)] border-t-transparent"
            style={{ width: editSize * 0.45, height: editSize * 0.45 }}
            aria-hidden
          />
        ) : (
          <PencilIcon style={{ width: editSize * 0.8, height: editSize * 0.8 }} />
        )}
      </button>
    </div>
  );
}

function FieldShell({
  id,
  label,
  children,
  mobile = false,
}: {
  id?: string;
  label: string;
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "flex items-center gap-3" : "grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-4 gap-y-2"}>
      <label
        htmlFor={id}
        className={mobile ? "w-[60px] shrink-0 text-body-13-m text-[var(--color-text)]" : "text-body-13-m text-[var(--color-text)]"}
      >
        {label}
      </label>
      <div className={mobile ? "min-w-0 flex-1" : "contents"}>
        {children}
      </div>
    </div>
  );
}

function BaseInput({
  className = "",
  readOnly = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      className={[
        "h-9 w-full rounded-[4px] border border-[var(--color-divider-warm)] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none",
        readOnly ? "cursor-default text-[var(--color-text-secondary)]" : "",
        className,
      ].join(" ")}
    />
  );
}

function GenderButtons({
  gender,
  onChange,
}: {
  gender: DogGender | null;
  onChange: (value: DogGender) => void;
}) {
  const className = (value: DogGender) =>
    [
      "flex h-8 flex-1 items-center justify-center rounded-[4px] text-body-13-m transition-colors",
      gender === value
        ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]"
        : "bg-[var(--color-ui-inactive-bg)] text-[var(--color-text)]",
    ].join(" ");

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange("male")} className={className("male")}>
        남
      </button>
      <button type="button" onClick={() => onChange("female")} className={className("female")}>
        여
      </button>
    </div>
  );
}

export default function ProfileManagementSection({
  profile: serverProfile,
  subscription,
  isNewProfile = false,
}: ProfileManagementSectionProps) {
  const router = useRouter();
  const { profile: activeProfile, profiles, refreshProfile, setActiveProfileId } = useProfile();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { openAlert } = useModal();
  const [isPending, start] = useTransition();
  const hasAlertedLimit = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = isNewProfile ? null : (activeProfile ?? serverProfile);
  const isCreating = profile === null;

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(profile?.profileImageUrl ?? null);
  const [gender, setGender] = useState<DogGender | null>(profile?.gender ?? null);
  const [petName, setPetName] = useState(profile?.name ?? "");
  const [breed, setBreed] = useState(profile?.breed ?? "");
  const [birthDate, setBirthDate] = useState(birthDateInputValue(profile?.birthDate));
  const [weight, setWeight] = useState(
    profile?.weight !== null && profile?.weight !== undefined ? String(profile.weight) : "",
  );
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [specialNotes, setSpecialNotes] = useState(profile?.specialNotes ?? "");
  const subscriptionPlanTheme = subscription ? packageThemeForPlan(subscription.plan) : null;

  useEffect(() => {
    if (isNewProfile) return;
    setProfileImageUrl(profile?.profileImageUrl ?? null);
    setGender(profile?.gender ?? null);
    setPetName(profile?.name ?? "");
    setBreed(profile?.breed ?? "");
    setBirthDate(birthDateInputValue(profile?.birthDate));
    setWeight(profile?.weight !== null && profile?.weight !== undefined ? String(profile.weight) : "");
    setSpecialNotes(profile?.specialNotes ?? "");
  }, [profile?.id, profile?.profileImageUrl, profile?.gender, profile?.name, profile?.breed, profile?.birthDate, profile?.weight, profile?.specialNotes, isNewProfile]);

  useEffect(() => {
    if (!isNewProfile) return;
    if (profiles.length < MAX_PROFILE_COUNT) return;
    if (hasAlertedLimit.current) return;
    hasAlertedLimit.current = true;
    openAlert({ title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.` });
    router.replace("/mypage");
  }, [isNewProfile, profiles.length, openAlert, router]);

  function handleDeleteProfile() {
    if (!profile || isCreating) return;

    openAlert({
      title: "애견 프로필을 삭제할까요?",
      description: "애견 프로필을 삭제하시겠습니까?\n작성된 내용은 복구되지 않습니다.",
      primaryLabel: "삭제하기",
      secondaryLabel: "취소하기",
      onPrimary: () => {
        void handleConfirmDeleteProfile();
      },
    });
  }

  async function handleConfirmDeleteProfile() {
    if (!profile || isCreating) return;

    setIsDeleting(true);
    showLoading("프로필을 삭제하고 있습니다...");

    let errorMessage: string | null = null;
    try {
      await deleteProfile(profile.id);
      await refreshProfile();
      router.push("/mypage");
      router.refresh();
    } catch (error) {
      errorMessage = getErrorMessage(error, "프로필 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      hideLoading();
      setIsDeleting(false);
    }

    if (errorMessage) {
      openAlert({ title: errorMessage });
    }
  }

  async function handleProfileImageSelected(file: File) {
    setImageError(null);
    if (!ACCEPT_IMAGE.split(",").includes(file.type)) {
      setImageError("JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("이미지는 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({
        fileName: file.name,
        fileType: file.type,
      });
      await uploadToS3(uploadUrl, file, file.type);

      if (isCreating) {
        setProfileImageUrl(fileUrl);
      } else if (profile) {
        await updateProfile(profile.id, { profileImageUrl: fileUrl });
        setProfileImageUrl(fileUrl);
        await refreshProfile();
        router.refresh();
      }
    } catch (error) {
      setImageError(getErrorMessage(error, "이미지 업로드에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleSave() {
    setSaveError(null);
    if (isCreating && profiles.length >= MAX_PROFILE_COUNT) {
      openAlert({ title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.` });
      return;
    }
    const trimmedWeight = weight.trim();
    const parsedWeight = trimmedWeight ? parseFloat(trimmedWeight) : NaN;
    if (trimmedWeight && Number.isNaN(parsedWeight)) {
      setSaveError("몸무게는 숫자로 입력해 주세요.");
      return;
    }

    const trimmedNotes = specialNotes.trim();

    showLoading("프로필을 저장하고 있습니다...");
    start(async () => {
      try {
        const body = {
          name: petName.trim() || undefined,
          breed: breed.trim() || undefined,
          birthDate: birthDate.trim() || undefined,
          weight: trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : undefined,
          ...(gender !== null ? { gender } : {}),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        };

        if (isCreating) {
          const newProfile = await createProfile({
            ...body,
            ...(trimmedNotes ? { specialNotes: trimmedNotes } : {}),
          });
          await refreshProfile();
          setActiveProfileId(newProfile.id);
        } else {
          await updateProfile(profile.id, {
            ...body,
            breed: breed.trim() || null,
            specialNotes: trimmedNotes || null,
          });
          await refreshProfile();
        }

        router.push("/mypage");
        router.refresh();
      } catch (error) {
        setSaveError(getErrorMessage(error, "저장 중 오류가 발생했습니다. 다시 시도해주세요."));
      } finally {
        hideLoading();
      }
    });
  }

  const desktopLayout = (
    <div className="max-md:hidden min-h-screen bg-[var(--color-background)] overflow-x-auto px-6 pb-16 pt-[84px]">
      <div className="mx-auto w-full max-w-[1014px] min-w-[924px]">
        <div className="rounded-[20px] bg-white px-[28px] pb-[34px] pt-[24px] shadow-[0_8px_30px_rgba(185,148,116,0.08)]">
          <div className="mb-4 flex items-center gap-1 text-[var(--color-text)]">
            <Link
              href="/mypage"
              aria-label="마이페이지로 돌아가기"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-title-24-sb tracking-tightest">{isCreating ? "프로필 등록" : "프로필 관리"}</h1>
          </div>

          <div className="flex min-w-0 items-start gap-[28px]">
            <div className="flex min-w-0 flex-1 justify-center">
              <aside className="flex w-[170px] shrink-0 flex-col items-center pt-8">
                <PetAvatar
                  size={124}
                  editSize={40}
                  imageUrl={profileImageUrl}
                  onEditClick={() => fileInputRef.current?.click()}
                  uploading={isUploadingImage}
                />
                <p className="mt-[13px] text-title-24-b text-[var(--color-text)]">{getProfileDisplayName(petName)}</p>
                <div className="mt-4 h-px w-[141px] bg-[var(--color-divider-warm)]" />
                {subscription ? (
                  <>
                    <span
                      className="mt-[20px] inline-flex h-6 items-center justify-center rounded-full px-3 text-body-14-sb text-white"
                      style={{ background: subscriptionPlanTheme?.colorVar }}
                    >
                      {subscriptionPlanTheme?.tier}
                    </span>
                    <p className="mt-2 w-full text-center text-subtitle-16-sb tracking-tightest text-[var(--color-text)]">
                      {subscription.plan.name} 구독중
                    </p>
                    <p className="mt-1 w-full text-center text-body-16-m text-[var(--color-text-secondary)]">
                      {subscription.nextBillingDate.replace(/-/g, ".")} ~
                    </p>
                    <p className="mt-1 w-full text-center text-body-16-m text-[var(--color-text-secondary)]">
                      결제일 : 매달 {parseInt(subscription.nextBillingDate.slice(8, 10), 10)}일
                    </p>
                    <Link
                      href="/mypage/subscription"
                      className="mt-[8px] text-body-14-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
                    >
                      구독 변경
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-[18px] w-full text-center text-body-16-m text-[var(--color-text-secondary)]">
                      아직 구독 정보가 없어요.
                    </p>
                    <Link
                      href="/subscribe"
                      className="mt-[8px] text-body-14-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
                    >
                      구독 시작하기
                    </Link>
                  </>
                )}
                {imageError && (
                  <p className="mt-3 w-full text-center text-body-12-m text-[var(--color-accent-rust)]">{imageError}</p>
                )}
              </aside>
            </div>

            <div className="w-[670px] shrink-0">
              <section className="rounded-[20px] bg-[var(--color-background)] px-7 pb-[52px] pt-7">
                <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">프로필 정보</h2>

                <div className="mt-6 grid grid-cols-[290px_290px] gap-x-[34px] gap-y-4">
                  <div className="flex items-center">
                    <label htmlFor="d-name" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      강아지 이름
                    </label>
                    <BaseInput
                      id="d-name"
                      type="text"
                      value={petName}
                      onChange={(event) => setPetName(event.target.value)}
                      className="h-8 !w-[220px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="d-breed" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      강아지 품종
                    </label>
                    <BreedCombobox
                      id="d-breed"
                      value={breed}
                      onChange={setBreed}
                      placeholder="품종 선택"
                      className="!w-[220px]"
                      inputClassName="h-8 border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="d-weight" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      몸무게
                    </label>
                    <BaseInput
                      id="d-weight"
                      type="text"
                      inputMode="decimal"
                      value={formatWeightInput(weight, isWeightFocused)}
                      onFocus={() => setIsWeightFocused(true)}
                      onBlur={() => setIsWeightFocused(false)}
                      onChange={(event) => setWeight(sanitizeWeightInput(event.target.value))}
                      className="h-8 !w-[220px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="d-birth" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      생년월일
                    </label>
                    <DatePicker
                      id="d-birth"
                      value={birthDateToValue(birthDate)}
                      onChange={(date) => {
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, "0");
                        const d = String(date.getDate()).padStart(2, "0");
                        setBirthDate(`${y}-${m}-${d}`);
                      }}
                      placeholder="생년월일 선택"
                      formatDisplay={formatBirthDateDisplayDots}
                      triggerClassName="!h-8 !w-[220px] !rounded-[4px] !border-0 !bg-white !px-3 hover:!border-0 !text-body-13-m [&>span]:!text-body-13-m [&>span]:!font-medium [&>span]:!tracking-normal"
                    />
                  </div>

                  <div className="flex items-center">
                    <span className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">성별</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={[
                          "inline-flex h-8 w-[106px] items-center justify-center rounded-[4px] text-body-13-m transition-colors",
                          gender === "male"
                            ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]"
                            : "bg-[var(--color-ui-inactive-bg)] text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        남
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={[
                          "inline-flex h-8 w-[106px] items-center justify-center rounded-[4px] text-body-13-m transition-colors",
                          gender === "female"
                            ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]"
                            : "bg-[var(--color-ui-inactive-bg)] text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        여
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <label htmlFor="d-feature" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      특징
                    </label>
                    <BaseInput
                      id="d-feature"
                      type="text"
                      value={specialNotes}
                      onChange={(event) => setSpecialNotes(event.target.value)}
                      placeholder={SPECIAL_NOTES_PLACEHOLDER}
                      maxLength={SPECIAL_NOTES_MAX_LENGTH}
                      className="h-8 !w-[544px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>
                </div>

                {saveError && <p className="mt-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{saveError}</p>}
              </section>

              <div className="mt-[28px] flex justify-end gap-[17px]">
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={isPending || isUploadingImage || isDeleting}
                    className="inline-flex h-9 w-[132px] items-center justify-center rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80 disabled:opacity-60"
                  >
                    {isDeleting ? "삭제 중..." : "프로필 삭제"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || isUploadingImage || isDeleting}
                  className="inline-flex h-9 w-[132px] items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "저장 중..." : "확인"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="md:hidden min-h-screen bg-white">
      {/* Warm background top section */}
      <div className="bg-[var(--color-surface-warm)] px-6 pb-8 pt-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-1 text-[var(--color-text)]">
          <Link
            href="/mypage"
            aria-label="마이페이지로 돌아가기"
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)]"
          >
            <BackIcon />
          </Link>
          <h1 className="text-subtitle-18-sb tracking-tightest">{isCreating ? "프로필 등록" : "프로필 관리"}</h1>
        </div>

        {/* White pet summary card */}
        <div className="rounded-[20px] bg-white px-5 py-6">
          <div className="flex items-center">
            {/* Left: avatar + name */}
            <div className="flex max-md:max-w-[80px] md:w-[110px] max-md:ml-4 shrink-0 flex-col items-center">
              <PetAvatar
                size={64}
                editSize={20}
                imageUrl={profileImageUrl}
                onEditClick={() => fileInputRef.current?.click()}
                uploading={isUploadingImage}
              />
              <p className="mt-2 text-subtitle-16-b text-[var(--color-text)]">{getProfileDisplayName(petName)}</p>
            </div>
            {/* Vertical divider */}
            <div className="mx-2 max-md:mx-6 h-[97px] w-px shrink-0 self-center bg-[var(--color-text-muted)]" />
            {/* Right: subscription info */}
            <div className="min-w-0 flex-1 self-center">
              {subscription ? (
                <div className="flex flex-col items-start gap-2">
                  <span
                    className="inline-flex rounded-full px-3 py-[3px] text-body-14-sb text-white"
                    style={{ background: subscriptionPlanTheme?.colorVar }}
                  >
                    {subscriptionPlanTheme?.tier}
                  </span>
                  <div>
                    <p className="text-body-14-sb tracking-tightest text-[var(--color-text-emphasis)]">
                      {subscription.plan.name} 구독중
                    </p>
                    <p className="mt-0.5 text-body-14-m text-[var(--color-text-label)]">
                      {subscription.nextBillingDate.replace(/-/g, ".")} ~
                    </p>
                    <p className="text-body-14-m text-[var(--color-text-label)]">
                      결제일 : 매달 {parseInt(subscription.nextBillingDate.slice(8, 10), 10)}일
                    </p>
                  </div>
                  <Link
                    href="/mypage/subscription"
                    className="text-body-14-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
                  >
                    구독 변경
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-body-14-m text-[var(--color-text-secondary)]">아직 구독 정보가 없어요.</p>
                  <Link
                    href="/subscribe"
                    className="text-body-14-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
                  >
                    구독 시작
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {imageError && <p className="mt-3 text-center text-caption-12-m text-[var(--color-accent-rust)]">{imageError}</p>}
      </div>

      {/* Profile info card */}
      <div className="px-6 pt-6">
        <div className="rounded-[20px] bg-[var(--color-surface-warm)] px-6 py-6">
          <h2 className="text-subtitle-16-b tracking-tightest text-[var(--color-text)]">프로필 정보</h2>

          {/* Dog fields */}
          <div className="mt-5 flex flex-col gap-4">
            <FieldShell id="m-name" label="강아지 이름" mobile>
              <BaseInput
                id="m-name"
                type="text"
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                placeholder="이름을 입력해주세요"
                className="!h-8 !border-0"
              />
            </FieldShell>
            <FieldShell id="m-breed" label="강아지 품종" mobile>
              <BreedCombobox
                id="m-breed"
                value={breed}
                onChange={setBreed}
                placeholder="품종 선택"
                className="min-w-0 w-full"
                inputClassName="!h-8 !border-0"
              />
            </FieldShell>
            <FieldShell id="m-weight" label="몸무게" mobile>
              <BaseInput
                id="m-weight"
                type="text"
                inputMode="decimal"
                value={formatWeightInput(weight, isWeightFocused)}
                onFocus={() => setIsWeightFocused(true)}
                onBlur={() => setIsWeightFocused(false)}
                onChange={(event) => setWeight(sanitizeWeightInput(event.target.value))}
                placeholder="예) 8"
                className="!h-8 !border-0"
              />
            </FieldShell>
            <FieldShell id="m-birth" label="생년월일" mobile>
              <DatePicker
                id="m-birth"
                value={birthDateToValue(birthDate)}
                onChange={(date) => {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  setBirthDate(`${y}-${m}-${d}`);
                }}
                placeholder="생년월일 선택"
                formatDisplay={formatBirthDateDisplayDots}
                triggerClassName="!h-8 !rounded-[4px] !border-0 !bg-white !px-3 hover:!border-0 !text-body-13-m [&>span]:!text-body-13-m [&>span]:!font-medium [&>span]:!tracking-normal"
              />
            </FieldShell>
            <FieldShell label="성별" mobile>
              <GenderButtons gender={gender} onChange={setGender} />
            </FieldShell>
            <FieldShell id="m-feature" label="특징" mobile>
              <BaseInput
                id="m-feature"
                type="text"
                value={specialNotes}
                onChange={(event) => setSpecialNotes(event.target.value)}
                placeholder={SPECIAL_NOTES_PLACEHOLDER}
                maxLength={SPECIAL_NOTES_MAX_LENGTH}
                className="!h-8 !border-0"
              />
            </FieldShell>
          </div>
        </div>
      </div>

      {saveError && <p className="mt-4 px-6 text-center text-body-13-m text-[var(--color-accent-rust)]">{saveError}</p>}

      {/* Bottom buttons */}
      <div className="mt-6 flex gap-3 px-6 pb-10">
        {!isCreating && (
          <button
            type="button"
            onClick={handleDeleteProfile}
            disabled={isPending || isUploadingImage || isDeleting}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80 disabled:opacity-60"
          >
            {isDeleting ? "삭제 중..." : "프로필 삭제"}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isUploadingImage || isDeleting}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "확인"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_IMAGE}
        className="sr-only"
        aria-label="프로필 이미지 파일 선택"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleProfileImageSelected(file);
        }}
      />
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
