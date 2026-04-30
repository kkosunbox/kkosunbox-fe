"use client";

import { useEffect, useId, useMemo, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import { getErrorMessage } from "@/shared/lib/api";
import orderTitleImage from "@/widgets/order/assets/order-title-please-order.webp";
import orderProductThumbnail from "@/widgets/order/assets/order-product-thumbnail.webp";
import orderDogImage from "@/widgets/order/assets/order-advertise-banner.webp";
import heroLeftPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-left-paw.webp";
import heroRightPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-right-paw.webp";
import type { BillingInfo } from "@/features/billing/api/types";
import { createDeliveryAddress } from "@/features/delivery-address/api/deliveryAddressApi";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import {
  createSubscription,
  getCouponInfo,
} from "@/features/subscription/api/subscriptionApi";
import type { CouponInfo, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

const inputCls =
  "h-8 w-full rounded-[4px] bg-white px-3 text-body-13-m leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function formatPhoneNumber(digits: string): string {
  if (digits.startsWith("02")) {
    const d = digits.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (digits.startsWith("010")) {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  }
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

function isValidKoreanPhone(digits: string): boolean {
  // 02(서울) | 010/011/016~019(모바일) | 031~033/041~044/051~055/061~064/070(지역·VoIP)
  return /^(02\d{7,8}|01[016789]\d{7,8}|0(3[1-3]|4[1-4]|5[1-5]|6[1-4]|70)\d{7,8})$/.test(digits);
}

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

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="var(--color-accent)" strokeWidth="1.5" />
      <path
        d="M5.5 9L8 11.5L12.5 6.5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
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

function CollapsiblePanel({
  open,
  id,
  children,
  className = "",
  innerClassName = "",
}: {
  open: boolean;
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div
      id={id}
      aria-hidden={!open}
      inert={!open}
      className={className}
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: prefersReducedMotion
          ? "none"
          : "grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
      }}
    >
      <div className="min-h-0 overflow-hidden">
        {innerClassName ? <div className={innerClassName}>{children}</div> : children}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const contentId = useId();

  return (
    <div className="rounded-[20px] bg-[var(--color-surface-warm)] px-7">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full flex items-center justify-between py-7 text-left"
      >
        <span className="max-md:text-subtitle-16-b md:text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text)]">{title}</span>
        <ChevronIcon open={open} />
      </button>
      <CollapsiblePanel id={contentId} open={open} innerClassName="pb-7">
        {children}
      </CollapsiblePanel>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={onChange}
        className={[
          "w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-[var(--color-accent)]" : "border border-[var(--color-border)] bg-white",
        ].join(" ")}
      >
        {checked && <CheckIcon />}
      </button>
      <span className="text-body-13-m leading-[16px] text-[var(--color-text)]">{label}</span>
    </label>
  );
}

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
          checked ? "border-2 border-[var(--color-accent)]" : "border border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />}
      </button>
      <span className="text-body-14-m leading-[17px] tracking-[-0.02em] text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-0">
      <span className="w-[70px] shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)]">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export interface OrderSectionProps {
  plan: SubscriptionPlanDto;
  initialAddresses: DeliveryAddress[];
  initialBilling: BillingInfo | null;
}

export default function OrderSection({
  plan,
  initialAddresses,
  initialBilling,
}: OrderSectionProps) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { profile } = useProfile();
  const [isPending, startTransition] = useTransition();

  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    date: true,
    summary: true,
  });

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialAddresses[0]?.id ?? null,
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  // /address 새 창에서 선택한 배송지 수신
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "ADDRESS_SELECTED" && e.data.address) {
        const addr = e.data.address as DeliveryAddress;
        setAddresses((prev) => {
          const idx = prev.findIndex((a) => a.id === addr.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = addr;
            return next;
          }
          return [...prev, addr];
        });
        setSelectedAddressId(addr.id);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const [newAddr, setNewAddr] = useState({
    receiverName: "",
    phoneNumber: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    memo: "",
  });
  const [saveInfo, setSaveInfo] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("신용카드");
  const [couponEnabled, setCouponEnabled] = useState(false);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const [billing, setBilling] = useState<BillingInfo | null>(initialBilling);

  // 팝업에서 결제 확정 시 구독 생성 트리거
  const [confirmedPayment, setConfirmedPayment] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // /payment 팝업에서 결제수단/카드 선택 결과 수신
  useEffect(() => {
    function handlePaymentMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "PAYMENT_SELECTED") {
        const { method, billing: selectedBilling } = e.data as {
          method: string;
          billing?: BillingInfo;
        };
        setPaymentMethod(method);
        if (selectedBilling) {
          setBilling(selectedBilling);
        }
        setConfirmedPayment(true);
      }
    }
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, []);

  // 결제 확정 시 구독 생성 진행
  useEffect(() => {
    if (!confirmedPayment) return;
    setConfirmedPayment(false);
    proceedSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedPayment]);

  const unitPrice = plan.monthlyPrice;
  const basePrice = unitPrice * quantity;
  const couponDiscount = useMemo(() => {
    if (!couponInfo?.canUse || !couponInfo.discountRate) return 0;
    // 쿠폰은 단가 1개에만 적용
    return Math.floor((unitPrice * couponInfo.discountRate) / 100);
  }, [unitPrice, couponInfo]);

  const total = Math.max(0, basePrice - couponDiscount);

  const agreeAll = agreeTerms && agreePrivacy && agreeAge;
  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeAge(next);
  }

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    const code = couponCodeInput.trim();
    if (!code) {
      setCouponError("쿠폰 코드를 입력해 주세요.");
      setCouponInfo(null);
      return;
    }
    try {
      const info = await getCouponInfo({ code });
      setCouponInfo(info);
      if (!info.canUse) {
        setCouponError(info.unavailableReason ?? "사용할 수 없는 쿠폰입니다.");
      }
    } catch (err) {
      setCouponInfo(null);
      setCouponError(getErrorMessage(err, "쿠폰 확인에 실패했습니다."));
    }
  }

  function handlePay() {
    setSubmitError(null);
    if (!agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }

    if (!selectedAddress) {
      const rawPhone = digitsOnly(newAddr.phoneNumber);
      if (
        !newAddr.receiverName.trim() ||
        !rawPhone ||
        !newAddr.zipCode.trim() ||
        !newAddr.address.trim()
      ) {
        setSubmitError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
        return;
      }
      if (!isValidKoreanPhone(rawPhone)) {
        setPhoneError("올바른 전화번호 형식이 아닙니다.");
        return;
      }
    }

    // 결제수단 선택 팝업 열기
    const url = `/payment?method=${encodeURIComponent(paymentMethod)}`;
    window.open(url, "paymentPopup", "width=480,height=700,scrollbars=yes");
  }

  function proceedSubscription() {
    showLoading("구독을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        let deliveryAddressId = selectedAddressId;

        if (!selectedAddress) {
          const created = await createDeliveryAddress({
            receiverName: newAddr.receiverName.trim(),
            phoneNumber: digitsOnly(newAddr.phoneNumber),
            zipCode: newAddr.zipCode.trim(),
            address: newAddr.address.trim(),
            addressDetail: newAddr.addressDetail.trim() || undefined,
            memo: newAddr.memo.trim() || undefined,
          });
          deliveryAddressId = created.id;
          setAddresses((prev) => [...prev, created]);
          setSelectedAddressId(created.id);
        }

        if (deliveryAddressId === null) {
          hideLoading();
          setSubmitError("배송지를 선택하거나 입력해 주세요.");
          return;
        }

        await createSubscription({
          petProfileId: profile!.id,
          deliveryAddressId,
          planId: plan.id,
          quantity,
          couponCode:
            couponInfo?.canUse && couponCodeInput.trim() ? couponCodeInput.trim() : undefined,
        });

        router.refresh();
        router.push("/mypage/subscription");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "결제 처리 중 오류가 발생했습니다.") });
      } finally {
        hideLoading();
      }
    });
  }

  function handleChangeAddress() {
    const url = selectedAddressId
      ? `/address?selectedId=${selectedAddressId}`
      : "/address";
    window.open(url, "addressPopup", "width=480,height=700,scrollbars=yes");
  }

  function handleSearchAddress() {
    if (typeof window !== "undefined" && window.daum) {
      const postcode = new window.daum.Postcode({
        oncomplete(data: { zonecode: string; roadAddress: string; jibunAddress: string; addressType: string }) {
          const addr = data.addressType === "R" ? data.roadAddress : data.jibunAddress;
          setNewAddr((s) => ({ ...s, zipCode: data.zonecode, address: addr }));
        },
        width: "100%",
        height: "100%",
      }) as { embed: (el: HTMLElement) => void; open: () => void };
      postcode.open();
    }
  }

  const orderPlanTheme = packageThemeForPlan(plan);

  const leftSections = (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="제품 정보"
        open={openSections.product}
        onToggle={() => toggleSection("product")}
      >
        <div className="rounded-[20px] bg-white px-7 max-md:pt-3 max-md:pb-7 md:py-7 max-md:flex max-md:flex-col max-md:items-center max-md:gap-5 md:flex md:items-center md:gap-6">
          <div className="max-md:w-[180px] max-md:h-[132px] md:w-[160px] md:h-[117px] shrink-0 flex items-center justify-center rounded-xl overflow-hidden">
            <Image
              src={orderProductThumbnail}
              alt={plan.name}
              width={180}
              height={132}
              className="object-contain md:-translate-y-2"
            />
          </div>
          <div className="flex flex-col gap-3 max-md:w-full max-md:px-2">
            <span
              className="inline-flex items-center justify-center px-3 py-1 rounded-[30px] text-body-14-sb leading-[17px] text-white w-fit"
              style={{ background: orderPlanTheme.colorVar }}
            >
              {orderPlanTheme.tierLabel}
            </span>
            <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
              {plan.name}
            </span>
            <span className="max-md:text-price-14-eb md:text-price-16-eb text-[var(--color-surface-dark)]">
              월 요금제 {formatPrice(unitPrice)}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-full border border-[var(--color-border)] flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
              >
                −
              </button>
              <span className="text-body-14-sb text-[var(--color-text)] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                disabled={quantity >= 99}
                className="w-7 h-7 rounded-full border border-[var(--color-border)] flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="주문고객 / 배송지 정보"
        open={openSections.customer}
        onToggle={() => toggleSection("customer")}
      >
        {selectedAddress ? (
          /* ── 저장된 배송지 읽기 전용 뷰 ── */
          <div className="flex flex-col gap-3 pb-1">
            {/* 라벨 + 이름 | 전화번호 | 이메일 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-body-13-m text-[var(--color-text)]">우리집</span>
              <CheckCircleIcon />
              <span className="text-body-13-m text-[var(--color-text)]">{selectedAddress.receiverName}</span>
              <span className="text-body-13-m text-[var(--color-text-secondary)]">|</span>
              <span className="text-body-13-m text-[var(--color-text)]">{selectedAddress.phoneNumber}</span>
            </div>
            {/* 주소 + 배송지 변경 버튼 */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-body-13-m text-[var(--color-text)]">
                {selectedAddress.address}
                {selectedAddress.addressDetail ? ` ${selectedAddress.addressDetail}` : ""}
              </span>
              <button
                type="button"
                onClick={handleChangeAddress}
                className="shrink-0 rounded-[4px] bg-[var(--color-accent)] px-3 py-1.5 text-body-13-m text-white"
              >
                배송지 변경
              </button>
            </div>
            {/* 메모 */}
            {selectedAddress.memo && (
              <span className="text-body-13-m text-[var(--color-text-secondary)]">
                {selectedAddress.memo}
              </span>
            )}
          </div>
        ) : (
          /* ── 새 배송지 입력 폼 ── */
          <div className="flex flex-col gap-4">
            {/* 받는분 / 휴대폰 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRow label="받는분">
                <input
                  value={newAddr.receiverName}
                  onChange={(e) => setNewAddr((s) => ({ ...s, receiverName: e.target.value }))}
                  className={`${inputCls} max-w-[220px]`}
                  placeholder="이름"
                />
              </FormRow>
              <FormRow label="휴대폰">
                <div className="flex flex-col gap-1">
                  <input
                    value={newAddr.phoneNumber}
                    onChange={(e) => {
                      setPhoneError(null);
                      setNewAddr((s) => ({
                        ...s,
                        phoneNumber: formatPhoneNumber(digitsOnly(e.target.value)),
                      }));
                    }}
                    onBlur={() => {
                      const raw = digitsOnly(newAddr.phoneNumber);
                      if (raw && !isValidKoreanPhone(raw)) {
                        setPhoneError("올바른 전화번호 형식이 아닙니다.");
                      }
                    }}
                    className={`${inputCls} max-w-[220px]`}
                    placeholder="010-0000-0000"
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="text-body-13-m text-red-600 pl-1" role="alert">{phoneError}</p>
                  )}
                </div>
              </FormRow>
            </div>
            {/* 우편번호 + 주소찾기 */}
            <FormRow label="우편번호">
              <div className="flex gap-2">
                <input
                  value={newAddr.zipCode}
                  readOnly
                  className={`${inputCls} max-w-[220px] cursor-default bg-[var(--color-surface-light)]`}
                />
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="h-8 shrink-0 rounded-[4px] bg-[var(--color-accent)] px-3 text-body-13-m text-white"
                >
                  주소찾기
                </button>
              </div>
            </FormRow>
            {/* 상세 주소 */}
            <FormRow label="">
              {newAddr.address ? (
                <div className="flex flex-col gap-2">
                  <p className="text-body-13-m text-[var(--color-text)]">{newAddr.address}</p>
                  <input
                    value={newAddr.addressDetail}
                    onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                    className={inputCls}
                    placeholder="상세 주소를 입력해주세요"
                  />
                </div>
              ) : (
                <input
                  value={newAddr.addressDetail}
                  onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                  className={inputCls}
                  placeholder="상세 주소를 입력해주세요"
                />
              )}
            </FormRow>
            {/* 배송메모 + 배송지 정보 저장 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRow label="배송메모">
                <input
                  value={newAddr.memo}
                  onChange={(e) => setNewAddr((s) => ({ ...s, memo: e.target.value }))}
                  className={`${inputCls} max-w-[220px]`}
                  placeholder="배송 시 요청사항을 입력해주세요"
                />
              </FormRow>
              <div className="flex items-center">
                <Checkbox checked={saveInfo} onChange={() => setSaveInfo((v) => !v)} label="배송지 정보 저장" />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="결제수단 선택"
        open={openSections.payment}
        onToggle={() => toggleSection("payment")}
      >
        <div className="flex flex-col gap-4">
          {/* 결제 수단 라디오 — 현재 신용카드만 지원 */}
          <div className="flex items-center gap-8 flex-wrap">
            {["신용카드" /* TODO: "카카오페이", "무통장입금", "계좌이체" — 추후 지원 예정 */].map((method) => (
              <RadioButton
                key={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                label={method}
              />
            ))}
          </div>

          {/* 등록된 카드 정보 표시 */}
          {paymentMethod === "신용카드" && billing && (
            <div className="flex items-center gap-3 border-t border-white pt-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="var(--color-text)" strokeWidth="1.5" />
                <path d="M2 10H22" stroke="var(--color-text)" strokeWidth="1.5" />
              </svg>
              <span className="text-body-13-m text-[var(--color-text)]">
                {billing.cardCompany} **** {billing.lastFourDigits}
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* 쿠폰 사용 */}
          <div className="flex flex-col gap-3 border-t border-white pt-4">
            <Checkbox
              checked={couponEnabled}
              onChange={() => {
                setCouponEnabled((v) => !v);
                if (couponEnabled) {
                  setCouponCodeInput("");
                  setCouponInfo(null);
                  setCouponError(null);
                }
              }}
              label="쿠폰사용"
            />
            {couponEnabled && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="w-[70px] shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)]">
                    쿠폰입력
                  </span>
                  <div className="flex gap-2 flex-1 min-w-0">
                    <input
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className={`${inputCls} flex-1 min-w-0`}
                      placeholder="코드 입력"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      className="h-8 shrink-0 rounded-[4px] bg-[var(--color-accent)] px-3 text-body-13-m text-white"
                    >
                      쿠폰적용
                    </button>
                  </div>
                  {couponInfo?.canUse ? (
                    <span className="shrink-0 text-body-13-m text-[var(--color-text-secondary)]">
                      {couponInfo.name ?? `할인쿠폰`} {couponInfo.discountRate}% -{formatPrice(couponDiscount)}
                    </span>
                  ) : null}
                </div>
                {couponError ? (
                  <p className="text-body-12-m text-red-600 pl-[70px]">{couponError}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="배송방법"
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-body-14-sb leading-[17px] text-[var(--color-text)]">
            우체국택배
          </span>
          <span className="text-body-13-m leading-[140%] text-[var(--color-text-secondary)]">
            월~목 배송 / 오전 11시 이후 주문 시 익일 발송
          </span>
        </div>
      </SectionCard>
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="결제정보"
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
      >
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">
                  주문상품금액{quantity > 1 ? ` ×${quantity}` : ""}
                </span>
                <span className="text-body-13-m text-[var(--color-text)]">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">총 쿠폰 할인금액</span>
                <span className="text-body-13-m text-[var(--color-text)]">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
                <span className="text-body-13-m text-[var(--color-text)]">-0원</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-body-14-b text-[var(--color-text)]">월 요금제</span>
              <span className="text-price-20-eb text-[var(--color-text)]">{formatPrice(total)}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="모두 동의합니다." />
                <button
                  type="button"
                  onClick={() => setAgreeOpen((p) => !p)}
                  aria-expanded={agreeOpen}
                  aria-controls="order-agreements-panel"
                  className="transition-transform duration-200"
                  style={{ transform: agreeOpen ? "matrix(1,0,0,-1,0,0)" : "none" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
              <CollapsiblePanel
                id="order-agreements-panel"
                open={agreeOpen}
                className="mt-3"
                innerClassName="flex flex-col gap-2.5 border-t border-white pt-3 pl-1"
              >
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
              </CollapsiblePanel>
            </div>

            {submitError ? (
              <p className="text-body-13-m text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!agreeAll || isPending}
              onClick={handlePay}
              className="w-full h-12 rounded-[30px] bg-[var(--color-accent)] text-white text-subtitle-18-sb disabled:opacity-50"
            >
              {isPending ? "처리 중…" : "결제하기"}
            </button>
        </div>
      </SectionCard>

      <div
        className="rounded-[20px] flex justify-center items-center gap-0 overflow-hidden"
        style={{ background: "var(--color-surface-light)", height: "104px" }}
      >
        <div className="shrink-0 flex items-center justify-center" style={{ width: "110px", height: "104px" }}>
          <Image
            src={orderDogImage}
            alt="강아지"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Image src={logoMain} alt="꼬순박스" width={64} height={22} className="object-contain object-left" />
          <span
            style={{ fontFamily: '"Griun Fromsol", sans-serif', fontSize: "16px", lineHeight: "21px", color: "var(--color-text)" }}
          >
            100% 국내산
          </span>
          <span
            style={{ fontFamily: '"Griun Fromsol", sans-serif', fontSize: "16px", lineHeight: "21px", color: "var(--color-text)" }}
          >
            휴먼그레이드 수제간식 구독
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <div
        className="relative overflow-hidden py-10 md:h-[160px] md:py-0 flex items-center justify-center"
        style={{ background: "var(--gradient-checklist-hero)" }}
      >
        <Image
          src={heroLeftPaw}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[25%] top-1/2 h-auto w-[74px] -translate-y-1/2 max-md:hidden"
        />
        <Image
          src={heroRightPaw}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[69%] top-[60%] h-auto w-[60px] -translate-y-1/2 max-md:hidden"
        />
        <Image
          src={heroRightPaw}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[72%] top-[36%] h-auto w-[38px] -translate-y-1/2 max-md:hidden"
        />
        <div className="relative z-10 text-center px-4 flex flex-col items-center gap-4">
          <Image
            src={orderTitleImage}
            alt="주문을 완료해주세요!"
            width={400}
            height={60}
            className="max-md:w-[200px] md:w-[268px] h-auto object-contain"
            priority
          />
          <p
            className="max-md:text-[14px] md:text-[16px] leading-5 tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
          >
            입력하신 정보가 맞는지 확인 후 결제하기 버튼을 눌러주세요.
          </p>
        </div>
      </div>

      <div className="bg-white md:overflow-x-auto">
        <div
          className="mx-auto px-4 md:px-0 py-6 md:py-8 md:min-w-[900px]"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="max-md:hidden mb-4">
            <div
              className="rounded-[20px] flex items-center justify-center h-20 gap-10"
              style={{ background: "var(--color-surface-warm)" }}
            >
              <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                주문상품금액&nbsp;&nbsp;{formatPrice(basePrice)}
              </span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">+</span>
              <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                총 할인금액&nbsp;&nbsp;
                <span className={couponDiscount > 0 ? "text-[var(--color-primary)]" : ""}>
                  {formatPrice(couponDiscount)}
                </span>
              </span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">-</span>
              <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                총 배송비&nbsp;&nbsp;0원
              </span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">=</span>
              <div className="flex items-center gap-3">
                <span className="text-subtitle-16-b tracking-[-0.04em] text-[var(--color-primary)]">총 주문금액</span>
                <span className="text-subtitle-20-b tracking-[-0.04em] text-[var(--color-primary)]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="max-md:hidden md:grid md:grid-cols-[1fr_327px] gap-4 items-start">
            {leftSections}
            {rightColumn}
          </div>

          <div className="max-md:flex max-md:flex-col md:hidden gap-4">
            {leftSections}
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
