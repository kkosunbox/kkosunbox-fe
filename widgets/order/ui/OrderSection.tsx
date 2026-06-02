"use client";

import { useEffect, useId, useMemo, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import packageImageBasic from "@/widgets/home/package-plans/assets/package-image-basic.png";
import packageImageStandard from "@/widgets/home/package-plans/assets/package-image-standard.png";
import packageImagePremium from "@/widgets/home/package-plans/assets/package-image-premium.png";

const ORDER_TIER_IMAGES: Record<PackageTier, typeof packageImageBasic> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};
import type { BillingInfo } from "@/features/billing/api/types";
import { createDeliveryAddress } from "@/features/delivery-address/api/deliveryAddressApi";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import {
  createSubscription,
  getCouponInfo,
} from "@/features/subscription/api/subscriptionApi";
import type { CouponInfo, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { packageThemeForPlan, type PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
const inputCls =
  "h-10 w-full rounded-[8px] bg-[var(--color-surface-light)] px-3 text-body-13-m leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none";

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

function RadioCheckedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="var(--color-accent)" />
      <rect x="5" y="5" width="10" height="10" rx="5" fill="var(--color-accent)" />
    </svg>
  );
}

function QuantityMinusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--color-text-muted)" fillOpacity="0.3" />
      <path d="M8 12H16" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function QuantityPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--color-text-muted)" fillOpacity="0.3" />
      <path d="M12 15L12 9" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 12L9 12" stroke="var(--color-text)" strokeWidth="1.2" strokeLinecap="round" />
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
    <div className="max-md:rounded-none max-md:px-0 md:rounded-[20px] md:bg-white md:px-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between border-b border-[var(--color-text-muted)] text-left max-md:pb-3 md:pt-7 md:pb-5"
      >
        <span className="tracking-[-0.04em] text-[var(--color-text)] max-md:text-subtitle-16-b md:text-subtitle-18-b">{title}</span>
        <ChevronIcon open={open} />
      </button>
      <CollapsiblePanel id={contentId} open={open} innerClassName="max-md:pt-5 md:pt-5 md:pb-5">
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
          checked ? "" : "border border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked && <RadioCheckedIcon />}
      </button>
      <span className="text-body-14-m leading-[17px] tracking-[-0.02em] text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-0">
      <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px]">
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
  initialQuantity?: number;
}

