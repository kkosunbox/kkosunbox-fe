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
  /** 로그인 상태에서 최초 프로필 fetch가 끝났는지 (fetch 전에는 false) */
  isProfilesReady: boolean;
  /** 활성 프로필 변경 */
  setActiveProfileId: (id: number) => void;
  /** 프로필 데이터를 서버에서 다시 가져온다 (수정 후 호출) */
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isProfilesReady, setIsProfilesReady] = useState(false);
  // 저장된 활성 프로필 id는 refreshProfile에서 tokenStore.getActiveProfileId()를
  // fallback으로 읽으므로 별도 mount effect로 초기화하지 않는다.
  // (effect 내 동기 setState는 cascading render + hydration 위험)
  const [activeId, setActiveId] = useState<number | null>(null);

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

  // 외부 인증 상태(isLoggedIn/isAuthLoading)를 구독해 프로필을 동기화하는 effect.
  // 로그아웃·인증 미완료 시 캐시를 초기화하고, 준비되면 서버에서 프로필을 가져온다.
  // 동기 setState는 인증 상태 전환 시점에만 발생하므로(매 렌더 X) cascading render 우려가 없다.
  /* eslint-disable react-hooks/set-state-in-effect -- 외부 인증 상태 동기화 + 데이터 fetch */
  useEffect(() => {
    if (!isLoggedIn) {
      setProfiles([]);
      setActiveId(null);
      setIsProfilesReady(false);
      return;
    }

    if (isAuthLoading) {
      setIsProfilesReady(false);
      return;
    }

    if (!tokenStore.getAccess()) {
      setIsProfilesReady(false);
      return;
    }

    let cancelled = false;
    setIsProfilesReady(false);
    void refreshProfile().finally(() => {
      if (!cancelled) setIsProfilesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isAuthLoading, refreshProfile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const profile = profiles.find((p) => p.id === activeId) ?? null;

  const setActiveProfileId = useCallback((id: number) => {
    setActiveId(id);
    tokenStore.setActiveProfileId(id);
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profile, profiles, isProfilesReady, setActiveProfileId, refreshProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <ProfileProvider>");
  return ctx;
}
