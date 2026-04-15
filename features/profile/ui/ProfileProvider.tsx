"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getProfiles } from "@/features/profile/api/profileApi";
import type { Profile } from "@/features/profile/api/types";

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
  const [activeId, setActiveId] = useState<number | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const { profiles: list } = await getProfiles();
      setProfiles(list);
      setActiveId((prev) => {
        if (prev !== null && list.some((p) => p.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch {
      setProfiles([]);
      setActiveId(null);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshProfile();
    } else {
      setProfiles([]);
      setActiveId(null);
    }
  }, [isLoggedIn, refreshProfile]);

  const profile = profiles.find((p) => p.id === activeId) ?? null;

  const setActiveProfileId = useCallback((id: number) => {
    setActiveId(id);
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
