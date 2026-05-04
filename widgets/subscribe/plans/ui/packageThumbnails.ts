import type { StaticImageData } from "next/image";
import boxMockupBasic from "../assets/box-mockup-basic.png";
import boxMockupStandard from "../assets/box-mockup-standard.png";
import boxMockupPremium from "../assets/box-mockup-premium.png";
import type { PackageTier } from "./packageData";

export const TIER_THUMBNAILS: Record<PackageTier, StaticImageData> = {
  Basic: boxMockupBasic,
  Standard: boxMockupStandard,
  Premium: boxMockupPremium,
};
