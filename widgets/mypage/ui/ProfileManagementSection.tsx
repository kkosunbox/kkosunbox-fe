"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Mock 데이터 ─────────────────────────────────────────── */
const MOCK_SUBSCRIPTION = {
  tier: "프리미엄",
  name: "프리미엄 패키지 구독중",
  startDate: "2026.01.21",
  billingDay: "매달 21일",
};

const MOCK_USER = {
  email: "abc1234@naver.com",
  petName: "뭉뭉이",
  birthDate: "2020.10.27",
  weight: "8kg",
  gender: "male" as "male" | "female",
  feature: "부드러운 간식을 좋아해요.",
};

/* ── 공통 스타일 ─────────────────────────────────────────── */
const FIELD_INPUT_CLS =
  "h-8 flex-1 min-w-0 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none";

const FIELD_LABEL_CLS =
  "w-[70px] shrink-0 text-body-13-m text-[var(--color-text)]";

const M_FIELD_LABEL_CLS =
  "w-[60px] shrink-0 text-body-13-m text-[var(--color-text)]";

const M_FIELD_INPUT_CLS =
  "h-8 flex-1 min-w-0 rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none";

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

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ── 프로필 아바타 ───────────────────────────────────────── */
function PetAvatar({ size = 124, editSize = 40 }: { size?: number; editSize?: number }) {
  return (
    <div className="relative shrink-0">
      <div
        className="overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 86 86" className="h-full w-full" aria-hidden="true">
          <circle cx="43" cy="43" r="43" fill="#F5C84B" />
          <path d="M27 32C27 24 33 18 40 18C46 18 51 22 54 27C56 22 61 18 68 18C75 18 80 24 80 32C80 42 73 48 66 52L61 41L54 38L47 41L34 52C31 46 27 40 27 32Z" fill="#B77246" opacity="0.95" />
          <ellipse cx="43" cy="48" rx="22" ry="24" fill="#FFF8F0" />
          <ellipse cx="35" cy="44" rx="6" ry="8" fill="#B77246" />
          <circle cx="37" cy="43" r="2.3" fill="#2B2B2B" />
          <circle cx="54" cy="43" r="2.3" fill="#2B2B2B" />
          <ellipse cx="46" cy="52" rx="6" ry="5" fill="#2B2B2B" />
          <path d="M43 52v4" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M39 58c2.2 1.8 8.8 1.8 11 0" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]"
        style={{ width: editSize, height: editSize }}
      >
        <PencilIcon />
      </button>
    </div>
  );
}

