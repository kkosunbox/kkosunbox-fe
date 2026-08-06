# 태스크: 2026-08-03 회의록 — 사양 확정 대기 항목

## 목적
2026-08-03 회의록에서 나온 요청 중, 코드로 바로 구현 가능한 항목(구매 카드 배경색, 리뷰 버튼 등)은
이미 처리했거나 다른 세션 WIP로 진행 중이다. 이 파일은 **기획/디자인 확정값이 나와야 착수 가능한
나머지 항목**만 모은 것이다. 다른 세션이 이 파일만 읽고 "지금 뭘 기다리고 있는지"를 코드를 다시
뒤지지 않고 파악하게 하는 게 목적.

이미 처리된 항목(이 파일에 포함 안 함):
- referral/me 비로그인 호출 버그 — 완료
- 마이페이지 구독카드 리뷰쓰러가기 비활성 노출 — 다른 세션 WIP로 구현 완료, 커밋 대기 (`widgets/mypage/ui/SubscriptionCard.tsx`)
- `/mypage` 단건구매 카드 배경색 패키지별 분기 — 이번 세션에서 구현 완료, tsc/eslint 통과
- 단건 구매 상세 → 구독 전환 CTA (구 "항목 2") — 디자인 확정(Figma Rectangle 975) 받고 구현 완료.
  `widgets/mypage/ui/PurchaseDetailSection.tsx`의 `SubscribePromoBanner`, `relatedPlanId` 기반
  `/order?planId=` 라우팅, `--color-subscribe-promo-bg` 토큰 추가로 반영됨.

---

## 항목 1 — 구매 완료 페이지 부재

### 확인된 현재 코드 상태
구독·단건구매 둘 다 결제 성공 후 **완료 페이지 없이 마이페이지로 즉시 리다이렉트**된다.

- 구독: `widgets/order/ui/order-section/useOrderSectionState.ts`의 `proceedSubscription()` (123–177행) 중
  169–170행에서 `router.refresh()` 후 `router.replace("/mypage/subscription?welcome=1")`로 바로 이동.
  완료 화면이나 요약 없이 `welcome=1` 쿼리만 붙는다.
- 단건구매: `app/(main)/purchase/order/success/page.tsx` (전체 47행)가 Toss 결제 콜백을 받아
  `confirmProductOrderServer()` 호출 후 34–46행에서 성공 시 `/mypage/purchase?productId=${order.productId}`,
  실패 시 `/purchase?confirmError=...`로 즉시 `redirect()`. 파일 18행 주석에 "결과를 별도 페이지로 보여주지
  않고 바로 처리 후 리다이렉트한다"고 의도적으로 문서화돼 있음 — 우발적 누락이 아니라 설계된 동작.

### 필요한 입력값 (기획/디자인 확정 사항)
- 완료 페이지에 무엇을 보여줄지: 주문 요약(상품/금액)? 다음 액션 유도(배송지 확인, 리뷰 예고 등)?
- 구독/단건구매 완료 화면을 하나로 통일할지, 각각 다르게 갈지
- `welcome=1` 쿼리 기반의 기존 마이페이지 웰컴 처리(있다면)를 유지할지, 완료 페이지로 대체할지

### 확정되면 손댈 곳
- 구독: `useOrderSectionState.ts:170`의 `router.replace` 대상 경로를 새 완료 페이지로 변경
- 단건구매: `app/(main)/purchase/order/success/page.tsx:40`의 `redirectTo` 값을 새 완료 페이지로 변경
- 신규 라우트 추가 (예: `app/(main)/order/complete/page.tsx` 등, 확정된 경로는 기획 나온 뒤 결정)

---

## 항목 2 — 단건 구매 상세 → 구독 전환 CTA 부재 (완료 — 위 "이미 처리된 항목" 참고)

### 확인된 현재 코드 상태
`widgets/mypage/ui/PurchaseDetailSection.tsx` (전체 451행) 확인 결과, 히어로 카드 영역(351–396행)에는
`ReviewButton`(244–265행 정의, 389·394행에서 렌더)만 있고 구독 유도 버튼은 없음. `import`문에도
구독 관련(`useRouter`, subscribe 경로 등) 흔적 없음 — 순수하게 구매내역 조회·환불·리뷰 기능만 구현된 상태.

