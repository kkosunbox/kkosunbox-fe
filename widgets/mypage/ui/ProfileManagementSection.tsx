"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Mock 데이터 ─────────────────────────────────────────── */
const MOCK_SUBSCRIPTION = {
  tier: "Premium",
  name: "프리미엄 패키지 구독중",
  startDate: "2026.01.21",
  billingDay: "매달 21일",
};

const MOCK_USER = {
  userId: "뭉뭉이",
  petName: "뭉뭉이",
  petAge: "3세",
  weight: "8kg",
  gender: "male" as "male" | "female",
  feature: "부드러운 간식을 좋아해요.",
};

/* ── 공통 스타일 ─────────────────────────────────────────── */
const INPUT_CLS =
  "h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[14px] font-medium text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-secondary)]";
const LABEL_CLS =
  "shrink-0 w-[72px] text-[13px] font-medium leading-[16px] text-[var(--color-text-label)]";

/* ── 아이콘 ──────────────────────────────────────────────── */
function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.5 2.5L11.5 4.5M2 12l1.5-.5 8.5-8.5L9.5 1.5 1.5 10l.5 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── 프로필 아바타 ───────────────────────────────────────── */
function PetAvatar({ size = 80 }: { size?: number }) {
  return (
    <div className="relative shrink-0">
      <div
        className="flex items-center justify-center rounded-full border border-[var(--color-text-muted)]"
        style={{
          width: size,
          height: size,
          background: "var(--color-secondary)",
        }}
      >
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="12"   cy="15.5" rx="5"   ry="4"   fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="6.5"  cy="10.5" rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="10"   cy="8.5"  rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="14"   cy="8.5"  rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
          <ellipse cx="17.5" cy="10.5" rx="2"   ry="2.5" fill="var(--color-primary)" opacity=".55" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

/* ── 구독 정보 블록 ──────────────────────────────────────── */
function SubscriptionInfo({ align = "left" }: { align?: "left" | "center" }) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const itemsAlign = align === "center" ? "items-center" : "items-start";
  return (
    <div className={`flex flex-col gap-2 ${itemsAlign}`}>
      <span
        className="inline-flex items-center rounded-full px-3 py-[4px] text-[14px] font-semibold text-white"
        style={{ background: "var(--color-accent-orange)" }}
      >
        {MOCK_SUBSCRIPTION.tier}
      </span>
      <p
        className={`text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text)] ${textAlign}`}
      >
        {MOCK_SUBSCRIPTION.name}
      </p>
      <p className={`text-[16px] font-medium leading-[140%] text-[var(--color-text-label)] ${textAlign}`}>
        {MOCK_SUBSCRIPTION.startDate} ~
      </p>
      <p className={`text-[16px] font-medium leading-[140%] text-[var(--color-text-label)] ${textAlign}`}>
        결제일 : {MOCK_SUBSCRIPTION.billingDay}
      </p>
      <Link
        href="/subscribe"
        className="text-[14px] font-medium text-[var(--color-accent)] hover:opacity-80 underline"
      >
        구독 변경
      </Link>
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function ProfileManagementSection() {
  const [gender, setGender] = useState<"male" | "female">(MOCK_USER.gender);
  const [petName, setPetName] = useState(MOCK_USER.petName);
  const [petAge, setPetAge] = useState(MOCK_USER.petAge);
  const [weight, setWeight] = useState(MOCK_USER.weight);
  const [feature, setFeature] = useState(MOCK_USER.feature);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 md:py-10">
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 md:px-8">

        {/* ━━ 흰색 카드 컨테이너 ━━ */}
        <div className="rounded-2xl bg-white px-6 py-8 md:px-8 md:py-8">

          {/* ← 뒤로가기 + 타이틀 */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/mypage"
              aria-label="마이페이지로 돌아가기"
              className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-[24px] font-semibold leading-[29px] tracking-[-0.04em] text-[var(--color-text)]">
              프로필 관리
            </h1>
          </div>

          {/* ━━ 메인 레이아웃 ━━ */}
          <div className="flex flex-col md:flex-row">

            {/* ── 왼쪽 패널: 아바타 + 구독 정보 ── */}

            {/* 모바일: 가로 배치 */}
            <div className="md:hidden mb-6 flex items-start gap-4">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <PetAvatar size={76} />
                <p className="text-[14px] font-semibold text-[var(--color-text)]">
                  {MOCK_USER.petName}
                </p>
              </div>
              <SubscriptionInfo align="left" />
            </div>

            {/* 데스크톱: 세로 배치 */}
            <div className="max-md:hidden w-[230px] shrink-0 flex flex-col items-center text-center">
              <PetAvatar size={124} />
              <p className="mt-3 text-[24px] font-bold leading-[130%] text-[var(--color-text)]">
                {MOCK_USER.petName}
              </p>
              <div className="my-5 w-[141px] border-t border-[var(--color-text-muted)]" />
              <SubscriptionInfo align="center" />
            </div>

            {/* 세로 구분선 — 데스크톱 전용 */}
            <div className="max-md:hidden mx-8 w-px self-stretch bg-[var(--color-divider-warm)]" />

            {/* ── 오른쪽 패널: 프로필 정보 폼 ── */}
            <div className="flex-1">
              <p className="mb-5 text-[16px] font-bold leading-[19px] text-[var(--color-text)]">
                프로필 정보
              </p>

              <div className="flex flex-col gap-3">

                {/* 아이디 */}
                <div className="flex items-center gap-3">
                  <label htmlFor="profile-userid" className={LABEL_CLS}>아이디</label>
                  <input
                    id="profile-userid"
                    type="text"
                    defaultValue={MOCK_USER.userId}
                    readOnly
                    className={`${INPUT_CLS} bg-[var(--color-surface-light)] cursor-default`}
                  />
                </div>

                {/* 비밀번호 */}
                <div className="flex items-center gap-3">
                  <label htmlFor="profile-pw" className={LABEL_CLS}>비밀번호</label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      id="profile-pw"
                      type="password"
                      defaultValue="password"
                      readOnly
                      className={`${INPUT_CLS} flex-1 cursor-default`}
                    />
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center rounded-[4px] bg-[var(--color-accent)] px-3 h-[44px] text-[13px] font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      비밀번호 변경
                    </button>
                  </div>
                </div>

                {/* 강아지 이름 + 강아지 나이 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <label htmlFor="profile-petname" className={LABEL_CLS}>강아지 이름</label>
                    <input
                      id="profile-petname"
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className={`${INPUT_CLS} flex-1`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label htmlFor="profile-petage" className={LABEL_CLS}>강아지 나이</label>
                    <input
                      id="profile-petage"
                      type="text"
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      className={`${INPUT_CLS} flex-1`}
                    />
                  </div>
                </div>

                {/* 몸무게 + 성별 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <label htmlFor="profile-weight" className={LABEL_CLS}>몸무게</label>
                    <input
                      id="profile-weight"
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={`${INPUT_CLS} flex-1`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={LABEL_CLS}>성별</span>
                    <div className="flex flex-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className="flex h-[44px] flex-1 items-center justify-center rounded-full text-[14px] font-semibold transition-colors"
                        style={{
                          background: gender === "male" ? "var(--color-accent)" : "var(--color-surface-light)",
                          color: gender === "male" ? "white" : "var(--color-text)",
                        }}
                      >
                        남
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className="flex h-[44px] flex-1 items-center justify-center rounded-full text-[14px] font-semibold transition-colors"
                        style={{
                          background: gender === "female" ? "var(--color-accent)" : "var(--color-surface-light)",
                          color: gender === "female" ? "white" : "var(--color-text)",
                        }}
                      >
                        여
                      </button>
                    </div>
                  </div>
                </div>

                {/* 특징 */}
                <div className="flex items-center gap-3">
                  <label htmlFor="profile-feature" className={LABEL_CLS}>특징</label>
                  <input
                    id="profile-feature"
                    type="text"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    className={`${INPUT_CLS} flex-1`}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* ━━ 하단 버튼 ━━ */}
          <div className="mt-8 flex gap-3 md:justify-end">
            <button
              type="button"
              className="flex h-[48px] flex-1 md:flex-none md:w-[120px] items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-[15px] font-semibold text-[var(--color-text-secondary)] hover:opacity-80 transition-opacity"
            >
              회원 탈퇴
            </button>
            <button
              type="button"
              className="flex h-[48px] flex-1 md:flex-none md:w-[120px] items-center justify-center rounded-full bg-[var(--color-accent)] text-[15px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              확인
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
