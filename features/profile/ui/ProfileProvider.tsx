"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getProfiles } from "@/features/profile/api/profileApi";
import type { Profile } from "@/features/profile/api/types";

interface ProfileContextValue {
  profile: Profile | null;
  /** 프로필 데이터를 서버에서 다시 가져온다 (수정 후 호출) */
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const { profiles } = await getProfiles();
      setProfile(profiles[0] ?? null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [isLoggedIn, refreshProfile]);

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <ProfileProvider>");
  return ctx;
}
