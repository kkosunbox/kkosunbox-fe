import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) {
    redirect("/login?next=/mypage");
  }

  return <>{children}</>;
}
