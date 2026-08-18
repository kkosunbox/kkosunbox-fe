# 레퍼럴·쿠폰 가격 구조 — 현재 상태와 다음 단계

작성일: 2026-08-12 / 커밋: `0f106b0`(1차 통합), 후속 커밋에서 반올림 규칙 정정
최종 갱신: 2026-08-12 (백엔드 API 실측 + 요구사항 확정 반영)

상태: **1차 목표(Single Source of Truth) 달성. 단, 통일 방향이 요구사항과 반대였음(§2).**
다음 작업은 "책임 분리"가 아니라 **마케팅 계층 / 결제 계층 분리** — 계획은 §2, 근거는 §0-1.

읽는 순서: §0-1(백엔드 계약 실측) → §2(확정 요구사항·경위) → §3(실측 기록)

---

## 0. 백엔드 실제 계산 규칙 (권위 — 프론트는 여기에 맞춘다)

2026-08-12 확인. **프론트 표시값은 이 식과 원 단위까지 같아야 한다.**

| 항목 | 방식 |
|---|---|
| 쿠폰 (정률) | `floor(단가 × 할인율 / 100)` |
| 쿠폰 (정액) | `floor(할인금액)` (단가 무관, 단가 초과분은 잘림) |
| **초대코드** | **`floor(단가 × 레퍼럴 할인율)`** |
| 기준가 | 쿠폰·초대코드 **둘 다 원가 단가(`plan.monthlyPrice`) 기준** |
| 적용 수량 | **둘 다 1개분만.** 수량 > 1이면 나머지는 정가 |
| 하한 | 0원 |

```
단가 33,000 / 수량 1
  쿠폰 20%   → floor(33,000 × 0.2) = 6,600
  초대코드 10% → floor(33,000 × 0.1) = 3,300
  최종 = 33,000 − 6,600 − 3,300 = 23,100
```

**중요 — 쿠폰은 레퍼럴 할인가에 다시 붙지 않는다.** 26,400원의 10%가 아니라
둘 다 원가 33,000원에서 각각 계산해 합산한다.

**시점**

| 시점 | 쿠폰 | 초대코드 |
|---|---|---|
| 최초 구독 생성 | 적용 | 적용 (첫 구독만) |
| 월 갱신 | 남은 `applyCount`만큼 재적용 | **미적용** |
| 예약 구독 시작 | 생성 시 잠긴 금액 그대로 | 동일 |

→ 초대코드는 최초 1회뿐이다. 오늘 `lastPaidAmount` 라벨에서 "예상"을 뺀 근거와 같은 사실.

---

## 0-1. 백엔드 API 계약 — 실측 (2026-08-12)

스펙 원본: `https://api-dev.kkosunbox.com/documentation-json` (Scalar, `/docs`에서 렌더).
프론트 `features/referral/api/types.ts` 3종은 `components.schemas`와 필드·required까지 **일치한다**.
`shared/lib/api/errorMessages.ts`에 `REFERRAL_*` 5종 매핑도 되어 있다. 타입 레이어는 최신이다.

### 적격 판정은 백엔드가 이미 전부 소유한다

`GET /v1/referral/validate` (**bearer 필수**)의 400 사유:

```
REFERRAL_CODE_INVALID          REFERRAL_SELF_REFERRAL
REFERRAL_NOT_INFLUENCER        REFERRAL_CONTRACT_EXPIRED
REFERRAL_NOT_FIRST_SUBSCRIPTION   ← 첫 구독 여부를 백엔드가 판정
```

→ 프론트 `probeSubscriptionHistory`는 마지막 항목의 **중복 구현**이다(데이터 소스도 다름:
`/v1/subscriptions` 배열 길이 vs 백엔드 자체 규칙). "단일 진실 공급원"의 실제 주인은 백엔드다.

`ReferralPageResponse.isActive` 설명 = *"현재 초대 코드 사용 가능 여부 (인플루언서·계약 상태 기준)"* —
즉 slug 경로의 `isActive` 체크가 `NOT_INFLUENCER`·`CONTRACT_EXPIRED`를 이미 커버한다.
slug 경로에서 검증되지 않는 사유는 **`SELF_REFERRAL` 하나뿐**이고, 그게 하필
`detectOwnSlug()`(인플루언서 본인) 경로와 정확히 겹친다.

### 토큰 없이는 validate를 부를 수 없다

