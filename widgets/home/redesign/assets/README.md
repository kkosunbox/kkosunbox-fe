# 메인 리디자인 에셋

dev용 신규 메인 구현을 위한 준비 에셋이다. 현재 페이지에는 연결하지 않았다. 원본 형식·해상도·바이트를 보존했으며 다운로드 원본도 유지했다.

[리디자인 계획](../../../../.claude/contexts/home-redesign-dev-plan-2026-09-21.md) · [원본 대응 및 SHA-256](../../../../.claude/contexts/assets/home-redesign-2026-09-21/asset-manifest.json)

## 네이밍 및 사용

섹션 순번 대신 화면 역할·콘텐츠를 나타내는 kebab-case를 사용한다. 순서가 의미를 갖는 구독 단계에만 01~04를 유지한다. 상품 이름은 시안 기준이며 실제 SKU 매핑은 구현 시 확인한다. 파일을 public URL로 직접 지정하지 말고 구현 시 이 슬라이스에서 정적 import하는 방식을 우선 검토한다.

| 원본 파일명 | 새 파일 링크 | 원본 크기 |
| --- | --- | --- |
| main-section-2-image.png | [brand-story-package.png](brand-story-package.png) | 1172 x 1208 |
| main-section-3-image.png | [subscription-dog-treat.png](subscription-dog-treat.png) | 910 x 908 |
| main-section-3-svg-step-01.svg | [subscription-step-01-profile.svg](subscription-step-01-profile.svg) | 63 x 63 |
| main-section-3-svg-step-02.svg | [subscription-step-02-plan.svg](subscription-step-02-plan.svg) | 62 x 62 |
| main-section-3-svg-step-03.svg | [subscription-step-03-payment-date.svg](subscription-step-03-payment-date.svg) | 72 x 66 |
| main-section-3-svg-step-04.svg | [subscription-step-04-delivery.svg](subscription-step-04-delivery.svg) | 91 x 55 |
| main-section-4-image-left.png | [review-dog-bowl.png](review-dog-bowl.png) | 328 x 382 |
| main-section-4-image-right.png | [review-dog-products.png](review-dog-products.png) | 422 x 422 |
| main-section-5-image-background.png | [package-showcase-background.png](package-showcase-background.png) | 3840 x 1460 |
| 사용자 제공 베이직 패키지 배경 | [package-showcase-background-basic.png](package-showcase-background-basic.png) | 3840 x 1460 |
| 사용자 제공 프리미엄 패키지 배경 | [package-showcase-background-premium.png](package-showcase-background-premium.png) | 3840 x 1460 |
| main-section-5-image-asset-01.png | [product-salmon-yogurt-ball.png](product-salmon-yogurt-ball.png) | 290 x 270 |
| main-section-5-image-asset-02.png | [product-kkomi-chips.png](product-kkomi-chips.png) | 290 x 270 |
| main-section-5-image-asset-03.png | [product-beef-meal.png](product-beef-meal.png) | 290 x 270 |
| main-section-5-image-asset-04.png | [product-duck-yogurt-ball.png](product-duck-yogurt-ball.png) | 290 x 270 |

## 주의할 표현

- brand-story-package.png에는 하단 그라디언트와 한글 문구가 포함되어 있다. 텍스트를 겹쳐 출력하지 않는다.
- package-showcase-background.png는 패키지 소개용 배경이다. 원본 section-5-image-asset-01~04는 별도의 단품 상품 영역에 사용한다.
- review-dog-bowl.png와 review-dog-products.png는 구매평 영역 상단 사진이며 개별 후기 프로필 사진이 아니다.
- SVG는 고유 비율과 색상을 보존한다. 동일 정사각형으로 늘리지 않는다.
- 290 × 270 상품 이미지를 크게 확대하지 않는다. 고해상도 대응과 압축은 후속 구현에서 결정한다.
- 시안 전체 이미지는 참고 문서 폴더에 보관하며 UI용 이미지로 사용하지 않는다.

## 2026-09-21 Figma 직접 대조 수정

- 기준 노드: `quOeNStz2JtI3Pn77ebVJN / 5526:5772`.
- `review-star.svg`, `chevron-down.svg`, `product-arrow.svg`, `delivery-truck.svg`: Figma MCP의 원본 SVG 다운로드.
- `package-basic.png`, `package-standard.png`, `package-premium.png`: Figma MCP 원본 래스터 이미지. 베이직 녹색, 스탠다드 파랑, 프리미엄 주황 매핑.
- `package-showcase-background-basic.png`, `package-showcase-background.png`, `package-showcase-background-premium.png`: Section 5 카드 선택에 따라 전환되는 베이직·스탠다드·프리미엄 배경.
- `product-banner-coupon.png`: 기존 `widgets/purchase/assets/purchase-banner-coupon.png` 원본 복사.
- `review-profile-01~04.webp`: 기존 공개 후기 프로필 원본 복사. 상단 강아지 사진과 구분한다.
- 준비 에셋은 현재 dev 전용 메인에 연결되어 있다. 단품 사진은 API 상품명이 해당 상품과 일치할 때만 사용한다.
