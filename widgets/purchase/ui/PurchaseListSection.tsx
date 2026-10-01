"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 서버가 제공하는 동적 원격 URL이다. */

import { Fragment, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/features/product/api";
import type { ProductCategoryDto, ProductDto, ProductSortOrder } from "@/features/product/api/types";
import { formatKrwPrice } from "@/shared/lib/format";
import PurchaseBannerCoupon from "@/shared/assets/promotion-coupon.png";

interface PurchaseListSectionProps {
  products: ProductDto[];
  categories: ProductCategoryDto[];
  initialLoadFailed: boolean;
}

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  href: string;
  isSoldOut: boolean;
  isSalesPaused: boolean;
  averageRating: number;
  reviewCount: number;
}

const SORT_OPTIONS: Array<{ value: ProductSortOrder; label: string }> = [
  { value: "LATEST", label: "최신순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
];

const PAGE_SIZE = 8;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${direction === "right" ? "rotate-180" : ""}`} fill="none">
      <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true">
      <path d="M7.25 21.334c0-.9428 0-1.4142.2929-1.7071.2929-.2929.7643-.2929 1.7071-.2929h39.5c.9428 0 1.4142 0 1.7071.2929.2929.2929.2929.7643.2929 1.7071v8.0833c0 .9428 0 1.4142-.2929 1.7071-.2929.2929-.7643.2929-1.7071.2929H45.5c-.9428 0-1.4142 0-1.7071.2929-.2929.2929-.2929.7643-.2929 1.7071v12.9167c0 .9428 0 1.4142-.2929 1.7071-.2929.2929-.7643.2929-1.7071.2929h-25c-.9428 0-1.4142 0-1.7071-.2929-.2929-.2929-.2929-.7643-.2929-1.7071V33.4173c0-.9428 0-1.4142-.2929-1.7071-.2929-.2929-.7643-.2929-1.7071-.2929H9.25c-.9428 0-1.4142 0-1.7071-.2929-.2929-.2929-.2929-.7643-.2929-1.7071v-8.0833Z" stroke="var(--color-profile-meta-empty)" strokeWidth="4" strokeLinecap="round" />
      <path d="M12.084 31.416h33.8333M29 16.916v31.4167M29.0006 16.9167l-4.2054-4.2055a15.377 15.377 0 0 0-4.2997-2.657L14.7164 8.1275c-1.295-.4317-2.6324.5323-2.6324 1.8974v5.4502c0 .8609.5508 1.625 1.3675 1.8973l5.8825 1.9607M28.9994 16.9167l4.2054-4.2055a15.377 15.377 0 0 1 4.2997-2.657l5.7791-1.9262c1.295-.4317 2.6324.5323 2.6324 1.8974v5.4502c0 .8609-.5508 1.625-1.3675 1.8973L38.666 19.3333" stroke="var(--color-profile-meta-empty)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function RatingStarIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
        fill="var(--color-star)"
      />
    </svg>
  );
}

export default function PurchaseListSection({ products, categories, initialLoadFailed }: PurchaseListSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("LATEST");
  const [currentProducts, setCurrentProducts] = useState(products);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(initialLoadFailed);
  const [page, setPage] = useState(1);
  const requestId = useRef(0);

  async function loadProducts(categoryId: number | null, nextSortOrder: ProductSortOrder) {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await getProducts({
        ...(categoryId !== null ? { categoryId } : {}),
        sortOrder: nextSortOrder,
      });
      if (currentRequestId === requestId.current) setCurrentProducts(response.products);
    } catch {
      if (currentRequestId === requestId.current) {
        setCurrentProducts([]);
        setLoadFailed(true);
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }

  const catalog = useMemo<DisplayProduct[]>(() => {
    return currentProducts.map((product) => ({
      id: String(product.id),
      name: product.name,
      description: product.description?.trim() || "꼬순박스가 정성껏 만든 건강한 수제간식",
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl ?? null,
      href: `/purchase/detail?productId=${product.id}`,
      isSoldOut: product.isSoldOut,
      isSalesPaused: product.isSalesPaused,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
    }));
  }, [currentProducts]);

  const totalPages = Math.max(1, Math.ceil(catalog.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = catalog.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectCategory(nextCategoryId: number | null) {
    setSelectedCategoryId(nextCategoryId);
    setPage(1);
    void loadProducts(nextCategoryId, sortOrder);
  }

  function selectSortOrder(nextSortOrder: ProductSortOrder) {
    setSortOrder(nextSortOrder);
    setPage(1);
    void loadProducts(selectedCategoryId, nextSortOrder);
  }

  return (
    <div className="bg-[var(--color-background)] pt-[var(--header-offset)]">
      <section className="h-[70px] bg-[var(--color-purchase-banner-bg)]" aria-label="단품몰 안내">
        <div className="mx-auto flex h-full items-center justify-center max-md:w-full max-md:gap-4 max-md:px-6 md:gap-[31px] md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px] lg:pl-[82px]">
          <p className="text-body-16-b md:leading-[19px] tracking-[-0.04em] text-white max-md:text-body-14-b">
            첫 만남은 가볍게, <span className="font-extrabold text-[var(--color-banner-bg)]">꼬순박스를 단품</span>으로 만나보기
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

      <section className="mx-auto pt-10 max-md:w-full max-md:px-6 max-md:pb-16 md:pb-[108px] md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px]">
        <h1 className="text-[28px] font-semibold leading-[33px] tracking-[-0.04em] text-black">단품몰</h1>

        <div className="mt-5 flex justify-between gap-6 max-md:flex-col max-md:items-start md:items-end">
          <div className="flex flex-wrap gap-3" role="group" aria-label="상품 카테고리">
            {[{ id: null, name: "전체", sortOrder: -1 }, ...categories].map((filter) => {
              const active = selectedCategoryId === filter.id;
              return (
                <button
                  key={filter.id ?? "all"}
                  type="button"
                  onClick={() => selectCategory(filter.id)}
                  className={`flex h-10 items-center justify-center rounded-full border px-5 text-[14px] font-semibold leading-[17px] transition-colors ${active ? "border-[var(--color-text)] bg-[var(--color-text)] text-white" : "border-[var(--color-text-muted)] text-[var(--color-text)] hover:border-[var(--color-text)]"}`}
                  aria-pressed={active}
                >
                  {filter.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-body-16-m md:leading-[22px] max-md:text-body-14-m" aria-label="상품 정렬">
            {SORT_OPTIONS.map((option, index) => (
              <Fragment key={option.value}>
                {index > 0 && <span className="h-2.5 w-px bg-[var(--color-text-secondary)]" aria-hidden="true" />}
                <button type="button" onClick={() => selectSortOrder(option.value)} disabled={loading} aria-pressed={sortOrder === option.value} className={sortOrder === option.value ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}>{option.label}</button>
              </Fragment>
            ))}
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="mt-5 grid max-sm:grid-cols-1 sm:max-md:grid-cols-2 md:max-lg:grid-cols-3 lg:grid-cols-4 max-md:gap-x-4 md:max-lg:gap-x-6 lg:gap-x-[26.6667px] max-lg:gap-y-8 lg:gap-y-10">
            {visibleProducts.map((product) => {
              const content = (
                <>
                  <div className="relative aspect-[290/270] overflow-hidden rounded-xl bg-[var(--color-surface-light)]">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="h-full w-full bg-[var(--color-surface-light)]" aria-hidden="true" />}
                    {(product.isSoldOut || product.isSalesPaused) && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-body-16-b text-white">
                        {product.isSoldOut ? "품절" : "판매 중지"}
                      </span>
                    )}
                  </div>
                  <div className="max-lg:pt-4 lg:pt-5">
                    <h2 className="font-semibold tracking-[-0.04em] text-[var(--color-text-price)] max-lg:text-[16px] max-lg:leading-[22px] lg:text-[18px] lg:leading-[21px]">{product.name}</h2>
                    <p className="line-clamp-2 font-medium tracking-[-0.05em] text-[var(--color-text-secondary)] max-lg:mt-2 max-lg:min-h-[36px] max-lg:text-[13px] max-lg:leading-[18px] lg:mt-2.5 lg:min-h-[34px] lg:text-[14px] lg:leading-[17px]">{product.description}</p>
                    <div className="flex flex-wrap items-center gap-y-1 max-lg:mt-2 max-lg:gap-x-1.5 lg:mt-2.5 lg:gap-x-2">
                      {product.originalPrice !== null && product.originalPrice > product.price && <span className="font-bold tracking-[-0.05em] text-[var(--color-text-discount)] max-lg:text-[18px] max-lg:leading-[22px] lg:text-price-20-b">{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
                      <strong className="font-bold tracking-[-0.05em] text-[var(--color-text-price)] max-lg:text-[18px] max-lg:leading-[22px] lg:text-price-20-b">{formatKrwPrice(product.price)}</strong>
                      {product.originalPrice !== null && product.originalPrice > product.price && <span className="font-medium tracking-[-0.05em] text-[var(--color-text-secondary)] line-through max-md:text-[14px] max-md:leading-[22px] md:max-lg:text-[16px] md:max-lg:leading-[22px] lg:text-[20px] lg:leading-6">{formatKrwPrice(product.originalPrice)}</span>}
                    </div>
                    {product.reviewCount > 0 && product.averageRating > 0 && (
                      <div className="flex flex-wrap items-center font-medium leading-[17px] tracking-[-0.02em] max-lg:mt-2 max-lg:gap-1.5 max-lg:text-[13px] lg:mt-2.5 lg:gap-2 lg:text-[14px]" aria-label={`평점 ${product.averageRating.toFixed(1)}점, 리뷰 ${product.reviewCount}건`}>
                        <span className="flex items-center gap-2 text-black">
                          <RatingStarIcon />
                          {product.averageRating.toFixed(1)}
                        </span>
                        <span className="border-l border-[var(--color-text-muted)] pl-2 text-[var(--color-text-secondary)]">리뷰 {product.reviewCount.toLocaleString("ko-KR")}건</span>
                      </div>
                    )}
                  </div>
                </>
              );

              return <Link key={product.id} href={product.href} className="group block min-w-0 w-full max-lg:max-w-[290px] max-lg:justify-self-center">{content}</Link>;
            })}
          </div>
        ) : (
          <div className="mt-[126px] flex min-h-[300px] flex-col items-center text-center max-md:mt-20">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[var(--color-surface-light)]">
              <GiftIcon />
            </div>
            <h2 className="mt-6 text-[24px] font-extrabold leading-[29px] tracking-[-0.04em] text-[var(--color-text)]">
              {loading ? "상품을 불러오는 중입니다." : loadFailed ? "상품 정보를 불러오지 못했습니다." : "카테고리에 준비된 상품이 없습니다."}
            </h2>
            <p className="mt-4 text-body-16-m text-[var(--color-text-secondary)]">
              {loading ? "잠시만 기다려주세요." : loadFailed ? "잠시 후 다시 시도해주세요." : "새로운 간식을 준비하고 있어요. 조금만 기다려주세요."}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="max-md:mt-[72px] md:mt-12 flex items-center justify-center gap-3" aria-label="상품 페이지">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="이전 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="left" /></button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} aria-current={currentPage === pageNumber ? "page" : undefined} className={`h-5 min-w-5 text-body-16-r leading-5 ${currentPage === pageNumber ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]"}`}>{pageNumber}</button>
            ))}
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="다음 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="right" /></button>
          </nav>
        )}
      </section>
    </div>
  );
}
