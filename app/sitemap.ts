import type { MetadataRoute } from "next";
import { PACKAGE_PRODUCT_SLUG_BY_TIER } from "@/entities/package";
import { SITE_URL } from "@/shared/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/subscribe`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/products`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.5 },
  ];
  const productRoutes: MetadataRoute.Sitemap = Object.values(PACKAGE_PRODUCT_SLUG_BY_TIER).map(
    (slug) => ({
      url: `${SITE_URL}/products/${slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );
  return [...staticRoutes, ...productRoutes];
}
