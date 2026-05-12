"use client";

import Link from "next/link";
import { DefaultPetIcon, Text, useModal } from "@/shared/ui";
import { ChevronRightIcon } from "./mypage-icons";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { getProfileDisplayName } from "@/shared/config/profile";
import { hasChecklistAnswers, hasProfileRecord } from "@/features/profile/lib/profileStatus";
import type { ChecklistQuestion, Profile } from "@/features/profile/api/types";

function fmtDate(d: string | null | undefined): string {
  return d ? d.slice(0, 10).replace(/-/g, ".") : "-";
}

function fmtGender(g: "male" | "female" | null | undefined): string {
  if (g === "male") return "남자";
  if (g === "female") return "여자";
  return "-";
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function PetAvatar({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="relative shrink-0 md:pl-7">
      <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)] md:h-[124px] md:w-[124px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            width={124}
            height={124}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--color-secondary)]"
            aria-hidden
          >
            <DefaultPetIcon className="h-12 w-12 shrink-0 md:h-16 md:w-16" />
          </div>
        )}
      </div>
      <Link
        href="/mypage/dog-profile"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] transition-opacity hover:opacity-90 md:h-[40px] md:w-[40px]"
      >
        <PencilIcon className="h-5 w-5 md:h-8 md:w-8" />
      </Link>
    </div>
  );
}

