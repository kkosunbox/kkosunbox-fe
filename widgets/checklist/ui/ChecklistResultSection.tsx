"use client";

import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import type { Profile } from "@/features/profile/api/types";
import ChecklistResult from "./ChecklistResult";
import type { PetInfo, RecommendedTier } from "./types";

function parseProfileBirthDate(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null;
  const day = iso.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function profileToPetInfo(p: Profile): PetInfo {
  return {
    name: p.name?.trim() ?? "",
    breed: p.breed?.trim() ?? "",
    specialNotes: p.specialNotes?.trim() ?? "",
    birthDate: parseProfileBirthDate(p.birthDate),
    weight:
      p.weight != null && !Number.isNaN(Number(p.weight))
        ? String(p.weight)
        : "",
    gender: p.gender ?? null,
  };
}

const DEFAULT_PET_INFO: PetInfo = {
  name: "",
  breed: "",
  specialNotes: "",
  birthDate: null,
  weight: "",
  gender: null,
};

export default function ChecklistResultSection({
  tier,
}: {
  tier: RecommendedTier;
}) {
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
    <ChecklistResult
      petInfo={profile ? profileToPetInfo(profile) : DEFAULT_PET_INFO}
      avatarSrc={profile?.profileImageUrl ?? null}
      userId={user?.id ?? null}
      recommendedTier={tier}
      profileId={profile?.id ?? null}
    />
  );
}
