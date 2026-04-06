export type PackageTier = "Basic" | "Standard" | "Premium";

export interface PackageData {
  tier: PackageTier;
  id: "basic" | "standard" | "premium";
  colorVar: string;
  tabActiveBg: string;
  name: string;
  items: readonly string[];
  price: string;
  quote: string;
  contents: readonly string[];
  special: string;
  customization: string;
  hearts: number;
}

export const PACKAGES: PackageData[] = [
  {
    tier: "Basic",
    id: "basic",
    colorVar: "var(--color-basic)",
    tabActiveBg: "rgba(63, 105, 0, 0.2)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
    quote: "수제 간식이 처음이에요!",
    contents: ["건조 간식 2종", "자연 화식 1종"],
    special: "휴먼그레이드 제철 식재료",
    customization: "알러지 식재료 제외",
    hearts: 3,
  },
  {
    tier: "Standard",
    id: "standard",
    colorVar: "var(--color-plus)",
    tabActiveBg: "rgba(62, 158, 217, 0.2)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
    quote: "매달 알찬 간식 선물을 원해요",
    contents: ["건조 간식 3종", "자연 화식 1종", "베이커리(머핀/타르트) 1종"],
    special: "휴먼그레이드 + 슈퍼푸드 추가",
    customization: "알러지 제외 + 기호성 반영",
    hearts: 4,
  },
  {
    tier: "Premium",
    id: "premium",
    colorVar: "var(--color-accent-orange)",
    tabActiveBg: "rgba(238, 104, 26, 0.2)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
    quote: "고급 식단과 맞춤 관리가 필요해요",
    contents: ["건조 간식 3종", "자연 화식 2종", "프리미엄 특식(테린/황태 등) 2종"],
    special: "휴먼그레이드 + 최상급 단백질원",
    customization: "생애주기/건강 고민 맞춤 설계",
    hearts: 5,
  },
];

const COMPARE_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];
export const COMPARE_PACKAGES = COMPARE_ORDER.map(
  (t) => PACKAGES.find((p) => p.tier === t)!
);
