"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductCategoryDto } from "@/features/product/api/types";
import { ChevronIcon } from "@/shared/ui";

interface Props {
  categories: ProductCategoryDto[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}

const CHIP = "flex shrink-0 items-center justify-center rounded-full border font-semibold transition-colors max-md:h-8 max-md:text-[12px] max-md:leading-[14px] md:h-10 md:text-[14px] md:leading-[17px]";

/**
 * 단품몰 카테고리 칩 — 기본은 한 줄만 보여주고, 넘치면 끝에 접기/펼치기 버튼을 둔다.
 * 접힌 상태에서 잘린 칩은 invisible로 숨겨 키보드 포커스·스크린리더에서도 빠지게 한다.
 */
export default function CategoryChips({ categories, selectedCategoryId, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  // 첫 줄에 들어가는 칩 개수 — 전부 들어가면 접기 버튼이 필요 없다
  const [firstRowCount, setFirstRowCount] = useState<number | null>(null);
  const chips = [{ id: null, name: "전체" }, ...categories];
  const overflowing = firstRowCount !== null && firstRowCount < chips.length;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const items = Array.from(list.children) as HTMLElement[];
      const firstTop = items[0]?.offsetTop ?? 0;
      setFirstRowCount(items.filter((item) => item.offsetTop === firstTop).length);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    // ResizeObserver는 백그라운드 탭에서 첫 콜백이 미뤄지므로 최초 측정을 한 번 더 예약한다.
    const timer = window.setTimeout(measure, 0);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [categories]);

  return (
    <div className="flex min-w-0 flex-1 items-start max-md:gap-2 md:gap-3">
      <div
        ref={listRef}
        id="product-category-chips"
        role="group"
        aria-label="상품 카테고리"
        className={`flex min-w-0 flex-1 flex-wrap max-md:gap-2 md:gap-3 ${expanded ? "" : "overflow-hidden max-md:h-8 md:h-10"}`}
      >
        {chips.map((chip, index) => {
          const active = selectedCategoryId === chip.id;
          const clipped = !expanded && firstRowCount !== null && index >= firstRowCount;
          return (
            <button
              key={chip.id ?? "all"}
              type="button"
              onClick={() => onSelect(chip.id)}
              aria-pressed={active}
              className={`${CHIP} max-md:px-3 md:px-5 ${clipped ? "invisible" : ""} ${active ? "border-[var(--color-text)] bg-[var(--color-text)] text-white" : "border-[var(--color-text-muted)] text-[var(--color-text)] hover:border-[var(--color-text)]"}`}
            >
              {chip.name}
            </button>
          );
        })}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="product-category-chips"
          aria-label={expanded ? "카테고리 접기" : "카테고리 더보기"}
          className={`${CHIP} border-[var(--color-text-muted)] hover:border-[var(--color-text)] max-md:w-8 md:w-10`}
        >
          <ChevronIcon open={expanded} size={20} />
        </button>
      )}
    </div>
  );
}
