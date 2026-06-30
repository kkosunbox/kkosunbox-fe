"use client";

import { useState } from "react";
import type { DogGender, Profile } from "@/features/profile/api/types";
import { birthDateInputValue, weightInputValue } from "../profileManagementHelpers";

/**
 * 프로필 폼 필드 draft state 및 서버 profile 동기화 effect를 소유한다.
 * profileImageUrl은 useProfileImage(Phase 3)가 담당한다.
 */
export function useProfileDraft({
  profile,
  isNewProfile,
}: {
  profile: Profile | null;
  isNewProfile: boolean;
}) {
  const [gender, setGender] = useState<DogGender | null>(profile?.gender ?? null);
  const [petName, setPetName] = useState(profile?.name ?? "");
  const [breed, setBreed] = useState(profile?.breed ?? "");
  const [birthDate, setBirthDate] = useState(birthDateInputValue(profile?.birthDate));
  const [weight, setWeight] = useState(weightInputValue(profile?.weight));
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [specialNotes, setSpecialNotes] = useState(profile?.specialNotes ?? "");

  // 서버 profile이 갱신/전환되면 draft를 다시 동기화한다.
  // 신규 프로필 폼(isNewProfile)에서는 사용자가 입력 중이므로 덮어쓰지 않는다.
  const profileSyncKey = isNewProfile
    ? "new"
    : JSON.stringify([
        profile?.id,
        profile?.gender,
        profile?.name,
        profile?.breed,
        profile?.birthDate,
        profile?.weight,
        profile?.specialNotes,
      ]);
  const [prevProfileSyncKey, setPrevProfileSyncKey] = useState(profileSyncKey);
  if (profileSyncKey !== prevProfileSyncKey) {
    setPrevProfileSyncKey(profileSyncKey);
    if (!isNewProfile) {
      setGender(profile?.gender ?? null);
      setPetName(profile?.name ?? "");
      setBreed(profile?.breed ?? "");
      setBirthDate(birthDateInputValue(profile?.birthDate));
      setWeight(weightInputValue(profile?.weight));
      setSpecialNotes(profile?.specialNotes ?? "");
    }
  }

  return {
    gender,
    setGender,
    petName,
    setPetName,
    breed,
    setBreed,
    birthDate,
    setBirthDate,
    weight,
    setWeight,
    isWeightFocused,
    setIsWeightFocused,
    specialNotes,
    setSpecialNotes,
  };
}
