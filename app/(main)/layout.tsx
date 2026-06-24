import { cookies } from "next/headers";
import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
import ChecklistFormModal from "@/widgets/checklist/ui/ChecklistFormModal";
import { ReferralProvider } from "@/features/referral/model";
import { INVITE_CODE_COOKIE, isValidInviteCode } from "@/features/referral/lib";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
// import { CursorPaw } from "@/shared/ui";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawInviteCode = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? null;
  const hasInviteCode = rawInviteCode !== null && isValidInviteCode(rawInviteCode);

  let hasSubscriptionHistory = false;
  if (hasInviteCode) {
    const token = await getServerToken().catch(() => null);
    if (token) {
      const subscriptions = await fetchSubscriptions(token).catch(() => []);
      hasSubscriptionHistory = subscriptions.length > 0;
    }
  }

  return (
    <ReferralProvider hasSubscriptionHistory={hasSubscriptionHistory}>
      <div className="flex min-h-dvh flex-col" suppressHydrationWarning>
        {/* <CursorPaw /> */}
        <Header />
        <ChecklistFormModal />
        <main className="flex flex-1 flex-col">{children}</main>
        <FooterSection />
      </div>
    </ReferralProvider>
  );
}
