import Link from "next/link";
import { Text } from "@/shared/ui";
import { ChevronRightIcon } from "./mypage-icons";
import type { ChecklistQuestion, Profile } from "@/features/profile/api/types";

function fmtDate(d: string | null | undefined): string {
  return d ? d.slice(0, 10).replace(/-/g, ".") : "-";
}

function fmtGender(g: "male" | "female" | null | undefined): string {
  if (g === "male") return "남자";
  if (g === "female") return "여자";
  return "-";
}

/** ProfileInfoList 위에 dim+blur 오버레이로 CTA를 띄우는 래퍼 */
function ChecklistDimOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-w-0 flex-1 md:flex md:h-full md:items-center">
      {children}
      <div className="absolute inset-0 rounded-[12px] backdrop-blur-[3px]" style={{ background: "rgba(255,255,255,0.72)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <Text variant="body-16-m" className="font-semibold text-[var(--color-text-emphasis)] md:max-w-[279px] md:leading-[19px] md:tracking-[-0.04em]">
          우리 아이 맞춤 간식을 위해
          <br />
          체크리스트를 작성해주세요.
        </Text>
        <Link
          href="/checklist"
          className="inline-flex h-[36px] items-center rounded-full bg-[var(--color-accent)] px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 md:h-[24px] md:rounded-[4px] md:px-2 md:text-body-13-m"
        >
          체크리스트 작성하기
        </Link>
      </div>
    </div>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.5205 6.42383C21.945 6.46921 22.2837 6.66391 22.5527 6.86914C22.837 7.08606 23.1418 7.39377 23.4551 7.70703L24.626 8.87891L24.6475 8.89941L24.6562 8.91016C24.9589 9.21268 25.254 9.50624 25.4639 9.78125C25.6984 10.0886 25.9189 10.4864 25.9189 11C25.9189 11.5136 25.6984 11.9114 25.4639 12.2188C25.2469 12.5031 24.9393 12.8078 24.626 13.1211L14.4326 23.3154C14.2755 23.4725 14.0713 23.6886 13.8076 23.8379C13.5439 23.9872 13.2536 24.0506 13.0381 24.1045L9.05078 25.1016C8.90291 25.1385 8.6815 25.1968 8.4873 25.2158C8.28067 25.236 7.82868 25.2425 7.45996 24.874C7.09145 24.5055 7.09798 24.0536 7.11816 23.8467C7.13717 23.6523 7.19545 23.4301 7.23242 23.2822L8.22852 19.2949C8.2824 19.0794 8.34678 18.7891 8.49609 18.5254L8.61816 18.3389C8.74905 18.1631 8.8998 18.0191 9.01758 17.9014L19.2119 7.70703C19.5253 7.39369 19.8299 7.08607 20.1143 6.86914C20.4216 6.63466 20.8195 6.41416 21.333 6.41406L21.5205 6.42383Z" stroke="#999999" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 9.00065L22 6.33398L26 10.334L23.3333 14.334L18 9.00065Z" fill="#999999" />
    </svg>
  );
}

