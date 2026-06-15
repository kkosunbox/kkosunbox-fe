import type { StaticImageData } from "next/image";
import packageExplainWithBasic from "../assets/package-explain-with-basic.webp";
import packageExplainWithPremium from "../assets/package-explain-with-premium.webp";
import packageExplainWithStandard from "../assets/package-explain-with-standard.webp";
import packageImageBasic from "../assets/package-image-basic.webp";
import packageImagePremium from "../assets/package-image-premium.webp";
import packageImageStandard from "../assets/package-image-standard.webp";
import type { PackageTier } from "./packageData";

export const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

export const PACKAGE_EXPLAIN_BY_TIER: Record<
  PackageTier,
  { src: StaticImageData; alt: string }
> = {
  Basic: { src: packageExplainWithBasic, alt: "베이직 패키지 BOX 설명" },
  Standard: { src: packageExplainWithStandard, alt: "스탠다드 패키지 BOX 설명" },
  Premium: { src: packageExplainWithPremium, alt: "프리미엄 패키지 BOX 설명" },
};