```
GET /v1/referral/validate?code=... (토큰 없음) → 401 MISSING_AUTHENTICATION_TOKEN
```

비로그인 방문자의 적격 여부는 **프론트에서 확인할 방법이 없다.**

### 부적격 코드는 거절이 아니라 무시된다

`POST /v1/subscriptions`의 에러 코드에 `REFERRAL_*`가 **하나도 없다**
(400은 `INVALID_BILLING_KEY`·`BAD_REQUEST`·`INVALID_COUPON`·`COUPON_EXPIRED`뿐).
부적격 `referralCode`를 보내면 백엔드는 조용히 무시하고 정가를 청구한다.

→ **잘못 보여준 할인가는 에러 없이 그대로 추가 청구가 된다.** 청구로 이어지는 화면에서
낙관적 표시를 금지하는 근거가 이것이다.

### 요율 소스의 비대칭 (미해결 구멍)

| 진입 | 요율 출처 | 부적격일 때 |
|---|---|---|
| `/r/{slug}` · slug 쿠키 | `page.discountRate` | **정상 유지** |
| `?r=CODE` (`proxy.ts:36`) | `validation.discountRate` | 400 → **요율 0** |

`?r=CODE`는 코드 쿠키만 심고 slug 쿠키가 없어(`ReferralProvider`는 slug를 알 때만 심는다)
항상 validate 경로를 탄다. 부적격이면 보여줄 요율 자체가 사라진다.
백엔드에 **부적격이어도 200에 요율 포함** 또는 **코드→요율 공개 조회**를 요청해야 막힌다.

---

## 1. 지금 구조 (1차 완료분)

```
plan.monthlyPrice (원가)
   │
   ├─ referralPricing.ts ──→ 표시 단가 (/subscribe, /r, /subscribe/detail, /order 공통)
   │      referralDiscountAmount = floor(단가 × 요율)
   │      referralUnitPrice      = 단가 − 위 금액
   │
   └─ /order 에서만
          computeOrderPricing({ unitPrice, quantity, couponDiscount, inviteDiscount })
          쿠폰 금액은 resolveSubscriptionCouponDiscount()가 원가 기준으로 산출
```

**서버가 확정 / 프론트가 유도**를 분리했다.
- 서버: `features/referral/lib/resolveReferralContext.ts` — 초대코드·slug·할인율·적격 여부.
  요청당 `cache()` 1회. `(main) layout`에서 호출해 트리 전체에 내려준다.
- 프론트: `features/referral/lib/referralPricing.ts` — 위 값으로 표시 단가만 유도.
  `useReferralPricing().unitPrice(p)`가 적격 분기까지 흡수한다.
  **호출부에서 `inviteEligible ? … : …`로 다시 분기하지 말 것** — 그 분기가 화면마다 흩어져 있다가
  한 곳이 빠진 것이 이번 사고였다.

**fail-closed**: `probeSubscriptionHistory()`는 실패를 `[]`가 아니라 `null`(판정 불가)로 돌려주고,
판정 불가는 부적격으로 처리한다.

**성능 가드**: `(main) layout`은 모든 페이지에서 돈다. 초대 맥락(쿠키/랜딩/인플루언서)이 없으면
**즉시 반환**해 조회하지 않는다. 무조건 조회하게 했더니 이미지 많은 상세 페이지 시각회귀가 불안정해졌다.

---

## 2. 확정 요구사항 — 마케팅 계층 / 결제 계층 분리

**2026-08-12 사업 요구사항으로 확정됨. 이전 서술(단순 책임 분리)을 대체한다.**

```
마케팅 계층   /r/{slug} · /subscribe · /subscribe/detail · home
              → 초대 맥락이 심어져 있으면 (isReferral) 적격 판정과 무관하게 할인가 표시

결제 계층     /order · /mypage/subscription/change
              → 서버 판정(inviteEligible) 그대로. 부적격이면 정가 + 사유 안내
```

`/order`가 이미 부적격자에게 **"초대코드는 첫 구독 시에만 사용 가능합니다."**를 보여준다(§3 케이스 B 실측).
그 안내가 정직성을 담보하는 **경계**이므로, 그 앞단의 마케팅 화면은 낙관적으로 약속해도 된다.

### 1차 작업이 꼬였던 경위 — 반드시 기억할 것

