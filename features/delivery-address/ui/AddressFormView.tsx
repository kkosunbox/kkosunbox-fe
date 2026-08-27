"use client";

import { useRef, useState } from "react";
import type { DeliveryAddress } from "../api/types";
import {
  createDeliveryAddress,
  updateDeliveryAddress,
} from "../api/deliveryAddressApi";
import { digitsOnly, formatPhoneNumber, isValidKoreanPhone } from "@/shared/lib/format";
import {
  DELIVERY_RECEIVER_NAME_MAX_LENGTH,
  DELIVERY_ADDRESS_DETAIL_MAX_LENGTH,
  DELIVERY_ADDRESS_NICKNAME_MAX_LENGTH,
} from "@/shared/config/inputLimits";

interface Props {
  editingAddress: DeliveryAddress | null;
  onSaved: (address: DeliveryAddress) => void;
  onClose: () => void;
  onSearchAddress: () => void;
  pendingZipCode: string;
  pendingAddress: string;
}

const LABEL_CLS = "w-[54px] shrink-0 text-body-13-m text-[var(--color-text)]";
/** Text input height: 40px — see `shared/config/input.ts` */
const INPUT_CLS =
  "h-10 flex-1 min-w-0 rounded-[4px] border border-transparent bg-[var(--color-surface-light)] px-3 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-orange)]";

const MEMO_MAX_LENGTH = 40;
const MEMO_OPTIONS = [
  "문 앞에 놓아주세요",
  "부재 시 연락주세요",
  "배송 전 미리 연락주세요",
] as const;

