import type { PackageTier } from "./packageData";

/** 구독 선택 시안의 간식 분류별 비교. 가격과 평점은 이 표에 보관하지 않는다. */
export const PACKAGE_COMPARISON_ROWS: ReadonlyArray<{
  label: string;
  contents: Record<PackageTier, string | null>;
}> = [
  { label: "식사형 화식", contents: { Basic: null, Standard: null, Premium: "소고기 + 가자미 화식 2종" } },
  { label: "크런치·육포 간식", contents: { Basic: null, Standard: "오트콕크런칩", Premium: "오트콕크런칩" } },
  { label: "유산균 간식", contents: { Basic: "요거트볼 1종", Standard: "요거트볼 1종", Premium: "요거트볼 2종" } },
  { label: "씹는 간식", contents: { Basic: "삼색우유껌", Standard: "꼬미칩 + 삼색우유껌", Premium: null } },
  { label: "부드러운 간식", contents: { Basic: "츄르 1종", Standard: null, Premium: null } },
];
