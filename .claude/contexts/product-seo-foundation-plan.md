# 상품 SEO 기반 구축 계획

> 상태: API·디자인 확정 전 범위 구현 및 로컬 검증 완료
> 범위: API·단품 상세 디자인 확정 전에 안전하게 적용 가능한 라우팅 및 SEO 기반

## 결정된 URL 책임

| URL | 역할 | 색인 정책 |
|---|---|---|
| `/products` | 전체 상품 카탈로그의 대표 URL | index, self-canonical |
| `/products/[slug]` | 상품별 대표 문서 및 Product 구조화 데이터 기준 | index, self-canonical |
| `/purchase` | 기존 단품몰 호환 진입점 | noindex, canonical `/products` |
| `/purchase/detail?tier=...` | 기존 단품 구매 상세 호환 경로 | 기존 noindex 유지 |
| `/subscribe` | 정기구독 서비스와 플랜 비교 | 기존 정책 유지 |
| 주문·결제 경로 | 트랜잭션 전용 | noindex 유지 |

## Phase 1 — 현행 감사 및 경계 설정

- 현재 단품 API는 `id`, `name`, `price`, `description`, `imageUrl`, `relatedPlanId`, `isSalesPaused`만 제공한다.
- API에는 안정적인 slug와 개별 간식의 카테고리·원재료·중량·보관법 등이 아직 없다.
- 이번 범위에서는 박스 3종만 대표 상품 URL을 부여한다.
- 개별 간식 상세 UI, 카테고리 SEO URL, 구독 Offer 모델은 API·디자인 확정 후로 보류한다.

## Phase 2 — 고정 slug 및 API 식별자 분리

- Basic: `kkosun-box-basic`
- Standard: `kkosun-box-standard`
- Premium: `kkosun-box-premium`
- slug는 프런트 카탈로그 계약이며 API `product.id`와 별도로 관리한다.
- 상품명이 바뀌어도 기존 slug는 유지하고, slug 변경이 필요하면 이전 URL의 리다이렉트를 별도 설계한다.

## Phase 3 — 대표 상품 라우팅

- `/products`는 기존 박스 목록 UI를 재사용한다.
- 상품 카드는 crawl 가능한 일반 링크로 `/products/[slug]`를 가리킨다.
- `/products/[slug]`는 기존 단품 상세 UI를 재사용하며 잘못된 slug는 `notFound()`로 처리한다.
- 기존 `/purchase`와 query-string 상세는 삭제하거나 영구 리다이렉트하지 않는다.

## Phase 4 — SEO 인터페이스와 sitemap

- `/products/[slug]`에 고유 metadata, self-canonical, Product/Offer 및 BreadcrumbList JSON-LD를 제공한다.
- API 상품이 확인되지 않으면 가격·재고 Offer를 만들지 않는다.
- 가격과 판매 상태는 API 값을 사용하며 화면과 구조화 데이터가 같은 소스를 공유한다.
- 정적 `public/sitemap.xml`을 Next.js `app/sitemap.ts`로 전환하고 대표 상품 URL을 포함한다.

## 후속 Phase — API·디자인 확정 후

- 개별 간식 slug를 백엔드 또는 관리 데이터의 안정적인 필드로 제공
- 개별 간식 상세 페이지와 상품별 고유 정보 연결
- 카테고리가 충분한 상품·독립 목적을 가질 때만 카테고리 URL 색인 검토
- 박스의 단품 구매와 구독 가격을 구조화 데이터에서 어떻게 모델링할지 확정
- 기존 `/purchase` 경로의 영구 리다이렉트 여부 결정
- Search Console에서 색인과 실제 검색 쿼리를 관찰한 뒤 카테고리·콘텐츠 SEO 결정

## 완료 검증

- [x] TypeScript 타입 검사 (`tsc --noEmit --incremental false`)
- [x] 전체 ESLint 검사 (`pnpm lint`)
- [x] 세 개의 고정 slug가 목록 링크와 sitemap에 모두 존재함을 확인
- [x] 세 상품 URL이 200, 잘못된 slug가 404임을 로컬 dev 서버에서 확인
- [x] 상품 상세의 self-canonical, Product/Offer, BreadcrumbList를 초기 HTML에서 확인
- [x] 기존 `/purchase`와 query 상세가 noindex이며 새 대표 URL을 canonical로 가리킴을 확인
- [x] localhost의 전역 `noindex, nofollow` 보호가 새 라우트에도 적용됨을 확인
- 프로덕션 배포 후 Rich Results Test와 Search Console URL 검사
