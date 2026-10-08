"use client";

import { Text } from "@/shared/ui";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import type { Profile } from "@/features/profile/api/types";

/** 쿠폰·포인트 기능 미구현 — 디자인만 구현해 두고 노출하지 않는다. 기능 연동 시 true로 전환 */
const SHOW_REWARD_SUMMARY = false;

function TicketIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[var(--color-text)]">
      <path
        d="M17.7998 4C18.9199 4 19.4804 3.99979 19.9082 4.21777C20.2845 4.40951 20.5905 4.71554 20.7822 5.0918C21.0002 5.51962 21 6.08009 21 7.2002V9.76953C20.9998 9.89674 20.8967 9.99984 20.7695 10H20C18.8954 10 18 10.8954 18 12C18 13.1046 18.8954 14 20 14H20.7695C20.8967 14.0002 20.9998 14.1033 21 14.2305V16.7998C21 17.9199 21.0002 18.4804 20.7822 18.9082C20.5905 19.2845 20.2845 19.5905 19.9082 19.7822C19.4804 20.0002 18.9199 20 17.7998 20H6.2002C5.08009 20 4.51962 20.0002 4.0918 19.7822C3.71554 19.5905 3.40951 19.2845 3.21777 18.9082C2.99979 18.4804 3 17.9199 3 16.7998V14.2305C3.00016 14.1033 3.10326 14.0002 3.23047 14H4C5.10457 14 6 13.1046 6 12C6 10.8954 5.10457 10 4 10H3.23047C3.10326 9.99984 3.00016 9.89674 3 9.76953V7.2002C3 6.08009 2.99979 5.51962 3.21777 5.0918C3.40951 4.71554 3.71554 4.40951 4.0918 4.21777C4.51962 3.99979 5.08009 4 6.2002 4H17.7998Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M13 9V10M13 4V5M13 14V15M13 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[var(--color-text)]">
      <ellipse cx="12" cy="7" rx="7" ry="3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 13V17C5 18.6569 8.13401 20 12 20C15.866 20 19 18.6569 19 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 7V12C5 13.6569 8.13401 15 12 15C15.866 15 19 13.6569 19 12V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RewardStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex items-center gap-2">
        {icon}
        <Text as="span" variant="subtitle-16-b" className="leading-6 tracking-[-0.02em] text-[var(--color-text)]">
          {label}
        </Text>
      </span>
      <Text as="span" variant="title-20-b" className="leading-6 text-[var(--color-cta-button)]">
        {value}
      </Text>
    </div>
  );
}

/** 쿠폰·포인트 요약 — 값은 기능 연동 전 placeholder */
function RewardSummary({ couponCount, point }: { couponCount: number; point: number }) {
  return (
    <div className="flex shrink-0 items-center">
      <RewardStat icon={<TicketIcon />} label="쿠폰" value={`${couponCount.toLocaleString("ko-KR")}개`} />
      <svg width="1" height="60" viewBox="0 0 1 60" className="mr-9 ml-12 shrink-0 text-[var(--color-border)]" aria-hidden="true">
        <path d="M0.5 0V60" stroke="currentColor" strokeDasharray="4 4" />
      </svg>
      <RewardStat icon={<DatabaseIcon />} label="포인트" value={`${point.toLocaleString("ko-KR")}P`} />
    </div>
  );
}

/** 데스크탑 전용 — 우측 컬럼 상단 인사 배너 */
export function GreetingBanner({ profile: serverProfile }: { profile: Profile | null }) {
  const { profile: clientProfile } = useProfile();
  const name = (clientProfile ?? serverProfile)?.name?.trim();

  return (
    <div className="flex h-[149px] items-center justify-between gap-6 rounded-[12px] bg-[var(--color-mypage-greeting-surface)] pr-[68px] pl-[38px]">
      <div className="min-w-0">
        <Text as="p" variant="body-14-sb-tight" className="truncate tracking-normal text-[var(--color-text)]">
          {name ? `안녕하세요, ${name} 보호자님! 👋` : "안녕하세요, 보호자님! 👋"}
        </Text>
        <Text as="p" variant="title-24-b" className="mt-3 leading-[29px] text-[var(--color-text)]">
          이번 달 구독과 주문 현황을 한눈에 확인하세요.
        </Text>
      </div>
      {SHOW_REWARD_SUMMARY && <RewardSummary couponCount={0} point={0} />}
    </div>
  );
}
