"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getProfiles } from "@/features/profile/api/profileApi";
import type { Profile } from "@/features/profile/api/types";
import { tokenStore } from "@/shared/lib/api/token";

interface ProfileContextValue {
  /** 현재 활성 프로필 (기존 호환) */
  profile: Profile | null;
  /** 전체 프로필 목록 */
  profiles: Profile[];
  /** 활성 프로필 변경 */
  setActiveProfileId: (id: number) => void;
  /** 프로필 데이터를 서버에서 다시 가져온다 (수정 후 호출) */
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<number | null>(() => tokenStore.getActiveProfileId());

  const refreshProfile = useCallback(async () => {
    try {
      const { profiles: list } = await getProfiles();
      setProfiles(list);
      setActiveId((prev) => {
        const stored = prev ?? tokenStore.getActiveProfileId();
        if (stored !== null && list.some((p) => p.id === stored)) return stored;
        const fallback = list[0]?.id ?? null;
        if (fallback !== null) tokenStore.setActiveProfileId(fallback);
        return fallback;
      });
    } catch {
      setProfiles([]);
      setActiveId(null);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const timerId = window.setTimeout(() => {
        void refreshProfile();
      }, 0);
      return () => window.clearTimeout(timerId);
    } else {
      const timerId = window.setTimeout(() => {
        setProfiles([]);
        setActiveId(null);
      }, 0);
      return () => window.clearTimeout(timerId);
    }
  }, [isLoggedIn, refreshProfile]);

  const profile = profiles.find((p) => p.id === activeId) ?? null;

  const setActiveProfileId = useCallback((id: number) => {
    setActiveId(id);
    tokenStore.setActiveProfileId(id);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, profiles, setActiveProfileId, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <ProfileProvider>");
  return ctx;
}
