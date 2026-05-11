import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchInquiries } from "@/features/inquiry/api/queries";
import { InquiryCard } from "./InquiryCard";

export async function InquiryCardLoader() {
  const token = await getServerToken();
  const inquiries = await fetchInquiries(token);
  return <InquiryCard inquiries={inquiries} />;
}