function stripParentheticalSuffix(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function summarizeChecklistValue(profile: Profile | null, questionId: number): string {
  const answer = profile?.checklistAnswers.find((item) => item.questionId === questionId);
  if (!answer || answer.selectedOptions.length === 0) return "-";
  return answer.selectedOptions
    .map((option) => stripParentheticalSuffix(option.text) || option.text)
    .join(", ");
}

interface ChecklistSummaryItem {
  label: string;
  value: string;
}

function buildChecklistSummary(
  profile: Profile | null,
  checklistQuestions: ChecklistQuestion[],
): ChecklistSummaryItem[] {
  const sourceQuestions = checklistQuestions.length
    ? checklistQuestions.slice(0, 4)
    : [
        { id: 0, text: "체크리스트 항목 1", shortText: null, description: null, isMultiSelect: false, sortOrder: 0, options: [] },
        { id: -1, text: "체크리스트 항목 2", shortText: null, description: null, isMultiSelect: false, sortOrder: 1, options: [] },
        { id: -2, text: "체크리스트 항목 3", shortText: null, description: null, isMultiSelect: false, sortOrder: 2, options: [] },
        { id: -3, text: "체크리스트 항목 4", shortText: null, description: null, isMultiSelect: false, sortOrder: 3, options: [] },
      ];

  return sourceQuestions.map((question) => ({
    label: question.shortText ?? question.text,
    value: summarizeChecklistValue(profile, question.id),
  }));
}

function ChecklistPanel({
  items,
  hasChecklist,
  mobile = false,
}: {
  items: ChecklistSummaryItem[];
  hasChecklist: boolean;
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile ? "mt-4 pt-4 border-t border-[var(--color-divider-neutral)]" : "flex flex-col justify-center"
      }
    >
      <div className="mb-2.5 flex items-center justify-between">
        <Text variant="subtitle-16-b" className="tracking-tightest text-[var(--color-text)]">
          체크리스트
        </Text>
        {hasChecklist && (
          <Link
            href="/checklist?rewrite=1"
            className="flex items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            다시 작성하기
            <ChevronRightIcon />
          </Link>
        )}
      </div>

      <div className="relative rounded-[12px] bg-[var(--color-checklist-bg)] px-4 py-[10px]">
        <div
          className={[
            "flex flex-col gap-[14px]",
            hasChecklist ? "" : "pointer-events-none select-none opacity-0",
          ].join(" ")}
          aria-hidden={!hasChecklist}
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-[12px] font-medium leading-[14px] text-[var(--color-text-secondary)]">
                {item.label}
              </span>
              <span className="text-right text-[12px] font-semibold leading-[14px] text-[var(--color-text)]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {!hasChecklist && (
          <>
            <div
              className="absolute inset-0 rounded-[12px] bg-[var(--color-checklist-fallback-bg)] backdrop-blur-[3px]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
              <Text
                variant="body-14-m"
                className="font-semibold leading-[1.5] text-[var(--color-text-emphasis)]"
              >
                우리 아이 맞춤 간식을 위해
                <br />
                체크리스트를 작성해주세요.
              </Text>
              <Link
                href="/checklist"
                className="inline-flex h-[28px] items-center rounded-full bg-[var(--color-accent)] px-4 text-body-13-m text-white transition-opacity hover:opacity-90"
              >
                체크리스트 작성하기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ProfileSection({
  profile: serverProfile,
  checklistQuestions,
}: {
  profile: Profile | null;
  checklistQuestions: ChecklistQuestion[];
}) {
  const { profile: clientProfile, profiles } = useProfile();
  const { openModal } = useModal();
  const profile = clientProfile ?? serverProfile;

  const hasProfile = hasProfileRecord(profile);
  const hasNamedProfile = profiles.some((item) => Boolean(item.name?.trim())) || Boolean(profile?.name?.trim());
  const hasChecklist = hasChecklistAnswers(profile);

  const displayName = getProfileDisplayName(profile?.name);
  const birth = fmtDate(profile?.birthDate);
  const gender = fmtGender(profile?.gender);
  const weight = profile?.weight ? `${profile.weight}kg` : "-";
  const birthEmpty = birth === "-";
  const genderEmpty = gender === "-";
  const weightEmpty = weight === "-";
  const specialNotes = profile?.specialNotes?.trim() ?? "";
  const breedTrimmed = profile?.breed?.trim() ?? "";
  const breedEmpty = !breedTrimmed;
  const breedDisplay = breedEmpty ? "품종" : breedTrimmed;

  const checklistItems = buildChecklistSummary(profile, checklistQuestions);

  return (
    <section className="pt-6 md:pt-7">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
        <div className="relative rounded-[20px] bg-white max-md:px-7 max-md:py-7 md:px-7 md:py-[26px] shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
          <Link
            href="/mypage/dog-profile"
            className="md:hidden absolute top-[8px] right-4 z-10 inline-flex shrink-0 items-center gap-0.5 text-body-13-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            <span>정보변경</span>
            <ChevronRightIcon />
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">

            {/* 프로필 정보 (좌) */}
            <div className="relative flex min-w-0 flex-1 items-start gap-5 md:min-h-0 md:items-center md:gap-8 md:self-stretch">
              <Link
                href="/mypage/dog-profile"
                className="max-md:hidden absolute top-2 right-2 z-10 inline-flex shrink-0 items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] transition-colors hover:opacity-80"
              >
                <span>정보변경</span>
                <ChevronRightIcon />
              </Link>
              <PetAvatar imageUrl={profile?.profileImageUrl ?? null} />
              <div className="min-w-0 flex-1 md:pr-[84px]">
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Text
                      as="h1"
                      variant="title-24-b"
                      mobileVariant="subtitle-18-b"
                      className="min-w-0 shrink truncate leading-[130%] tracking-[-0.02em] text-[var(--color-text)]"
                    >
                      {displayName}
                    </Text>
                    {hasProfile && (
                      <Text
                        variant="body-16-m"
                        mobileVariant="body-13-r"
                        className={[
                          "min-w-0 max-w-[min(200px,40vw)] shrink translate-y-[2px] truncate leading-[140%]",
                          breedEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text-secondary)]",
                        ].join(" ")}
                      >
                        {breedDisplay}
                      </Text>
                    )}
                    {hasNamedProfile && (
                      <button
                        type="button"
                        aria-label="프로필 변경"
                        onClick={() => openModal("profile-switch")}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-border)] transition-opacity hover:opacity-80"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8.39922 7.33331L19.1992 7.33331M15.5992 11.0666L19.1992 7.33331L15.5992 3.59998M15.5992 16.6666L4.79922 16.6666M8.39922 12.9333L4.79922 16.6666L8.39922 20.4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {hasProfile ? (
                  <>
                    <div className="mt-3 flex items-center max-[374px]:gap-1 min-[375px]:gap-3 md:mt-[10px]">
                      <Text
                        variant="body-16-m"
                        mobileVariant="body-13-r"
                        className={[
                          "leading-[140%] tracking-[-0.02em]",
                          birthEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        {birthEmpty ? "생일" : birth}
                      </Text>
                      <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                      <Text
                        variant="body-16-m"
                        mobileVariant="body-13-r"
                        className={[
                          "leading-[140%]",
                          genderEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        {genderEmpty ? "성별" : gender}
                      </Text>
                      <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                      <Text
                        variant="body-16-m"
                        mobileVariant="body-13-r"
                        className={[
                          "leading-[140%]",
                          weightEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        {weightEmpty ? "몸무게" : weight}
                      </Text>
                    </div>
                    <Text
                      variant="body-16-m"
                      mobileVariant="body-13-r"
                      className={[
                        "mt-1 line-clamp-2 leading-[140%] md:mt-1",
                        specialNotes ? "text-[var(--color-text)]" : "text-[var(--color-profile-meta-empty)]",
                      ].join(" ")}
                    >
                      {specialNotes || "강아지의 특징을 입력해주세요."}
                    </Text>
                  </>
                ) : (
                  <>
                    <div className="mt-2.5 flex items-center gap-3 text-[var(--color-text-placeholder)] md:mt-[10px]">
                      <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                        생년월일
                      </Text>
                      <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                      <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                        성별
                      </Text>
                      <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                      <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                        몸무게
                      </Text>
                    </div>
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="mt-2 text-[var(--color-text-label)]">
                      정보를 입력해주세요.
                    </Text>
                  </>
                )}
              </div>
            </div>

            {/* 구분선 (데스크톱) */}
            <div className="max-md:hidden mx-[20px] w-px self-stretch bg-[var(--color-text-muted)]" />

            {/* 체크리스트 패널 (데스크톱) */}
            <div className="max-md:hidden md:w-[318px] md:flex-none md:self-center">
              <ChecklistPanel items={checklistItems} hasChecklist={hasChecklist} />
            </div>
          </div>

          {/* 체크리스트 패널 (모바일) */}
          <div className="md:hidden">
            <ChecklistPanel items={checklistItems} hasChecklist={hasChecklist} mobile />
          </div>
        </div>
      </div>
    </section>
  );
}
