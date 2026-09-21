"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 서버가 제공하는 동적 원격 URL이다. */

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { COMPARE_PACKAGES, getPackageProductPath, getPackagePurchaseProduct, TIER_BOX_IMAGES, type PackageTier } from "@/entities/package";
import type { ProductDto } from "@/features/product/api/types";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { formatKrwPrice } from "@/shared/lib/format";
import PurchaseBannerCoupon from "../assets/purchase-banner-coupon.png";

type Category = "all" | "yogurt" | "meal" | "gum";

interface PurchaseListSectionProps {
  productsByTier: Record<PackageTier, ProductDto | null>;
  products: ProductDto[];
}

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | StaticImageData;
  href: string | null;
  category: Exclude<Category, "all"> | "etc";
}

const FILTERS: Array<{ value: Category; label: string }> = [
  { value: "all", label: "전체" },
  { value: "yogurt", label: "요거트볼" },
  { value: "meal", label: "화식" },
  { value: "gum", label: "껌" },
];

const PAGE_SIZE = 8;

function resolveCategory(name: string): DisplayProduct["category"] {
  if (name.includes("요거트")) return "yogurt";
  if (name.includes("화식")) return "meal";
  if (name.includes("껌")) return "gum";
  return "etc";
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${direction === "right" ? "rotate-180" : ""}`} fill="none">
      <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PurchaseListSection({ productsByTier, products }: PurchaseListSectionProps) {
  const [category, setCategory] = useState<Category>("all");
  const [page, setPage] = useState(1);

  const catalog = useMemo<DisplayProduct[]>(() => {
    if (products.length > 0) {
      return products.map((product) => {
        const matchedPackage = COMPARE_PACKAGES.find((pkg) => productsByTier[pkg.tier]?.id === product.id);
        return {
          id: String(product.id),
          name: product.name,
          description: product.description?.trim() || "꼬순박스가 정성껏 만든 건강한 수제간식",
          price: product.price,
          image: product.imageUrl || (matchedPackage ? TIER_BOX_IMAGES[matchedPackage.tier] : TIER_BOX_IMAGES.Basic),
          href: matchedPackage ? getPackageProductPath(matchedPackage.tier) : null,
          category: resolveCategory(product.name),
        };
      });
    }

    return COMPARE_PACKAGES.map((pkg) => ({
      id: pkg.tier,
      name: pkg.name,
      description: "꼬순박스를 부담 없이 경험할 수 있는 수제간식 패키지",
      price: getPackagePurchaseProduct(pkg.tier)!.price,
      image: TIER_BOX_IMAGES[pkg.tier],
      href: getPackageProductPath(pkg.tier),
      category: "etc",
    }));
  }, [products, productsByTier]);

  const filteredProducts = category === "all" ? catalog : catalog.filter((product) => product.category === category);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setPage(1);
  }

  return (
    <div className="bg-[var(--color-background)]">
      <section className="mt-[var(--header-offset)] h-[70px] bg-[var(--color-purchase-banner-bg)]" aria-label="단품몰 안내">
        <div className="mx-auto flex h-full items-center justify-center gap-[53px] max-md:w-full max-md:gap-4 max-md:px-6 md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px]">
          <p className="text-body-20-b tracking-[-0.04em] text-white max-md:text-body-14-b">
            첫 만남은 가볍게, <span className="text-[var(--color-banner-bg)]">꼬순박스를 단품으로 만나보기</span>
          </p>
          <Image
            src={PurchaseBannerCoupon}
            alt=""
            width={172}
            height={61}
            className="h-[61px] w-[172px] self-end object-contain max-md:h-[54px] max-md:w-[152px]"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="mx-auto pb-24 pt-16 max-md:w-full max-md:px-6 max-md:pb-16 max-md:pt-10 md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px]">
        <h1 className="text-title-36-b text-[var(--color-text-price)] max-md:text-title-28-b">All Product</h1>

        <div className="mt-6 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <div className="flex flex-wrap gap-3" role="group" aria-label="상품 카테고리">
            {FILTERS.map((filter) => {
              const active = category === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => selectCategory(filter.value)}
                  className={`flex h-10 items-center justify-center rounded-full border px-5 text-body-14-sb transition-colors ${active ? "border-[var(--color-text)] bg-[var(--color-text)] text-white" : "border-[var(--color-text-muted)] text-[var(--color-text)] hover:border-[var(--color-text)]"}`}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-body-16-m max-md:text-body-14-m" aria-label="상품 정렬">
            <span className="font-semibold text-[var(--color-text)]">최신순</span>
            <span className="h-2.5 w-px bg-[var(--color-text-secondary)]" aria-hidden="true" />
            <button type="button" disabled className="text-[var(--color-text-secondary)]">평점 높은순</button>
            <span className="h-2.5 w-px bg-[var(--color-text-secondary)]" aria-hidden="true" />
            <button type="button" disabled className="text-[var(--color-text-secondary)]">평점 낮은순</button>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="mt-[30px] grid grid-cols-1 gap-x-8 gap-y-[92px] sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[26px] max-md:gap-y-12">
            {visibleProducts.map((product) => {
              const content = (
                <>
                  <div className="relative aspect-[290/270] overflow-hidden rounded-2xl bg-[var(--color-surface-light)]">
                    {typeof product.image === "string" ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <Image src={product.image} alt={product.name} fill quality={HIGH_IMAGE_QUALITY} className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 25vw" />
                    )}
                  </div>
                  <div className="pt-5">
                    <h2 className="text-subtitle-20-b text-[var(--color-text-price)] max-md:text-subtitle-18-b">{product.name}</h2>
                    <p className="mt-3 line-clamp-2 text-body-16-m tracking-[-0.05em] text-[var(--color-text-secondary)] max-md:text-body-14-r">{product.description}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <strong className="text-[24px] font-extrabold leading-[29px] tracking-[-0.05em] text-[var(--color-text-price)] max-md:text-[22px]">{formatKrwPrice(product.price)}</strong>
                    </div>
                  </div>
                </>
              );

              return product.href ? (
                <Link key={product.id} href={product.href} className="group block">{content}</Link>
              ) : (
                <article key={product.id} className="group">{content}</article>
              );
            })}
          </div>
        ) : (
          <p className="py-24 text-center text-body-18-r text-[var(--color-text-secondary)]">해당 카테고리의 상품이 없습니다.</p>
        )}

        {totalPages > 1 && (
          <nav className="mt-[72px] flex items-center justify-center gap-3" aria-label="상품 페이지">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="이전 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="left" /></button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} aria-current={currentPage === pageNumber ? "page" : undefined} className={`h-6 min-w-6 text-body-16-r ${currentPage === pageNumber ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]"}`}>{pageNumber}</button>
            ))}
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="다음 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="right" /></button>
          </nav>
        )}
      </section>
    </div>
  );
}
