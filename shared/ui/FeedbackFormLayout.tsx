import Link from "next/link";
import type { ReactNode } from "react";

interface FeedbackFormLayoutProps {
  title: string;
  backHref: string;
  introTitle: string;
  introDescription: ReactNode;
  children: ReactNode;
  action: ReactNode;
}

/** 문의·리뷰 작성 화면의 공통 제목, 안내 카드, 하단 액션 레이아웃. */
export default function FeedbackFormLayout({
  title,
  backHref,
  introTitle,
  introDescription,
  children,
  action,
}: FeedbackFormLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1240px] max-xl:px-6 xl:px-0">
      <Link
        href={backHref}
        className="mt-10 inline-flex h-[33px] items-center gap-2 max-md:mt-6"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M19 8L11 16L19 24"
            stroke="var(--color-text-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-[28px] font-semibold leading-[33px] tracking-[-0.04em] text-black max-md:text-[24px] max-md:leading-7">
          {title}
        </h1>
      </Link>

      <section className="mt-8 min-h-[525px] rounded-[12px] bg-[var(--color-surface-light)] p-8 max-md:mt-6 max-md:min-h-0 max-md:p-5">
        <h2 className="text-[18px] font-bold leading-[21px] tracking-[-0.04em] text-[var(--color-text)]">
          {introTitle}
        </h2>
        <div className="mt-5 text-[13px] font-medium leading-4 text-[var(--color-text)]">
          {introDescription}
        </div>
        {children}
      </section>

      <div className="flex justify-center pb-[73px] pt-11 max-md:pb-10 max-md:pt-8">
        {action}
      </div>
    </div>
  );
}
