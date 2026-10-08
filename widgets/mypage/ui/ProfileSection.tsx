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
      <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)] lg:ring-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            width={80}
            height={80}
          />
        ) : (
          <FallbackAvatar userId={userId} className="absolute inset-0 h-full w-full" />
        )}
      </div>
      <button
        type="button"
        onClick={onEditProfile}
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] transition-opacity hover:opacity-90 lg:h-[26px] lg:w-[26px] lg:bg-[var(--color-profile-edit-badge-bg)]"
      >
        <PencilIcon className="h-5 w-5" />
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

/** 모바일·태블릿 전용 체크리스트 요약 */
function ChecklistPanel({
  items,
  hasChecklist,
}: {
  items: ChecklistSummaryItem[];
  hasChecklist: boolean;
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const canCollapseOnMobile = items.length >= CHECKLIST_MOBILE_EXPAND_THRESHOLD;
  const isMobileExpanded = canCollapseOnMobile && mobileExpanded;
  const displayItems =
    canCollapseOnMobile && !isMobileExpanded
      ? items.slice(0, CHECKLIST_MOBILE_COLLAPSED_COUNT)
      : items;

  return (
    <div className="border-t border-[var(--color-divider-neutral)] pt-4">
      <div className="relative mb-4">
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
            className="absolute top-0 right-0 inline-flex shrink-0 items-center gap-0.5 text-body-13-m text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            <span>다시 작성하기</span>
            <ChevronRightIcon />
          </button>
        )}
      </div>

      <div className="relative rounded-[12px] bg-white px-6 py-5">
        <div
          className={[
            "flex flex-col gap-[14px]",
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
            <div className="absolute inset-0 rounded-[12px] bg-white backdrop-blur-[3px]" />
            <ChecklistEmptyPrompt className="absolute inset-0" />
          </>
        )}
      </div>
    </div>
  );
}

