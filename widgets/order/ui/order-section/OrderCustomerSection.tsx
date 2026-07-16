import type { Dispatch, SetStateAction } from "react";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import {
  ORDER_ACTION_CHIP_CLASS as actionChipCls,
  ORDER_ACTION_CHIP_SMALL_CLASS as actionChipSmallCls,
  ORDER_INPUT_CLASS as inputCls,
} from "./orderSectionStyles";
import { digitsOnly, formatPhoneNumber, isValidKoreanPhone } from "@/shared/lib/format";
import { OrderCheckCircleIcon as CheckCircleIcon } from "./OrderSectionIcons";
import { SectionCard, FormRow } from "./OrderSectionFormParts";
import type { NewAddrState } from "./useOrderSectionState";

interface OrderCustomerSectionProps {
  open: boolean;
  onToggle: () => void;
  selectedAddress: DeliveryAddress | null;
  onChangeAddress: () => void;
  newAddr: NewAddrState;
  setNewAddr: Dispatch<SetStateAction<NewAddrState>>;
  phoneError: string | null;
  setPhoneError: (error: string | null) => void;
  onSearchAddress: () => void;
}

export function OrderCustomerSection({
  open,
  onToggle,
  selectedAddress,
  onChangeAddress,
  newAddr,
  setNewAddr,
  phoneError,
  setPhoneError,
  onSearchAddress,
}: OrderCustomerSectionProps) {
  return (
    <SectionCard title="주문고객 / 배송지 정보" open={open} onToggle={onToggle}>
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
              onClick={onChangeAddress}
              className={actionChipSmallCls}
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
                aria-label="받는분"
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
                  aria-label="휴대폰"
                />
                {phoneError && (
                  <p className="text-body-13-m text-red-600 pl-1" role="alert">{phoneError}</p>
                )}
              </div>
            </FormRow>
          </div>
          {/* 우편번호 + 주소찾기 */}
          <FormRow label="우편번호">
            <div className="flex items-center gap-3">
              <input
                value={newAddr.zipCode}
                readOnly
                className={`${inputCls} min-w-0 cursor-default bg-[var(--color-surface-light)] md:max-w-[220px]`}
                aria-label="우편번호"
              />
              <button
                type="button"
                onClick={onSearchAddress}
                className={actionChipCls}
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
                aria-label="상세 주소"
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
              maxLength={50}
              aria-label="배송메모"
            />
          </FormRow>
        </div>
      )}
    </SectionCard>
  );
}
