"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import withdrawHeroDesktop from "../assets/withdraw-confirm-hero-web-renewal.webp";
import withdrawHeroMobile from "../assets/withdraw-confirm-hero-mobile-renewal.webp";
import { useAuth } from "@/features/auth";
import { withdraw } from "@/features/auth/api";
import type { Profile } from "@/features/profile/api/types";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";

/* ── 탈퇴 사유 옵션 ──────────────────────────────────────────────── */

const WITHDRAW_REASONS = [
  "매달 내는 구독료가 부담돼요.",
  "우리 아이 입맛에 잘 안맞아요.",
  "간식 양에 비해 가격이 비싼 것 같아요.",
  "혜택, 쿠폰 등이 너무 적어요.",
  "다른 계정이 있어요.",
] as const;

const REASON_ETC = "기타";

/* ── 헬퍼 ─────────────────────────────────────────────────────────── */

function daysSince(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - created.getTime()) / 86_400_000));
}

/* ── 라디오 버튼 ──────────────────────────────────────────────────── */

function RadioButton({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3">
      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked
            ? "border-[var(--color-accent)]"
            : "border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked && (
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
        )}
      </span>
      <span className="text-body-14-m text-[var(--color-text)]">{label}</span>
    </button>
  );
}

/* ── 메인 컴포넌트 ────────────────────────────────────────────────── */

interface WithdrawConfirmSectionProps {
  profile: Profile | null;
}