원래 사고는 "같은 유저에게 `/r` 24,565원 / `/subscribe` 28,900원"이었다. 불일치를 없애는 방향이
둘이었는데 — 마케팅 화면을 **전부 할인가로** 통일하거나, **전부 정가로** 통일하거나 —
요구사항은 전자였고 1차 작업은 후자로 갔다. **불일치는 없앴지만 통일 방향이 반대였다.**

증상: 비로그인으로 `/r/test`를 열면 히어로는 "꼬순박스 15% 할인받기"·"이 페이지에서만 가능한 특별한 혜택!"을
약속하는데 플랜 카드는 `/subscribe`가 아무에게나 보여주는 28,900원을 그대로 보여줬다.

**왜 여태 안 걸렸나**: 플랜 자체 할인율도 15%(`/v1/subscriptions/plans` 실측: 3개 플랜 전부 `discountRate: 15`),
초대 할인율도 15%다. **서로 다른 두 개의 15%가 우연히 겹쳐** 화면이 자기모순 없이 보였다.
초대 요율이 10%였다면 첫날에 발견됐을 문제다.

### 계층 경계는 이미 파일 단위로 존재한다

`useReferralPricing()` 사용처는 **정확히 마케팅 계층 3곳뿐**이다
(`PlanPicker.tsx` · `ReferralPlanPicker.tsx` · `SubscribeProductDetailPage.tsx`).
`/order`는 이 훅을 쓰지 않고 `referralDiscountAmount()`를 직접 쓴다(`useOrderSectionState.ts:20`).

→ 구조는 이미 맞다. **틀린 것은 그 훅이 읽는 플래그 하나뿐이다.**

```
useReferralPricing → inviteEligible 을 읽음  ❌ 결제 계층 기준
                   → isReferral 을 읽어야 함  ✅ 마케팅 계층 기준
```

두 값 모두 `ReferralContext`에 이미 있다. 새 상태·추가 API 호출·3-state 모두 불필요하다.

### 예외 — `/mypage/subscription/change`는 실제 가격을 보여줘야 한다

`SubscriptionChangePlansSection.tsx:123`이 같은 `PlanPicker`를 쓰지만 **`/order`를 거치지 않는다.**
"변경하기"가 `changePlan()`을 직접 호출한다(`:52`) — **결제 경계 자체가 없는 흐름이다.**
여기 오는 사용자는 정의상 기존 구독자(부적격 확정)이므로, 초대 쿠키가 남아 있을 때
할인가를 보여주면 안내 없이 정가가 청구된다(§0-1 "부적격 코드는 무시된다" 참고).

→ **`intent`의 기본값은 `"actual"`.** 낙관적 표시는 명시적으로 켜는 것만 허용한다.
새 사용처가 실수로 할인을 약속하는 것을 구조적으로 막기 위함이다.

### 화면별 intent

| 화면 | intent |
|---|---|
| `/r/{slug}` (`ReferralPlanPicker`·`ReferralPackagePlansSection`) | promotional |
| `/subscribe` (`SubscribePlansSection`) | promotional |
| `/subscribe/detail` (`SubscribeProductDetailPage`) | promotional |
| home (`PackagePlansSection`) | promotional |
| **`/mypage/subscription/change`** | **actual** |
| `/order` | 훅 미사용 — **변경 없음** |

### 표시 술어 — `hasDisplayableReferralOffer`

**마케팅 화면이 읽는 값은 이것 하나뿐이다.** 훅 내부 한 곳에서만 계산한다.

```ts
hasDisplayableReferralOffer =
     referralSource !== "none"      // 초대 맥락이 성립함
  && referralSource !== "own-slug"  // 자동 자기감지는 초대가 아님
  && discountRate > 0               // 표시할 요율을 확보함
  && !inviteConsumed                // 같은 세션에서 방금 소비하지 않음
```

**`discountRate > 0`은 "서버 적격"도 "현재 적용 가능"도 뜻하지 않는다.** 오직 *표시할 할인율을
확보했다*는 뜻이다. code 경로에서는 validate 실패와 요율 미확보가 한 덩어리로 내려오기 때문에
(§0-1 요율 비대칭) 이 가드가 `?r=CODE` 미확보 케이스를 함께 막는다.

이 가드가 없으면 **`"첫 달 0%추가할인"` 칩이 렌더된다** — `ReferralAdditionalDiscountChip`은
`pct` 내부 가드가 없고, `PlanPicker.tsx:326`·`SubscribeProductDetailPage.tsx:195`가
표시 플래그만 보고 칩을 켜기 때문이다. (가격 자체는 `referralPricing.ts:48`이 `rate <= 0`을
막아 정가로 안전하다 — 파손 지점은 칩이다.)

