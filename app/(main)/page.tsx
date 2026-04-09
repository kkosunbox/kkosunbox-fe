import { HeroSection } from "@/widgets/home/hero";
import { StatsBar } from "@/widgets/home/stats-bar";
import { PackagePlansSection } from "@/widgets/home/package-plans";
import { IngredientsSection } from "@/widgets/home/ingredients";
import { PainPointsSection } from "@/widgets/home/pain-points";
import { ReviewsSection } from "@/widgets/home/reviews";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <PackagePlansSection />
      <IngredientsSection />
      <PainPointsSection />
      <ReviewsSection />
    </>
  );
}
