export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function gtag(command: string, ...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(command, ...args);
  }
}

export function trackPageView(url: string) {
  gtag("config", GA_ID, { page_path: url });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  gtag("event", eventName, params);
}

// ── 전환 퍼널 ──────────────────────────────────────────────────────
export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  plan_tier: string;
  quantity: number;
}) {
  trackEvent("purchase", { currency: "KRW", ...params });
}

export function trackBeginCheckout(params: { plan_tier: string; value: number }) {
  trackEvent("begin_checkout", { currency: "KRW", ...params });
}

export function trackSelectItem(params: { plan_tier: string }) {
  trackEvent("select_item", params);
}

export function trackViewItemList() {
  trackEvent("view_item_list");
}

// ── Auth 퍼널 ──────────────────────────────────────────────────────
export function trackLogin(method: "email" | "kakao" | "naver" | "google") {
  trackEvent("login", { method });
}

export function trackSignUp() {
  trackEvent("sign_up");
}

// ── 체크리스트 퍼널 ────────────────────────────────────────────────
export function trackChecklistStart() {
  trackEvent("checklist_start");
}

export function trackChecklistComplete(params: { recommended_tier: string }) {
  trackEvent("checklist_complete", params);
}

export function trackChecklistCtaClick(params: { plan_tier: string }) {
  trackEvent("checklist_cta_click", params);
}

// ── 구독 관리 퍼널 ─────────────────────────────────────────────────
export function trackSubscriptionCancelAttempt() {
  trackEvent("subscription_cancel_attempt");
}

export function trackSubscriptionPlanChange(params: { plan_tier: string }) {
  trackEvent("subscription_plan_change", params);
}

export function trackReviewSubmit(params: { rating: number }) {
  trackEvent("review_submit", params);
}