### 초대 맥락의 출처 — `referralSource`

`resolveReferralContext.ts:36-38`이 이미 계산하지만 버리고 있는 분기에 이름을 준다.
네 갈래는 코드상 **이미 상호배타적**이다.

| 값 | 성립 조건 | 마케팅 프로모션 |
|---|---|---|
| `"slug"` | `/r/{slug}` 명시 진입 또는 slug 쿠키 | **표시** |
| `"code"` | `?r=CODE` (`proxy.ts:36`) | 표시 (단 요율 확보 시) |
| `"own-slug"` | 쿠키 없는 로그인 인플루언서의 `detectOwnSlug()` | **미표시** |
| `"none"` | 맥락 없음 / 조회 실패 / 비활성 slug | 미표시 |

불변조건: `isReferral === (referralSource !== "none")`.
(`isReferral`은 기존 사용처가 많아 유지한다. 장기적으로는 파생값으로 접을 수 있다.)

**`isSelfDetected`라고 부르지 않는다** — 백엔드가 판정하는 `REFERRAL_SELF_REFERRAL`과 혼동된다.
전자는 *컨텍스트 생성 경로*, 후자는 *계정 적격성 판정*으로 전혀 다른 층위다.

#### 제품 정책 — 자동 자기감지만 차단한다

> 로그인한 인플루언서라는 이유만으로 홈·구독 화면에 자신의 레퍼럴 프로모션을 자동 적용하지 않는다.
> 단 `/r/{slug}`로 **명시적으로 진입**한 경우에는 방문자용 랜딩을 그대로 표시하며,
> 실제 적용 가능 여부는 `/order`에서 판정한다.

`detectOwnSlug()`는 쿠키가 없어도 **매 요청 slug를 복원**하므로(`resolveReferralContext.ts:121`),
차단하지 않으면 인플루언서는 구독 완료 후 새로고침해도 사이트 전역에서 15%를 영구히 보게 된다.
현재는 `inviteEligible = firstSubscriptionEligible`(=false)이 우연히 막고 있으나,
마케팅 계층이 적격을 안 보게 되는 순간 그 방어가 사라진다.
`referral.spec.ts:236`(E)이 정확히 이 케이스를 검증하며, **F와 달리 E는 사양 변경이 아니라 리그레션이다.**

**주의 — 명시 진입은 랜딩에만 머무르지 않는다.** `/r` 방문 직후 `ReferralProvider.tsx:59`가
코드·slug 쿠키를 심으므로, 이후 홈·`/subscribe`에서도 `"slug"` 경로로 **7일간
(`INVITE_CODE_MAX_AGE_SEC`) 프로모션이 유지된다.** 인플루언서가 스스로 방문자로 진입한 결과이며
`/order`가 차단하므로 허용한다. 회사가 자기 랜딩조차 금지하기로 하면 `referralSource`만으로는
부족하고 `page.referralCode === 본인 코드` 같은 실제 소유 판정이 추가로 필요하다.

### 소비 후 수명주기 — 영속 제거는 쿠키가 담당한다

`/r/{slug}` 유입자가 첫 구독에 성공했을 때(`useOrderSectionState.ts:200-208`) 실제 상태 전이:

```
clearStoredInviteCode() / clearStoredInviteSlug()  → 쿠키 삭제 (Max-Age=0; path=/)
markInviteConsumed()                               → Provider 메모리 플래그
router.refresh() → router.replace(...)
```

| 상황 | 결과 | 담당 |
|---|---|---|
| 페이지 전환만 (하드 리로드 없음) | 즉시 제거 | `inviteConsumed` |
| 하드 리로드 — 일반 유저 | 제거 (쿠키 없음 → `"none"`) | **쿠키 삭제** |
| 하드 리로드 — 인플루언서 | 제거 (`"own-slug"` → 미표시) | **`referralSource`** |
| 로그아웃 후 재방문 | 제거 (초대 쿠키는 auth와 독립이나 이미 삭제됨) | 쿠키 삭제 |
| 나중에 `/r/{slug}` 재방문 | 재노출 — **의도된 재유입**, `/order`가 정가로 판정 | — |