function ChecklistEmptyPrompt({ className }: { className?: string }) {
  return (
    <div className={["flex flex-col items-center justify-center gap-2 px-3 text-center", className].filter(Boolean).join(" ")}>
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
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-[var(--color-text-label)]">
      <path d="M7.2001 6.40039L9.6001 4.40039L7.2001 2.40039" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12.0416 6.4668C12.5553 7.35646 12.761 8.39075 12.6269 9.40925C12.4928 10.4278 12.0264 11.3736 11.3 12.1C10.5736 12.8264 9.62779 13.2928 8.60929 13.4269C7.59078 13.561 6.55649 13.3552 5.66683 12.8416C4.77717 12.3279 4.08185 11.5351 3.68872 10.586C3.2956 9.63689 3.22663 8.5846 3.49251 7.59231C3.75839 6.60002 4.34427 5.72319 5.15928 5.09781C5.97428 4.47244 6.97287 4.13346 8.00016 4.13346"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 데스크탑·와이드 전용 — 프로필 패널 하단 체크리스트 (패널 높이에 맞춰 늘어나고 목록은 내부 스크롤) */
function ChecklistPanelDesktop({
  items,
  hasChecklist,
}: {
  items: ChecklistSummaryItem[];
  hasChecklist: boolean;
}) {
  return (
    <>
      <div className="mt-7 flex min-h-[183px] flex-1 flex-col rounded-[12px] bg-[var(--color-surface-light)] pt-3 pr-2 pb-5 pl-5">
        <div className="flex h-6 items-center justify-between gap-2 pr-3">
          <Text as="h2" variant="body-14-sb-tight" className="tracking-normal text-[var(--color-text)]">
            체크리스트
          </Text>
          {hasChecklist && (
            <button
              type="button"
              onClick={() => openChecklistForm({ rewrite: true })}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[24px] border border-[var(--color-text-muted)] bg-white px-2 text-caption-12-m-tight text-[var(--color-text)] transition-opacity hover:opacity-80"
            >
              <RefreshIcon />
              <span>다시하기</span>
            </button>
          )}
        </div>
        <div className="mt-3 mr-3 h-px shrink-0 bg-[var(--color-text-muted)]" aria-hidden />

        {hasChecklist ? (
          <div className="scrollbar-checklist-summary mt-4 flex min-h-0 flex-1 basis-0 flex-col gap-[14px] overflow-y-auto">
            {items.map((item, i) => (
              <div key={`${item.label}-${i}`} className="flex shrink-0 items-center justify-between gap-3">
                <Text as="span" variant="caption-12-m-tight" className="min-w-0 shrink-0 truncate text-[var(--color-checklist-summary-label)]">
                  {item.label}
                </Text>
                <Text as="span" variant="caption-12-sb-tight" className="min-w-0 truncate text-right text-[var(--color-text)]">
                  {item.value}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <ChecklistEmptyPrompt className="mt-4 flex-1 pr-3" />
        )}
      </div>

      {hasChecklist && (
        <Link
          href="/checklist/result"
          className="mt-3 inline-flex h-6 shrink-0 items-center self-end rounded-[4px] bg-[var(--color-cta-button)] px-2 text-body-13-m text-white transition-opacity hover:opacity-80"
        >
          추천상품보기
        </Link>
      )}
    </>
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

function ExpandRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DesktopMetaDivider() {
  return <span className="h-[8.5px] w-px shrink-0 bg-[var(--color-text-secondary)]" aria-hidden />;
}

/** 데스크탑·와이드 전용 — 좌측 세로 프로필 패널 (높이는 우측 컬럼에 맞춰 stretch) */
function ProfileSectionDesktop({
  vm,
  checklistItems,
  hasChecklist,
}: {
  vm: ProfileViewModel;
  checklistItems: ChecklistSummaryItem[];
  hasChecklist: boolean;
}) {
  const metaClass = (empty: boolean) =>
    empty ? "text-[var(--color-profile-meta-empty)]" : "text-[var(--color-text)]";

  return (
    <div className="relative flex h-full flex-col rounded-[12px] bg-white px-5 pt-12 pb-6 max-lg:hidden">
      <button
        type="button"
        onClick={vm.onEditProfile}
        className="absolute top-[17px] right-3 inline-flex items-center gap-1 text-body-13-sb leading-[1.3] text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
      >
        <span>정보변경</span>
        <ExpandRightIcon />
      </button>

      <div className="flex flex-col items-center px-2 text-center">
        <PetAvatar imageUrl={vm.imageUrl} userId={vm.userId} onEditProfile={vm.onEditProfile} />

        <div className="mt-[30px] flex max-w-full min-w-0 items-center justify-center gap-3">
          <Text
            as="h1"
            variant="title-24-b"
            className="min-w-0 shrink truncate leading-[130%] text-[var(--color-text)]"
          >
            {vm.displayName}
          </Text>
          {vm.hasNamedProfile && <ProfileSwitchButton onClick={vm.onOpenProfileSwitch} />}
        </div>

        {(vm.hasProfile || vm.isInfluencer) && (
          <div className="mt-[11px] flex h-6 max-w-full min-w-0 items-center justify-center gap-2.5">
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
            {vm.isInfluencer && <MyPointButton />}
          </div>
        )}

        {vm.hasProfile ? (
          <>
            <div className="mt-[11px] flex items-center justify-center gap-3">
              <Text variant="body-16-m" className={`font-semibold leading-[140%] tracking-[-0.02em] ${metaClass(vm.birthEmpty)}`}>
                {vm.birthEmpty ? "생년월일" : vm.birth}
              </Text>
              <DesktopMetaDivider />
              <Text variant="body-16-m" className={`font-semibold leading-[140%] ${metaClass(vm.genderEmpty)}`}>
                {vm.genderEmpty ? "성별" : vm.gender}
              </Text>
              <DesktopMetaDivider />
              <Text variant="body-16-m" className={`font-semibold leading-[140%] ${metaClass(vm.weightEmpty)}`}>
                {vm.weightEmpty ? "몸무게" : vm.weight}
              </Text>
            </div>
            <Text
              variant="body-16-m"
              className={`mt-3 line-clamp-2 font-semibold leading-[140%] ${metaClass(!vm.specialNotes)}`}
            >
              {vm.specialNotes || "강아지의 특징을 입력해주세요."}
            </Text>
          </>
        ) : (
          <>
            <div className="mt-[11px] flex items-center justify-center gap-3 text-[var(--color-text-placeholder)]">
              <Text variant="body-16-m" className="leading-[140%]">
                생년월일
              </Text>
              <DesktopMetaDivider />
              <Text variant="body-16-m" className="leading-[140%]">
                성별
              </Text>
              <DesktopMetaDivider />
              <Text variant="body-16-m" className="leading-[140%]">
                몸무게
              </Text>
            </div>
            <Text variant="body-16-m" className="mt-3 leading-[140%] text-[var(--color-text-label)]">
              정보를 입력해주세요.
            </Text>
          </>
        )}
      </div>

      <ChecklistPanelDesktop items={checklistItems} hasChecklist={hasChecklist} />
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
    <section className="max-lg:pt-1 max-lg:pb-6 lg:h-full">
      <div className="mx-auto w-full max-lg:max-w-content max-lg:px-6 lg:h-full">
        <ProfileSectionMobile vm={vm} />
        <ProfileSectionDesktop vm={vm} checklistItems={checklistItems} hasChecklist={hasChecklist} />
        <div className="lg:hidden">
          <ChecklistPanel items={checklistItems} hasChecklist={hasChecklist} />
        </div>
      </div>
    </section>
  );
}
