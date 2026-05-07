import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchActiveSubscription } from "@/features/subscription/api/queries";
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

  // TODO: 다중 구독 UI 대응 시 fetchSubscriptions으로 교체 후 ProfileManagementSection에 subscriptions[] 전달 필요
  const [profile, subscription] = await Promise.all([
    isNewMode ? Promise.resolve(null) : fetchProfile(token),
    fetchActiveSubscription(token),
  ]);

  return (
    <ProfileManagementSection
      profile={profile}
      subscription={subscription}
      isNewProfile={isNewMode}
    />
  );
}