**`inviteConsumed`는 영구 숨김 장치가 아니다.** 쿠키를 지운 사실이 이미 렌더된 React 트리에
반영되기까지의 **전이 구간 가드**다(`useOrderSectionState.ts:203` 주석 참고 — 쿠키가 사라지면
layout이 재계산을 스킵해 `router.refresh()`만으로는 값이 갱신되지 않는다).
영속 정책은 쿠키 수명(7일)이 표현한다. 이름을 유지하되 이 설명을 타입과 Provider 양쪽에 남긴다.

### 개별 재판정 금지

**가격 · 취소선 · 배지 퍼센트 · 추가할인 칩 · CTA 문구가 모두 같은 `hasDisplayableReferralOffer`를
읽어야 한다.** 하나라도 `isReferral`이나 `inviteEligible`을 직접 조합하면 같은 화면 안에서 상태가 갈린다.

특히 `ReferralPackagePlansSection.tsx:25`는 `useReferralPricing()`이 아니라 `useReferral()`을
직접 까서 `inviteEligible`을 쓰고 있다 — intent 스위치가 자동으로 덮지 못하므로 **별도 처리 대상**이다.

### 부수 효과 — 배지 퍼센트 불일치가 자동 해소된다

같은 비로그인 유저가 베이직 플랜에서 `/r`은 **14%**, `/subscribe`는 **15%** 배지를 봤다.

```
ReferralPlanPicker.tsx:448  combinedDiscountPct(plan) 무조건 → round(14.35) = 14
PlanPicker.tsx:46           부적격 → plan.discountRate      → 15
```

프리미엄(14.75)·스탠다드(14.87)는 양쪽 다 15로 반올림돼 베이직에서만 드러났다.
마케팅 화면이 promotional로 통일되면 세 곳 모두 `combinedDiscountPct`를 타므로 따로 고칠 것이 없다.

### 지켜야 할 선 (유지)

**레퍼럴 resolver가 주문 가격 resolver가 되면 안 된다.**
쿠폰은 `/order`에 들어와야만 알 수 있고, `/subscribe`는 쿠폰을 **몰라야 정상**이다.

```
Product Pricing   원가
   ↓
Referral Pricing  초대코드 적용 단가   ← 마케팅 계층과 /order 가 공유
   ↓
Order Pricing     + 쿠폰 → 최종 결제금액   ← /order 전용
```

### 미뤄둔 것 (이번 범위 아님)

- 가격 근거를 `/v1/referral/validate`로 이관하고 `probeSubscriptionHistory`를 **UI 노출 판단 전용**으로
  강등하는 작업. §0-1 기준으로는 그쪽이 정답이지만, 위 요구사항은 그것 없이도 해결된다.
- `resolveOrderReferralContext()`는 레퍼럴 모듈에 있으나 실제로는 주문서 UI 모드 판단용이다.
  근본 원인은 `firstSubscriptionEligible`(계정 사실)이 레퍼럴 컨텍스트에 들어 있다는 것.
- `getInviteSectionMode()`는 얇은 어댑터로 보이지만 `features/order`가 레퍼럴 타입을 모르게 하는
  **의도된 방벽**이다. 제거 대상이 아니다.

---

## 3. 확인 완료 / 미확인

### 실화면 실측 — **적격·부적격 양쪽 통과** (2026-08-12)

두 계정으로 확인했다. 프리미엄 정가 33,900 / 플랜가 28,900 / 초대 15%.

**A. 신규 계정(구독 이력 없음 → 적격)**

| 화면 | 표시 | 판정 |
|---|---|---|
| `/r/test` | 월 요금제 **24,565원** (28% 배지) | ✅ |
| `/subscribe` | 월 요금제 **24,565원** | ✅ |
| `/subscribe/detail?planId=3` | **24,565원** | ✅ |
| `/order?planId=3&quantity=1` | 28,900 − **4,335** = **24,565원** | ✅ **기준 충족** |
| `/order?planId=3&quantity=3` | 86,700 − **4,335** = 82,365원 | ✅ 1개분만 할인 |

할인액 4,335 = `floor(28,900 × 0.15)` — **백엔드 청구식과 동일**.

**B. 기존 계정(구독 18BOX 등 보유 → 부적격)**

| 화면 | 표시 |
|---|---|
| `/subscribe` | 28,900원, 초대 배지 없음 |
| `/order?planId=3&quantity=1` | 28,900원, "초대코드는 첫 구독 시에만 사용 가능합니다." |

