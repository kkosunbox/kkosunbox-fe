"use client";

import { Text } from "@/shared/ui";
import { TIER_BOX_IMAGES } from "@/entities/package";
import { ROW_GRID } from "./helpers";
import type { SubscriptionDetailViewModel } from "./useSubscriptionDetailSection";
import { ChevronLeftIcon } from "./components/icons";
import { Pagination } from "./components/Pagination";
import { RecordRow } from "./components/RecordRow";

export function SubscriptionDetailView(vm: SubscriptionDetailViewModel) {
  const {
    subscription,
    payments,
    theme,
    isActive,
    startDate,
    endDate,
    records,
    currentPage,
    totalPages,
    formatDate,
    billingDayLabel,
    handleDeleteRecord,
    handleResubscribe,
    handleCancel,
    handleTogglePause,
    handleCancelPayment,
    handleChangeSubscription,
    handleReceiptDownload,
    goBack,
    goToPrevPage,
    goToNextPage,
    setPage,
  } = vm;

  const recordRowProps = {
    planName: subscription.plan.name,
    onCancelPayment: handleCancelPayment,
    onReceiptDownload: handleReceiptDownload,
  };

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* Upper solid color band — mobile 367px / desktop 258px */}
      <div className="absolute left-0 right-0 top-0 max-md:h-[296px] md:h-[258px] bg-[var(--color-subscription-header-bg)]" />

      {/* Hero — plan card fits entirely within the 258px band */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 pt-8 pb-6">
        {/* Back + title */}
        <button
          type="button"
          onClick={goBack}
          className="mb-6 flex items-center gap-1 text-subtitle-18-b text-[var(--color-text)] hover:opacity-70"
        >
          <ChevronLeftIcon />
          구독중인 플랜
        </button>

        {/* Plan summary card — 154px tall, no shadow (colored band provides contrast) */}
        <div className="flex overflow-hidden rounded-[20px] bg-white shadow-[0px_4px_12px_0px_#00000014] max-md:h-[150px] md:h-[154px] lg:h-[154px]">
          <div className="relative shrink-0 bg-[var(--color-surface-light)] max-md:h-[150px] max-md:w-[130px] md:h-[154px] lg:h-[154px] md:w-[166px] lg:w-[166px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- 플랜 박스 이미지 원본 품질 유지 */}
            <img
              src={TIER_BOX_IMAGES[theme.tier].src}
              alt={`${subscription.plan.name} 이미지`}
              width={TIER_BOX_IMAGES[theme.tier].width}
              height={TIER_BOX_IMAGES[theme.tier].height}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center scale-105"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:flex-row lg:flex-row md:items-center lg:items-center md:gap-6 lg:gap-6 md:px-8 lg:px-8 md:py-5 lg:py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Text variant="subtitle-16-sb" mobileVariant="body-14-sb" className="tracking-[-0.04em] text-[var(--color-text)]">
                {subscription.plan.name}{isActive ? " 구독중" : ""}
              </Text>

              {isActive ? (
                <>
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    {formatDate(startDate)} ~
                  </Text>
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    결제일 : {billingDayLabel(subscription.nextBillingDate)}
                  </Text>
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="shrink-0 self-start text-right text-body-13-sb leading-[130%] text-[var(--color-accent)] underline hover:opacity-80 transition-opacity"
                  >
                    {subscription.isPaused ? "쉬어가기 해제" : "구독 쉬어가기"}
                  </button>
                </>
              ) : (
                <>
                  {endDate && (
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                      {formatDate(endDate)}
                    </Text>
                  )}
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    구독종료
                  </Text>
                </>
              )}
            </div>

            {/* Desktop-only action buttons */}
            <div className="max-md:hidden flex shrink-0 items-center gap-2">
              {isActive ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-text-muted)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 취소
                  </button>
                  <button
                    type="button"
                    onClick={handleChangeSubscription}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-btn-dark-warm)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 변경
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteRecord}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-text-muted)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleResubscribe}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-btn-dark-warm)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 재시작
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only action buttons */}
        <div className="md:hidden lg:hidden mt-3 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {isActive ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 취소
              </button>
              <button
                type="button"
                onClick={handleChangeSubscription}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 변경
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDeleteRecord}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={handleResubscribe}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 재시작
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payment history — flat on white background, 24px gap from band end */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 max-md:pt-6 md:pt-6 pb-12">
        <Text as="h2" variant="subtitle-18-b" className="mb-5 text-[var(--color-text)]">
          구독 상세내역
        </Text>

        {/* Desktop table */}
        <div className="max-md:hidden">
          <div className={`${ROW_GRID} h-11 rounded-lg bg-[var(--color-surface-light)] pl-[30px] pr-2`}>
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
