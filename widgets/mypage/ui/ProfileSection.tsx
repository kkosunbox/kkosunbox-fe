"use client";

import { useState } from "react";
import Link from "next/link";
import { FallbackAvatar, Text, useModal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ChevronRightIcon } from "./mypage-icons";
import { useAuth } from "@/features/auth";
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

function PetAvatar({
  imageUrl,
  userId,
  onEditProfile,
}: {
  imageUrl: string | null;
  userId?: number | null;
  onEditProfile: () => void;
}) {
  return (
    <div className="relative shrink-0">
      <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)] lg:h-[124px] lg:w-[124px]">
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
          <FallbackAvatar userId={userId} className="absolute inset-0 h-full w-full" />
        )}
      </div>
      <button
        type="button"
        onClick={onEditProfile}
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] transition-opacity hover:opacity-90 lg:h-[40px] lg:w-[40px]"
      >
        <PencilIcon className="h-5 w-5 lg:h-8 lg:w-8" />
      </button>
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

/** 모바일·태블릿: 이 개수 이상이면 더보기/숨김 (스크롤 없음) */
const CHECKLIST_MOBILE_EXPAND_THRESHOLD = 9;
const CHECKLIST_MOBILE_COLLAPSED_COUNT = CHECKLIST_MOBILE_EXPAND_THRESHOLD - 1;

function ChecklistExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={expanded ? "rotate-180" : ""}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildChecklistSummary(
  profile: Profile | null,
  checklistQuestions: ChecklistQuestion[],
): ChecklistSummaryItem[] {
  const sourceQuestions = checklistQuestions.length
    ? checklistQuestions
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
  variant,
}: {
  items: ChecklistSummaryItem[];
  hasChecklist: boolean;
  variant: "mobile" | "desktop";
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isMobile = variant === "mobile";
  const canCollapseOnMobile = isMobile && items.length >= CHECKLIST_MOBILE_EXPAND_THRESHOLD;
  const isMobileExpanded = canCollapseOnMobile && mobileExpanded;
  const displayItems =
    canCollapseOnMobile && !isMobileExpanded
      ? items.slice(0, CHECKLIST_MOBILE_COLLAPSED_COUNT)
      : items;

  return (
    <div
      className={
        isMobile
          ? "border-t border-[var(--color-divider-neutral)] pt-4"
          : "flex flex-col justify-center"
      }
    >
      <div
        className={
          isMobile
            ? "relative mb-2.5"
            : "mb-2.5 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2">
          <Text as="h2" variant="body-14-sb-tight" className="text-[var(--color-text)]">
            체크리스트
          </Text>
          {hasChecklist && (
            <Link
              href="/checklist/result"
              className="inline-flex h-6 items-center rounded-[4px] bg-[var(--color-text)] px-2 text-body-13-m text-white transition-opacity hover:opacity-80"
            >
              추천상품보기
            </Link>
          )}
        </div>
        {hasChecklist && (
          <button
            type="button"
            onClick={() => openChecklistForm({ rewrite: true })}
            className={[
              "inline-flex shrink-0 items-center gap-0.5 text-body-13-m text-[var(--color-text-secondary)] transition-opacity hover:opacity-80",
              isMobile ? "absolute top-0 right-0" : "",
            ].join(" ")}
          >
            <span>다시 작성하기</span>
            <ChevronRightIcon />
          </button>
        )}
      </div>

      <div className="relative rounded-[12px] bg-white px-6 py-5 lg:h-[138px]">
        <div
          className={[
            "flex flex-col gap-[14px]",
            isMobile ? "" : "scrollbar-checklist-summary max-h-[98px] overflow-y-auto",
            hasChecklist ? "" : "pointer-events-none select-none opacity-0",
          ].join(" ")}
          aria-hidden={!hasChecklist}
        >
          {displayItems.map((item, i) => (
            <div key={`${item.label}-${i}`} className="flex items-center justify-between gap-3">
              <Text as="span" variant="caption-12-m-tight" className="min-w-0 shrink-0 truncate text-[var(--color-text-label)]">
                {item.label}
              </Text>
              <Text as="span" variant="caption-12-sb-tight" className="min-w-0 truncate text-right text-[var(--color-text)]">
                {item.value}
              </Text>
            </div>
          ))}
        </div>

        {canCollapseOnMobile && hasChecklist && (
          <button
            type="button"
            aria-expanded={isMobileExpanded}
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="mt-3 flex w-full items-center justify-center gap-0.5 text-body-13-m text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            <span>{isMobileExpanded ? "숨김" : "질문 더보기"}</span>
            <ChecklistExpandChevron expanded={isMobileExpanded} />
          </button>
        )}

        {!hasChecklist && (
          <>
            <div className="absolute inset-0 rounded-[12px] bg-[var(--color-checklist-fallback-bg)] backdrop-blur-[3px]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
              <Text variant="body-14-m" className="font-semibold leading-[1.5] text-[var(--color-text-emphasis)]">
                우리 아이 맞춤 간식을 위해
                <br />
                체크리스트를 작성해주세요.
              </Text>
              <button
                type="button"
                onClick={() => openChecklistForm()}
                className="inline-flex h-[28px] items-center rounded-[8px] bg-[var(--color-cta-button)] px-4 text-body-13-m text-white transition-opacity hover:opacity-90"
              >
                체크리스트 작성하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ProfileViewModel {
  imageUrl: string | null;
  userId?: number | null;
  displayName: string;
  hasProfile: boolean;
  hasNamedProfile: boolean;
  isInfluencer: boolean;
  breedDisplay: string;
  breedEmpty: boolean;
  birth: string;
  gender: string;
  weight: string;
  birthEmpty: boolean;
  genderEmpty: boolean;
  weightEmpty: boolean;
  specialNotes: string;
  onOpenProfileSwitch: () => void;
  onEditProfile: () => void;
}

function MyPointButton() {
  return (
    <Link
      href="/mypage/point"
      prefetch={false}
      className="inline-flex h-6 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-cta-button)] px-2 text-body-13-m text-white transition-opacity hover:opacity-80"
    >
      MY 포인트
    </Link>
  );
}

function ProfileSwitchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="프로필 변경"
      onClick={onClick}
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
  );
}

function ProfileMetaDivider() {
  return <span className="h-[8px] w-px shrink-0 bg-[var(--color-text-muted)]" aria-hidden />;
}

/** 모바일·태블릿 전용 — max-sm: 4줄 / sm~lg: 3줄 */
function ProfileSectionMobile({ vm }: { vm: ProfileViewModel }) {
  const specialLine = vm.hasProfile
    ? vm.specialNotes || "강아지의 특징을 입력해주세요."
    : "정보를 입력해주세요.";

  const breedMetaClass = [
    "min-w-0 shrink truncate leading-[140%]",
    vm.breedEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text-secondary)]",
  ].join(" ");

  const birthMetaClass = [
    "font-semibold leading-[140%] tracking-[-0.02em]",
    vm.birthEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
  ].join(" ");

  const genderMetaClass = [
    "font-semibold leading-[140%]",
    vm.genderEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
  ].join(" ");

  const weightMetaClass = [
    "font-semibold leading-[140%]",
    vm.weightEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
  ].join(" ");

  return (
    <div className="px-0 pt-7 pb-10 lg:hidden">
      <div className="mb-1 flex justify-end">
        <button
          type="button"
          onClick={vm.onEditProfile}
          className="inline-flex shrink-0 items-center gap-0.5 text-body-13-m text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
        >
          <span>정보변경</span>
          <ChevronRightIcon />
        </button>
      </div>

      <div className="flex items-center gap-5">
        <PetAvatar imageUrl={vm.imageUrl} userId={vm.userId} onEditProfile={vm.onEditProfile} />
        <div className="min-w-0 flex flex-1 flex-col gap-2">
          {/* 1줄: 이름 + 전환 (초소형·일반 공통) */}
          <div className="flex min-w-0 items-center justify-start gap-2">
            <Text
              as="h1"
              variant="title-24-b"
              mobileVariant="subtitle-18-b"
              className="min-w-0 shrink truncate leading-[130%] tracking-[-0.02em] text-[var(--color-text)]"
            >
              {vm.displayName}
            </Text>
            {vm.hasNamedProfile && <ProfileSwitchButton onClick={vm.onOpenProfileSwitch} />}
            {vm.isInfluencer && <MyPointButton />}
          </div>

          {vm.hasProfile ? (
            <>
              {/* 2줄: 품종 | 생일 */}
              <div className="flex min-w-0 items-center gap-1">
                <Text variant="body-16-m" mobileVariant="body-13-r" className={breedMetaClass}>
                  {vm.breedDisplay}
                </Text>
                <ProfileMetaDivider />
                <Text variant="body-16-m" mobileVariant="body-13-r" className={birthMetaClass}>
                  {vm.birthEmpty ? "생년월일" : vm.birth}
                </Text>
              </div>
              {/* 3줄: 성별 | 몸무게 */}
              <div className="flex min-w-0 items-center gap-1">
                <Text variant="body-16-m" mobileVariant="body-13-r" className={genderMetaClass}>
                  {vm.genderEmpty ? "성별" : vm.gender}
                </Text>
                <ProfileMetaDivider />
                <Text variant="body-16-m" mobileVariant="body-13-r" className={weightMetaClass}>
                  {vm.weightEmpty ? "몸무게" : vm.weight}
                </Text>
              </div>
            </>
          ) : (
            <>
              {/* 2줄: 견종 | 생년월일 */}
              <div className="flex min-w-0 items-center gap-1 text-[var(--color-text-placeholder)]">
                <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                  견종
                </Text>
                <ProfileMetaDivider />
                <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                  생년월일
                </Text>
              </div>
              {/* 3줄: 성별 | 몸무게 */}
              <div className="flex min-w-0 items-center gap-1 text-[var(--color-text-placeholder)]">
                <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                  성별
                </Text>
                <ProfileMetaDivider />
                <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
                  몸무게
                </Text>
              </div>
            </>
          )}

          {/* 마지막 줄: 특징 */}
          <Text
            variant="body-16-m"
            mobileVariant="body-13-r"
            className={[
              "line-clamp-2 font-semibold leading-[140%]",
              vm.hasProfile
                ? vm.specialNotes
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-profile-meta-empty)]"
                : "text-[var(--color-text-label)]",
            ].join(" ")}
          >
            {specialLine}
          </Text>
        </div>
      </div>
    </div>
  );
}