export default function AddressFormView({
  editingAddress,
  onSaved,
  onClose,
  onSearchAddress,
  pendingZipCode,
  pendingAddress,
}: Props) {
  const isEditing = editingAddress !== null;

  const [receiverName, setReceiverName] = useState(
    editingAddress?.receiverName ?? "",
  );
  const [addressDetail, setAddressDetail] = useState(
    editingAddress?.addressDetail ?? "",
  );
  const [nickname, setNickname] = useState(editingAddress?.nickname ?? "");
  const [phoneNumber, setPhoneNumber] = useState(
    formatPhoneNumber(digitsOnly(editingAddress?.phoneNumber ?? "")),
  );
  const [memo, setMemo] = useState(editingAddress?.memo ?? "");
  const [isMemoMenuOpen, setIsMemoMenuOpen] = useState(false);
  const [isCustomMemo, setIsCustomMemo] = useState(
    Boolean(editingAddress?.memo) &&
      !MEMO_OPTIONS.includes(
        editingAddress?.memo as (typeof MEMO_OPTIONS)[number],
      ),
  );
  const memoInputRef = useRef<HTMLInputElement>(null);

  /* 사용 보류 필드 — API/타입에 없음. 필요 시 폼에 다시 연결.
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  */
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const phoneDigits = digitsOnly(phoneNumber);

    if (!receiverName.trim()) {
      setError("받는분을 입력해주세요.");
      return;
    }
    if (receiverName.trim().length > DELIVERY_RECEIVER_NAME_MAX_LENGTH) {
      setError(`받는분은 ${DELIVERY_RECEIVER_NAME_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }
    if (addressDetail.trim().length > DELIVERY_ADDRESS_DETAIL_MAX_LENGTH) {
      setError(`상세 주소는 ${DELIVERY_ADDRESS_DETAIL_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }
    if (nickname.trim().length > DELIVERY_ADDRESS_NICKNAME_MAX_LENGTH) {
      setError(`배송지명은 ${DELIVERY_ADDRESS_NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }
    if (!pendingZipCode || !pendingAddress) {
      setError("주소를 검색해주세요.");
      return;
    }
    if (!phoneDigits) {
      setError("휴대폰 번호를 입력해주세요.");
      return;
    }
    if (!isValidKoreanPhone(phoneDigits)) {
      setError("올바른 전화번호 형식이 아닙니다.");
      return;
    }

    setSaving(true);
    try {
      const trimmedNickname = nickname.trim();
      const common = {
        receiverName: receiverName.trim(),
        phoneNumber: phoneDigits,
        zipCode: pendingZipCode,
        address: pendingAddress,
        addressDetail: addressDetail.trim() || undefined,
        memo: memo.trim() || undefined,
      };

      let saved: DeliveryAddress;
      if (isEditing) {
        saved = await updateDeliveryAddress(editingAddress.id, {
          ...common,
          nickname: trimmedNickname || null,
        });
      } else {
        saved = await createDeliveryAddress({
          ...common,
          nickname: trimmedNickname || undefined,
        });
      }
      onSaved(saved);
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-7 pb-7 pt-7">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">
          {isEditing ? "배송지 수정" : "신규 배송지 추가"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Form fields — 순서·노출: 신규 배송지 모바일 UI 기준 (받는분 → 휴대폰 → 우편번호/찾기 → 기본주소 → 상세 → 배송지명 → 배송메모) */}
      <div className="flex flex-col gap-4">
        {/* 받는분 */}
        <div className="flex items-center gap-3">
          <label htmlFor="addr-receiver" className={LABEL_CLS}>
            받는분
          </label>
          <input
            id="addr-receiver"
            type="text"
            maxLength={DELIVERY_RECEIVER_NAME_MAX_LENGTH}
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="이름"
            className={INPUT_CLS}
          />
        </div>

        {/* 휴대폰 */}
        <div className="flex items-center gap-3">
          <label htmlFor="addr-phone" className={LABEL_CLS}>
            휴대폰
          </label>
          <input
            id="addr-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(digitsOnly(e.target.value)))}
            inputMode="numeric"
            placeholder="010-0000-0000"
            className={INPUT_CLS}
          />
        </div>

        {/* 우편번호 */}
        <div className="flex items-center gap-3">
          <label className={LABEL_CLS}>우편번호</label>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* 직접 입력할 수 없는 필드라 클릭·Enter만으로도 주소찾기가 열리게 한다 */}
            <input
              type="text"
              value={pendingZipCode}
              readOnly
              placeholder="우편번호를 검색해주세요"
              aria-label="우편번호"
              onClick={onSearchAddress}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSearchAddress();
                }
              }}
              className={`${INPUT_CLS} cursor-pointer`}
            />
            <button
              type="button"
              onClick={onSearchAddress}
              className="flex h-10 w-[61px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-cta-button)] text-body-13-m text-white transition-opacity hover:opacity-90"
            >
              주소찾기
            </button>
          </div>
        </div>

        {/* 도로명/지번 주소 (검색 결과) — 시안처럼 라벨 없이 표시, 정렬용 빈 칸 */}
        {pendingAddress ? (
          <div className="flex items-center gap-3">
            <span className={LABEL_CLS} aria-hidden />
            <input
              type="text"
              value={pendingAddress}
              readOnly
              aria-label="검색된 주소"
              className={`${INPUT_CLS} cursor-default`}
            />
          </div>
        ) : null}

        {/* 상세 주소 — 시안과 동일하게 보이는 라벨 없음 */}
        <div className="flex items-center gap-3">
          <span className={LABEL_CLS} aria-hidden />
          <input
            type="text"
            maxLength={DELIVERY_ADDRESS_DETAIL_MAX_LENGTH}
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="상세 주소를 입력해주세요"
            aria-label="상세 주소"
            className={INPUT_CLS}
          />
        </div>

        {/* 사용 보류: 이메일
        <div className="flex items-center gap-3">
          <label htmlFor="addr-email" className={LABEL_CLS}>
            이메일
          </label>
          <input
            id="addr-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className={INPUT_CLS}
          />
        </div>
        */}

        {/* 사용 보류: 전화번호(유선)
        <div className="flex items-center gap-3">
          <label htmlFor="addr-tel" className={LABEL_CLS}>
            전화번호
          </label>
          <input
            id="addr-tel"
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="-를 제외한 숫자만 입력해주세요"
            className={INPUT_CLS}
          />
        </div>
        */}

        {/* 배송지명 */}
        <div className="flex items-center gap-3">
          <label htmlFor="addr-nickname" className={LABEL_CLS}>
            배송지명
          </label>
          <input
            id="addr-nickname"
            type="text"
            maxLength={DELIVERY_ADDRESS_NICKNAME_MAX_LENGTH}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="배송지명을 입력해주세요"
            className={INPUT_CLS}
          />
        </div>

        {/* 배송메모 */}
        <div
          className="flex items-center gap-3"
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsMemoMenuOpen(false);
            }
          }}
        >
          <label
            htmlFor="addr-memo"
            className={`${LABEL_CLS} flex h-10 items-center self-start`}
          >
            배송메모
          </label>
          <div className="relative min-w-0 flex-1">
            {isCustomMemo ? (
              <div className="relative pb-5">
                <input
                  ref={memoInputRef}
                  id="addr-memo"
                  type="text"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  onClick={() => setIsMemoMenuOpen(true)}
                  placeholder="배송 시 요청사항을 입력해주세요"
                  maxLength={MEMO_MAX_LENGTH}
                  className={`${INPUT_CLS} w-full`}
                />
                <span className="pointer-events-none absolute bottom-0 right-0 text-body-13-r text-[var(--color-text-secondary)]">
                  {memo.length}/{MEMO_MAX_LENGTH}자
                </span>
              </div>
            ) : (
              <button
                id="addr-memo"
                type="button"
                onClick={() => setIsMemoMenuOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isMemoMenuOpen}
                className={`${INPUT_CLS} flex w-full items-center text-left`}
              >
                <span
                  className={
                    memo ? undefined : "text-[var(--color-text-secondary)]"
                  }
                >
                  {memo || "배송 시 요청사항을 입력해주세요"}
                </span>
              </button>
            )}

            {isMemoMenuOpen && (
              <div
                role="listbox"
                aria-label="배송메모 선택"
                className="absolute left-0 right-0 top-10 z-20 mt-1 overflow-hidden rounded-[8px] bg-white py-1 shadow-[0_13px_61px_rgba(169,169,169,0.36)]"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isCustomMemo}
                  onClick={() => {
                    if (!isCustomMemo) setMemo("");
                    setIsCustomMemo(true);
                    setIsMemoMenuOpen(false);
                    requestAnimationFrame(() => memoInputRef.current?.focus());
                  }}
                  className="flex h-10 w-full items-center px-5 text-left text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
                >
                  직접 입력하기
                  <span className="ml-1 text-[var(--color-text-secondary)]">
                    ({memo.length}/{MEMO_MAX_LENGTH}자)
                  </span>
                </button>
                {MEMO_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={!isCustomMemo && memo === option}
                    onClick={() => {
                      setMemo(option);
                      setIsCustomMemo(false);
                      setIsMemoMenuOpen(false);
                    }}
                    className="flex h-10 w-full items-center px-5 text-left text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-body-13-m text-[var(--color-accent-rust)]">
          {error}
        </p>
      )}

      {/* Submit button */}
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-btn-15-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
