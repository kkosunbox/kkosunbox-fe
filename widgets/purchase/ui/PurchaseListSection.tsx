"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 서버가 제공하는 동적 원격 URL이다. */

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartPackage } from "@/features/cart";
import { getProducts } from "@/features/product/api";
import type { ProductCategoryDto, ProductDto, ProductSortOrder } from "@/features/product/api/types";
import { formatKrwPrice } from "@/shared/lib/format";
import PurchaseBannerCoupon from "@/shared/assets/promotion-coupon.png";
import { PACKAGE_SHEET_OPEN_VALUE, PACKAGE_SHEET_PARAM } from "@/shared/config/packageSheet";
import CategoryChips from "./CategoryChips";
import PackageBottomSheet from "./package/PackageBottomSheet";
import PackagePanel from "./package/PackagePanel";
import { usePackagePurchase } from "./package/usePackagePurchase";

interface PurchaseListSectionProps {
  products: ProductDto[];
  categories: ProductCategoryDto[];
  initialLoadFailed: boolean;
}

interface DisplayProduct {
  id: string;
  productId: number;
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

const PAGE_SIZE = 6;

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

function AddToPackageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="max-md:h-5 max-md:w-5 md:h-6 md:w-6">
      <path d="M4 5H5.62563C6.193 5 6.47669 5 6.70214 5.12433C6.79511 5.17561 6.87933 5.24136 6.95162 5.31912C7.12692 5.50769 7.19573 5.7829 7.33333 6.33333L7.51493 7.05972C7.616 7.46402 7.66654 7.66617 7.74455 7.83576C8.01534 8.42449 8.5546 8.84553 9.19144 8.96546C9.37488 9 9.58326 9 10 9" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
      <path d="M18 18H7.55091C7.40471 18 7.33162 18 7.27616 17.9938C6.68857 17.928 6.28605 17.3695 6.40945 16.7913C6.42109 16.7367 6.44421 16.6674 6.49044 16.5287C6.54177 16.3747 6.56743 16.2977 6.59579 16.2298C6.88607 15.5342 7.54277 15.0608 8.29448 15.0054C8.3679 15 8.44906 15 8.61137 15H14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      <path d="M9.69425 15H15.7639C16.5215 15 17.214 14.572 17.5528 13.8944L19.2764 10.4472C19.6088 9.78231 19.1253 9 18.382 9H8.77069C7.84378 9 7.13872 9.8323 7.2911 10.7466L7.72147 13.3288C7.8822 14.2932 8.71658 15 9.69425 15Z" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
      <circle cx="17" cy="21" r="1" fill="currentColor" />
      <circle cx="9" cy="21" r="1" fill="currentColor" />
      <path d="M14 2L14 6" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
      <path d="M16 4L12 4" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
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
  const pkg = useCartPackage();
  const { canPurchase, purchase: purchasePackage, purchaseChoiceModal } = usePackagePurchase(pkg);
  // 모바일·태블릿 바텀시트 — 담은 상품이 있으면 처음부터 띄우고, "상품 더 담기"로 닫은 뒤에는 다시 담을 때 연다.
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetInitialized = useRef(false);

  useEffect(() => {
    if (!pkg.loaded || sheetInitialized.current) return;
    sheetInitialized.current = true;
    if ((pkg.cart?.items.length ?? 0) > 0) setSheetOpen(true);
  }, [pkg.loaded, pkg.cart]);

  // 헤더 장바구니 아이콘으로 들어오면(?package=open) 비어 있어도 시트를 연다. 다시 눌러도 열리도록 쿼리는 지운다.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openSheetRequested = searchParams.get(PACKAGE_SHEET_PARAM) === PACKAGE_SHEET_OPEN_VALUE;

  useEffect(() => {
    if (!openSheetRequested) return;
    sheetInitialized.current = true;
    setSheetOpen(true);
    router.replace(pathname, { scroll: false });
  }, [openSheetRequested, pathname, router]);

  async function addToPackage(productId: number) {
    if (await pkg.add(productId)) setSheetOpen(true);
  }

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
      productId: product.id,
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

