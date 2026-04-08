"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { withdraw } from "@/features/auth/api";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import type { DogGender, Profile } from "@/features/profile/api/types";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { useModal } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api/types";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";

function birthDateInputValue(profileBirth: string | null | undefined): string {
  if (!profileBirth?.trim()) return "";
  const day = profileBirth.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

interface ProfileManagementSectionProps {
  profile: Profile | null;
  userEmail: string;
  subscription: UserSubscriptionDto | null;
}

/* ─── 공통 스타일 ─── */
const FIELD_INPUT_CLS =
  "h-8 flex-1 min-w-0 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none";
const FIELD_LABEL_CLS = "w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]";
const M_FIELD_LABEL_CLS = "w-[72px] shrink-0 text-body-13-m text-[var(--color-text)]";
const M_FIELD_INPUT_CLS =
  "h-8 flex-1 min-w-0 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none";

/* ─── 아이콘 ─── */
function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 2.5L11.5 4.5M2 12l1.5-.5 8.5-8.5L9.5 1.5 1.5 10l.5 2z"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/* ─── 프로필 아바타 ─── */
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
          // 사용자 프로필 CDN URL — 도메인 가변으로 next/image remotePatterns 미사용
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
            <path
              d="M43 52v4"
              stroke="var(--color-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M39 58c2.2 1.8 8.8 1.8 11 0"
              stroke="var(--color-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={onEditClick}
        disabled={disabled || uploading}
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] disabled:opacity-50"
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

