import { HeroSection } from "@/widgets/home/hero";
import { StatsBar } from "@/widgets/home/stats-bar";
import { BenefitsSection } from "@/widgets/home/benefits";
import { PackagePlansSection } from "@/widgets/home/package-plans";
import { IngredientsSection } from "@/widgets/home/ingredients";
import { PainPointsSection } from "@/widgets/home/pain-points";
import { HowItWorksSection } from "@/widgets/home/how-it-works";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <BenefitsSection />
      <PackagePlansSection />
      <IngredientsSection />
      <PainPointsSection />
      <HowItWorksSection />
    </>
  );
}
