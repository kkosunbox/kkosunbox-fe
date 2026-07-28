"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { isPopupRoute } from "@/shared/config/popupRoutes";

declare global {
  interface Window {
    ChannelIO?: ((...args: unknown[]) => void) & {
      q?: unknown[][];
      c?: (args: unknown[]) => void;
    };
    ChannelIOInitialized?: boolean;
  }
}

const PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY ?? "";

export function ChannelTalkProvider() {
  const { user } = useAuth();
  const pathname = usePathname();

  // 결제·배송지 팝업 창에서는 채널톡을 띄우지 않는다. 스크립트 자체를 넣지 않으므로
  // CDN 요청도 발생하지 않는다.
  const isPopup = isPopupRoute(pathname);

  useEffect(() => {
    if (isPopup) return;

    if (!window.ChannelIO) {
      const ch = ((...args: unknown[]) => {
        ch.c!(args);
      }) as NonNullable<Window["ChannelIO"]>;
      ch.q = [];
      ch.c = (args) => ch.q!.push(args);
      window.ChannelIO = ch;
    }

    window.ChannelIO("boot", {
      pluginKey: PLUGIN_KEY,
      language: "ko",
    });

    return () => {
      window.ChannelIO?.("shutdown");
    };
  }, [isPopup]);

  useEffect(() => {
    if (isPopup || !user) return;

    void fetch("/api/channel-talk/member-hash")
      .then((r) => r.json())
      .then(({ hash }: { hash: string | null }) => {
        window.ChannelIO?.("updateUser", {
          memberId: String(user.id),
          ...(hash ? { memberHash: hash } : {}),
          profile: { email: user.email },
        });
      });
  }, [isPopup, user]);

  if (isPopup) return null;

  return (
    <Script
      src="https://cdn.channel.io/plugin/ch-plugin-web.js"
      strategy="afterInteractive"
    />
  );
}
