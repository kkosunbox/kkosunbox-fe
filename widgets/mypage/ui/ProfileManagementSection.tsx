"use client";

import type { Profile } from "@/features/profile/api/types";
import { ProfileManagementView } from "./profile-management/ProfileManagementView";
import { useProfileManagement } from "./profile-management/useProfileManagement";

interface ProfileManagementSectionProps {
  profile: Profile | null;
  isNewProfile?: boolean;
}

export default function ProfileManagementSection({
  profile,
  isNewProfile = false,
}: ProfileManagementSectionProps) {
  const vm = useProfileManagement({ profile, isNewProfile });
  return <ProfileManagementView {...vm} />;
}
