"use client";

import { useState } from "react";
import Image from "next/image";
import { DatePicker } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";

/* ─── 가격 상수 ──────────────────────────────────────────── */
const PRODUCT_PRICE = 25000;
const COUPON_DISCOUNT_AMOUNT = 5000;
const SHIPPING_FEE = 0;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/* ─── 공통 클래스 ────────────────────────────────────────── */
/** 피그마 기준: h-8(32px), border-radius 4px, white bg, 테두리 없음 */
const inputCls =
  "h-8 w-full rounded-[4px] bg-white px-3 text-[13px] leading-[140%] font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none";

/* ─── 아이콘 ─────────────────────────────────────────────── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: open ? "matrix(1,0,0,-1,0,0)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6L4.5 8.5L10 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="3"
        y="4"
        width="14"
        height="13"
        rx="2"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
      />
      <path
        d="M3 8h14"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
      />
      <path
        d="M7 2v3M13 2v3"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PawPrint({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="15.5" rx="5" ry="4" fill="var(--color-primary)" />
      <ellipse cx="6.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="10" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="14" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      <ellipse cx="17.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
    </svg>
  );
}

/* ─── 섹션 카드 ──────────────────────────────────────────── */
/**
 * 피그마 기준:
 * - background: #FFF7EF (--color-surface-warm)
 * - border-radius: 20px
 * - 내부 패딩: 28px (px-7)
 * - 타이틀: font-weight 700, 18px, color #262525
 */
function SectionCard({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-[var(--color-surface-warm)] px-7">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-7 text-left"
      >
        <span
          className="text-[18px] font-bold leading-[21px] tracking-[-0.04em]"
          style={{ color: "#262525" }}
        >
          {title}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="pb-7">{children}</div>}
    </div>
  );
}

/* ─── 체크박스 ───────────────────────────────────────────── */
/**
 * 피그마 기준:
 * - 체크 시: background #7FB3FF, border-radius 5px
 * - 미체크 시: border 1px solid #B0B0B0, border-radius 5px
 * - 라벨: font-weight 500, 13px, color #2F2F2F
 */
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={onChange}
        className={[
          "w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "bg-[var(--color-accent)]"
            : "border border-[var(--color-border)] bg-white",
        ].join(" ")}
      >
        {checked && <CheckIcon />}
      </button>
      <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}

/* ─── 라디오 버튼 ────────────────────────────────────────── */
/**
 * 피그마 기준:
 * - 선택 시: border 2px solid #7FB3FF, inner circle #7FB3FF
 * - 미선택 시: border 1px solid #B0B0B0
 * - 라벨: font-weight 500, 14px, letter-spacing -0.02em
 */
function RadioButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        onClick={onChange}
        className={[
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "border-2 border-[var(--color-accent)]"
            : "border border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked && (
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
        )}
      </button>
      <span className="text-[14px] font-medium leading-[17px] tracking-[-0.02em] text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}

/* ─── 폼 행 (레이블 + 입력 영역) ─────────────────────────── */
/**
 * 피그마 기준: 레이블 너비 70px 고정, 입력 영역 flex-1
 */
function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-0">
      <span className="w-[70px] shrink-0 text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ─── 타입 ───────────────────────────────────────────────── */
type PaymentMethod = "card" | "kakao" | "transfer" | "bank";

interface FormState {
  name: string;
  email: string;
  postalCode: string;
  addressDetail: string;
  mobile: string;
  phone: string;
  deliveryNote: string;
  saveDelivery: boolean;
}