**C. 쿠폰 (기존 계정, `/order` q=1)**

| 쿠폰 | 결과 |
|---|---|
| `spring30` 정액 10,000원 | 28,900 − **10,000** = **18,900원** ✅ 원가 기준·액수 그대로 |
| `welcome10` 정률 10% | "이미 사용한 쿠폰입니다." — 이 계정이 이미 소진(1인 1회) |

### D. 실결제 검증 — **모든 규칙 한 번에 통과** (2026-08-12, dev / Toss 테스트키)

신규 계정(카드·배송지 세팅, 구독 이력 없음)으로 **구독 #78**을 실제로 생성했다.
프리미엄 28,900 × **수량 3** + 정률 쿠폰 `welcome10`(10%) + 초대코드(15%).

```
주문상품금액 ×3   86,700원
총 할인금액      -7,225원   = 쿠폰 2,890 + 초대코드 4,335
총 결제금액      79,475원
```

- 쿠폰 2,890 = `floor(28,900 × 0.10)` → **원가 기준 · 1개분만** (수량 3인데 곱해지지 않음)
- 초대코드 4,335 = `floor(28,900 × 0.15)` → 동일
- 두 할인이 **각각 원가에서** 계산돼 합산됨 — 쿠폰 적용 후 잔액에 레퍼럴이 겹치지 않음

**표시액 == 청구액, 5개 지점 전부 79,475원으로 일치**

| 지점 | 값 |
|---|---|
| 주문서 총 주문금액 | 79,475원 |
| 서버 청구 (구독 상세 결제 이력) | **79,475원** |
| `/mypage/subscription` 목록 카드 | 79,475원 |
| `/mypage` 대시보드 카드 | 79,475원 |
| 목록 상단 "결제 금액" | 79,475원 |

→ 오늘 도입한 `lastPaidAmount` 표시가 **실데이터로 검증**됐다(QA 0-5-1·0-5-2·0-5-3 통과).

**초대코드 소비 확인**: 구독 완료 직후 `/subscribe`가 28,900원·배지 없음으로 되돌아왔다.
적격 → 부적격 전환이 즉시 반영된다.

### 미확인 — 다음에
- [ ] 시각회귀 잔여 불안정 — `home`·`subscribe-detail`이 간헐적으로
      "두 번 연속 안정된 스크린샷 실패". 갤러리 무한 스크롤에 `prefers-reduced-motion`을 넣어
      한 원인은 제거했으나 완전히 사라지진 않았다. 연속 2회 중 1회는 87/87.

### 남은 한계 — 프론트로는 못 막는 것

적격 판정은 `/v1/subscriptions`가 **빈 배열을 200으로** 돌려주면 "진짜 신규 사용자"와 구분할 수 없다.
`null`(에러) 분기로 막을 수 있는 건 **에러로 내려올 때뿐**이다.
서버가 장애 중에 조용히 빈 값을 주면 이력 있는 사용자에게도 첫 구독 할인가가 노출된다 —
프론트 레이어에서 더 할 수 있는 게 없고, 백엔드 신뢰성에 달린 문제다.

(오늘 오전 `/v1/subscriptions` 500은 실제 장애였고 백엔드가 대응했다. 오후에 목록이 비어 보인 것은
장애가 아니라 **사용자가 의도적으로 빈 계정으로 테스트 중**이었던 것 — 위 실측 A가 그 계정이다.)

### 표시 caveat (버그 아님, 백엔드 규칙대로)

수량 ≥ 2일 때 `/subscribe`의 "월 요금제 24,565원"은 **첫 1개에만** 해당한다.
주문서는 `정가 × 수량 − 1개분 할인`으로 계산한다(위 q=3 실측). 규칙을 바꾸려면 백엔드 합의가 먼저다.

---

## 4. 기술 부채 — 프론트 범위 밖 (백엔드 합의 필요)

### 4-1. 부적격 `referralCode`가 조용히 무시된다 ★ 최대 시스템 위험

`POST /v1/subscriptions`는 `REFERRAL_*` 에러를 정의하지 않는다(§0-1). 부적격 코드를 보내면
거절이 아니라 무시하고 정가를 청구한다. 프론트를 아무리 잘 분리해도 다음 경쟁 상태가 남는다.

```
/order에서 validate 성공 → 계정·계약·코드 상태 변경 → 구독 API가 코드 무시 → 정가 결제
```

