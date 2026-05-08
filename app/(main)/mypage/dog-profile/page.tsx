import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { ProfileManagementSection } from "@/widgets/mypage";

export const metadata = { title: "애견 프로필 관리 | 꼬순박스" };

export default async function DogProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const params = await searchParams;
  const isNewMode = params.new === "true";
  const token = await getServerToken();

  const profile = isNewMode ? null : await fetchProfile(token);

  return (
    <ProfileManagementSection
      profile={profile}
      isNewProfile={isNewMode}
    />
  );
}
