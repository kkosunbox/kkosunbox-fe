"use client";

import { useEffect, useRef, useState, useTransition, type InputHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import type { DogGender, Profile } from "@/features/profile/api/types";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { DatePicker, useLoadingOverlay } from "@/shared/ui";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const MASKED_PASSWORD = "********";
const FEATURE_VALUE = "푸드퍼즐 간식을 좋아해요.";

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

interface ProfileManagementSectionProps {
  profile: Profile | null;
  userEmail: string;
  subscription: UserSubscriptionDto | null;
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.5 2.5L11.5 4.5M2 12l1.5-.5 8.5-8.5L9.5 1.5 1.5 10l.5 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  return (
    <div className="relative shrink-0">
      <div
        className="overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)]"
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
          <svg viewBox="0 0 86 86" className="h-full w-full" aria-hidden="true">
            <circle cx="43" cy="43" r="43" style={{ fill: "var(--color-cta-logo-bg)" }} />
            <path
              d="M27 32C27 24 33 18 40 18C46 18 51 22 54 27C56 22 61 18 68 18C75 18 80 24 80 32C80 42 73 48 66 52L61 41L54 38L47 41L34 52C31 46 27 40 27 32Z"
              style={{ fill: "var(--color-brown)" }}
              opacity="0.95"
            />
            <ellipse cx="43" cy="48" rx="22" ry="24" style={{ fill: "var(--color-surface-warm)" }} />
            <ellipse cx="35" cy="44" rx="6" ry="8" style={{ fill: "var(--color-brown)" }} />
            <circle cx="37" cy="43" r="2.3" style={{ fill: "var(--color-text)" }} />
            <circle cx="54" cy="43" r="2.3" style={{ fill: "var(--color-text)" }} />
            <ellipse cx="46" cy="52" rx="6" ry="5" style={{ fill: "var(--color-text)" }} />
            <path d="M43 52v4" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M39 58c2.2 1.8 8.8 1.8 11 0" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
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
          <PencilIcon />
        )}
      </button>
    </div>
  );
}

function SubscriptionSummary({ subscription }: { subscription: UserSubscriptionDto | null }) {
  if (!subscription) {
    return (
      <div className="text-center">
        <p className="text-body-13-m text-[var(--color-text-secondary)]">아직 구독 정보가 없어요.</p>
        <Link
          href="/subscribe"
          className="mt-2 inline-flex text-body-12-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          구독 시작
        </Link>
      </div>
    );
  }

  const planTheme = packageThemeForPlan(subscription.plan);

  return (
    <div className="text-center">
      <span
        className="inline-flex rounded-full px-[10px] py-[3px] text-body-12-m text-white"
        style={{ background: planTheme.colorVar }}
      >
        {planTheme.tier}
      </span>
      <p className="mt-3 text-subtitle-16-b text-[var(--color-text)]">{subscription.plan.name} 패키지 구독중</p>
      <p className="mt-1 text-body-13-r text-[var(--color-text-secondary)]">
        {subscription.nextBillingDate.replace(/-/g, ".")} -
      </p>
      <p className="mt-1 text-body-13-r text-[var(--color-text-secondary)]">결제일 : 매월 {parseInt(subscription.nextBillingDate.slice(8, 10), 10)}일</p>
      <Link
        href="/mypage/subscription"
        className="mt-3 inline-flex text-body-12-m text-[var(--color-accent)] underline underline-offset-2 transition-opacity hover:opacity-80"
      >
        구독 변경
      </Link>
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
    <div className={mobile ? "flex flex-col gap-2" : "grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-4 gap-y-2"}>
      <label
        htmlFor={id}
        className={mobile ? "text-body-13-m text-[var(--color-text)]" : "text-body-13-m text-[var(--color-text)]"}
      >
        {label}
      </label>
      {children}
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
      "flex h-9 flex-1 items-center justify-center rounded-[4px] border text-body-13-m transition-colors",
      gender === value
        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "border-[var(--color-divider-warm)] bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]",
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

function PasswordField({ inputId, mobile = false }: { inputId: string; mobile?: boolean }) {
  return (
    <div className={mobile ? "flex items-center gap-2" : "flex items-center gap-3"}>
      <BaseInput id={inputId} value={MASKED_PASSWORD} readOnly aria-label="비밀번호" className="flex-1" />
      <Link
        href="/mypage/password"
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent-soft)] px-3 text-body-12-m text-[var(--color-accent)] transition-opacity hover:opacity-90"
      >
        비밀번호 변경
      </Link>
    </div>
  );
}