/** 데스크탑·와이드 전용 — 커밋 기준 레이아웃 유지 */
function ProfileSectionDesktop({
  vm,
  checklistItems,
  hasChecklist,
}: {
  vm: ProfileViewModel;
  checklistItems: ChecklistSummaryItem[];
  hasChecklist: boolean;
}) {
  return (
    <div className="relative hidden h-full pl-10 lg:flex lg:items-center lg:px-7 lg:py-[26px]">
      <div className="relative flex w-full items-center gap-0">
        {/* 구분선(h-148px) 상단과 맞춤 — 행 items-center 유지, 버튼만 절대 위치 */}
        <button
          type="button"
          onClick={vm.onEditProfile}
          className="absolute top-[calc(50%-74px)] right-[calc(358px+40px+0.5rem)] z-10 inline-flex shrink-0 items-center gap-1 text-body-14-m text-[var(--color-text-secondary)] transition-colors hover:opacity-80"
        >
          <span>정보변경</span>
          <ChevronRightIcon />
        </button>
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-8">
          <PetAvatar imageUrl={vm.imageUrl} userId={vm.userId} onEditProfile={vm.onEditProfile} />
          <div className="min-w-0 flex-1 pr-[84px]">
            <div className="flex flex-col gap-[12px]">
              <div className="flex min-w-0 items-center gap-3">
                <Text
                  as="h1"
                  variant="title-24-b"
                  className="min-w-0 shrink truncate leading-[130%] tracking-[-0.02em] text-[var(--color-text)]"
                >
                  {vm.displayName}
                </Text>
                {vm.hasNamedProfile && <ProfileSwitchButton onClick={vm.onOpenProfileSwitch} />}
                {vm.isInfluencer && <MyPointButton />}
              </div>
              {vm.hasProfile && (
                <Text
                  variant="body-16-m"
                  className={[
                    "min-w-0 truncate leading-[140%]",
                    vm.breedEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text-secondary)]",
                  ].join(" ")}
                >
                  {vm.breedDisplay}
                </Text>
              )}
            </div>
            {vm.hasProfile ? (
              <>
                <div className="mt-[10px] flex items-center gap-3">
                  <Text
                    variant="body-16-m"
                    className={[
                      "font-semibold leading-[140%] tracking-[-0.02em]",
                      vm.birthEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {vm.birthEmpty ? "생년월일" : vm.birth}
                  </Text>
                  <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                  <Text
                    variant="body-16-m"
                    className={[
                      "font-semibold leading-[140%]",
                      vm.genderEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {vm.genderEmpty ? "성별" : vm.gender}
                  </Text>
                  <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                  <Text
                    variant="body-16-m"
                    className={[
                      "font-semibold leading-[140%]",
                      vm.weightEmpty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {vm.weightEmpty ? "몸무게" : vm.weight}
                  </Text>
                </div>
                <Text
                  variant="body-16-m"
                  className={[
                    "mt-3 line-clamp-2 font-semibold leading-[140%]",
                    vm.specialNotes ? "text-[var(--color-text)]" : "text-[var(--color-profile-meta-empty)]",
                  ].join(" ")}
                >
                  {vm.specialNotes || "강아지의 특징을 입력해주세요."}
                </Text>
              </>
            ) : (
              <>
                <div className="mt-[10px] flex items-center gap-3 text-[var(--color-text-placeholder)]">
                  <Text variant="body-16-m" className="leading-[140%]">
                    생년월일
                  </Text>
                  <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                  <Text variant="body-16-m" className="leading-[140%]">
                    성별
                  </Text>
                  <span className="h-[8px] w-px bg-[var(--color-text-muted)]" aria-hidden />
                  <Text variant="body-16-m" className="leading-[140%]">
                    몸무게
                  </Text>
                </div>
                <Text variant="body-16-m" className="mt-2 text-[var(--color-text-label)]">
                  정보를 입력해주세요.
                </Text>
              </>
            )}
          </div>
        </div>

        <div className="mx-[20px] h-[148px] w-px bg-[var(--color-text-muted)]" />

        <div className="w-[358px] flex-none">
          <ChecklistPanel items={checklistItems} hasChecklist={hasChecklist} variant="desktop" />
        </div>
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
  const { user } = useAuth();
  const { profile: clientProfile, profiles } = useProfile();
  const { openModal } = useModal();
  const profile = clientProfile ?? serverProfile;

  const hasProfile = hasProfileRecord(profile);
  const hasNamedProfile = profiles.some((item) => Boolean(item.name?.trim())) || Boolean(profile?.name?.trim());
  const hasChecklist = hasChecklistAnswers(profile);

  const birth = fmtDate(profile?.birthDate);
  const gender = fmtGender(profile?.gender);
  const weight = profile?.weight ? `${profile.weight}kg` : "-";
  const breedTrimmed = profile?.breed?.trim() ?? "";

  const vm: ProfileViewModel = {
    imageUrl: profile?.profileImageUrl ?? null,
    userId: user?.id ?? null,
    displayName: getProfileDisplayName(profile?.name),
    hasProfile,
    hasNamedProfile,
    isInfluencer: user?.isInfluencer ?? false,
    breedDisplay: breedTrimmed || "견종",
    breedEmpty: !breedTrimmed,
    birth,
    gender,
    weight,
    birthEmpty: birth === "-",
    genderEmpty: gender === "-",
    weightEmpty: weight === "-",
    specialNotes: profile?.specialNotes?.trim() ?? "",
    onOpenProfileSwitch: () => openModal("profile-switch"),
    onEditProfile: () => {
      if (profile) openChecklistForm({ editProfile: true });
      else openChecklistForm();
    },
  };

  const checklistItems = buildChecklistSummary(profile, checklistQuestions);

  return (
    <section className="max-lg:pt-1 max-lg:pb-6 lg:h-[258px] lg:pt-3 lg:pb-3">
      <div className="mx-auto w-full max-w-content max-lg:px-6 lg:h-full lg:px-0">
        <ProfileSectionMobile vm={vm} />
        <ProfileSectionDesktop vm={vm} checklistItems={checklistItems} hasChecklist={hasChecklist} />
        <div className="lg:hidden">
          <ChecklistPanel items={checklistItems} hasChecklist={hasChecklist} variant="mobile" />
        </div>
      </div>
    </section>
  );
}
