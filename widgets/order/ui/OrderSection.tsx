"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import { ApiError } from "@/shared/lib/api";
import { registerBilling, getBillingTerms } from "@/features/billing/api/billingApi";
import type { BillingTermsType } from "@/features/billing/api/types";
import { createDeliveryAddress } from "@/features/delivery-address/api/deliveryAddressApi";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import type { Profile } from "@/features/profile/api/types";
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

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
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
        <span className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text)]">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="pb-7">{children}</div>}
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
  label: React.ReactNode;
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

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0">
      <span className="w-[70px] shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)]">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const BILLING_TERM_TYPES: BillingTermsType[] = [
  "ElectronicFinancialTransactions",
  "CollectPersonalInfo",
  "SharingPersonalInformation",
];

export interface OrderSectionProps {
  plan: SubscriptionPlanDto;
  profiles: Profile[];
  initialAddresses: DeliveryAddress[];
  hasBilling: boolean;
}

export default function OrderSection({
  plan,
  profiles,
  initialAddresses,
  hasBilling: hasBillingProp,
}: OrderSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [openSections, setOpenSections] = useState({
    product: true,
    pet: true,
    customer: true,
    payment: true,
    date: true,
    summary: true,
  });

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(initialAddresses);
  const [selectedProfileId, setSelectedProfileId] = useState<number>(profiles[0]!.id);
  const [addressMode, setAddressMode] = useState<"existing" | "new">(
    initialAddresses.length ? "existing" : "new",
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialAddresses[0]?.id ?? null,
  );

  const [newAddr, setNewAddr] = useState({
    receiverName: "",
    phoneNumber: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    memo: "",
  });

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const today = new Date();
  const minBillingDate = addDays(today, 7);
  const maxBillingDate = addDays(today, 365);
  const [subscriptionDate, setSubscriptionDate] = useState<Date | null>(null);

  const [agreeOpen, setAgreeOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeBillingTerms, setAgreeBillingTerms] = useState(false);

  const [billingRegistered, setBillingRegistered] = useState(hasBillingProp);
  const [card, setCard] = useState({
    cardNo: "",
    expYear: "",
    expMonth: "",
    idNo: "",
    cardPw: "",
    buyerName: "",
    buyerEmail: "",
    buyerTel: "",
  });

  const [billingTerms, setBillingTerms] = useState<
    Partial<Record<BillingTermsType, { title: string; content: string }>>
  >({});
  const [termsOpen, setTermsOpen] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (hasBillingProp) return;
    let cancelled = false;
    Promise.all(
      BILLING_TERM_TYPES.map(async (t) => {
        const res = await getBillingTerms(t);
        return [t, res] as const;
      }),
    )
      .then((pairs) => {
        if (cancelled) return;
        const next: Partial<Record<BillingTermsType, { title: string; content: string }>> = {};
        for (const [t, res] of pairs) {
          next[t] = { title: res.termsTitle, content: res.content };
        }
        setBillingTerms(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasBillingProp]);

  const basePrice = plan.monthlyPrice;
  const couponDiscount = useMemo(() => {
    if (!couponInfo?.canUse || !couponInfo.discountRate) return 0;
    return Math.floor((basePrice * couponInfo.discountRate) / 100);
  }, [basePrice, couponInfo]);

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
      if (err instanceof ApiError) {
        setCouponError(err.message || "쿠폰 확인에 실패했습니다.");
      } else {
        setCouponError("쿠폰 확인에 실패했습니다.");
      }
    }
  }

  function handlePay() {
    setSubmitError(null);
    if (!agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }
    if (!billingRegistered && !agreeBillingTerms) {
      setSubmitError("전자금융거래 약관에 동의해 주세요.");
      return;
    }
    if (!subscriptionDate) {
      setSubmitError("구독 결제일을 선택해 주세요.");
      return;
    }

    startTransition(async () => {
      try {
        let deliveryAddressId = selectedAddressId;

        if (addressMode === "new") {
          if (
            !newAddr.receiverName.trim() ||
            !digitsOnly(newAddr.phoneNumber) ||
            !newAddr.zipCode.trim() ||
            !newAddr.address.trim()
          ) {
            setSubmitError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
            return;
          }
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
          setSubmitError("배송지를 선택하거나 입력해 주세요.");
          return;
        }

        if (!billingRegistered) {
          const cardNo = digitsOnly(card.cardNo);
          if (cardNo.length < 15 || card.expMonth.length !== 2 || card.expYear.length !== 2) {
            setSubmitError("카드 번호와 유효기간을 확인해 주세요.");
            return;
          }
          if (card.idNo.length < 6 || card.cardPw.length !== 2) {
            setSubmitError("생년월일(또는 사업자번호)과 카드 비밀번호 앞 2자리를 입력해 주세요.");
            return;
          }
          await registerBilling({
            cardNo,
            expYear: card.expYear,
            expMonth: card.expMonth,
            idNo: card.idNo,
            cardPw: card.cardPw,
            buyerName: card.buyerName.trim() || undefined,
            buyerEmail: card.buyerEmail.trim() || undefined,
            buyerTel: digitsOnly(card.buyerTel) || undefined,
          });
          setBillingRegistered(true);
        }

        await createSubscription({
          petProfileId: selectedProfileId,
          deliveryAddressId,
          planId: plan.id,
          billingDate: toYmd(subscriptionDate),
          couponCode:
            couponInfo?.canUse && couponCodeInput.trim() ? couponCodeInput.trim() : undefined,
        });

        router.refresh();
        router.push("/mypage/subscription");
      } catch (err) {
        if (err instanceof ApiError) {
          setSubmitError(err.message || `처리 실패 (${err.code})`);
        } else {
          setSubmitError("처리 중 오류가 발생했습니다.");
        }
      }
    });
  }

  const orderPlanTheme = packageThemeForPlan(plan);

  const leftSections = (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="제품 정보"
        open={openSections.product}
        onToggle={() => toggleSection("product")}
      >
        <div className="rounded-[20px] bg-white px-7 py-7 flex items-center gap-6">
          <div className="w-[120px] h-[120px] md:w-[160px] md:h-[117px] shrink-0 flex items-center justify-center rounded-xl bg-[var(--color-card-premium)] text-4xl select-none">
            📦
          </div>
          <div className="flex flex-col gap-3">
            <span
              className="inline-flex items-center justify-center px-3 py-1 rounded-[30px] text-body-14-sb leading-[17px] text-white w-fit"
              style={{ background: orderPlanTheme.colorVar }}
            >
              {orderPlanTheme.tierLabelKo}
            </span>
            <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
              {plan.name}
            </span>
            <span className="text-price-16-eb text-[var(--color-surface-dark)]">
              월 요금제 {formatPrice(plan.monthlyPrice)}
            </span>
          </div>
        </div>
      </SectionCard>

      {profiles.length > 1 ? (
        <SectionCard title="반려동물 프로필" open={openSections.pet} onToggle={() => toggleSection("pet")}>
          <div className="flex flex-col gap-3">
            {profiles.map((p) => (
              <RadioButton
                key={p.id}
                checked={selectedProfileId === p.id}
                onChange={() => setSelectedProfileId(p.id)}
                label={p.name?.trim() || `프로필 #${p.id}`}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="배송지 정보"
        open={openSections.customer}
        onToggle={() => toggleSection("customer")}
      >
        <div className="flex flex-col gap-4">
          {addresses.length > 0 ? (
            <div className="flex flex-col gap-2">
              <RadioButton
                checked={addressMode === "existing"}
                onChange={() => setAddressMode("existing")}
                label="저장된 배송지"
              />
              {addressMode === "existing" ? (
                <div className="ml-7 flex flex-col gap-2 border-t border-white pt-3">
                  {addresses.map((a) => (
                    <RadioButton
                      key={a.id}
                      checked={selectedAddressId === a.id}
                      onChange={() => {
                        setSelectedAddressId(a.id);
                        setAddressMode("existing");
                      }}
                      label={`${a.receiverName} · ${a.address}`}
                    />
                  ))}
                </div>
              ) : null}
              <RadioButton
                checked={addressMode === "new"}
                onChange={() => setAddressMode("new")}
                label="새 배송지 입력"
              />
            </div>
          ) : null}

          {(addressMode === "new" || addresses.length === 0) && (
            <div className="flex flex-col gap-4 border-t border-white pt-4">
              <FormRow label="받는분">
                <input
                  value={newAddr.receiverName}
                  onChange={(e) => setNewAddr((s) => ({ ...s, receiverName: e.target.value }))}
                  className={inputCls}
                  placeholder="이름"
                />
              </FormRow>
              <FormRow label="연락처">
                <input
                  value={newAddr.phoneNumber}
                  onChange={(e) => setNewAddr((s) => ({ ...s, phoneNumber: e.target.value }))}
                  className={inputCls}
                  placeholder="- 없이 숫자만"
                />
              </FormRow>
              <FormRow label="우편번호">
                <input
                  value={newAddr.zipCode}
                  onChange={(e) => setNewAddr((s) => ({ ...s, zipCode: e.target.value }))}
                  className={inputCls}
                />
              </FormRow>
              <FormRow label="주소">
                <input
                  value={newAddr.address}
                  onChange={(e) => setNewAddr((s) => ({ ...s, address: e.target.value }))}
                  className={inputCls}
                  placeholder="기본 주소"
                />
              </FormRow>
              <FormRow label="">
                <input
                  value={newAddr.addressDetail}
                  onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                  className={inputCls}
                  placeholder="상세 주소"
                />
              </FormRow>
              <FormRow label="배송메모">
                <input
                  value={newAddr.memo}
                  onChange={(e) => setNewAddr((s) => ({ ...s, memo: e.target.value }))}
                  className={inputCls}
                  placeholder="요청사항 (선택)"
                />
              </FormRow>
            </div>
          )}

          <div className="border-t border-white" />
        </div>
      </SectionCard>

      <SectionCard
        title="결제 수단"
        open={openSections.payment}
        onToggle={() => toggleSection("payment")}
      >
        <div className="flex flex-col gap-4">
          {billingRegistered ? (
            <p className="text-body-13-m text-[var(--color-text-secondary)]">
              등록된 카드로 정기 결제가 진행됩니다.
            </p>
          ) : (
            <>
              <p className="text-body-13-m text-[var(--color-text-secondary)]">
                신용카드 정보를 입력해 주세요. (정기 결제 빌링 등록)
              </p>
              <FormRow label="카드번호">
                <input
                  value={card.cardNo}
                  onChange={(e) => setCard((s) => ({ ...s, cardNo: e.target.value }))}
                  className={inputCls}
                  placeholder="16자리"
                  inputMode="numeric"
                />
              </FormRow>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <FormRow label="월">
                  <input
                    value={card.expMonth}
                    onChange={(e) => setCard((s) => ({ ...s, expMonth: e.target.value }))}
                    className={inputCls}
                    placeholder="MM"
                    maxLength={2}
                  />
                </FormRow>
                <FormRow label="년">
                  <input
                    value={card.expYear}
                    onChange={(e) => setCard((s) => ({ ...s, expYear: e.target.value }))}
                    className={inputCls}
                    placeholder="YY"
                    maxLength={2}
                  />
                </FormRow>
              </div>
              <FormRow label="생년월일">
                <input
                  value={card.idNo}
                  onChange={(e) => setCard((s) => ({ ...s, idNo: e.target.value }))}
                  className={inputCls}
                  placeholder="YYMMDD 또는 사업자번호"
                />
              </FormRow>
              <FormRow label="카드비밀번호">
                <input
                  type="password"
                  value={card.cardPw}
                  onChange={(e) => setCard((s) => ({ ...s, cardPw: e.target.value }))}
                  className={inputCls}
                  placeholder="앞 2자리"
                  maxLength={2}
                />
              </FormRow>
              <div className="flex flex-col gap-2 border-t border-white pt-3">
                <Checkbox
                  checked={agreeBillingTerms}
                  onChange={() => setAgreeBillingTerms((v) => !v)}
                  label="결제·개인정보 관련 약관에 동의합니다 (필수)"
                />
                <button
                  type="button"
                  onClick={() => setTermsOpen((o) => !o)}
                  className="text-left text-body-13-m text-[var(--color-accent)]"
                >
                  {termsOpen ? "약관 접기" : "약관 내용 보기"}
                </button>
                {termsOpen ? (
                  <div className="max-h-48 overflow-y-auto rounded-[8px] bg-white p-3 text-body-12-r text-[var(--color-text-secondary)]">
                    {BILLING_TERM_TYPES.map((t) => {
                      const block = billingTerms[t];
                      if (!block) return null;
                      return (
                        <div key={t} className="mb-3">
                          <p className="font-semibold text-[var(--color-text)]">{block.title}</p>
                          <p className="whitespace-pre-wrap">{block.content}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-white pt-4">
            <FormRow label="쿠폰">
              <div className="flex gap-2">
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
                  적용
                </button>
              </div>
            </FormRow>
            {couponError ? (
              <p className="text-body-12-m text-red-600 pl-[70px]">{couponError}</p>
            ) : null}
            {couponInfo?.canUse ? (
              <p className="text-body-13-m text-[var(--color-text-secondary)] pl-[70px]">
                할인 {couponInfo.discountRate}% 적용 예상
              </p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="구독 결제일"
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-[120px] shrink-0">
            <DatePicker
              value={subscriptionDate}
              onChange={setSubscriptionDate}
              placeholder="날짜 선택"
              minDate={minBillingDate}
              maxDate={maxBillingDate}
              triggerClassName="!h-[34px] !rounded-[5px] !border-[var(--color-text-muted)] !px-3"
            />
          </div>
          <p className="text-body-13-m leading-[140%] text-[var(--color-text-secondary)]">
            첫 정기 결제일은 오늘 기준 최소 7일 이후부터 선택할 수 있습니다.
          </p>
        </div>
      </SectionCard>
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col gap-4">
      <div className="rounded-[20px] bg-[var(--color-surface-warm)] px-7">
        <button
          type="button"
          onClick={() => toggleSection("summary")}
          className="w-full flex items-center justify-between py-7 text-left"
        >
          <span className="text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text)]">
            결제정보
          </span>
          <ChevronIcon open={openSections.summary} />
        </button>

        {openSections.summary && (
          <div className="pb-7 flex flex-col gap-8">
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">주문상품금액</span>
                <span className="text-body-13-m text-[var(--color-text)]">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">쿠폰 할인</span>
                <span className="text-body-13-m text-[var(--color-text)]">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
            </div>

            <div className="border-t border-white" />

            <div className="flex justify-between items-center">
              <span className="text-body-14-b text-[var(--color-text)]">월 요금제 (예상)</span>
              <span className="text-price-20-eb text-[var(--color-text)]">{formatPrice(total)}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="모두 동의합니다." />
                <button
                  type="button"
                  onClick={() => setAgreeOpen((p) => !p)}
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
        )}
      </div>

      <div
        className="rounded-[20px] flex items-center gap-0 overflow-hidden"
        style={{ background: "var(--color-surface-light)", height: "104px" }}
      >
        <div
          className="shrink-0 flex items-center justify-center text-emoji-40 select-none"
          style={{ width: "110px", height: "104px" }}
        >
          🐕
        </div>
        <div className="flex flex-col gap-1">
          <Image src={logoMain} alt="꼬순박스" width={64} height={22} className="object-contain object-left" />
          <span
            className="text-brand-display-14"
            style={{ fontFamily: '"GangwonEduPower", sans-serif', color: "var(--color-text)" }}
          >
            브랜드 할인 쿠폰
          </span>
          <span
            className="text-brand-display-24"
            style={{
              fontFamily: '"GangwonEduPower", sans-serif',
              letterSpacing: "-0.06em",
              color: "var(--color-text-sub)",
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
          <h1 className="max-md:text-display-32-b md:text-display-36-b text-[var(--color-primary)] mb-2">
            주문을 완료해주세요!
          </h1>
          <p className="max-md:text-body-14-m md:text-body-16-m text-[var(--color-text-on-warm)]">
            입력하신 정보가 맞는지 확인 후 결제하기 버튼을 눌러주세요.
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div
          className="mx-auto px-4 md:px-6 py-6 md:py-8"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="max-md:hidden mb-4">
            <div
              className="rounded-[20px] flex items-center justify-center h-20 gap-10"
              style={{ background: "var(--color-surface-warm)" }}
            >
              <span className="text-subtitle-16-sb text-[var(--color-text)]">
                주문상품금액 {formatPrice(basePrice)}
              </span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">-</span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">
                쿠폰 할인 {formatPrice(couponDiscount)}
              </span>
              <span className="text-subtitle-16-sb text-[var(--color-text)]">=</span>
              <div className="flex items-center gap-2">
                <span className="text-subtitle-16-b text-[var(--color-primary)]">월 예상 금액</span>
                <span className="text-subtitle-20-b text-[var(--color-primary)]">{formatPrice(total)}</span>
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
