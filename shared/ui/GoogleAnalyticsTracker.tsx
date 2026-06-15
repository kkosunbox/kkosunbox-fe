"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, trackEvent } from "@/shared/lib/analytics";

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const url = pathname + (query ? `?${query}` : "");

    if (prevUrl.current === url) return;
    prevUrl.current = url;

    trackPageView(url);

    const ref = searchParams.get("ref");
    if (ref) {
      trackEvent("referral_visit", { referral_code: ref, page_path: url });
    }
  }, [pathname, searchParams]);

  return null;
}
