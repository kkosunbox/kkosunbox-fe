"use client";

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

export default function ChecklistResultSection({
  tier,
}: {
  tier: RecommendedTier;
}) {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-body-16-m text-[var(--color-text-secondary)]">
          불러오는 중…
        </p>
      </div>
    );
  }

  return (
    <ChecklistResult
      petInfo={profileToPetInfo(profile)}
      avatarSrc={profile.profileImageUrl}
      recommendedTier={tier}
      profileId={profile.id}
    />
  );
}
