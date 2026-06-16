"use client";

import { useReferral } from "@/features/referral/model";
import HeroSection from "./HeroSection";
import { ReferralHeroSection } from "@/widgets/home/referral-hero";

export default function HomeHero() {
  const { isReferral } = useReferral();
  return isReferral ? <ReferralHeroSection /> : <HeroSection />;
}
