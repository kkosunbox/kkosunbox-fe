import type { PackageTier } from "./packageData";

export const PACKAGE_PRODUCT_SLUG_BY_TIER = {
  Basic: "kkosun-box-basic",
  Standard: "kkosun-box-standard",
  Premium: "kkosun-box-premium",
} as const satisfies Record<PackageTier, string>;

export type PackageProductSlug =
  (typeof PACKAGE_PRODUCT_SLUG_BY_TIER)[PackageTier];

export interface PackageProductCatalogEntry<TProduct = unknown> {
  /** URL과 API 식별자는 서로 독립적이다. API id가 바뀌어도 이 slug는 유지한다. */
  slug: PackageProductSlug;
  tier: PackageTier;
  product: TProduct | null;
}

export function getPackageProductPath(tier: PackageTier): string {
  return `/products/${PACKAGE_PRODUCT_SLUG_BY_TIER[tier]}`;
}

export function getPackageTierBySlug(slug: string): PackageTier | null {
  const match = (Object.entries(PACKAGE_PRODUCT_SLUG_BY_TIER) as Array<
    [PackageTier, PackageProductSlug]
  >).find(([, value]) => value === slug);
  return match?.[0] ?? null;
}

export function createPackageProductCatalogEntry<TProduct>(
  tier: PackageTier,
  product: TProduct | null,
): PackageProductCatalogEntry<TProduct> {
  return { slug: PACKAGE_PRODUCT_SLUG_BY_TIER[tier], tier, product };
}
