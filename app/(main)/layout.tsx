import { headers } from "next/headers";
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
  // `/r/{slug}` 방문은 proxy.ts가 심어준 헤더로 landingSlug를 받는다 — `r/[slug]/page.tsx`가
  // 별도로 ReferralProvider를 중첩하면 쿠키 기록 effect가 경합해 상위 값으로 덮어써진다.
  const headersList = await headers();
  const landingSlug = headersList.get("x-referral-slug") ?? undefined;
  const referral = await resolveReferralContext(landingSlug);

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