/* ── 구독 정보 블록 (데스크톱 전용) ─────────────────────── */
function SubscriptionInfo() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="inline-flex items-center rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-14-sb text-white">
        {MOCK_SUBSCRIPTION.tier}
      </span>
      <p className="text-subtitle-16-sb tracking-tightest text-[var(--color-text)]">
        {MOCK_SUBSCRIPTION.name}
      </p>
      <p className="text-body-16-m text-[var(--color-text-secondary)]">
        {MOCK_SUBSCRIPTION.startDate} ~
      </p>
      <p className="text-body-16-m text-[var(--color-text-secondary)]">
        결제일 : {MOCK_SUBSCRIPTION.billingDay}
      </p>
      <Link
        href="/subscribe"
        className="text-body-14-m text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
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
  const [birthDate, setBirthDate] = useState(MOCK_USER.birthDate);
  const [weight, setWeight] = useState(MOCK_USER.weight);
  const [feature, setFeature] = useState(MOCK_USER.feature);

  return (
    <>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 모바일 레이아웃                                          */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="md:hidden">

        {/* ── 상단 크림 섹션 (헤더 + 유저 카드) ── */}
        <div className="bg-[var(--color-background)] px-6 pb-8 pt-6">

          {/* 헤더 */}
          <div className="mb-5 flex items-center gap-2">
            <Link
              href="/mypage"
              aria-label="마이페이지로 돌아가기"
              className="flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-subtitle-18-sb tracking-tightest text-[var(--color-text)]">
              프로필 관리
            </h1>
          </div>

          {/* 유저 카드 (흰색) */}
          <div className="rounded-[20px] bg-white px-6 py-5">
            <div className="flex items-center">

              {/* 왼쪽: 아바타 + 이름 */}
              <div className="flex flex-1 flex-col items-center gap-2">
                <PetAvatar size={64} editSize={20} />
                <p className="text-subtitle-16-b text-[var(--color-text)]">{MOCK_USER.petName}</p>
              </div>

              {/* 세로 구분선 */}
              <div className="mx-3 h-16 w-px bg-[var(--color-text-muted)]" />

              {/* 오른쪽: 구독 정보 */}
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="w-fit rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-14-sb text-white">
                  {MOCK_SUBSCRIPTION.tier}
                </span>
                <p className="text-body-14-sb tracking-tightest text-[var(--color-text)]">
                  {MOCK_SUBSCRIPTION.name}
                </p>
                <p className="text-body-14-m text-[var(--color-text-secondary)]">
                  {MOCK_SUBSCRIPTION.startDate} ~
                </p>
                <p className="text-body-14-m text-[var(--color-text-secondary)]">
                  결제일 : {MOCK_SUBSCRIPTION.billingDay}
                </p>
                <Link
                  href="/subscribe"
                  className="text-body-14-m text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
                >
                  구독 변경
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* ── 하단 흰색 섹션 (폼 카드 + 버튼) ── */}
        <div className="bg-white px-6 pb-10 pt-6">

          {/* 프로필 정보 카드 (크림) */}
          <div className="rounded-[20px] bg-[var(--color-background)] px-6 py-6">
            <h2 className="mb-4 text-subtitle-16-b text-[var(--color-text)]">프로필 정보</h2>

            <div className="flex flex-col gap-4">

              {/* 이메일 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-email" className={M_FIELD_LABEL_CLS}>이메일</label>
                <input
                  id="m-profile-email"
                  type="email"
                  defaultValue={MOCK_USER.email}
                  readOnly
                  className={`${M_FIELD_INPUT_CLS} cursor-default`}
                />
              </div>

              {/* 비밀번호 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-pw" className={M_FIELD_LABEL_CLS}>비밀번호</label>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    id="m-profile-pw"
                    type="password"
                    defaultValue="password"
                    readOnly
                    className="h-8 min-w-0 flex-1 cursor-default rounded-[4px] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none"
                  />
                  <button
                    type="button"
                    className="h-8 shrink-0 rounded-[4px] bg-[var(--color-accent)] px-3 text-body-13-m text-white transition-opacity hover:opacity-90"
                  >
                    변경
                  </button>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-white" />

              {/* 강아지 이름 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-petname" className={M_FIELD_LABEL_CLS}>강아지 이름</label>
                <input
                  id="m-profile-petname"
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className={M_FIELD_INPUT_CLS}
                />
              </div>

              {/* 생년월일 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-birth" className={M_FIELD_LABEL_CLS}>생년월일</label>
                <div className="relative min-w-0 flex-1">
                  <input
                    id="m-profile-birth"
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-8 w-full rounded-[4px] bg-white pl-3 pr-9 text-body-13-m text-[var(--color-text)] outline-none"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                    <CalendarIcon />
                  </span>
                </div>
              </div>

              {/* 몸무게 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-weight" className={M_FIELD_LABEL_CLS}>몸무게</label>
                <input
                  id="m-profile-weight"
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={M_FIELD_INPUT_CLS}
                />
              </div>

              {/* 성별 */}
              <div className="flex items-center gap-3">
                <span className={M_FIELD_LABEL_CLS}>성별</span>
                <div className="flex flex-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={[
                      "flex h-8 flex-1 items-center justify-center rounded-[4px] transition-colors",
                      gender === "male"
                        ? "bg-[var(--color-accent-soft)] text-body-13-sb text-[var(--color-accent)]"
                        : "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={[
                      "flex h-8 flex-1 items-center justify-center rounded-[4px] transition-colors",
                      gender === "female"
                        ? "bg-[var(--color-accent-soft)] text-body-13-sb text-[var(--color-accent)]"
                        : "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    여
                  </button>
                </div>
              </div>

              {/* 특징 */}
              <div className="flex items-center gap-3">
                <label htmlFor="m-profile-feature" className={M_FIELD_LABEL_CLS}>특징</label>
                <input
                  id="m-profile-feature"
                  type="text"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  className={M_FIELD_INPUT_CLS}
                />
              </div>

            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-body-14-sb text-white transition-opacity hover:opacity-80"
            >
              회원 탈퇴
            </button>
            <button
              type="button"
              className="flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90"
            >
              확인
            </button>
          </div>

        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 데스크톱 레이아웃                                        */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-md:hidden min-h-screen bg-[var(--color-background)] py-10">
        <div className="mx-auto max-w-content md:px-0">

          {/* ━━ 흰색 카드 ━━ */}
          <div className="rounded-[20px] bg-white md:px-8 md:py-8">

            {/* ← 뒤로가기 + 타이틀 */}
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/mypage"
                aria-label="마이페이지로 돌아가기"
                className="flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <h1 className="text-title-24-sb tracking-tightest text-[var(--color-text)]">
                프로필 관리
              </h1>
            </div>

            {/* ━━ 메인 레이아웃 ━━ */}
            <div className="flex flex-col gap-6 md:flex-row md:gap-0">

              {/* ── 왼쪽 패널 ── */}
              <div className="flex flex-col items-center md:w-[220px] md:shrink-0">
                <PetAvatar size={124} editSize={40} />
                <p className="mt-3 text-title-24-b text-[var(--color-text)]">
                  {MOCK_USER.petName}
                </p>
                <div className="my-5 w-[141px] border-t border-[var(--color-text-muted)]" />
                <SubscriptionInfo />
              </div>

              {/* ── 오른쪽 패널 (크림) ── */}
              <div className="flex-1 rounded-[20px] bg-[var(--color-background)] md:ml-8 md:px-7 md:py-7">

                <h2 className="mb-6 text-subtitle-18-b tracking-tightest text-[var(--color-text)]">
                  프로필 정보
                </h2>

                {/* 전체 폼을 하나의 2열 그리드로 통합 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* 이메일 — 좌측 열만 */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="profile-email" className={FIELD_LABEL_CLS}>이메일</label>
                    <input
                      id="profile-email"
                      type="email"
                      defaultValue={MOCK_USER.email}
                      readOnly
                      className={`${FIELD_INPUT_CLS} cursor-default`}
                    />
                  </div>
                  <div className="max-md:hidden" />

                  {/* 비밀번호 — 좌측 열: input / 우측 열(데스크톱): 버튼 */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="profile-pw" className={FIELD_LABEL_CLS}>비밀번호</label>
                    <input
                      id="profile-pw"
                      type="password"
                      defaultValue="password"
                      readOnly
                      className={`${FIELD_INPUT_CLS} cursor-default`}
                    />
                  </div>
                  {/* 데스크톱: 우측 열 */}
                  <div className="max-md:hidden flex items-center">
                    <button
                      type="button"
                      className="inline-flex h-8 items-center rounded-[4px] bg-[var(--color-accent)] px-3 text-body-13-m text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                    >
                      비밀번호 변경
                    </button>
                  </div>

                  {/* 구분선 — 2열 전체 */}
                  <div className="border-t border-white md:col-span-2" />

                  {/* 강아지 이름 */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="profile-petname" className={FIELD_LABEL_CLS}>강아지 이름</label>
                    <input
                      id="profile-petname"
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className={FIELD_INPUT_CLS}
                    />
                  </div>
                  {/* 생년월일 */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="profile-birth" className={FIELD_LABEL_CLS}>생년월일</label>
                    <div className="relative min-w-0 flex-1">
                      <input
                        id="profile-birth"
                        type="text"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-8 w-full rounded-[4px] bg-white pl-3 pr-9 text-body-13-m text-[var(--color-text)] outline-none"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                        <CalendarIcon />
                      </span>
                    </div>
                  </div>

                  {/* 몸무게 */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="profile-weight" className={FIELD_LABEL_CLS}>몸무게</label>
                    <input
                      id="profile-weight"
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={FIELD_INPUT_CLS}
                    />
                  </div>
                  {/* 성별 */}
                  <div className="flex items-center gap-4">
                    <span className={FIELD_LABEL_CLS}>성별</span>
                    <div className="flex flex-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={[
                          "flex h-8 flex-1 items-center justify-center rounded-[4px] transition-colors",
                          gender === "male"
                            ? "bg-[var(--color-accent-soft)] text-body-13-sb text-[var(--color-accent)]"
                            : "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        남
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={[
                          "flex h-8 flex-1 items-center justify-center rounded-[4px] transition-colors",
                          gender === "female"
                            ? "bg-[var(--color-accent-soft)] text-body-13-sb text-[var(--color-accent)]"
                            : "bg-[var(--color-surface-light)] text-body-13-m text-[var(--color-text)]",
                        ].join(" ")}
                      >
                        여
                      </button>
                    </div>
                  </div>

                  {/* 특징 — 2열 전체 */}
                  <div className="flex items-center gap-4 md:col-span-2">
                    <label htmlFor="profile-feature" className={FIELD_LABEL_CLS}>특징</label>
                    <input
                      id="profile-feature"
                      type="text"
                      value={feature}
                      onChange={(e) => setFeature(e.target.value)}
                      className={FIELD_INPUT_CLS}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ━━ 하단 버튼 ━━ */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                className="flex h-11 w-[120px] items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-btn-15-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
              >
                회원 탈퇴
              </button>
              <button
                type="button"
                className="flex h-11 w-[120px] items-center justify-center rounded-full bg-[var(--color-accent)] text-btn-15-sb text-white transition-opacity hover:opacity-90"
              >
                확인
              </button>
            </div>

          </div>
        </div>
      </div>

    </>
  );
}
