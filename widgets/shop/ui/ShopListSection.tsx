"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SHOP_PRODUCTS,
  SHOP_CATEGORIES,
  SHOP_FREE_SHIPPING_THRESHOLD,
} from "@/entities/product";
import { formatKrwPrice } from "@/shared/lib/format";
import { ShopProductArt } from "./ShopProductArt";

type Category = (typeof SHOP_CATEGORIES)[number];

export default function ShopListSection() {
  const [category, setCategory] = useState<Category>("전체");

  const products =
    category === "전체"
      ? SHOP_PRODUCTS
      : SHOP_PRODUCTS.filter((p) => p.category === category);

  return (
    <div className="pt-[var(--header-offset)]">
      <div className="mx-auto w-full max-w-content max-md:px-6 md:px-8 lg:px-0 max-md:py-8 md:py-12 lg:py-16">
        {/* 타이틀 */}
        <div className="flex flex-col gap-2">
          <span className="text-body-14-sb text-[var(--color-primary)]">간식 스토어</span>
          <h1 className="max-md:text-title-24-b md:text-title-32-b text-[var(--color-text-emphasis)]">
            꼬순박스 속 그 간식, 낱개로 만나보세요
          </h1>
          <p className="max-md:text-body-14-r md:text-body-16-r text-[var(--color-text-secondary)]">
            구독 박스에 담기는 수제간식을 필요한 만큼만 구매할 수 있어요.
            {" "}
            {formatKrwPrice(SHOP_FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료배송.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mt-6 flex flex-wrap gap-2 max-md:mb-6 md:mb-8" role="group" aria-label="카테고리 필터">
          {SHOP_CATEGORIES.map((c) => {
            const isActive = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={isActive}
                className={[
                  "h-9 rounded-full px-4 text-body-14-sb transition-colors",
                  isActive
                    ? "bg-[var(--color-btn-dark-warm)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-text-body-warm)] hover:border-[var(--color-btn-dark-warm)]",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/order?productId=${product.id}`}
              className="group flex flex-col"
            >
              <div
                className="relative aspect-square w-full overflow-hidden rounded-[20px]"
                style={{ boxShadow: "var(--shadow-card-soft)" }}
              >
                <ShopProductArt glyph={product.glyph} colorVar={product.colorVar} />
                {product.badge ? (
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-body-13-sb text-white"
                    style={{ background: product.colorVar }}
                  >
                    {product.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-subtitle-16-sb md:text-subtitle-18-sb text-[var(--color-text-emphasis)] group-hover:text-[var(--color-primary)] transition-colors">
                    {product.name}
                  </span>
                  <span className="shrink-0 text-caption-12-r text-[var(--color-text-secondary)]">
                    {product.weight}
                  </span>
                </div>
                <span className="line-clamp-2 text-body-13-r md:text-body-14-r text-[var(--color-text-secondary)]">
                  {product.description}
                </span>
                <span className="mt-1 text-price-16-eb md:text-price-20-eb-lh24 text-[var(--color-text-emphasis)]">
                  {formatKrwPrice(product.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
