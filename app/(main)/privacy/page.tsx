import { PrivacySection } from "@/widgets/privacy";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default function PrivacyPage() {
  return <PrivacySection />;
}
