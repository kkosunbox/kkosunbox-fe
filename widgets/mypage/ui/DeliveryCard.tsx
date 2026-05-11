"use client";

import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "./dashboard-shared";
import type { DeliveryStatus, DeliveryStatusSummaryResponse } from "@/features/subscription/api/types";

function PackingIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.9993 21.6667V34.0979C19.9993 34.4968 19.9993 34.6962 19.8705 34.7676C19.7417 34.839 19.5726 34.7333 19.2343 34.5219L7.60602 27.2542C7.14649 26.967 6.91673 26.8234 6.79137 26.5972C6.66602 26.371 6.66602 26.1001 6.66602 25.5582V13.3333M19.9993 21.6667L6.66602 13.3333M19.9993 21.6667L30.6191 15.0293C31.837 14.2682 32.4459 13.8876 32.4459 13.3333C32.4459 12.7791 31.837 12.3985 30.6191 11.6373L21.0593 5.6625C20.5439 5.34033 20.2861 5.17925 19.9993 5.17925C19.7126 5.17925 19.4548 5.34033 18.9394 5.6625L6.66602 13.3333"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33.3327 20V14.4418C33.3327 13.8999 33.3327 13.629 33.2073 13.4028C33.082 13.1766 32.8522 13.033 32.3927 12.7458L26.666 9.16667"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.1667" cy="27.5" r="4.16667" stroke="var(--color-icon-gray)" strokeWidth="3" />
      <path d="M35 33.3333L32.5 30.8333" stroke="var(--color-icon-gray)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M23.334 32.9167L22.5007 33.4375L21.6673 33.9583L21.0606 34.3375C20.5452 34.6597 20.2874 34.8208 20.0007 34.8208C19.7139 34.8208 19.4561 34.6597 18.9407 34.3375L13.334 30.8333"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="27" cy="29.5" rx="4" ry="3.5" stroke="var(--color-icon-gray)" strokeWidth="3" />
      <ellipse cx="14" cy="29.5" rx="4" ry="3.5" stroke="var(--color-icon-gray)" strokeWidth="3" />
      <path
        d="M6.8125 19.8333H17.6875V7M17.6875 7V10.6667H5V27C5 28.1046 5.89543 29 7 29H10.4375M17.6875 7H24.9375L33.629 14.0332C33.8637 14.223 34 14.5087 34 14.8105V18M28.5625 10.6667H26.75V18H34M34 18V27C34 28.1046 33.1046 29 32 29H30.375M23.125 29H17.6875"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeliveredIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.16601 33.3333H31.8327C32.6611 33.3333 33.3327 32.6618 33.3327 31.8333V13.5694C33.3327 13.4142 33.2965 13.261 33.2271 13.1222L30.5521 7.77224C30.2134 7.09467 29.5208 6.66667 28.7633 6.66667H11.2354C10.4779 6.66667 9.78535 7.09467 9.44656 7.77224L6.77159 13.1222C6.70216 13.261 6.66602 13.4142 6.66602 13.5694V31.8333C6.66602 32.6618 7.33759 33.3333 8.16601 33.3333Z"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8.33398 13.3333H31.6673"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 6.66667L15 13.3333V23.3333L20 20L25 23.3333V13.3333L23.3333 6.66667"
        stroke="var(--color-icon-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DELIVERY_ICON_COMPONENTS = [PackingIcon, TruckIcon, DeliveredIcon];

const DELIVERY_STEPS: Array<{
  label: string;
  status: DeliveryStatus;
  key: keyof DeliveryStatusSummaryResponse;
}> = [
  { label: "배송준비중", status: "PendingDelivery", key: "pendingDelivery" },
  { label: "배송중", status: "DeliveryInProgress", key: "deliveryInProgress" },
  { label: "배송완료", status: "DeliveryCompleted", key: "deliveryCompleted" },
];

function openAddressPopup() {
  const w = 420;
  const h = 680;
  const left = (screen.width - w) / 2;
  const top = (screen.height - h) / 2;
  window.open(
    "/address",
    "addressPopup",
    `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );
}

function openDeliveryPopup(status: DeliveryStatus) {
  const w = 420;
  const h = 680;
  const left = (screen.width - w) / 2;
  const top = (screen.height - h) / 2;
  window.open(
    `/delivery?status=${status}`,
    `deliveryPopup_${status}`,
    `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );
}

interface DeliveryCardProps {
  summary: DeliveryStatusSummaryResponse;
}

export function DeliveryCard({ summary }: DeliveryCardProps) {
  return (
    <DashboardCard>
      <SectionHeader title="배송관리" onLinkClick={openAddressPopup} linkLabel="배송지관리" spacing="tight" />
      <div className="grid grid-cols-3 gap-4 md:gap-16 pt-1 max-md:-mx-3">
        {DELIVERY_STEPS.map((step, index) => {
          const Icon = DELIVERY_ICON_COMPONENTS[index];
          const count = summary[step.key];
          return (
            <div key={step.label} className="flex flex-col items-center text-center">
              <div className="text-[var(--color-text-secondary)] mb-4">
                <Icon />
              </div>
              <Text variant="body-16-sb" mobileVariant="body-14-sb" className="leading-[1.3] text-[var(--color-text)] max-md:mb-3 md:mb-2.5">
                {step.label}
              </Text>
              <button
                type="button"
                onClick={() => openDeliveryPopup(step.status)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`${step.label} ${count}건 배송 현황 보기`}
              >
                <Text as="span" variant="subtitle-20-b" className="text-primary">
                  {count}
                </Text>
              </button>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