export default function WithdrawConfirmSection({ profile }: WithdrawConfirmSectionProps) {
  const { openAlert } = useModal();
  const { logout } = useAuth();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, start] = useTransition();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [etcText, setEtcText] = useState("");

  const daysWithUs = profile?.createdAt ? daysSince(profile.createdAt) : null;
  const profileImageUrl = profile?.profileImageUrl ?? null;

  const isEtc = selectedReason === REASON_ETC;
  const canSubmit = selectedReason !== null && (!isEtc || etcText.trim().length > 0);

  function handleWithdraw() {
    if (!canSubmit) return;

    const reason = isEtc ? etcText.trim() : selectedReason!;

    start(() => {
      showLoading();
      void withdraw({ reason })
        .then(() => logout())
        .catch((error) => {
          openAlert({
            title: getErrorMessage(error, "탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요."),
          });
        })
        .finally(() => hideLoading());
    });
  }

  /* ── 데스크톱 ──────────────────────────────────────────────────── */

  const desktopLayout = (
    <div className="max-md:hidden mx-auto w-full max-w-[1013px] px-5 max-md2:pt-6 pb-[104px]">
      {/* 프로필 배너 */}
      <div className="overflow-hidden rounded-[20px] bg-[var(--color-support-faq-surface)] px-14 py-7">
        <div className="flex items-center gap-9">
          {/* 프로필 이미지 */}
          <div className="h-[78px] w-[78px] shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-cta-logo-bg)]">
                <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
                  <circle cx="20" cy="16" r="8" fill="var(--color-brown)" opacity="0.6" />
                  <ellipse cx="20" cy="34" rx="14" ry="10" fill="var(--color-brown)" opacity="0.4" />
                </svg>
              </div>
            )}
          </div>

          {/* 메시지 */}
          <p className="text-body-16-r-griun text-[var(--color-text)]">
            {daysWithUs ? (
              <>
                꼬순박스와 함께한 지{" "}
                <span className="text-[24px]">
                  <span className="text-[var(--color-primary)]">{daysWithUs}</span>일째,
                </span>
              </>
            ) : (
              "꼬순박스 회원님,"
            )}
            <br />
            관련된 모든 구독 서비스를 탈퇴하시겠습니까?
          </p>
        </div>
      </div>

      {/* 탈퇴 이유 섹션 */}
      <div className="mt-4 rounded-[20px] bg-[var(--color-surface-light)] px-7 py-7">
        <h2 className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text-emphasis)]">
          탈퇴 이유
        </h2>

        <div className="mt-[18px]">
          <div className="grid grid-cols-2 gap-y-5 items-start">
            {WITHDRAW_REASONS.slice(0, 4).map((reason) => (
              <RadioButton
                key={reason}
                checked={selectedReason === reason}
                onClick={() => setSelectedReason(reason)}
                label={reason}
              />
            ))}
          </div>
          {/* 3행 — input(h-10) 높이 보정으로 상단 간격 축소, 왼쪽은 오른쪽 열 높이에 맞춰 세로 중앙 정렬 */}
          <div className="mt-2.5 grid grid-cols-2 items-center">
            <RadioButton
              checked={selectedReason === WITHDRAW_REASONS[4]}
              onClick={() => setSelectedReason(WITHDRAW_REASONS[4])}
              label={WITHDRAW_REASONS[4]}
            />
            <div className="flex items-center gap-3">
              <RadioButton
                checked={isEtc}
                onClick={() => setSelectedReason(REASON_ETC)}
                label={REASON_ETC}
              />
              <input
                type="text"
                value={etcText}
                onChange={(e) => setEtcText(e.target.value)}
                placeholder="탈퇴 이유를 작성해주세요."
                disabled={!isEtc}
                className="h-10 w-[271px] rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <p className="mt-4 text-[13px] font-medium leading-[150%] text-[var(--color-text-secondary)]">
        1. 회원 탈퇴 시 모든 정보는 삭제되며 복구되지 않습니다. (단, 관련 법령에 따라 일부 정보는 일정 기간 보관될 수 있습니다.)
        <br />
        2. 보유 중인 적립금 및 쿠폰은 모두 소멸됩니다.
        <br />
        3. 진행 중인 주문이 있을 경우 탈퇴가 제한됩니다.
        <br />
        4. 탈퇴 후 180일 이내 재가입 시 신규 혜택은 제공되지 않습니다.
        <br />
        5. [탈퇴하기] 버튼을 누르면 위 내용에 동의한 것으로 간주됩니다.
      </p>

      {/* 버튼 */}
      <div className="mt-[44px] flex justify-center gap-[17px]">
        <Link
          href="/mypage"
          className="inline-flex h-9 w-[132px] items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
        >
          유지하기
        </Link>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!canSubmit || isPending}
          className="inline-flex h-9 w-[132px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "처리 중..." : "탈퇴하기"}
        </button>
      </div>
    </div>
  );

  /* ── 모바일 ────────────────────────────────────────────────────── */

  const mobileLayout = (
    <div className="md:hidden lg:hidden bg-white px-5 pb-10 pt-6">
      {/* 프로필 배너 */}
      <div className="relative mt-6">
        {/* 배너 본체 */}
        <div className="relative h-[115px] overflow-hidden rounded-[20px] bg-[var(--color-support-faq-surface)]">
          {/* 메시지 */}
          <p
            className="absolute inset-x-0 text-center text-[var(--color-text)]"
            style={{
              top: "46px",
              fontFamily: '"Griun PolFairness", "Pretendard", sans-serif',
              fontSize: 14,
              lineHeight: "150%",
              letterSpacing: "-0.02em",
            }}
          >
            {daysWithUs ? (
              <>
                꼬순박스와 함께한 지{" "}
                <span className="text-[18px]">
                  <span className="text-[var(--color-primary)]">{daysWithUs}</span>일째,
                </span>
              </>
            ) : (
              "꼬순박스 회원님,"
            )}
            <br />
            관련된 모든 구독 서비스를 탈퇴하시겠어요?
          </p>
        </div>

        {/* 프로필 이미지 (배너 상단에 걸쳐있음) */}
        <div className="absolute left-1/2 -top-8 z-10 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full border border-[var(--color-text-muted)] bg-white">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="프로필"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-cta-logo-bg)]">
              <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
                <circle cx="20" cy="16" r="8" fill="var(--color-brown)" opacity="0.6" />
                <ellipse cx="20" cy="34" rx="14" ry="10" fill="var(--color-brown)" opacity="0.4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 탈퇴 이유 */}
      <div className="mt-4 rounded-[20px] bg-[var(--color-surface-light)] px-5 py-5">
        <h3 className="text-subtitle-16-b tracking-[-0.04em] text-[var(--color-text-emphasis)]">
          탈퇴 이유
        </h3>

        <div className="mt-4 flex flex-col gap-4">
          {WITHDRAW_REASONS.map((reason) => (
            <RadioButton
              key={reason}
              checked={selectedReason === reason}
              onClick={() => setSelectedReason(reason)}
              label={reason}
            />
          ))}

          <div className="flex flex-col gap-2">
            <RadioButton
              checked={isEtc}
              onClick={() => setSelectedReason(REASON_ETC)}
              label={REASON_ETC}
            />
            {isEtc && (
              <input
                type="text"
                value={etcText}
                onChange={(e) => setEtcText(e.target.value)}
                placeholder="탈퇴 이유를 작성해주세요."
                className="ml-8 h-10 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]"
              />
            )}
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <p className="mt-4 text-[13px] font-medium leading-[150%] text-[var(--color-text-secondary)]">
        1. 회원 탈퇴 시 모든 정보는 삭제되며 복구되지 않습니다. (단, 관련 법령에 따라 일부 정보는 일정 기간 보관될 수 있습니다.)
        <br />
        2. 보유 중인 적립금 및 쿠폰은 모두 소멸됩니다.
        <br />
        3. 진행 중인 주문이 있을 경우 탈퇴가 제한됩니다.
        <br />
        4. 탈퇴 후 180일 이내 재가입 시 신규 혜택은 제공되지 않습니다.
        <br />
        5. [탈퇴하기] 버튼을 누르면 위 내용에 동의한 것으로 간주됩니다.
      </p>

      {/* 버튼 */}
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/mypage"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
        >
          유지하기
        </Link>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!canSubmit || isPending}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "처리 중..." : "탈퇴하기"}
        </button>
      </div>
    </div>
  );

  const HERO_ALT = "정말로 꼬순박스를 탈퇴하실 건가요?";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* Hero 배너 */}
      <section aria-label="탈퇴 페이지 안내">
        {/* 모바일 (<md2) */}
        <div className="flex h-[calc(156px+var(--banner-height))] items-end overflow-hidden md2:hidden">
          <img
            src={withdrawHeroMobile.src}
            alt={HERO_ALT}
            className="h-[156px] w-full object-cover object-center"
          />
        </div>
        {/* 데스크톱 (≥md2) */}
        <div className="max-md2:hidden relative w-full h-[306px]">
          <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
          <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
            <img
              src={withdrawHeroDesktop.src}
              alt={HERO_ALT}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>
      {desktopLayout}
      {mobileLayout}
    </div>
  );
}
