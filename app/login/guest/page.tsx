"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthDesktopShell,
  AuthMobileShell,
  SocialLoginButtons,
  authLabelCls,
  authUnderlineInputCls,
  authCtaButtonCls,
  authMobileCtaButtonCls,
  getOAuthUrl,
} from "@/features/auth";
import type { OAuthProvider } from "@/features/auth";
import {
  GUEST_ORDER_ID_LENGTH,
  getGuestOrderAccessErrorMessage,
  isGuestOrderIdComplete,
  isValidGuestPhone,
  normalizeGuestOrderId,
  saveGuestOrderAccess,
} from "@/features/guest-order";
import { lookupGuestOrder } from "@/features/product/api";
import { digitsOnly, formatPhoneNumber } from "@/shared/lib/format";
import { useLoadingOverlay } from "@/shared/ui";

const LAST_LOGIN_KEY = "ggosoonbox_last_login";

/** 하이픈 포함 표시 길이 (K7M2-Q9PX) */
const ORDER_ID_INPUT_MAX_LENGTH = GUEST_ORDER_ID_LENGTH + 1;

function LookupFormFields({
  orderId,
  setOrderId,
  phone,
  setPhone,
  orderIdId,
  phoneId,
}: {
  orderId: string;
  setOrderId: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  orderIdId: string;
  phoneId: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={orderIdId} className={authLabelCls}>주문번호</label>
        <input
          id={orderIdId}
          type="text"
          placeholder="주문번호를 입력하세요"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={ORDER_ID_INPUT_MAX_LENGTH}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value.toUpperCase())}
          className={authUnderlineInputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={phoneId} className={authLabelCls}>주문자 연락처</label>
        <input
          id={phoneId}
          type="tel"
          inputMode="numeric"
          placeholder="주문 시 입력한 연락처를 입력하세요"
          autoComplete="tel"
          value={formatPhoneNumber(phone)}
          onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))}
          className={authUnderlineInputCls}
        />
      </div>
    </div>
  );
}

function LookupNotice() {
  return (
    <ul className="mt-[15px] flex flex-col gap-1 text-body-13-r text-[var(--color-text-secondary)]">
      <li className="flex gap-1.5 before:content-['·']">주문 시 입력하셨던 주문번호와 주문자 연락처를 입력해 주세요.</li>
    </ul>
  );
}

function RegisterLink({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span
        className="text-body-14-m text-[var(--color-auth-hint)] opacity-40"
        style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
      >
        아직 계정이 없으신가요?
      </span>
      <Link
        href="/register"
        className="text-body-14-sb text-[var(--color-link-warm)]"
        style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
      >
        회원가입하기
      </Link>
    </div>
  );
}

/** 비회원 주문조회 — 주문번호 + 주문자 연락처로 조회 후 상세로 이동 */
export default function GuestOrderLookupPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const router = useRouter();
  const isFormValid = isGuestOrderIdComplete(orderId) && isValidGuestPhone(phone);

  function handleSocialLogin(provider: OAuthProvider) {
    localStorage.setItem(LAST_LOGIN_KEY, provider);
    const url = getOAuthUrl(provider);
    if (url) window.location.href = url;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isPending) return;
    setError(null);
    showLoading("주문을 조회하고 있습니다...");
    startTransition(async () => {
      try {
        const normalizedId = normalizeGuestOrderId(orderId);
        await lookupGuestOrder({ orderId: normalizedId, ordererPhone: phone });
        saveGuestOrderAccess({ orderId: normalizedId, ordererPhone: phone });
        router.push(`/guest-orders/${normalizedId}`);
      } catch (err) {
        setError(getGuestOrderAccessErrorMessage(err, "주문을 조회하지 못했습니다. 잠시 후 다시 시도해 주세요."));
      } finally {
        hideLoading();
      }
    });
  }

  const errorText = error && (
    <p role="alert" className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
      {error}
    </p>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col max-lg:min-h-svh max-lg:overflow-hidden max-lg:bg-[var(--color-login-top)] lg:min-h-screen lg:bg-white"
    >
      {/* ══════════════════ 모바일·태블릿(<lg) ══════════════════ */}
      <AuthMobileShell active="guest-order">
        <LookupFormFields
          orderId={orderId}
          setOrderId={setOrderId}
          phone={phone}
          setPhone={setPhone}
          orderIdId="guest-order-id-mobile"
          phoneId="guest-order-phone-mobile"
        />
        <LookupNotice />
        {errorText}

        <div className="mt-[52px]">
          <button type="submit" disabled={!isFormValid || isPending} className={authMobileCtaButtonCls}>
            {isPending ? "조회 중..." : "주문 조회"}
          </button>
        </div>

        <p
          className="mt-[18px] text-center text-body-14-m text-[var(--color-text-secondary)]"
          style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
        >
          - 간편로그인 -
        </p>
        <div className="mt-7">
          <SocialLoginButtons onSelect={handleSocialLogin} lastLoginMethod={null} />
        </div>
        <RegisterLink className="mt-4" />
      </AuthMobileShell>

      {/* ══════════════════ 데스크톱(lg+) ══════════════════ */}
      <AuthDesktopShell
        active="guest-order"
        headingTop="우리 아이를 위한 건강한 간식,"
        headingBottom="꼬순박스에 오신 걸 환영해요"
        contentGapPx={52}
      >
        <LookupFormFields
          orderId={orderId}
          setOrderId={setOrderId}
          phone={phone}
          setPhone={setPhone}
          orderIdId="guest-order-id"
          phoneId="guest-order-phone"
        />
        <LookupNotice />
        {errorText}

        <div className="mt-[52px]">
          <button type="submit" disabled={!isFormValid || isPending} className={authCtaButtonCls}>
            {isPending ? "조회 중..." : "주문 조회"}
          </button>
        </div>

        <p
          className="mt-6 text-center text-body-14-m text-[var(--color-text-secondary)]"
          style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
        >
          - 간편로그인 -
        </p>
        <div className="mt-6">
          <SocialLoginButtons onSelect={handleSocialLogin} lastLoginMethod={null} />
        </div>
        <RegisterLink className="mt-6" />
      </AuthDesktopShell>
    </form>
  );
}
