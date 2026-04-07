import Link from "next/link";
import { Text } from "@/shared/ui";
import { ChevronRightIcon } from "./mypage-icons";
import { PET } from "./mypage-mock";

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.001 3.57031C10.4206 3.36246 10.9134 3.36239 11.333 3.57031C11.572 3.68883 11.7765 3.90251 12.0205 4.14648C12.2645 4.39049 12.4782 4.59493 12.5967 4.83398C12.8046 5.2536 12.8046 5.7464 12.5967 6.16602C12.4782 6.40507 12.2645 6.60951 12.0205 6.85352L7.41211 11.4619C7.23624 11.6378 7.08551 11.7942 6.89453 11.9023C6.70366 12.0104 6.49207 12.0589 6.25098 12.1191L4.92969 12.4492C4.7655 12.4903 4.58702 12.5362 4.43848 12.5508C4.28379 12.5659 4.02286 12.5628 3.81348 12.3535C3.60421 12.1443 3.60014 11.8833 3.61523 11.7285C3.62975 11.5801 3.67577 11.4014 3.7168 11.2373L4.04688 9.91602C4.10719 9.67476 4.15654 9.46343 4.26465 9.27246C4.37279 9.08146 4.5292 8.93076 4.70508 8.75488L9.31348 4.14648C9.55748 3.90247 9.76193 3.68877 10.001 3.57031Z"
        stroke="var(--color-text-secondary)"
        strokeLinecap="round"
      />
      <path d="M9 4.50033L11 3.16699L13 5.16699L11.6667 7.16699L9 4.50033Z" fill="var(--color-text-secondary)" />
    </svg>
  );
}

function PetAvatar() {
  return (
    <div className="relative shrink-0">
      <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)] md:h-[124px] md:w-[124px]">
        <div className="absolute inset-0 rounded-full bg-[var(--color-secondary)]" />
        <div className="absolute inset-[6px] rounded-full bg-[var(--color-premium-light)] opacity-55" />
        <svg
          viewBox="0 0 86 86"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle cx="43" cy="43" r="43" fill="#F5C84B" />
          <path
            d="M27 32C27 24 33 18 40 18C46 18 51 22 54 27C56 22 61 18 68 18C75 18 80 24 80 32C80 42 73 48 66 52L61 41L54 38L47 41L34 52C31 46 27 40 27 32Z"
            fill="#B77246"
            opacity="0.95"
          />
          <ellipse cx="43" cy="48" rx="22" ry="24" fill="#FFF8F0" />
          <ellipse cx="35" cy="44" rx="6" ry="8" fill="#B77246" />
          <circle cx="37" cy="43" r="2.3" fill="#2B2B2B" />
          <circle cx="54" cy="43" r="2.3" fill="#2B2B2B" />
          <ellipse cx="46" cy="52" rx="6" ry="5" fill="#2B2B2B" />
          <path d="M43 52v4" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M39 58c2.2 1.8 8.8 1.8 11 0"
            stroke="#2B2B2B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] md:h-[40px] md:w-[40px]"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

function ProfileInfoList({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={
        mobile
          ? "mt-4 border-t border-[var(--color-divider-warm)] pt-2"
          : "min-w-0 flex-1 pl-8"
      }
    >
      {PET.attributes.map((attr) => (
        <div
          key={attr.label}
          className="flex items-center justify-between gap-3 py-2.5"
        >
          <Text
            variant="body-13-r"
            className="font-medium text-[var(--color-text-secondary)]"
          >
            {attr.label}
          </Text>
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Text
              variant="body-13-r"
              className="text-right font-semibold text-[var(--color-text)]"
            >
              {attr.value}
            </Text>
            <PencilIcon />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSection() {
  return (
    <section className="pt-6 md:pt-7">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-0">
        <div className="rounded-[20px] bg-white max-md:px-7 max-md:py-7 md:px-7 md:py-6 shadow-[0_8px_30px_rgba(185,148,116,0.06)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0">
            <div className="flex min-w-0 flex-1 items-start gap-5 md:items-center md:gap-4 md:pr-8">
              <PetAvatar />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Text
                    as="h1"
                    variant="title-24-b"
                    mobileVariant="subtitle-18-b"
                    className="text-[var(--color-text)]"
                  >
                    {PET.name}
                  </Text>
                  {/* 데스크톱: 프로필 관리 */}
                  <Link
                    href="/mypage/profile"
                    className="max-md:hidden inline-flex shrink-0 items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
                  >
                    <span>프로필 관리</span>
                    <ChevronRightIcon />
                  </Link>
                  {/* 모바일: 정보변경 */}
                  <Link
                    href="/mypage/profile"
                    className="max-md:inline-flex md:hidden shrink-0 items-center gap-0.5 text-body-13-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
                  >
                    <span>정보변경</span>
                    <ChevronRightIcon />
                  </Link>
                </div>
                <Text
                  variant="body-16-m"
                  mobileVariant="body-13-r"
                  className="mt-1 text-[var(--color-text-secondary)]"
                >
                  {PET.birth} &nbsp;|&nbsp; {PET.gender} &nbsp;|&nbsp; {PET.weight}
                </Text>
                <Text
                  variant="body-16-m"
                  mobileVariant="body-13-r"
                  className="mt-1 text-[var(--color-text-secondary)]"
                >
                  {PET.bio}
                </Text>
              </div>
            </div>

            {/* 데스크톱: 세로 구분선 */}
            <div className="max-md:hidden mx-4 w-px self-stretch bg-[var(--color-text-muted)]" />
            {/* 모바일: 가로 구분선 */}
            <div className="md:hidden h-px bg-[var(--color-divider-warm)]" />

            <div className="max-md:hidden flex min-w-0 flex-1 items-center">
              <ProfileInfoList />
            </div>
          </div>
          {/* 모바일: 속성 목록 */}
          <div className="md:hidden">
            <ProfileInfoList mobile />
          </div>
        </div>
      </div>
    </section>
  );
}
