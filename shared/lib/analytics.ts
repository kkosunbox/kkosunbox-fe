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