/* ─── 구독 정보 블록 ─── */
function SubscriptionBlock({ subscription }: { subscription: UserSubscriptionDto | null }) {
  if (!subscription) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-body-14-m text-[var(--color-text-muted)]">구독 없음</p>
        <Link href="/subscribe"
          className="text-body-14-m text-[var(--color-accent)] underline transition-opacity hover:opacity-80">
          구독 시작하기
        </Link>
      </div>
    );
  }
  const day = parseInt(subscription.nextBillingDate.slice(8, 10), 10);
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="inline-flex items-center rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-14-sb text-white">
        {subscription.plan.name}
      </span>
      <p className="text-subtitle-16-sb tracking-tightest text-[var(--color-text)]">
        {subscription.plan.name} 구독중
      </p>
      <p className="text-body-16-m text-[var(--color-text-secondary)]">
        결제일 : 매월 {day}일
      </p>
      <Link href="/subscribe"
        className="text-body-14-m text-[var(--color-accent)] underline transition-opacity hover:opacity-80">
        구독 변경
      </Link>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function ProfileManagementSection({
  profile,
  userEmail,
  subscription,
}: ProfileManagementSectionProps) {
  const router = useRouter();
  const { openModal } = useModal();
  const { logout } = useAuth();
  const [isPending, start] = useTransition();

  function handleOpenWithdraw() {
    openModal("member-withdraw", () => {
      void withdraw({ reason: "사용자 요청" })
        .then(() => logout())
        .catch((e) => {
          const msg = e instanceof ApiError ? e.message : "탈퇴 처리에 실패했습니다.";
          alert(msg);
        });
    });
  }
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCreating = profile === null;

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    profile?.profileImageUrl ?? null,
  );

  /* ── 폼 상태 (프로필 기존값으로 초기화) ── */
  const [gender, setGender] = useState<DogGender | null>(profile?.gender ?? null);
  const [petName, setPetName] = useState(profile?.name ?? "");
  const [breed, setBreed] = useState(profile?.breed ?? "");
  const [birthDate, setBirthDate] = useState(birthDateInputValue(profile?.birthDate));
  const [weight, setWeight] = useState(
    profile?.weight !== null && profile?.weight !== undefined
      ? String(profile.weight)
      : ""
  );

  useEffect(() => {
    setProfileImageUrl(profile?.profileImageUrl ?? null);
  }, [profile?.id, profile?.profileImageUrl]);

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
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "이미지 업로드에 실패했습니다.";
      setImageError(msg);
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleSave() {
    setSaveError(null);
    start(async () => {
      try {
        const w = weight.trim();
        const parsedW = w ? parseFloat(w) : NaN;
        if (w && Number.isNaN(parsedW)) {
          setSaveError("몸무게는 숫자로 입력해 주세요.");
          return;
        }

        const body = {
          name: petName.trim() || undefined,
          breed: breed.trim() || undefined,
          birthDate: birthDate.trim() || undefined,
          weight: w && !Number.isNaN(parsedW) ? parsedW : undefined,
          ...(gender !== null ? { gender } : {}),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        };

        if (isCreating) {
          await createProfile(body);
        } else {
          await updateProfile(profile!.id, body);
        }

        router.push("/mypage");
        router.refresh();
      } catch (e) {
        setSaveError(
          e instanceof ApiError ? e.message : "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        );
      }
    });
  }

  const genderButtonClass = (g: DogGender) =>
    [
      "flex h-8 flex-1 items-center justify-center rounded-[4px] transition-colors",
      gender === g
        ? "bg-[var(--color-accent-soft)] text-body-13-sb text-[var(--color-accent)]"
        : gender === null
          ? "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text-secondary)]"
          : "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]",
    ].join(" ");

  /* ─── 모바일 레이아웃 ─── */
  const MobileLayout = (
    <div className="md:hidden">
      <div className="bg-[var(--color-background)] px-6 pb-8 pt-6">
        {/* 헤더 */}
        <div className="mb-5 flex items-center gap-2">
          <Link href="/mypage" aria-label="마이페이지로 돌아가기"
            className="flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-subtitle-18-sb tracking-tightest text-[var(--color-text)]">
            {isCreating ? "프로필 등록" : "프로필 관리"}
          </h1>
        </div>

        {/* 유저 카드 */}
        <div className="rounded-[20px] bg-white px-6 py-5">
          <div className="flex items-center">
            <div className="flex flex-1 flex-col items-center gap-2">
              <PetAvatar
                size={64}
                editSize={20}
                imageUrl={profileImageUrl}
                onEditClick={() => fileInputRef.current?.click()}
                uploading={isUploadingImage}
              />
              {imageError && (
                <p className="max-w-[140px] text-center text-body-12-m text-[var(--color-accent-rust)]">
                  {imageError}
                </p>
              )}
              <p className="text-subtitle-16-b text-[var(--color-text)]">{petName || "미입력"}</p>
            </div>
            <div className="mx-3 h-16 w-px bg-[var(--color-text-muted)]" />
            <div className="flex flex-1 flex-col gap-1.5">
              {subscription ? (
                <>
                  <span className="w-fit rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-14-sb text-white">
                    {subscription.plan.name}
                  </span>
                  <p className="text-body-14-sb tracking-tightest text-[var(--color-text)]">
                    {subscription.plan.name} 구독중
                  </p>
                </>
              ) : (
                <Link href="/subscribe" className="text-body-14-m text-[var(--color-accent)] underline">
                  구독 시작하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 폼 */}
      <div className="bg-white px-6 pb-10 pt-6">
        <div className="rounded-[20px] bg-[var(--color-background)] px-6 py-6">
          <h2 className="mb-4 text-subtitle-16-b text-[var(--color-text)]">프로필 정보</h2>
          <div className="flex flex-col gap-4">

            {/* 이메일 */}
            <div className="flex items-center gap-3">
              <label htmlFor="m-email" className={M_FIELD_LABEL_CLS}>이메일</label>
              <input id="m-email" type="email" value={userEmail} readOnly
                className={`${M_FIELD_INPUT_CLS} cursor-default opacity-60`} />
            </div>

            <div className="border-t border-white" />

            {/* 강아지 이름 */}
            <div className="flex items-center gap-3">
              <label htmlFor="m-petname" className={M_FIELD_LABEL_CLS}>강아지 이름</label>
              <input id="m-petname" type="text" value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className={M_FIELD_INPUT_CLS} />
            </div>

            {/* 견종 */}
            <div className="flex items-center gap-3">
              <label htmlFor="m-breed" className={M_FIELD_LABEL_CLS}>견종</label>
              <input id="m-breed" type="text" value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="견종을 입력해주세요"
                className={M_FIELD_INPUT_CLS} />
            </div>

            {/* 생년월일 */}
            <div className="flex items-center gap-3">
              <label htmlFor="m-birth" className={M_FIELD_LABEL_CLS}>생년월일</label>
              <input
                id="m-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="h-8 min-w-0 flex-1 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none"
              />
            </div>

            {/* 몸무게 */}
            <div className="flex items-center gap-3">
              <label htmlFor="m-weight" className={M_FIELD_LABEL_CLS}>몸무게(kg)</label>
              <input id="m-weight" type="text" inputMode="decimal" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="예) 5.5"
                className={M_FIELD_INPUT_CLS} />
            </div>

            {/* 성별 */}
            <div className="flex items-center gap-3">
              <span className={M_FIELD_LABEL_CLS}>성별</span>
              <div className="flex flex-1 gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)} className={genderButtonClass(g)}>
                    {g === "male" ? "남" : "여"}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {saveError && (
          <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>{saveError}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/mypage"
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-body-14-sb text-white transition-opacity hover:opacity-80">
            취소
          </Link>
          <button type="button" onClick={handleSave} disabled={isPending || isUploadingImage}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60">
            {isPending ? "저장 중..." : isCreating ? "프로필 등록" : "확인"}
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleOpenWithdraw}
            className="text-body-12-m text-[var(--color-text-secondary)] underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── 데스크톱 레이아웃 ─── */
  const DesktopLayout = (
    <div className="max-md:hidden min-h-screen bg-[var(--color-background)] py-10">
      <div className="mx-auto max-w-content md:px-0">
        <div className="rounded-[20px] bg-white md:px-8 md:py-8">

          {/* 헤더 */}
          <div className="mb-6 flex items-center gap-2">
            <Link href="/mypage" aria-label="마이페이지로 돌아가기"
              className="flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-title-24-sb tracking-tightest text-[var(--color-text)]">
              {isCreating ? "프로필 등록" : "프로필 관리"}
            </h1>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-0">

            {/* 왼쪽 패널 */}
            <div className="flex flex-col items-center md:w-[220px] md:shrink-0">
              <PetAvatar
                size={124}
                editSize={40}
                imageUrl={profileImageUrl}
                onEditClick={() => fileInputRef.current?.click()}
                uploading={isUploadingImage}
              />
              {imageError && (
                <p className="mt-2 max-w-[200px] text-center text-body-12-m text-[var(--color-accent-rust)]">
                  {imageError}
                </p>
              )}
              <p className="mt-3 text-title-24-b text-[var(--color-text)]">{petName || "미입력"}</p>
              <div className="my-5 w-[141px] border-t border-[var(--color-text-muted)]" />
              <SubscriptionBlock subscription={subscription} />
            </div>

            {/* 오른쪽 패널 */}
            <div className="flex-1 rounded-[20px] bg-[var(--color-background)] md:ml-8 md:px-7 md:py-7">
              <h2 className="mb-6 text-subtitle-18-b tracking-tightest text-[var(--color-text)]">프로필 정보</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* 이메일 */}
                <div className="flex items-center gap-4">
                  <label htmlFor="d-email" className={FIELD_LABEL_CLS}>이메일</label>
                  <input id="d-email" type="email" value={userEmail} readOnly
                    className={`${FIELD_INPUT_CLS} cursor-default opacity-60`} />
                </div>
                <div className="max-md:hidden" />

                <div className="border-t border-white md:col-span-2" />

                {/* 강아지 이름 */}
                <div className="flex items-center gap-4">
                  <label htmlFor="d-petname" className={FIELD_LABEL_CLS}>강아지 이름</label>
                  <input id="d-petname" type="text" value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="이름을 입력해주세요"
                    className={FIELD_INPUT_CLS} />
                </div>

                {/* 견종 */}
                <div className="flex items-center gap-4">
                  <label htmlFor="d-breed" className={FIELD_LABEL_CLS}>견종</label>
                  <input id="d-breed" type="text" value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="견종을 입력해주세요"
                    className={FIELD_INPUT_CLS} />
                </div>

                {/* 생년월일 */}
                <div className="flex items-center gap-4">
                  <label htmlFor="d-birth" className={FIELD_LABEL_CLS}>생년월일</label>
                  <input
                    id="d-birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none"
                  />
                </div>

                {/* 몸무게 */}
                <div className="flex items-center gap-4">
                  <label htmlFor="d-weight" className={FIELD_LABEL_CLS}>몸무게(kg)</label>
                  <input id="d-weight" type="text" inputMode="decimal" value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="예) 5.5"
                    className={FIELD_INPUT_CLS} />
                </div>

                {/* 성별 */}
                <div className="flex items-center gap-4">
                  <span className={FIELD_LABEL_CLS}>성별</span>
                  <div className="flex flex-1 gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g)} className={genderButtonClass(g)}>
                        {g === "male" ? "남" : "여"}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {saveError && (
            <p className="mt-4 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>{saveError}</p>
          )}

          <div className="mt-8 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={handleOpenWithdraw}
              className="self-center text-body-13-m text-[var(--color-text-secondary)] underline underline-offset-2 transition-opacity hover:opacity-80 md:self-auto"
            >
              회원 탈퇴
            </button>
            <div className="flex justify-end gap-3">
              <Link href="/mypage"
                className="flex h-11 w-[120px] items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-btn-15-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80">
                취소
              </Link>
              <button type="button" onClick={handleSave} disabled={isPending || isUploadingImage}
                className="flex h-11 w-[120px] items-center justify-center rounded-full bg-[var(--color-accent)] text-btn-15-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                {isPending ? "저장 중..." : isCreating ? "프로필 등록" : "확인"}
              </button>
            </div>
          </div>

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
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void handleProfileImageSelected(f);
        }}
      />
      {MobileLayout}
      {DesktopLayout}
    </>
  );
}
