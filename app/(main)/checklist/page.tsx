import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/lib/session";
import { ChecklistSection } from "@/widgets/checklist";

export const metadata = {
  title: "체크리스트 | 꼬순박스",
};

export default async function ChecklistPage() {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login?next=/checklist");
  }

  return <ChecklistSection />;
}