해결안(택1, 백엔드 작업):
1. 부적격 `referralCode` 전달 시 **결제 실패**로 응답
2. 서버가 **최종 결제 견적**을 반환하고 사용자가 그 금액을 확인 후 확정
3. validate 결과를 결제 시점까지 원자적으로 보장하는 **quote/token** 발급

### 4-2. `?r=CODE` 유입은 요율을 확보하지 못한다

§0-1의 요율 비대칭. 같은 "레퍼럴 상태"인데 유입 방식에 따라 가격이 갈린다.
현재는 `discountRate > 0` 가드로 **잘못된 표시를 막을 뿐 지원하는 것은 아니다.**
문서상 **"지원하지 않는 예외"** 로 취급하며, 이 경로를 프로모션 완료 상태로 보지 않는다.

해결안: 부적격이어도 200에 요율을 포함하거나, **코드 → 요율 공개 조회**를 신설.

### 4-3. 프론트가 백엔드 판정을 중복 구현하고 있다

`probeSubscriptionHistory`는 `REFERRAL_NOT_FIRST_SUBSCRIPTION`의 중복 구현이다(§0-1).
장기적으로는 가격 근거를 `/v1/referral/validate`로 이관하고 이 함수를 **UI 노출 판단 전용**으로
강등하는 것이 정답이다. 다만 §2 요구사항은 그것 없이도 해결되므로 이번 범위에서 제외한다.

---

## 5. 작업 Phase

각 Phase 종료 시 보고 항목: **변경 파일 / 지켜진 불변조건 / 실행한 테스트 / 발견된 예외 / 다음 Phase 진행 가능 여부**

| Phase | 내용 | 상태 |
|---|---|---|
| 1 | 요구사항·가격 경계·불변조건 문서화 (이 문서) | ✅ 완료 |
| 2 | `referralSource` + `hasDisplayableReferralOffer` 도입, `useReferralPricing` intent, 호출부 선언 (`ReferralPackagePlansSection` 별도 처리) | ✅ 완료 (tsc/eslint/vitest 통과) |
| 3 | `PlanPicker` prop 추가, `/mypage/subscription/change` `actual` 고정 + 회귀 테스트 | ✅ 완료 (tsc/eslint/vitest 통과) |
| 4 | E2E 갱신(D 기대값 변경 / E·F 보존 확인) + 4-1·4-2 백엔드 과제 분리 | 대기 — 다음 작업 |

### `intent` 설계 조건 (전부 필수)

1. 기본값은 **`"actual"`** — 새 사용처가 실수로 할인을 약속하지 못하게 한다
2. `"promotional"`은 호출부에서 **명시적으로만**
3. `/mypage/subscription/change`는 `"actual"` 고정
4. `/order`는 이 훅에 의존하지 않는다 (변경 없음)
5. 프로모션 술어는 **훅 내부 한 곳에서만** 계산한다
6. 컴포넌트가 `isReferral`·`inviteEligible`을 **다시 조합하지 않는다**

### 테스트 매트릭스 (Phase 4)

| 유입 / 사용자 | 마케팅 화면 | `/order` | 기대 |
|---|---|---|---|
| `/r/{slug}` 비로그인 | 15% | 접근 불가(로그인 리다이렉트) | 프로모션 유지 |
| `/r/{slug}` 신규 로그인 | 15% | 15% | 동일 가격 |
| `/r/{slug}` 기존 고객 | 15% | 정가 | 제외 사유 표시 |
| 초대 쿠키 비활성·만료 slug | 정가 | 정가 | 할인 약속 없음 (회귀 방지) |
| `?r=CODE` 요율 확보 | 15% | 판정 결과 | 유입 방식 일관성 |
| `?r=CODE` 요율 미확보 | **정가** | 정가 | **0%를 15%처럼 취급 금지** |
| `/mypage/subscription/change` | 정가 | 주문 단계 없음 | 직접 변경 금액과 일치 |
| **구독 완료 직후, 페이지 전환만** | **제거** | — | `inviteConsumed` 동작 (기존 F) |
| **구독 완료 후 하드 리로드 — 일반** | **제거** | — | 쿠키 삭제 동작 |
| **구독 완료 후 하드 리로드 — 인플루언서** | **제거** | — | `"own-slug"` 차단 (기존 E) |

`validate 성공 후 결제 시점 무시`는 백엔드 협조 없이 E2E로 재현할 수 없다 → 4-1 기술 부채로 이관.
