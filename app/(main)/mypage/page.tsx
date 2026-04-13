import { getServerToken } from "@/features/auth/lib/session";
import { fetchChecklistQuestions, fetchProfile } from "@/features/profile/api/queries";
import { fetchActiveSubscription } from "@/features/subscription/api/queries";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchInquiries } from "@/features/inquiry/api/queries";
import { MypageSection } from "@/widgets/mypage";

export default async function MyPage() {
  const token = await getServerToken();

  const [profile, checklistQuestions, subscription, billingInfo, inquiries] = await Promise.all([
    fetchProfile(token),
    fetchChecklistQuestions(),
    fetchActiveSubscription(token),
    fetchBillingInfo(token),
    fetchInquiries(token),
  ]);

  return (
    <MypageSection
      profile={profile}
      checklistQuestions={checklistQuestions}
      subscription={subscription}
      billingInfo={billingInfo}
      inquiries={inquiries}
    />
  );
}
