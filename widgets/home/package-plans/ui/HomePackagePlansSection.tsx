"use client";

import { useReferral } from "@/features/referral/model";
import PackagePlansSection from "./PackagePlansSection";
import { ReferralPackagePlansSection } from "@/widgets/home/referral-package-plans";

export default function HomePackagePlansSection() {
  const { isReferral } = useReferral();
  return isReferral ? <ReferralPackagePlansSection /> : <PackagePlansSection />;
}
