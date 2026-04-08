import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchUser } from "@/features/auth/api/queries";
import { fetchActiveSubscription } from "@/features/subscription/api/queries";
import { ProfileManagementSection } from "@/widgets/mypage";

export const metadata = { title: "프로필 관리 | 꼬순박스" };

export default async function ProfilePage() {
  const token = await getServerToken();

  const [profile, user, subscription] = await Promise.all([
    fetchProfile(token),
    fetchUser(token),
    fetchActiveSubscription(token),
  ]);

  return (
    <ProfileManagementSection
      profile={profile}
      userEmail={user?.email ?? ""}
      subscription={subscription}
    />
  );
}
