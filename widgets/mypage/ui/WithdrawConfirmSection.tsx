"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import { withdraw } from "@/features/auth/api";
import type { Profile } from "@/features/profile/api/types";
import { WITHDRAWAL_REASON_MAX_LENGTH } from "@/shared/config/inputLimits";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import {
  FallbackAvatar,
  FeedbackFormLayout,
  useLoadingOverlay,
  useModal,
} from "@/shared/ui";
import { SupportHero } from "@/widgets/support/shared";

const WITHDRAW_REASONS = [
  "매달 내는 구독료가 부담돼요.",
  "우리 아이 입맛에 잘 안맞아요.",
  "간식 양에 비해 가격이 비싼 것 같아요.",
  "혜택, 쿠폰 등이 너무 적어요.",
  "다른 계정이 있어요.",
] as const;

const REASON_ETC = "기타";

const WITHDRAW_NOTICES = [
  "회원 탈퇴 시 모든 정보는 삭제되며 복구되지 않습니다. 단, 관련 법령에 따라 일부 정보는 일정 기간 보관될 수 있습니다.",
  "보유 중인 적립금 및 쿠폰은 모두 소멸됩니다.",
  "진행 중인 주문이 있을 경우 탈퇴가 제한됩니다.",
  "탈퇴 후 180일 이내 재가입 시 신규 혜택은 제공되지 않습니다.",
  "‘탈퇴하기’ 버튼을 누르면 위 내용에 동의한 것으로 간주됩니다.",
] as const;

function daysSince(dateString: string): number {
  const createdAt = new Date(dateString);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000));
}

function WithdrawReasonOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "flex min-h-12 cursor-pointer items-center gap-3 rounded-[8px] border bg-white px-4 py-3 transition-colors",
        checked
          ? "border-[var(--color-cta-button)]"
          : "border-[var(--color-text-muted)]",
      ].join(" ")}
    >
      <input
        type="radio"
        name="withdraw-reason"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          checked
            ? "border-[var(--color-cta-button)]"
            : "border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-cta-button)]" /> : null}
      </span>
      <span className="text-body-14-m text-[var(--color-text)]">{label}</span>
    </label>
  );
}

interface WithdrawConfirmSectionProps {
  profile: Profile | null;
}

export default function WithdrawConfirmSection({ profile }: WithdrawConfirmSectionProps) {
  const { openAlert } = useModal();
  const { logout } = useAuth();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [etcText, setEtcText] = useState("");

  const daysWithUs = profile?.createdAt ? daysSince(profile.createdAt) : null;
  const isEtc = selectedReason === REASON_ETC;
  const canSubmit = selectedReason !== null && (!isEtc || etcText.trim().length > 0);

  function handleWithdraw() {
    if (!canSubmit) return;

    const reason = isEtc ? etcText.trim() : selectedReason!;

    startTransition(() => {
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

  const action = (
    <div className="flex w-full max-w-[652px] gap-3 max-md:gap-2">
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={!canSubmit || isPending}
        className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-[8px] border border-[var(--color-text-muted)] bg-white px-6 text-body-16-sb text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-cta-button)] hover:text-[var(--color-cta-button)] disabled:cursor-not-allowed disabled:opacity-50 max-md:px-3 max-md:text-body-14-sb"
      >
        {isPending ? "처리 중..." : "탈퇴하기"}
      </button>
      <Link
        href="/mypage"
        className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] px-6 text-body-16-sb text-white transition-opacity hover:opacity-90 max-md:px-3 max-md:text-body-14-sb"
      >
        유지하기
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SupportHero label="회원 탈퇴 안내">
        정말로 <strong>꼬순박스를 탈퇴</strong>하실건가요?
      </SupportHero>

      <FeedbackFormLayout
        title="회원 탈퇴"
        backHref="/mypage"
        introTitle="탈퇴 전에 꼭 확인해주세요."
        introDescription={
          <>
            <p>회원 탈퇴가 완료되면 계정과 관련된 혜택 및 맞춤 정보는 복구할 수 없습니다.</p>
            <p>진행 중인 주문과 구독 상태를 확인한 후 신중하게 결정해주세요.</p>
          </>
        }
        action={action}
      >
        <section className="mt-8 flex items-center gap-5 rounded-[12px] bg-white p-5 max-md:mt-6 max-md:items-start max-md:p-4" aria-label="회원 정보">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)] bg-[var(--color-avatar-fallback)]">
            {profile?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL은 도메인이 가변적이다.
              <img
                src={profile.profileImageUrl}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            ) : (
              <FallbackAvatar userId={profile?.id} className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 self-center">
            <p className="text-subtitle-16-b text-[var(--color-text-emphasis)]">
              {profile?.name ? `${profile.name}와 함께한 소중한 시간` : "꼬순박스와 함께한 소중한 시간"}
            </p>
            <p className="mt-1 text-body-14-m text-[var(--color-text-secondary)]">
              {daysWithUs
                ? `꼬순박스와 함께한 지 ${daysWithUs}일째예요.`
                : "그동안 꼬순박스와 함께해주셔서 감사합니다."}
            </p>
          </div>
        </section>

        <fieldset className="mt-8 max-md:mt-6">
          <legend className="text-subtitle-18-b text-[var(--color-text-emphasis)]">
            탈퇴 이유
          </legend>
          <p className="mt-2 text-body-13-m text-[var(--color-text-secondary)]">
            서비스 개선을 위해 가장 가까운 이유를 선택해주세요.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 max-md:grid-cols-1">
            {[...WITHDRAW_REASONS, REASON_ETC].map((reason) => (
              <WithdrawReasonOption
                key={reason}
                checked={selectedReason === reason}
                label={reason}
                onChange={() => setSelectedReason(reason)}
              />
            ))}
            {isEtc ? (
              <div className="col-span-2 max-md:col-span-1">
                <input
                  type="text"
                  value={etcText}
                  onChange={(event) => setEtcText(event.target.value)}
                  maxLength={WITHDRAWAL_REASON_MAX_LENGTH}
                  placeholder="탈퇴 이유를 작성해주세요."
                  className="h-10 w-full rounded-[8px] border border-[var(--color-text-muted)] bg-white px-4 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]"
                />
                <p className="mt-1 text-right text-body-13-m text-[var(--color-text-secondary)]">
                  {etcText.length}/{WITHDRAWAL_REASON_MAX_LENGTH}
                </p>
              </div>
            ) : null}
          </div>
        </fieldset>

        <section className="mt-8 rounded-[12px] border border-[var(--color-text-muted)] bg-white p-5 max-md:mt-6 max-md:p-4" aria-labelledby="withdraw-notice-title">
          <h2 id="withdraw-notice-title" className="text-subtitle-16-b text-[var(--color-text-emphasis)]">
            회원 탈퇴 유의사항
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-body-13-m leading-[150%] text-[var(--color-text-secondary)]">
            {WITHDRAW_NOTICES.map((notice) => <li key={notice}>{notice}</li>)}
          </ol>
        </section>
      </FeedbackFormLayout>
    </div>
  );
}