export default function ProfileManagementSection({
  profile,
  userEmail,
  subscription,
}: ProfileManagementSectionProps) {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, start] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCreating = profile === null;

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(profile?.profileImageUrl ?? null);
  const [gender, setGender] = useState<DogGender | null>(profile?.gender ?? null);
  const [petName, setPetName] = useState(profile?.name ?? "");
  const [birthDate, setBirthDate] = useState(birthDateInputValue(profile?.birthDate));
  const [weight, setWeight] = useState(
    profile?.weight !== null && profile?.weight !== undefined ? String(profile.weight) : "",
  );
  const subscriptionPlanTheme = subscription ? packageThemeForPlan(subscription.plan) : null;

  useEffect(() => {
    setProfileImageUrl(profile?.profileImageUrl ?? null);
  }, [profile?.id, profile?.profileImageUrl]);

  function handleOpenWithdraw() {
    router.push("/mypage/withdraw");
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
    const trimmedWeight = weight.trim();
    const parsedWeight = trimmedWeight ? parseFloat(trimmedWeight) : NaN;
    if (trimmedWeight && Number.isNaN(parsedWeight)) {
      setSaveError("몸무게는 숫자로 입력해 주세요.");
      return;
    }

    showLoading("프로필을 저장하고 있습니다...");
    start(async () => {
      try {
        const body = {
          name: petName.trim() || undefined,
          birthDate: birthDate.trim() || undefined,
          weight: trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : undefined,
          ...(gender !== null ? { gender } : {}),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        };

        if (isCreating) {
          await createProfile(body);
        } else {
          await updateProfile(profile.id, body);
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
    <div className="max-md:hidden min-h-screen bg-[var(--color-background)] px-6 pb-16 pt-[84px]">
      <div className="mx-auto w-full max-w-[1014px]">
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
                <p className="mt-[13px] text-title-24-b text-[var(--color-text)]">{petName || "멍멍이"}</p>
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
                      {subscription.plan.name} 패키지 구독중
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

                <div className="mt-6 flex w-[389px] flex-col gap-4">
                  <div className="flex items-center">
                    <label htmlFor="d-email" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      이메일
                    </label>
                    <BaseInput
                      id="d-email"
                      type="email"
                      value={userEmail}
                      readOnly
                      className="h-8 !w-[220px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="d-password" className="w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]">
                      비밀번호
                    </label>
                    <div className="flex items-center gap-3">
                      <BaseInput
                        id="d-password"
                        value={MASKED_PASSWORD}
                        readOnly
                        aria-label="비밀번호"
                        className="h-8 !w-[220px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                      />
                      <Link
                        href="/mypage/password"
                        className="inline-flex h-8 w-[87px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent)] text-body-13-m text-white transition-opacity hover:opacity-90"
                      >
                        비밀번호 변경
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 h-px w-full bg-white" />

                <div className="mt-5 grid grid-cols-[290px_290px] gap-x-[34px] gap-y-4">
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
                      triggerClassName="!h-8 !w-[220px] !rounded-[4px] !border-0 !bg-white !px-3 hover:!border-0 !text-body-13-m"
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
                      value={weight}
                      onChange={(event) => setWeight(event.target.value)}
                      className="h-8 !w-[220px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
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
                            : "bg-[var(--color-ui-disabled)] text-[var(--color-text)]",
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
                            : "bg-[var(--color-ui-disabled)] text-[var(--color-text)]",
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
                      value={FEATURE_VALUE}
                      readOnly
                      className="h-8 !w-[544px] border-0 bg-white px-3 text-body-13-m text-[var(--color-text)]"
                    />
                  </div>
                </div>

                {saveError && <p className="mt-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{saveError}</p>}
              </section>

              <div className="mt-[28px] flex justify-end gap-[17px]">
                <button
                  type="button"
                  onClick={handleOpenWithdraw}
                  className="inline-flex h-9 w-[132px] items-center justify-center rounded-full bg-[var(--color-divider-warm)] text-body-14-sb text-white transition-opacity hover:opacity-80"
                >
                  회원 탈퇴
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || isUploadingImage}
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
    <div className="md:hidden bg-[var(--color-background)] px-5 pb-10 pt-6">
      <div className="mb-5 flex items-center gap-1 text-[var(--color-text)]">
        <Link
          href="/mypage"
          aria-label="마이페이지로 돌아가기"
          className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)]"
        >
          <BackIcon />
        </Link>
        <h1 className="text-subtitle-18-b tracking-tightest">{isCreating ? "프로필 등록" : "프로필 관리"}</h1>
      </div>

      <div className="rounded-[20px] bg-white p-5 shadow-[0_8px_30px_rgba(185,148,116,0.08)]">
        <div className="flex gap-4">
          <div className="flex w-[110px] shrink-0 flex-col items-center">
            <PetAvatar
              size={78}
              editSize={28}
              imageUrl={profileImageUrl}
              onEditClick={() => fileInputRef.current?.click()}
              uploading={isUploadingImage}
            />
            <p className="mt-3 text-subtitle-16-b text-[var(--color-text)]">{petName || "멍멍이"}</p>
          </div>
          <div className="min-w-0 flex-1 border-l border-[var(--color-divider-warm)] pl-4">
            <SubscriptionSummary subscription={subscription} />
          </div>
        </div>
        {imageError && <p className="mt-3 text-center text-body-12-m text-[var(--color-accent-rust)]">{imageError}</p>}

        <div className="mt-5 rounded-[16px] bg-[var(--color-background)] px-4 py-5">
          <h2 className="text-subtitle-16-b text-[var(--color-text)]">프로필 정보</h2>
          <div className="mt-4 flex flex-col gap-4">
            <FieldShell id="m-email" label="이메일" mobile>
              <BaseInput id="m-email" type="email" value={userEmail} readOnly />
            </FieldShell>
            <FieldShell id="m-password" label="비밀번호" mobile>
              <PasswordField inputId="m-password" mobile />
            </FieldShell>
            <FieldShell id="m-name" label="강아지 이름" mobile>
              <BaseInput
                id="m-name"
                type="text"
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                placeholder="이름을 입력해주세요"
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
                triggerClassName="!h-9 !rounded-[4px] !border !border-[var(--color-divider-warm)] !bg-white !px-3 hover:!border-[var(--color-primary)] !text-body-13-m"
              />
            </FieldShell>
            <FieldShell id="m-weight" label="몸무게" mobile>
              <BaseInput
                id="m-weight"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="예) 8"
              />
            </FieldShell>
            <FieldShell label="성별" mobile>
              <GenderButtons gender={gender} onChange={setGender} />
            </FieldShell>
            <FieldShell id="m-feature" label="특징" mobile>
              <BaseInput id="m-feature" type="text" value={FEATURE_VALUE} readOnly />
            </FieldShell>
          </div>
        </div>

        {saveError && <p className="mt-4 text-center text-body-13-m text-[var(--color-accent-rust)]">{saveError}</p>}

        <div className="mt-6 flex gap-3">
          <Link
            href="/mypage"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-body-14-sb text-[var(--color-text-secondary)]"
          >
            편집 취소
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || isUploadingImage}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white disabled:opacity-60"
          >
            {isPending ? "저장 중..." : "확인"}
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleOpenWithdraw}
            className="text-body-12-m text-[var(--color-text-secondary)] underline underline-offset-2"
          >
            회원 탈퇴
          </button>
        </div>
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
