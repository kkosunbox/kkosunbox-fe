import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/lib/session";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 쿠키 조작·만료 등 어떤 상태에서도 실제 인증을 검증한 뒤 분기 (app/(main)/order/page.tsx와 동일 패턴)
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login?next=/mypage");
  }

  return <>{children}</>;
}