export default function OrderSection({
  plan,
  initialAddresses,
  initialBilling,
  initialQuantity = 1,
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
  const [paymentMethod, setPaymentMethod] = useState<string>("신용카드");
  const [couponEnabled, setCouponEnabled] = useState(false);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const [quantity, setQuantity] = useState(initialQuantity);

  const [billing, setBilling] = useState<BillingInfo | null>(initialBilling);

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
      }
    }
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, []);

  function openPaymentPopup(method: string) {
    const url = `/payment?method=${encodeURIComponent(method)}`;
    window.open(url, "paymentPopup", "width=480,height=700,scrollbars=yes");
  }

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

    if (!billing) {
      setSubmitError("결제수단을 선택해 주세요.");
      return;
    }

    proceedSubscription();
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
          petProfileId: profile?.id,
          deliveryAddressId,
          planId: plan.id,
          quantity,
          couponCode:
            couponInfo?.canUse && couponCodeInput.trim() ? couponCodeInput.trim() : undefined,
        });

        router.refresh();
        router.push("/mypage/subscription?welcome=1");
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
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <SectionCard
        title="제품 정보"
        open={openSections.product}
        onToggle={() => toggleSection("product")}
      >
        <div>
          <div className="flex w-full items-center max-sm:gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]">
              <Image
                src={ORDER_TIER_IMAGES[orderPlanTheme.tier]}
                alt={plan.name}
                width={180}
                height={132}
                className="h-full w-auto max-w-none object-contain object-center"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <span
                className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
                style={{ background: orderPlanTheme.colorVar }}
              >
                {orderPlanTheme.tierLabel}
              </span>
              <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                {plan.name}
              </span>
              <span className="text-price-16-eb text-[var(--color-surface-dark)]">
                월 요금제 {formatPrice(unitPrice)}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
                >
                  <span className="max-md:hidden">−</span>
                  <span className="md:hidden">
                    <QuantityMinusIcon />
                  </span>
                </button>
                <span className="text-body-14-sb text-[var(--color-text)] min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  disabled={quantity >= 99}
                  className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
                >
                  <span className="max-md:hidden">+</span>
                  <span className="md:hidden">
                    <QuantityPlusIcon />
                  </span>
                </button>
              </div>
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
              {selectedAddress.nickname ? (
                <span className="text-body-13-m text-[var(--color-text)]">
                  {selectedAddress.nickname}
                </span>
              ) : null}
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
                className="flex h-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] px-2 py-1 text-body-13-m text-[var(--color-surface-light)] transition-opacity hover:opacity-90"
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormRow label="받는분">
                <input
                  value={newAddr.receiverName}
                  onChange={(e) => setNewAddr((s) => ({ ...s, receiverName: e.target.value }))}
                  className={`${inputCls} md:max-w-[220px]`}
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
                    className={`${inputCls} md:max-w-[220px]`}
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
              <div className="flex gap-3">
                <input
                  value={newAddr.zipCode}
                  readOnly
                  className={`${inputCls} min-w-0 cursor-default bg-[var(--color-surface-light)] md:max-w-[220px]`}
                />
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="flex h-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] px-2 py-1 text-body-13-m text-[var(--color-surface-light)] transition-opacity hover:opacity-90"
                >
                  주소찾기
                </button>
              </div>
            </FormRow>
            {/* 상세 주소 */}
            <FormRow label="">
              {newAddr.address ? (
                <div className="flex flex-col gap-2">
                  <input
                    readOnly
                    value={newAddr.address}
                    className={`${inputCls} cursor-default bg-[var(--color-surface-light)]`}
                    aria-label="검색된 기본 주소"
                  />
                  <input
                    value={newAddr.addressDetail}
                    onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                    className={inputCls}
                    placeholder="상세 주소를 입력해주세요"
                    aria-label="상세 주소"
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
            {/* 배송메모 */}
            <FormRow label="배송메모">
              <input
                value={newAddr.memo}
                onChange={(e) => setNewAddr((s) => ({ ...s, memo: e.target.value }))}
                className={`${inputCls} md:max-w-[220px]`}
                placeholder="배송 시 요청사항을 입력해주세요"
              />
            </FormRow>
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
                onChange={() => {
                  setPaymentMethod(method);
                  openPaymentPopup(method);
                }}
                label={method}
              />
            ))}
          </div>

          {/* 등록된 카드 정보 표시 — 클릭 시 카드 변경 팝업 */}
          {paymentMethod === "신용카드" && billing && (
            <button
              type="button"
              onClick={() => openPaymentPopup(paymentMethod)}
              className="flex items-center gap-3 border-t border-[var(--color-border-light)] pt-4 w-full text-left hover:opacity-70 transition-opacity"
            >
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
            </button>
          )}

          {/* 쿠폰 사용 */}
          <div className="flex flex-col gap-3 border-t border-[var(--color-border-light)] pt-4">
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
                <div className="flex items-start gap-0 md:items-center md:gap-4">
                  <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">
                    쿠폰입력
                  </span>
                  <div className="flex flex-1 gap-3 min-w-0">
                    <input
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className={`${inputCls} flex-1 min-w-0`}
                      placeholder="코드 입력"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      className="h-10 shrink-0 rounded-[8px] bg-[var(--color-why-bg)] px-3 text-body-13-m text-white"
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
                  <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">{couponError}</p>
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 md:flex-wrap">
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
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <SectionCard
        title="결제정보"
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
      >
        <div className="flex flex-col max-md:gap-4 md:gap-8">
            <div className="flex flex-col max-md:gap-4 md:gap-4">
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

            <div className="border-t border-[var(--color-border-light)]" />

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
                innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
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
              className="w-full h-12 rounded-[8px] bg-[var(--color-why-bg)] text-white text-body-16-sb tracking-[-0.02em] disabled:opacity-50"
            >
              {isPending ? "처리 중…" : "결제하기"}
            </button>
        </div>
      </SectionCard>

      <Link
        href="/checklist"
        className="block overflow-hidden max-md:mx-[calc(50%_-_50vw)] max-md:rounded-none md:rounded-[8px]"
      >
        <Image
          src="/images/sidebar-banner-001.png"
          alt="꼬순박스 배너 — 체크리스트 작성하러 가기"
          width={375}
          height={126}
          className="h-auto w-full"
        />
      </Link>
    </div>
  );

  const priceSummaryItems = [
    { label: "주문상품금액", value: formatPrice(basePrice), emphasis: false },
    { label: "총 할인금액", value: formatPrice(couponDiscount), emphasis: false },
    { label: "총 배송비", value: "0원", emphasis: false },
    { label: "총 주문금액", value: formatPrice(total), emphasis: true },
  ] as const;

  const priceSummaryBar = (
    <div className="w-full bg-[var(--color-why-bg)]">
      <div className="mx-auto flex w-full items-center justify-center px-4 max-md:h-[81px] md:h-[58px] md:max-w-[var(--max-width-content)] md:gap-10 md:px-4">
        <div className="flex w-full max-w-[327px] items-center justify-between md:max-w-none md:justify-center md:gap-10">
          {priceSummaryItems.map((item, index) => (
            <div key={item.label} className="flex items-center max-md:gap-2 md:gap-10">
              {index > 0 ? (
                <span className="text-subtitle-16-sb tracking-[-0.04em] text-white">
                  {index === 3 ? "=" : index === 2 ? "-" : "+"}
                </span>
              ) : null}
              <div className={item.emphasis ? "flex flex-col items-center md:flex-row md:gap-3" : "flex flex-col items-center md:flex-row md:gap-2"}>
                <span
                  className={[
                    "whitespace-nowrap tracking-[-0.04em]",
                    item.emphasis
                      ? "text-body-13-m text-[var(--color-accent-orange)] md:text-subtitle-16-b"
                      : "text-body-13-m text-white md:text-subtitle-16-sb",
                  ].join(" ")}
                >
                  {item.label}
                </span>
                <span
                  className={[
                    "whitespace-nowrap tracking-[-0.04em]",
                    item.emphasis
                      ? "text-body-14-sb text-[var(--color-accent-orange)] md:text-subtitle-20-b"
                      : "text-body-14-sb text-white md:text-subtitle-16-sb",
                  ].join(" ")}
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
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
      {priceSummaryBar}

      <div className="bg-white md:overflow-x-auto lg:overflow-x-auto">
        <div
          className="mx-auto max-md:px-6 max-md:pt-6 md:min-w-[900px] md:px-0 md:py-8"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="max-md:hidden md:grid md:grid-cols-[1fr_1px_327px] md:gap-x-8 items-start">
            {leftSections}
            <div className="self-stretch bg-[var(--color-text-muted)]" />
            {rightColumn}
          </div>

          <div className="flex flex-col gap-9 md:hidden">
            {leftSections}
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
