"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuth } from "@/features/auth";

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!user) return;

    void fetch("/api/channel-talk/member-hash")
      .then((r) => r.json())
      .then(({ hash }: { hash: string | null }) => {
        window.ChannelIO?.("updateUser", {
          memberId: String(user.id),
          ...(hash ? { memberHash: hash } : {}),
          profile: { email: user.email },
        });
      });
  }, [user]);

  return (
    <Script
      src="https://cdn.channel.io/plugin/ch-plugin-web.js"
      strategy="afterInteractive"
    />
  );
}
