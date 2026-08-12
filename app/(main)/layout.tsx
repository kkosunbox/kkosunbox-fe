import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
import ChecklistFormModal from "@/widgets/checklist/ui/ChecklistFormModal";
import { ReferralProvider } from "@/features/referral/model";
import { resolveReferralContext } from "@/features/referral/lib/resolveReferralContext";
// import { CursorPaw } from "@/shared/ui";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 초대 상태는 요청당 한 번만 확정한다(resolveReferralContext는 cache() 적용).
  // 하위 페이지가 같은 사실을 다시 계산하면 화면마다 가격이 갈린다 — 그 사고로 도입된 구조다.
  const referral = await resolveReferralContext();

  return (
    <ReferralProvider context={referral}>
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
