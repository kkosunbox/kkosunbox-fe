import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { PartnershipSection } from "@/widgets/partnership";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default async function PartnershipPage() {
  const token = await getServerToken();
  if (!token) {
    redirect("/login?next=/partnership");
  }

  return <PartnershipSection />;
}
