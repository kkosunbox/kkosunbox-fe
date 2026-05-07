import { getServerToken } from "@/features/auth/lib/session";
import { fetchChecklistQuestions, fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchInquiries } from "@/features/inquiry/api/queries";
import { MypageSection } from "@/widgets/mypage";

export default async function MyPage() {
  const token = await getServerToken();

  const [profile, checklistQuestions, allSubscriptions, billingInfo, inquiries] = await Promise.all([
    fetchProfile(token),
    fetchChecklistQuestions(),
    fetchSubscriptions(token),
    fetchBillingInfo(token),
    fetchInquiries(token),
  ]);

  const subscriptions = allSubscriptions.filter((s) => s.isActive);

  return (
    <MypageSection
      profile={profile}
      checklistQuestions={checklistQuestions}
      subscriptions={subscriptions}
      billingInfo={billingInfo}
      inquiries={inquiries}
    />
  );
}
