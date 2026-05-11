import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile, fetchChecklistQuestions } from "@/features/profile/api/queries";
import { ProfileSection } from "./ProfileSection";

export async function ProfileSectionLoader() {
  const token = await getServerToken();
  const [profile, checklistQuestions] = await Promise.all([
    fetchProfile(token),
    fetchChecklistQuestions(),
  ]);
  return <ProfileSection profile={profile} checklistQuestions={checklistQuestions} />;
}
