export const PET = {
  hasProfile: false,   // false = 펫 정보 미입력
  hasChecklist: false, // false = 체크리스트 미작성
  name: "몽몽이",
  birth: "2020.10.27",
  gender: "여자",
  weight: "8kg",
  bio: "부드러운 간식을 좋아해요.",
  attributes: [
    { label: "알러지 유무", value: "닭고기 알러지" },
    { label: "필요 건강 상태", value: "피모 관리" },
    { label: "선호하는 간식", value: "건조간식" },
    { label: "선호하는 제형", value: "천연 껌/뼈" },
  ],
};

// null = 구독 없음
export const SUBSCRIPTION: {
  tier: string;
  name: string;
  startDate: string;
  billingDay: string;
} | null = null;

export const PAYMENT = {
  hasMethod: false, // false = 결제수단 미등록
  method: "신용카드 결제",
  card: "국민카드 (1234 - **** - **** - ****)",
  nextDate: "2026.04.21 (카드결제)",
};

export const DELIVERY_STEPS = [
  { label: "주문접수", count: 0 },
  { label: "배송준비중", count: 0 },
  { label: "배송중", count: 0 },
  { label: "배송완료", count: 0 },
];

export const INQUIRIES: { id: number; text: string; date: string; status: string }[] = [];

export const INQUIRY_TOTAL_PAGES = 1;
