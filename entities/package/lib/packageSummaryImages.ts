import type { StaticImageData } from "next/image";
import packageImageBasic from "../assets/package-image-basic.webp";
import packageImagePremium from "../assets/package-image-premium.webp";
import packageImageStandard from "../assets/package-image-standard.webp";
import type { PackageTier } from "./packageData";

export const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};
