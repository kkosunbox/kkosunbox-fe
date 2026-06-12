"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  FALLBACK_AVATAR_SSR_DEFAULT,
  getFallbackAvatarPath,
} from "@/shared/lib/fallbackAvatar";

interface FallbackAvatarProps {
  userId?: number | null;
  size?: number;
  className?: string;
}

function getDimensionStyle(size: number | undefined, className?: string): React.CSSProperties {
  if (size !== undefined) return { width: size, height: size };
  if (className) return {};
  return { width: 80, height: 80 };
}

function subscribeToGuestFallbackAvatar() {
  return () => {};
}

export default function FallbackAvatar({ userId, size, className }: FallbackAvatarProps) {
  const guestSrc = useSyncExternalStore(
    subscribeToGuestFallbackAvatar,
    () => getFallbackAvatarPath(null),
    () => FALLBACK_AVATAR_SSR_DEFAULT,
  );
  const src = userId != null ? getFallbackAvatarPath(userId) : guestSrc;

  return (
    <div
      className={["relative overflow-hidden rounded-full", className].filter(Boolean).join(" ")}
      style={{
        ...getDimensionStyle(size, className),
        background: "var(--color-avatar-fallback)",
      }}
    >
      <Image src={src} alt="" fill className="object-cover" aria-hidden />
    </div>
  );
}
