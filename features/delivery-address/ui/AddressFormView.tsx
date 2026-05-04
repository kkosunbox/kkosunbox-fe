"use client";

import { useState } from "react";
import type { DeliveryAddress } from "../api/types";
import {
  createDeliveryAddress,
  updateDeliveryAddress,
} from "../api/deliveryAddressApi";

interface Props {
  editingAddress: DeliveryAddress | null;
  onSaved: (address: DeliveryAddress) => void;
  onClose: () => void;
  onSearchAddress: () => void;
  pendingZipCode: string;
  pendingAddress: string;
}

const LABEL_CLS = "w-[72px] shrink-0 text-body-14-sb text-[var(--color-text)]";
const INPUT_CLS =
  "h-10 flex-1 min-w-0 rounded-md border border-[var(--color-text-muted)] bg-white px-3 text-body-14-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)]";

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
  const [phoneNumber, setPhoneNumber] = useState(
    editingAddress?.phoneNumber ?? "",
  );
  const [memo, setMemo] = useState(editingAddress?.memo ?? "");

  /* 사용 보류 필드 — API/타입에 없음. 필요 시 폼에 다시 연결.
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  */
  const [saveInfo, setSaveInfo] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    if (!receiverName.trim()) {
      setError("받는분을 입력해주세요.");
      return;
    }
    if (!pendingZipCode || !pendingAddress) {
      setError("주소를 검색해주세요.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("휴대폰 번호를 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        receiverName: receiverName.trim(),
        phoneNumber: phoneNumber.trim(),
        zipCode: pendingZipCode,
        address: pendingAddress,
        addressDetail: addressDetail.trim() || undefined,
        memo: memo.trim() || undefined,
      };

      let saved: DeliveryAddress;
      if (isEditing) {
        saved = await updateDeliveryAddress(editingAddress.id, body);
      } else {
        saved = await createDeliveryAddress(body);
      }
      onSaved(saved);
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-subtitle-20-b tracking-tightest text-[var(--color-text)]">
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

      {/* Form fields — 순서·노출: 신규 배송지 모바일 UI 기준 (받는분 → 휴대폰 → 우편번호/찾기 → 기본주소 → 상세 → 배송메모) */}
      <div className="flex flex-col gap-5">
        {/* 받는분 */}
        <div className="flex items-center gap-3">
          <label htmlFor="addr-receiver" className={LABEL_CLS}>
            받는분
          </label>
          <input
            id="addr-receiver"
            type="text"
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
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="-를 제외한 숫자만 입력해주세요"
            className={INPUT_CLS}
          />
        </div>

        {/* 우편번호 */}
        <div className="flex items-center gap-3">
          <label className={LABEL_CLS}>우편번호</label>
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={pendingZipCode}
              readOnly
              placeholder=""
              className={`${INPUT_CLS} cursor-default bg-[var(--color-surface-light)]`}
            />
            <button
              type="button"
              onClick={onSearchAddress}
              className="shrink-0 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-body-13-sb text-white transition-opacity hover:opacity-90"
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
              className={`${INPUT_CLS} cursor-default bg-[var(--color-surface-light)]`}
            />
          </div>
        ) : null}

        {/* 상세 주소 — 시안과 동일하게 보이는 라벨 없음 */}
        <div className="flex items-center gap-3">
          <span className={LABEL_CLS} aria-hidden />
          <input
            type="text"
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

        {/* 배송메모 */}
        <div className="flex items-center gap-3">
          <label htmlFor="addr-memo" className={LABEL_CLS}>
            배송메모
          </label>
          <input
            id="addr-memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="배송 시 요청사항을 입력해주세요"
            className={INPUT_CLS}
          />
        </div>

        {/* 배송지 정보 저장 — 라벨 열은 빈 칸, 체크 영역은 입력과 동일 왼쪽 라인 */}
        <div className="flex items-center gap-3 pt-2">
          <span className={LABEL_CLS} aria-hidden />
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded",
                saveInfo
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-text-muted)] bg-white",
              ].join(" ")}
            >
              {saveInfo && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="sr-only"
            />
            <span className="text-body-14-m text-[var(--color-text)]">
              배송지 정보 저장
            </span>
          </label>
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
          className="h-14 w-full rounded-full bg-[var(--color-accent)] text-btn-15-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