  const sortControls = (
    <div className="flex shrink-0 items-center gap-3 whitespace-nowrap leading-[1.4] tracking-[-0.02em] max-md:text-[13px] md:text-[16px]" role="group" aria-label="상품 정렬">
      {SORT_OPTIONS.map((option, index) => (
        <Fragment key={option.value}>
          {index > 0 && <span className="h-[8.5px] w-px bg-[var(--color-text-secondary)]" aria-hidden="true" />}
          <button type="button" onClick={() => selectSortOrder(option.value)} disabled={loading} aria-pressed={sortOrder === option.value} className={sortOrder === option.value ? "font-semibold text-[var(--color-text)]" : "font-medium text-[var(--color-text-secondary)]"}>{option.label}</button>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-[var(--color-background)] pt-[var(--header-offset)]">
      <section className="max-md:h-[51px] md:h-[70px] bg-[var(--color-purchase-banner-bg)]" aria-label="단품몰 안내">
        <div className="mx-auto flex h-full items-center justify-center max-md:w-full max-md:gap-6 max-md:px-4 md:gap-[31px] md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px] lg:pl-[82px]">
          <p className="font-bold tracking-[-0.04em] text-white max-md:text-[12px] max-md:leading-[14px] sm:max-md:whitespace-nowrap md:text-[16px] md:leading-[19px]">
            첫 만남은 가볍게, <span className="font-extrabold text-[var(--color-banner-bg)]">꼬순박스를 단품</span>으로 만나보기
          </p>
          <Image
            src={PurchaseBannerCoupon}
            alt=""
            width={172}
            height={61}
            className="self-end max-md:h-[42px] max-md:w-[85px] max-md:object-cover md:h-[61px] md:w-[172px] md:object-contain"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="mx-auto max-md:w-full max-md:px-6 max-md:pb-16 max-md:pt-4 md:pt-10 md:max-lg:pb-[108px] lg:pb-[69px] md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h1 className="font-semibold tracking-[-0.04em] text-black max-md:text-[16px] max-md:leading-[19px] md:text-[28px] md:leading-[33px]">단품몰</h1>
          <div className="md:hidden">{sortControls}</div>
        </div>

        <div className="md2:flex md2:gap-6 lg:gap-[30px]">
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-6 max-md:mt-2.5 md:mt-5 md:items-end">
              <CategoryChips categories={categories} selectedCategoryId={selectedCategoryId} onSelect={selectCategory} />
              <div className="max-md:hidden">{sortControls}</div>
            </div>

            {visibleProducts.length > 0 ? (
              <div className="grid max-sm:grid-cols-1 sm:max-md:grid-cols-2 md:max-md2:grid-cols-3 md2:max-lg:grid-cols-2 lg:grid-cols-3 max-md:mt-4 max-md:gap-x-4 max-md:gap-y-6 md:mt-5 md:gap-x-6 md:max-lg:gap-y-8 lg:gap-y-10">
                {visibleProducts.map((product) => {
                  const unavailable = product.isSoldOut || product.isSalesPaused;
                  const hasDiscount = product.originalPrice !== null && product.originalPrice > product.price;
                  return (
                    <article key={product.id} className="group min-w-0 w-full max-lg:max-w-[290px] max-lg:justify-self-center">
                      <div className="relative">
                        <Link href={product.href} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden bg-[var(--color-surface-light)] max-md:aspect-[156/146] max-md:rounded-lg md:rounded-xl md:max-lg:aspect-[290/270] lg:aspect-square">
                          {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="h-full w-full bg-[var(--color-surface-light)]" />}
                          {unavailable && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-body-16-b text-white">
                              {product.isSoldOut ? "품절" : "판매 중지"}
                            </span>
                          )}
                        </Link>
                        {!unavailable && (
                          <button
                            type="button"
                            onClick={() => void addToPackage(product.productId)}
                            disabled={pkg.pendingProductId !== null}
                            aria-label={`${product.name} 내 패키지에 담기`}
                            aria-busy={pkg.pendingProductId === product.productId}
                            className="absolute flex items-center justify-center rounded-full border-[1.5px] border-[var(--color-text-muted)] bg-white text-[var(--color-text)] transition-transform hover:scale-105 disabled:opacity-60 max-md:bottom-2 max-md:right-2 max-md:h-8 max-md:w-8 md:bottom-4 md:right-4 md:h-10 md:w-10"
                          >
                            <AddToPackageIcon />
                          </button>
                        )}
                      </div>
                      <Link href={product.href} className="flex flex-col max-md:pt-3 md:max-lg:pt-4 lg:gap-2.5 lg:pt-3">
                        <h2 className="font-semibold tracking-[-0.04em] text-[var(--color-text-price)] max-md:text-[14px] max-md:leading-[17px] md:max-lg:text-[16px] md:max-lg:leading-[22px] lg:text-[18px] lg:leading-[21px]">{product.name}</h2>
                        <p className="line-clamp-2 font-medium tracking-[-0.05em] text-[var(--color-text-secondary)] max-md:mt-2 max-md:min-h-[28px] max-md:text-[12px] max-md:leading-[14px] md:max-lg:mt-2 md:max-lg:min-h-[36px] md:max-lg:text-[13px] md:max-lg:leading-[18px] lg:order-2 lg:min-h-[34px] lg:text-[14px] lg:leading-[17px]">{product.description}</p>
                        <div className="flex flex-wrap items-center gap-y-1 max-md:mt-2 max-md:gap-x-1 md:max-lg:mt-2 md:max-lg:gap-x-1.5 lg:order-1 lg:gap-x-2">
                          {hasDiscount && <span className="tracking-[-0.05em] text-[var(--color-text-discount)] max-md:text-[14px] max-md:font-bold max-md:leading-[17px] md:max-lg:text-[18px] md:max-lg:font-bold md:max-lg:leading-[22px] lg:text-[20px] lg:font-extrabold lg:leading-6">{Math.round((1 - product.price / product.originalPrice!) * 100)}%</span>}
                          <strong className="tracking-[-0.05em] text-[var(--color-text-price)] max-md:text-[14px] max-md:font-bold max-md:leading-[17px] md:max-lg:text-[18px] md:max-lg:font-bold md:max-lg:leading-[22px] lg:text-[20px] lg:font-extrabold lg:leading-6">{formatKrwPrice(product.price)}</strong>
                          {hasDiscount && <span className="font-medium tracking-[-0.05em] text-[var(--color-text-secondary)] line-through max-md:text-[13px] max-md:leading-4 md:max-lg:text-[16px] md:max-lg:leading-[22px] lg:text-[20px] lg:leading-6">{formatKrwPrice(product.originalPrice!)}</span>}
                        </div>
                        {product.reviewCount > 0 && product.averageRating > 0 && (
                          <div className="flex flex-wrap items-center gap-0.5 font-medium leading-[17px] tracking-[-0.02em] max-md:mt-2 max-md:text-[14px] md:max-lg:mt-2 md:max-lg:text-[13px] lg:order-3 lg:text-[14px]" aria-label={`평점 ${product.averageRating.toFixed(1)}점, 리뷰 ${product.reviewCount}건`}>
                            <span className="flex items-center gap-2 text-black">
                              <RatingStarIcon />
                              {product.averageRating.toFixed(1)}
                            </span>
                            <span className="text-[var(--color-text-label)]"><span className="text-[var(--color-text-muted)]" aria-hidden="true">ㅣ</span> 리뷰 {product.reviewCount.toLocaleString("ko-KR")}건</span>
                          </div>
                        )}
                      </Link>
                    </article>
                  );
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
              <nav className="max-md:mt-[72px] md:max-lg:mt-12 lg:mt-6 flex items-center justify-center gap-3" aria-label="상품 페이지">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="이전 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="left" /></button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} aria-current={currentPage === pageNumber ? "page" : undefined} className={`h-5 min-w-5 text-body-16-r leading-5 ${currentPage === pageNumber ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]"}`}>{pageNumber}</button>
                ))}
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="다음 페이지" className="text-[var(--color-ui-disabled)] disabled:opacity-50"><Chevron direction="right" /></button>
              </nav>
            )}
          </div>

          <div className="max-md2:hidden shrink-0 md2:pt-20">
            <PackagePanel pkg={pkg} canPurchase={canPurchase} onPurchase={purchasePackage} />
          </div>
        </div>
      </section>
      {sheetOpen && <PackageBottomSheet pkg={pkg} canPurchase={canPurchase} onPurchase={purchasePackage} onMore={() => setSheetOpen(false)} />}
      {purchaseChoiceModal}
    </div>
  );
}
