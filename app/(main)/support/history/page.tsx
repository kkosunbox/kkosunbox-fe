import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { InquiryHistorySection } from "@/widgets/support/inquiry-history";

export default async function SupportInquiryHistoryPage() {
  const token = await getServerToken();
  if (!token) {
    redirect("/login?next=/support/history");
  }

  return <InquiryHistorySection />;
}
