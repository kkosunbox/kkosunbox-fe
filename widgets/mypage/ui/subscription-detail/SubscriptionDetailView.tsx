"use client";

import { BILLING_DAY_OPTIONS, ROW_GRID, ROW_PADDING, formatDate } from "./helpers";
import type { SubscriptionDetailViewModel } from "./useSubscriptionDetailSection";
import { ChevronLeftIcon, CloseIcon, DropdownTriangleIcon, PencilIcon } from "./components/icons";
import { Pagination } from "./components/Pagination";
import { RecordRow } from "./components/RecordRow";
import {
  OVERVIEW_HEADER_LINK_CLASS,
  OVERVIEW_PRIMARY_BUTTON_CLASS,
  OVERVIEW_SECONDARY_BUTTON_CLASS,
  SubscriptionOverviewCard,
} from "../subscription-overview/SubscriptionOverviewCard";

export function SubscriptionDetailView(vm: SubscriptionDetailViewModel) {
  const {
    subscription,
    payments,
    isActive,
    isScheduled,
    startDate,
    records,
    currentPage,
    totalPages,
    billingDay,
    isEditingBillingDay,
    handleDeleteRecord,
    handleResubscribe,
    handleCancel,
    handleTogglePause,
    handleCancelPayment,
    handleChangeSubscription,
    handleReceiptDownload,
    handleStartEditBillingDay,
    handleCancelEditBillingDay,
    handleSelectBillingDay,
    goBack,
    goToPrevPage,
    goToNextPage,
    setPage,
  } = vm;

  const nextBillingLabel = subscription.nextBillingDate
    ? formatDate(subscription.nextBillingDate)
    : "-";

  const recordRowProps = {
    planName: subscription.plan.name,
    onCancelPayment: handleCancelPayment,
    onReceiptDownload: handleReceiptDownload,
  };

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* Upper solid color band — mobile 296px / desktop 148px */}
      <div className="absolute left-0 right-0 top-[var(--header-offset)] max-md:h-[296px] md:h-[148px] bg-[var(--color-subscription-detail-header-bg)]" />

      {/* Hero — 구독 카드가 밴드 경계에 걸친다 */}
      <div className="relative mx-auto w-full max-w-[1240px] max-xl:px-6 xl:px-0 pt-8">
        {/* Back + title */}
        <button
          type="button"
          onClick={goBack}
          className="mb-3 flex items-center gap-1 max-md:text-subtitle-18-b md:text-title-20-sb text-[var(--color-text)] hover:opacity-70"
        >
          <ChevronLeftIcon />
          구독 상세보기
        </button>

        <SubscriptionOverviewCard
          subscription={subscription}
          date={subscription.startDate ?? startDate}
          headerAction={
            !isActive ? (
              <button type="button" onClick={handleDeleteRecord} className={OVERVIEW_HEADER_LINK_CLASS}>
                삭제
              </button>
            ) : isScheduled ? null : (
              <button type="button" onClick={handleTogglePause} className={OVERVIEW_HEADER_LINK_CLASS}>
                {subscription.isPaused ? "쉬어가기 해제" : "구독 쉬어가기"}
              </button>
            )
          }
          billingValue={
            !isActive || isScheduled || subscription.isPaused ? undefined : isEditingBillingDay ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={billingDay}
                    onChange={(e) => handleSelectBillingDay(Number(e.target.value))}
                    aria-label="결제일 선택"
                    className="h-7 appearance-none rounded-[5px] border border-[var(--color-text-muted)] bg-white pl-3 pr-10 text-body-13-m leading-[140%] text-[var(--color-text-secondary)] outline-none"
                  >
                    {BILLING_DAY_OPTIONS.map((day) => (
                      <option key={day} value={day}>
                        {day}일
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
                    <DropdownTriangleIcon />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEditBillingDay}
                  aria-label="결제일 수정 취소"
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-text-secondary)] hover:opacity-70"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-price-20-eb-lh24 text-[var(--color-text)]">{nextBillingLabel}</span>
                <button
                  type="button"
                  onClick={handleStartEditBillingDay}
                  aria-label="결제일 수정"
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-text-secondary)] hover:opacity-70"
                >
                  <PencilIcon />
                </button>
              </div>
            )
          }
          primaryAction={
            !isActive ? (
              <button type="button" onClick={handleResubscribe} className={OVERVIEW_PRIMARY_BUTTON_CLASS}>
                구독 재시작
              </button>
            ) : isScheduled ? undefined : (
              <button type="button" onClick={handleChangeSubscription} className={OVERVIEW_PRIMARY_BUTTON_CLASS}>
                구독 변경
              </button>
            )
          }
          secondaryActions={
            isActive
              ? [
                  <button key="cancel" type="button" onClick={handleCancel} className={OVERVIEW_SECONDARY_BUTTON_CLASS}>
                    구독 취소
                  </button>,
                ]
              : []
          }
        />
      </div>

      {/* Payment history — flat on white background, 24px gap from band end */}
      <div className="relative mx-auto w-full max-w-[1240px] max-xl:px-6 xl:px-0 max-md:pt-6 md:pt-10 pb-12">
        <h2 className="sr-only">구독 상세내역</h2>

        {/* Desktop table */}
        <div className="max-md:hidden">
          <div className={`${ROW_GRID} ${ROW_PADDING} h-11 rounded-lg bg-[var(--color-surface-light)]`}>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">구독</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">배송</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">금액</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">직접입력</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">영수증</span>
          </div>

          {payments.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              결제 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul className="mt-2 min-h-[540px]">
                {records.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    desktop
                    isOnly={records.length === 1}
                    {...recordRowProps}
                  />
                ))}
              </ul>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
                onSelect={setPage}
              />
            </>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden lg:hidden">
          {payments.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              결제 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul className="min-h-[540px]">
                {records.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    desktop={false}
                    isOnly={records.length === 1}
                    {...recordRowProps}
                  />
                ))}
              </ul>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
                onSelect={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
