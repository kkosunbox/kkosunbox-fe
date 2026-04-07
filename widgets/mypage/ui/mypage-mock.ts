export const PET = {
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

export const SUBSCRIPTION = {
  tier: "프리미엄",
  name: "프리미엄 패키지 구독중",
  startDate: "2026.01.21",
  billingDay: "매달 21일",
};

export const PAYMENT = {
  method: "신용카드 결제",
  card: "국민카드 (1234 - **** - **** - ****)",
  nextDate: "2026.04.21 (카드결제)",
};

export const DELIVERY_STEPS = [
  { label: "주문접수", count: 1 },
  { label: "배송준비중", count: 0 },
  { label: "배송중", count: 0 },
  { label: "배송완료", count: 0 },
];

export const INQUIRIES = [
  { id: 1, text: "제품 문의드립니다.", date: "26.03.14", status: "처리중" },
  { id: 2, text: "배송 언제쯤 도착하나요?", date: "26.03.12", status: "처리완료" },
  { id: 3, text: "아이가 먹어도 안전한가요?", date: "26.03.12", status: "처리완료" },
];

export const INQUIRY_TOTAL_PAGES = 5;
