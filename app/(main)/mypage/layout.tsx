import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";

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