### 필요한 입력값 (기획/디자인 확정 사항)
- CTA 문구, 배치 위치(히어로 카드 옆? 하단 별도 배너?)
- 클릭 시 어느 플랜으로 유도할지 — 현재 구매한 상품의 `relatedPlanId`(197행에서 이미 계산됨:
  `product?.relatedPlanId`)로 자동 매칭할지, 아니면 `/subscribe` 목록으로 보낼지

### 확정되면 손댈 곳
- `PurchaseDetailSection.tsx`의 히어로 카드 섹션(374–390행 부근)에 CTA 추가
- `relatedPlanId`는 이미 197행에 계산돼 있어 그대로 재사용 가능 (`/order?planId=${relatedPlanId}` 형태로
  연결 가능해 보이나, 확정 전까지 임의 구현 금지)

---

## 항목 3 — "이미 구매한 유저가 구독하기 누르면 옵션 선택해서 적용" 재현 불가

### 확인된 현재 코드 상태
`widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx`의 구독하기 버튼(모바일 283행, 데스크탑 495행)은
**이미** `onClick={() => router.push(\`/order?planId=${selectedPlan.id}&quantity=${quantity}\`)}` 형태로,
사용자가 화면에서 고른 `selectedPlan`(73행)·`quantity`(74행)를 그대로 쿼리로 넘겨 `/order`로 이동한다.
즉 지금 구조 자체가 "옵션 선택 후 적용"이다. 파일 전체에서 `hasSubscription`, `이미`, `already` 등
재구매/기존 구매자 분기 로직은 검색되지 않음 — "이미 구매한 경우"를 구분하는 코드 자체가 없다.

### 필요한 입력값
- 회의록 문장이 가리키는 정확한 화면과 재현 스텝(어느 페이지에서 "구독하기"를 눌렀을 때 옵션이
  적용되지 않는지) — 스크린샷 또는 클릭 순서 필요
- "이미 구매"가 단건구매 이력을 말하는지, 이전 구독 이력을 말하는지, 현재 활성 구독 중을 말하는지 구분 필요

### 결론
현재 코드로는 어떤 버그/누락을 가리키는지 특정 불가. **재현 정보 없이 추측 구현 금지** — PM에게
구체적 재현 스텝 요청 후 착수.

---

## 항목 4 — 로그인/회원가입 탭 통합 리디자인

### 확인된 현재 코드 상태
`app/login/page.tsx` + `app/login/layout.tsx`, `app/register/page.tsx` + `app/register/layout.tsx`로
완전히 분리된 두 라우트. 탭 전환 구조나 공유 레이아웃 없음.

### 필요한 입력값 (디자인/기획 확정 사항)
- 탭 UI 시안 (디자인팀)
- 라우팅 방식: 하나의 경로(`/login`)에서 쿼리·상태로 탭 전환할지, 여전히 `/login`·`/register` 두 경로를
  유지하되 공유 레이아웃 안에 탭 UI만 얹을지

### 확정되면 손댈 곳
디자인 시안·라우팅 방식이 나온 뒤 `app/login/`, `app/register/` 구조를 어떻게 통합할지 결정 —
현재는 착수 대상 아님.

---

## 참고 — 단품 가격 (착수는 가능, 숫자만 대기)

`entities/package/lib/packagePurchaseProducts.ts` (25행)의 `PACKAGE_PURCHASE_PRODUCTS` 배열에
Basic 19900 / Standard 23900 / Premium 27500이 더미 가격으로 하드코딩돼 있음 (14–16행, 파일 주석에도
"실제 상품 API 연동 시 이 배열을 서버 응답으로 교체한다"고 명시된 임시값). 회의록의 "비율 맞춰서
재공유 예정" 숫자가 나오면 이 배열 값만 갱신하면 된다 — 별도 설계 불필요, 숫자만 기다리는 상태.

(참고: 구독가 17,900/22,900/28,900은 프론트 하드코딩이 없고 `SubscriptionPlanDto.monthlyPrice`로
백엔드가 내려주는 값이라 백엔드 반영만으로 자동 적용됨 — 이 파일의 대상 아님.)

---

## 검증
이 파일 자체는 구현 태스크가 아니라 대기 목록이므로 빌드/린트 검증 대상 없음.
각 항목 착수 시 해당 변경 파일 기준으로 `pnpm build` / `pnpm lint` 통과 확인.