/* ─── 메인 컴포넌트 ──────────────────────────────────────── */
export default function OrderSection() {
  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    date: true,
    summary: true,
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    postalCode: "",
    addressDetail: "",
    mobile: "",
    phone: "",
    deliveryNote: "",
    saveDelivery: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [useCoupon, setUseCoupon] = useState(false);
  const [subscriptionDate, setSubscriptionDate] = useState<Date | null>(null);
  const [agreeOpen, setAgreeOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const agreeAll = agreeTerms && agreePrivacy && agreeAge;
  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeAge(next);
  }

  const couponDiscount = useCoupon ? COUPON_DISCOUNT_AMOUNT : 0;
  const total = PRODUCT_PRICE - couponDiscount - SHIPPING_FEE;

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 3);

  /* ── 좌측 섹션 ── */
  const leftSections = (
    <div className="flex flex-col gap-4">

      {/* 제품 정보 */}
      <SectionCard
        title="제품 정보"
        open={openSections.product}
        onToggle={() => toggleSection("product")}
      >
        {/* 피그마: 내부 흰색 카드 background #FFFFFF, border-radius 20px */}
        <div className="rounded-[20px] bg-white px-7 py-7 flex items-center gap-6">
          {/* 상품 이미지 */}
          <div className="w-[120px] h-[120px] md:w-[160px] md:h-[117px] shrink-0 flex items-center justify-center rounded-xl bg-[var(--color-card-premium)] text-4xl select-none">
            📦
          </div>
          {/* 상품 정보 */}
          <div className="flex flex-col gap-3">
            {/* 피그마: Premium badge — background #F07F3D, border-radius 30px, padding 4px 12px */}
            <span
              className="inline-flex items-center justify-center px-3 py-1 rounded-[30px] text-[14px] font-semibold leading-[17px] text-white w-fit"
              style={{ background: "var(--color-premium)" }}
            >
              Premium
            </span>
            {/* 피그마: font-weight 600, 16px, color #262525 */}
            <span
              className="text-[16px] font-semibold leading-[19px] tracking-[-0.04em]"
              style={{ color: "#262525" }}
            >
              프리미엄 패키지 BOX
            </span>
            {/* 피그마: font-weight 800, 16px, color #171713 */}
            <span
              className="text-[16px] font-extrabold leading-[19px] tracking-[-0.05em]"
              style={{ color: "var(--color-surface-dark)" }}
            >
              월 요금제 {formatPrice(PRODUCT_PRICE)}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* 주문고객 / 배송지 정보 */}
      <SectionCard
        title="주문고객 / 배송지 정보"
        open={openSections.customer}
        onToggle={() => toggleSection("customer")}
      >
        <div className="flex flex-col gap-4">
          {/* 받는분 + 이메일 (데스크톱: 2열, 모바일: 1열) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-[34px]">
            <FormRow label="받는분">
              <input
                name="name"
                placeholder="이름"
                value={form.name}
                onChange={handleChange}
                className={inputCls}
              />
            </FormRow>
            <FormRow label="이메일">
              <input
                name="email"
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                className={inputCls}
              />
            </FormRow>
          </div>

          {/* 우편번호 */}
          <FormRow label="우편번호">
            <div className="flex gap-2">
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className={`${inputCls} flex-1 min-w-0`}
              />
              {/* 피그마: background #7FB3FF, border-radius 4px */}
              <button
                type="button"
                className="h-8 px-2 rounded-[4px] bg-[var(--color-accent)] text-white text-[13px] font-medium leading-[16px] whitespace-nowrap shrink-0"
              >
                주소찾기
              </button>
            </div>
          </FormRow>

          {/* 상세 주소 */}
          <FormRow label="">
            <input
              name="addressDetail"
              placeholder="상세 주소를 입력해주세요"
              value={form.addressDetail}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, addressDetail: e.target.value }))
              }
              className={inputCls}
            />
          </FormRow>

          {/* 휴대폰 + 전화번호 (데스크톱: 2열, 모바일: 1열) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-[34px]">
            <FormRow label="휴대폰">
              <input
                name="mobile"
                type="tel"
                placeholder="-를 제외한 숫자만 입력해주세요"
                value={form.mobile}
                onChange={handleChange}
                className={inputCls}
              />
            </FormRow>
            <FormRow label="전화번호">
              <input
                name="phone"
                type="tel"
                placeholder="-를 제외한 숫자만 입력해주세요"
                value={form.phone}
                onChange={handleChange}
                className={inputCls}
              />
            </FormRow>
          </div>

          {/* 배송메모 + 배송지 정보 저장 (데스크톱: 한 행) */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <FormRow label="배송메모">
              <input
                name="deliveryNote"
                placeholder="배송 시 요청사항을 입력해주세요"
                value={form.deliveryNote}
                onChange={handleChange}
                className={inputCls}
              />
            </FormRow>
            <div className="pl-[70px] md:pl-0 md:shrink-0">
              <Checkbox
                checked={form.saveDelivery}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    saveDelivery: !prev.saveDelivery,
                  }))
                }
                label="배송지 정보 저장"
              />
            </div>
          </div>

          {/* 피그마: 구분선 border 1px solid #FFFFFF */}
          <div className="border-t border-white" />
        </div>
      </SectionCard>

      {/* 결제수단 선택 */}
      <SectionCard
        title="결제수단 선택"
        open={openSections.payment}
        onToggle={() => toggleSection("payment")}
      >
        <div className="flex flex-col gap-6">
          {/* 피그마: 결제 방법 — flex row, gap 32px */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <RadioButton
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              label="신용카드"
            />
            <RadioButton
              checked={paymentMethod === "kakao"}
              onChange={() => setPaymentMethod("kakao")}
              label="카카오페이"
            />
            <RadioButton
              checked={paymentMethod === "transfer"}
              onChange={() => setPaymentMethod("transfer")}
              label="무통장입금"
            />
            <RadioButton
              checked={paymentMethod === "bank"}
              onChange={() => setPaymentMethod("bank")}
              label="계좌이체"
            />
          </div>

          {/* 쿠폰 사용 */}
          <div className="flex items-center gap-4">
            <Checkbox
              checked={useCoupon}
              onChange={() => setUseCoupon((prev) => !prev)}
              label="쿠폰사용"
            />
            {useCoupon && (
              <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
                가입축하쿠폰 -{formatPrice(COUPON_DISCOUNT_AMOUNT)}
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 구독 날짜 선택 */}
      <SectionCard
        title="구독 날짜 선택"
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      >
        {/*
          피그마: 날짜 피커(120px)와 설명 텍스트를 한 행에 나란히 배치
          - 피커: left 28px, top 73px (카드 기준)
          - 텍스트: left 164px (28+120+16), top 81px (피커와 수직 중앙 정렬)
          모바일: 세로 스택
        */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* wrapper로 폭 고정 → trigger w-full이 120px로 채워짐 */}
          <div className="w-[120px] shrink-0">
            <DatePicker
              value={subscriptionDate}
              onChange={setSubscriptionDate}
              placeholder="날짜 선택"
              minDate={minDate}
              maxDate={maxDate}
              triggerClassName="!h-[34px] !rounded-[5px] !border-[var(--color-text-muted)] !px-3"
            />
          </div>
          <p className="text-[13px] font-medium leading-[140%] text-[var(--color-text-secondary)]">
            구독 시작일은 구매일로 부터 최대 3일 후까지 선택 가능합니다.
          </p>
        </div>
      </SectionCard>
    </div>
  );

  /* ── 우측 컬럼 ── */
  const rightColumn = (
    <div className="flex flex-col gap-4">
      {/*
        피그마: 결제정보 카드
        - background #FFF7EF, border-radius 20px
        - 결제정보 + 동의 + 결제하기 버튼 모두 포함
      */}
      <div className="rounded-[20px] bg-[var(--color-surface-warm)] px-7">
        {/* 결제정보 헤더 */}
        <button
          type="button"
          onClick={() => toggleSection("summary")}
          className="w-full flex items-center justify-between py-7 text-left"
        >
          <span
            className="text-[18px] font-bold leading-[21px] tracking-[-0.04em]"
            style={{ color: "#262525" }}
          >
            결제정보
          </span>
          <ChevronIcon open={openSections.summary} />
        </button>

        {openSections.summary && (
          <div className="pb-7 flex flex-col gap-8">
            {/* 가격 항목들 — 피그마: font-weight 500, 13px */}
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  주문상품금액
                </span>
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  {formatPrice(PRODUCT_PRICE)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  총 쿠폰 할인금액
                </span>
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  총 배송비
                </span>
                <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                  -{formatPrice(SHIPPING_FEE)}
                </span>
              </div>
            </div>

            {/* 피그마: 구분선 border 1px solid #FFFFFF */}
            <div className="border-t border-white" />

            {/* 월 요금제 합계 — 피그마: label font-weight 700/14px, amount font-weight 800/20.6px */}
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold leading-[17px] text-[var(--color-text)]">
                월 요금제
              </span>
              <span
                className="text-[20px] font-extrabold leading-[32px] tracking-[-0.05em]"
                style={{ color: "var(--color-text)" }}
              >
                {formatPrice(total)}
              </span>
            </div>

            {/* 모두 동의합니다 — 피그마: 체크박스 + 펼침 화살표 */}
            <div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={agreeAll}
                  onChange={handleAgreeAll}
                  label="모두 동의합니다."
                />
                <button
                  type="button"
                  onClick={() => setAgreeOpen((prev) => !prev)}
                  className="transition-transform duration-200"
                  style={{
                    transform: agreeOpen ? "matrix(1,0,0,-1,0,0)" : "none",
                  }}
                >
                  {/* 피그마: Icon/Outline/cheveron-down, 20px */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              {agreeOpen && (
                <div className="mt-3 flex flex-col gap-2.5 pl-1 border-t border-white pt-3">
                  <Checkbox
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms((p) => !p)}
                    label="이용약관 동의 (필수)"
                  />
                  <Checkbox
                    checked={agreePrivacy}
                    onChange={() => setAgreePrivacy((p) => !p)}
                    label="개인정보 수집·이용 동의 (필수)"
                  />
                  <Checkbox
                    checked={agreeAge}
                    onChange={() => setAgreeAge((p) => !p)}
                    label="만 14세 이상 확인 (필수)"
                  />
                </div>
              )}
            </div>

            {/*
              결제하기 버튼
              피그마: background #7FB3FF, border-radius 30px, height 48px
              font-weight 600, 18px, color white
            */}
            <button
              type="button"
              disabled={!agreeAll}
              className="w-full h-12 rounded-[30px] bg-[var(--color-accent)] text-white text-[18px] font-semibold leading-[27px] tracking-[-0.02em] text-center disabled:opacity-50 transition-opacity"
            >
              결제하기
            </button>
          </div>
        )}
      </div>

      {/*
        쿠폰 배너
        피그마: background #F8F8F8, border-radius 20px, width 327px, height 104px
        - 강아지 이미지 96x96
        - "브랜드 할인 쿠폰" / "최대 20%": GangwonEduPower 폰트
      */}
      <div
        className="rounded-[20px] flex items-center gap-0 overflow-hidden"
        style={{ background: "var(--color-surface-light)", height: "104px" }}
      >
        {/* 강아지 이미지 영역 */}
        <div
          className="shrink-0 flex items-center justify-center text-[40px] select-none"
          style={{ width: "110px", height: "104px" }}
        >
          🐕
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col gap-1">
          <Image
            src={logoMain}
            alt="꼬순박스"
            width={64}
            height={22}
            className="object-contain object-left"
          />
          {/* 피그마: GangwonEduPower, 14px, color #262525 */}
          <span
            className="text-[14px] leading-[14px]"
            style={{
              fontFamily: '"GangwonEduPower", sans-serif',
              color: "#262525",
            }}
          >
            브랜드 할인 쿠폰
          </span>
          {/* 피그마: GangwonEduPower, 24px, letter-spacing -0.06em, color #606060 */}
          <span
            className="text-[24px] leading-[25px]"
            style={{
              fontFamily: '"GangwonEduPower", sans-serif',
              letterSpacing: "-0.06em",
              color: "#606060",
            }}
          >
            최대 20%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── 히어로 영역 (따뜻한 배경 유지) ── */}
      <div
        className="py-10 md:py-14 relative overflow-hidden"
        style={{ background: "var(--color-surface-warm)" }}
      >
        <div className="max-md:hidden absolute left-12 top-1/2 -translate-y-1/2 opacity-[0.07]">
          <PawPrint size={100} />
        </div>
        <div className="max-md:hidden absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.07]">
          <PawPrint size={100} />
        </div>
        <div className="text-center px-4">
          <h1
            className="text-[32px] md:text-[36px] font-bold leading-[1.4] tracking-[-0.04em] text-[var(--color-primary)] mb-2"
          >
            주문을 완료해주세요!
          </h1>
          <p className="text-[14px] md:text-[16px] font-medium text-[var(--color-text-on-warm)]">
            입력하신 정보가 맞는지 확인 후 결제하기 버튼을 눌러주세요.
          </p>
        </div>
      </div>

      {/* ── 히어로 아래: 흰색 배경 ── */}
      <div className="bg-white">
        <div
          className="mx-auto px-4 md:px-6 py-6 md:py-8"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          {/*
            가격 요약 바 (데스크톱 전용)
            피그마: background #FFF7EF, border-radius 20px, height 80px
            아이템: font-weight 600, 16px, gap 40px
            총 주문금액: font-weight 700, color #C97A3D
            총 주문금액 금액: font-weight 700, 20px
          */}
          <div className="max-md:hidden mb-4">
            <div
              className="rounded-[20px] flex items-center justify-center h-20 gap-10"
              style={{ background: "var(--color-surface-warm)" }}
            >
              <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
                주문상품금액 {formatPrice(PRODUCT_PRICE)}
              </span>
              <span className="text-[16px] font-semibold text-[var(--color-text)]">+</span>
              <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
                총 할인금액 {formatPrice(couponDiscount)}
              </span>
              <span className="text-[16px] font-semibold text-[var(--color-text)]">-</span>
              <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
                총 배송비 {formatPrice(SHIPPING_FEE)}
              </span>
              <span className="text-[16px] font-semibold text-[var(--color-text)]">=</span>

              {/* 총 주문금액 — 피그마: 두 요소 분리 (라벨 16px bold primary, 금액 20px bold primary) */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[16px] font-bold leading-[19px] tracking-[-0.04em]"
                  style={{ color: "var(--color-primary)" }}
                >
                  총 주문금액
                </span>
                <span
                  className="text-[20px] font-bold leading-[24px] tracking-[-0.04em]"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* 콘텐츠 그리드 */}
          {/* 데스크톱: 670px + 16px gap + 327px = 1013px */}
          <div className="hidden md:grid md:grid-cols-[1fr_327px] gap-4 items-start">
            {leftSections}
            {rightColumn}
          </div>

          {/* 모바일: 단일 열 */}
          <div className="md:hidden flex flex-col gap-4">
            {leftSections}
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