function PetAvatar({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="relative shrink-0">
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
            <svg
              className="h-12 w-12 shrink-0 md:h-16 md:w-16"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M37.2785 37.1373C34.5293 36.2292 29.4393 36.2693 26.7858 37.1139C24.1808 37.9418 22.587 40.5692 22.9069 43.7334C23.054 45.3339 23.6124 46.7856 24.4207 48.0884C25.7689 50.4181 27.567 52.1842 29.7678 53.3181L29.7649 64C25.1334 63.8512 19.5793 63.0969 15.4461 60.4477C11.3073 58.0495 8.72806 53.579 8.15965 48.1904C7.5941 42.8236 8.1825 37.5086 9.75634 32.3876L13.9066 18.8726C16.4144 10.7011 19.6935 2.31382 27.7441 0.484171C30.5833 -0.16139 33.4182 -0.16139 36.2574 0.484171C44.2637 2.30546 47.557 10.6175 50.0563 18.7505L54.2451 32.3859C55.8332 37.5537 56.4188 42.9223 55.8218 48.3376C55.2334 53.666 52.647 58.0712 48.5567 60.4477C44.4265 63.0969 38.8666 63.8512 34.2379 64L34.2351 53.3198C36.4345 52.1842 38.234 50.4181 39.5821 48.0901C40.419 46.7388 40.9903 45.2336 41.1089 43.5645C41.3502 40.5223 39.8349 37.9819 37.2799 37.139L37.2785 37.1373ZM24.3736 29.4809C26.2131 29.6197 27.5141 27.882 27.4856 25.9654C27.457 24.0823 26.1517 22.4985 24.4464 22.5804C22.844 22.6573 21.6844 24.1843 21.6501 25.947C21.6158 27.7098 22.6884 29.3521 24.3736 29.4792V29.4809ZM39.1951 29.5043C41.0589 29.6598 42.3871 27.9055 42.3514 25.9454C42.3157 23.9853 40.9917 22.455 39.2651 22.5537C37.667 22.6456 36.5044 24.186 36.4702 25.9403C36.4359 27.6947 37.5084 29.3621 39.1951 29.5026V29.5043Z"
                fill="white"
              />
              <path
                d="M5.91505 29.3653C3.36291 29.5175 0.745087 28.1294 0.106697 25.1508C-0.498845 22.321 1.61198 17.7519 2.94161 15.3687C5.23524 11.2562 10.9036 2.34373 15.7665 3.22176C12.6403 8.00159 11.2307 12.1024 9.50831 17.6967L5.91505 29.367V29.3653Z"
                fill="white"
              />
              <path
                d="M63.9001 25.0837C63.2645 28.1743 60.6053 29.519 58.0803 29.3601L54.4528 17.5694C52.7604 12.0688 51.3536 8.00139 48.2402 3.22992C53.0603 2.33182 58.7287 11.1824 61.058 15.3685C62.3319 17.658 64.4842 22.2455 63.9015 25.0837H63.9001Z"
                fill="white"
              />
              <path
                d="M36.5476 42.4958C37.5173 43.5829 33.4227 49.7157 31.1891 48.3326C29.4939 47.2823 28.09 45.6701 27.4044 43.5645C27.3216 43.3086 27.3016 42.7818 27.4002 42.5911C28.0086 41.417 35.5835 41.417 36.5476 42.4974V42.4958Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </div>
      <Link
        href="/mypage/profile"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] transition-opacity hover:opacity-90 md:h-[40px] md:w-[40px]"
      >
        <PencilIcon className="h-5 w-5 md:h-8 md:w-8" />
      </Link>
    </div>
  );
}

interface ProfileSummaryItem {
  label: string;
  value: string;
  href?: string;
}

