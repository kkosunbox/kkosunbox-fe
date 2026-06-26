import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { InquirySection } from "@/widgets/inquiry";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default async function InquiryPage() {
  const token = await getServerToken();
  if (!token) {
    redirect("/login?next=/inquiry");
  }

  return <InquirySection />;
}