function ProfileInfoList({
  attributes,
  mobile = false,
}: {
  attributes: ProfileSummaryItem[];
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "mt-4 border-t border-[var(--color-divider-warm)] pt-2"
          : "min-w-0 flex h-[124px] flex-1 flex-col justify-between pl-7"
      }
    >
      {attributes.map((attr, index) => (
        <div
          key={`${attr.label}-${index}`}
          className={mobile ? "flex items-center justify-between gap-3 py-2.5" : "flex items-center justify-between gap-3 py-0"}
        >
          <Text variant="body-13-r" className="font-medium text-[var(--color-text-secondary)]">
            {attr.label}
          </Text>
          {attr.href ? (
            <Link
              href={attr.href}
              aria-label={`${attr.label} 수정하기`}
              className="flex min-w-0 max-w-[180px] items-center gap-1.5 text-[var(--color-text-secondary)] transition-opacity hover:opacity-80 md:max-w-[190px]"
            >
              <span className="min-w-0 flex-1" title={attr.value}>
                <Text variant="body-13-r" className="block truncate text-right font-semibold text-[var(--color-text)]">
                  {attr.value}
                </Text>
              </span>
              <PencilIcon className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <div className="flex min-w-0 max-w-[180px] items-center gap-1.5 text-[var(--color-text-secondary)] md:max-w-[190px]">
              <span className="min-w-0 flex-1" title={attr.value}>
                <Text variant="body-13-r" className="block truncate text-right font-semibold text-[var(--color-text)]">
                  {attr.value}
                </Text>
              </span>
              <PencilIcon className="h-4 w-4 shrink-0" />
            </div>
          )}
        </div>
      ))}
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

function buildChecklistSummary(
  profile: Profile | null,
  checklistQuestions: ChecklistQuestion[],
): ProfileSummaryItem[] {
  const sourceQuestions = checklistQuestions.length
    ? checklistQuestions.slice(0, 4)
    : [
        { id: 0, text: "체크리스트 항목 1", description: null, isMultiSelect: false, sortOrder: 0, options: [] },
        { id: -1, text: "체크리스트 항목 2", description: null, isMultiSelect: false, sortOrder: 1, options: [] },
        { id: -2, text: "체크리스트 항목 3", description: null, isMultiSelect: false, sortOrder: 2, options: [] },
        { id: -3, text: "체크리스트 항목 4", description: null, isMultiSelect: false, sortOrder: 3, options: [] },
      ];

  return sourceQuestions.map((question) => ({
    label: question.text,
    value: summarizeChecklistValue(profile, question.id),
    href: question.id > 0 ? `/checklist?editQuestionId=${question.id}&returnTo=mypage` : undefined,
  }));
}

export function ProfileSection({
  profile,
  checklistQuestions,
}: {
  profile: Profile | null;
  checklistQuestions: ChecklistQuestion[];
}) {
  const hasProfile = Boolean(profile?.name);
  const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;

  const displayName = profile?.name ?? "닉네임#1234";
  const birth = fmtDate(profile?.birthDate);
  const gender = fmtGender(profile?.gender);
  const weight = profile?.weight ? `${profile.weight}kg` : "-";

  const attributes = buildChecklistSummary(profile, checklistQuestions);

  return (
    <section className="pt-6 md:pt-7">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
        <div className="rounded-[20px] bg-white max-md:px-7 max-md:py-7 md:h-[204px] md:overflow-hidden md:px-7 md:py-[26px] shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
          <div className="flex flex-col gap-4 md:h-full md:flex-row md:items-stretch md:gap-0">
            <div className="relative flex min-w-0 flex-1 items-start gap-5 md:min-h-0 md:items-center md:gap-8 md:self-stretch">
              <Link
                href="/mypage/profile"
                className="max-md:hidden absolute top-3 right-2 z-10 inline-flex shrink-0 items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
              >
                <span>정보변경</span>
                <ChevronRightIcon />
              </Link>
              <PetAvatar imageUrl={profile?.profileImageUrl ?? null} />
              <div className="min-w-0 flex-1 md:pr-[84px]">
                <div className="flex items-start justify-between gap-3">
                  <Text
                    as="h1"
                    variant="title-24-b"
                    mobileVariant="subtitle-18-b"
                    className="min-w-0 text-[var(--color-text)]"
                  >
                    {displayName}
                  </Text>
                  <Link
                    href="/mypage/profile"
                    className="inline-flex shrink-0 items-center gap-0.5 text-body-13-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80 md:hidden"
                  >
                    <span>정보변경</span>
                    <ChevronRightIcon />
                  </Link>
                </div>
                {hasProfile ? (
                  <>
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="mt-3 text-[var(--color-text-secondary)] md:mt-[11px]">
                      {birth} &nbsp;|&nbsp; {gender} &nbsp;|&nbsp; {weight}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="mt-1 text-[var(--color-text-placeholder)] md:mt-[11px]">
                      생년월일 &nbsp;|&nbsp; 성별 &nbsp;|&nbsp; 몸무게
                    </Text>
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="mt-2 text-[var(--color-text-label)]">
                      정보를 입력해주세요.
                    </Text>
                  </>
                )}
              </div>
            </div>

            <div className="max-md:hidden mx-[20px] h-[149px] w-px self-center bg-[var(--color-text-muted)]" />
            <div className="max-md:hidden flex min-w-0 flex-1 items-center md:w-[318px] md:flex-none md:self-center">
              {hasChecklist ? (
                <div className="flex h-[151px] w-full items-center">
                  <ProfileInfoList attributes={attributes} />
                </div>
              ) : (
                <div className="h-[151px] w-full">
                  <ChecklistDimOverlay>
                    <ProfileInfoList attributes={attributes} />
                  </ChecklistDimOverlay>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            {hasChecklist ? (
              <ProfileInfoList attributes={attributes} mobile />
            ) : (
              <ChecklistDimOverlay>
                <ProfileInfoList attributes={attributes} mobile />
              </ChecklistDimOverlay>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
