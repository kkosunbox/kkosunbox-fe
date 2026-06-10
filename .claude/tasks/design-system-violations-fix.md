# 태스크: 디자인 시스템 위반 수정 (2026-06-10 커밋 분석)

## 목적
12시간 커밋 분석에서 발견된 hex 색상 직접 사용, SVG 속성 hex 사용, 임의 픽셀 타이포그래피 클래스 사용 위반을 CLAUDE.md 규칙에 맞게 수정한다.

---

## 변경 전 / 변경 후

| 위반 유형 | 파일 | 수정 내용 |
|---|---|---|
| Hex className | SubscriptionManagementSection.tsx | `bg-[#EEEEEE]` → `bg-[var(--color-border-light)]` |
| SVG stroke hex | PointHistorySection.tsx | `stroke="#B0B0B0"` → `stroke="var(--color-border)"` |
| 임의 타이포그래피 | PointHistorySection.tsx | `text-[36px] font-bold leading-[43px]` → `text-title-36-b` |
| 임의 타이포그래피 | PointHistorySection.tsx | `text-[18px] font-semibold leading-[21px]` → 신규 클래스 또는 `text-subtitle-18-sb` |
| 임의 타이포그래피 | SubscriptionManagementSection.tsx | `max-md:text-[14px] md:text-[16px]` → 타이포그래피 클래스 |
| 임의 타이포그래피 | SubscriptionManagementSection.tsx | `text-[13px] font-medium leading-[16px]` → `text-body-13-m-tight` |
| 임의 타이포그래피 | AccountInfoModal.tsx | `text-[16px] font-bold leading-[19px]` → `text-subtitle-16-b-tight` |
| 임의 타이포그래피 | AccountInfoModal.tsx | `text-[13px]` / `text-[14px]` / `text-[12px]` 직접 사용 |
| 임의 타이포그래피 | SubscribePlansSection.tsx | `text-[14px] font-semibold leading-[17px]` → `text-body-14-sb-tight` 외 다수 |
| 임의 타이포그래피 | PackagePlansSection.tsx | SubscribePlansSection과 동일 패턴 중복 |

---

## 대상 파일

- `widgets/mypage/ui/SubscriptionManagementSection.tsx` — 라인 255, 484, 500
- `widgets/mypage/ui/PointHistorySection.tsx` — 라인 51–52, 442, 605, 612
- `shared/ui/custom-modals/AccountInfoModal.tsx` — 라인 178, 200–201, 215–217, 249, 285
- `widgets/subscribe/plans/ui/SubscribePlansSection.tsx` — 라인 359, 374, 392–393, 425–426, 433–434, 484–505
- `widgets/home/package-plans/ui/PackagePlansSection.tsx` — 라인 244, 353–377
- `app/globals.css` — 신규 `@utility` 클래스 추가 시

---

## 구체적인 변경 사항

### 1. [Hex className] SubscriptionManagementSection.tsx:484

```tsx
// ❌ 제거
<div className="max-md:hidden w-px shrink-0 bg-[#EEEEEE] my-10" />

// ✅ 교체
<div className="max-md:hidden w-px shrink-0 bg-[var(--color-border-light)] my-10" />
```
> `--color-border-light: #EEEEEE` — `:root`와 `@theme inline` 모두 등록됨

---

### 2. [SVG stroke hex] PointHistorySection.tsx:51–52

`CopyIcon` 컴포넌트 (checked === false 브랜치):

```tsx
// ❌ 제거
<rect x="9" y="9" width="11" height="11" rx="1.5" stroke="#B0B0B0" strokeWidth="2" />
<path d="..." stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" />

// ✅ 교체
<rect x="9" y="9" width="11" height="11" rx="1.5" stroke="var(--color-border)" strokeWidth="2" />
<path d="..." stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
```
> `--color-border: #B0B0B0` — 이미 등록됨

---

### 3. [타이포그래피] PointHistorySection.tsx:442

`BalanceCard` 내 `pointInfo` JSX:

```tsx
// ❌ 제거
<span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">

// ✅ 교체 (text-title-36-b = 36px/43px/700/-0.04em 이미 존재)
<span className="text-title-36-b text-[var(--color-text)]">
```

---

### 4. [타이포그래피] PointHistorySection.tsx:605, 612

모바일 `h1`(605행)과 `h2`(612행) 두 곳:

```tsx
// ❌ 제거
className="text-[18px] font-semibold leading-[21px] tracking-[-0.04em] text-[var(--color-text-emphasis)]"

// ✅ 방법 A — 기존 클래스 사용 (leading 22px→21px 1px 차이 허용)
className="text-subtitle-18-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]"

// ✅ 방법 B — globals.css에 신규 클래스 추가 후 사용
// @utility text-subtitle-18-sb-tight { font-size: 18px; line-height: 21px; font-weight: 550; }
className="text-subtitle-18-sb-tight tracking-[-0.04em] text-[var(--color-text-emphasis)]"
```
> 방법 A/B 중 디자인 확인 후 선택

---

### 5. [타이포그래피] SubscriptionManagementSection.tsx:255

`SubscriptionRow` 컴포넌트 내 boxQuantity 표시:

```tsx
// ❌ 제거 (line 255–259)
<span
  className="max-md:text-[14px] md:text-[16px] font-semibold leading-tight max-md:mb-1"
  style={{ color: badgeColor }}
>

// ✅ 교체 — Text 컴포넌트 mobileVariant 패턴 또는 Tailwind 클래스 조합
// text-body-14-sb (14px/22px/550) 모바일, text-subtitle-16-sb (16px/20px/550) 데스크탑
<span
  className="max-md:text-body-14-sb md:text-subtitle-16-sb leading-tight max-md:mb-1"
  style={{ color: badgeColor }}
>
```

---

### 6. [타이포그래피] SubscriptionManagementSection.tsx:500

`구독추가` 버튼:

```tsx
// ❌ 제거 (line 500)
className="inline-flex h-[24px] items-center rounded-[4px] bg-[var(--color-text)] px-2 text-[13px] font-medium leading-[16px] text-white transition-opacity hover:opacity-80"

// ✅ 교체 — text-body-13-m-tight (13px/130%≈16.9px/500) 또는 text-body-13-m
className="inline-flex h-[24px] items-center rounded-[4px] bg-[var(--color-text)] px-2 text-body-13-m-tight text-white transition-opacity hover:opacity-80"
```

---

### 7. [타이포그래피] AccountInfoModal.tsx:178, 249

`계정 정보` 헤더 h2(178행)와 `비밀번호 변경` 헤더 h2(249행):

```tsx
// ❌ 제거
<h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">

// ✅ 교체 (text-subtitle-16-b-tight = 16px/19px/700/-0.05em 이미 존재)
// tracking-[-0.04em] 제거 주의 — text-subtitle-16-b-tight에 -0.05em 내장됨
<h2 className="text-subtitle-16-b-tight text-[var(--color-text)]">
```

---

### 8. [타이포그래피] AccountInfoModal.tsx:200–201, 215–217, 285

**라인 200–201** — `비밀번호 변경` 버튼:
```tsx
// ❌  text-[13px] font-medium leading-[16px]
// ✅  text-body-13-m-tight
```

**라인 215–217** — `계정 탈퇴` 텍스트 버튼:
```tsx
// ❌  text-[14px] font-medium leading-[140%] tracking-[-0.02em]
// ✅  text-body-14-m tracking-[-0.02em]  (leading 22px vs 19.6px — 허용 범위 확인)
```

**라인 285** — 비밀번호 안내 텍스트:
```tsx
// ❌  text-[12px] font-medium leading-[16px]
// ✅  text-body-12-m  (12px/18px/500) — leading 차이 허용 범위 확인
//    또는 신규 @utility text-caption-12-m-tight { font-size: 12px; line-height: 16px; font-weight: 500; }
//    (text-caption-12-m-tight 이미 존재: 12px/14px/500 — lh 차이 있어 신규 필요할 수 있음)
```

---

### 9. [타이포그래피] SubscribePlansSection.tsx — 다수

| 라인 | 현재 코드 | 교체 |
|---|---|---|
| 359, 426 | `text-[14px] font-semibold leading-[17px]` | `text-body-14-sb-tight` (이미 존재, -0.02em 내장) |
| 374 | `text-[17px] font-bold leading-[22px] tracking-[-0.04em]` | 신규 `@utility text-subtitle-17-b-lh22` 또는 `text-subtitle-17-b` 검토 |
| 392, 433 | `text-[14px] font-semibold leading-[150%] tracking-[-0.02em]` | `text-body-14-sb tracking-[-0.02em]` (lh 22px 허용) |
| 484–485 | `text-[17px] leading-[24px] tracking-[-0.04em] md:text-[20px]` | `max-md:text-subtitle-17-sb md:text-subtitle-20-sb` 등 검토 |
| 494 | `text-[14px] font-semibold leading-[19px] tracking-[-0.05em] md:text-[16px]` | `max-md:text-price-14-eb md:text-price-16-eb` 또는 별도 클래스 |
| 497 | `text-[14px] leading-[19px] tracking-[-0.05em] line-through md:text-[16px]` | 신규 클래스 필요 또는 `text-body-14-r` 검토 |
| 502 | `text-[14px] font-bold leading-[19px] tracking-[-0.05em] md:text-[16px]` | `max-md:text-body-14-b md:text-body-16-b` 검토 |
| 505 | `text-[17px] font-extrabold leading-[24px] tracking-[-0.05em] md:text-[20px]` | 신규 클래스 필요 |

---

### 10. [타이포그래피] PackagePlansSection.tsx — SubscribePlansSection과 동일 패턴 중복

| 라인 | 현재 코드 | 교체 |
|---|---|---|
| 244 | `text-[17px] font-bold leading-[22px] tracking-[-0.04em]` | 항목 9와 동일 — `text-subtitle-17-b` 또는 신규 클래스 |
| 353–354 | `text-[17px] leading-[24px] md:text-[20px]` | 항목 9 라인 484와 동일 |
| 365 | `text-[14px] font-semibold leading-[19px] md:text-[16px]` | 항목 9 라인 494와 동일 |
| 368 | `text-[14px] leading-[19px] line-through md:text-[16px]` | 항목 9 라인 497과 동일 |
| 373 | `text-[14px] font-bold leading-[19px] md:text-[16px]` | 항목 9 라인 502와 동일 |
| 376 | `text-[17px] font-extrabold leading-[24px] md:text-[20px]` | 항목 9 라인 505와 동일 |

> SubscribePlansSection과 PackagePlansSection의 카드 UI가 동일 패턴을 공유하므로 **한 번에 같이 수정**한다.

---

## 신규 @utility 클래스 후보 (globals.css에 추가 필요할 수 있음)

아래 클래스들은 현재 `globals.css`에 없으나 위 수정 과정에서 필요할 수 있다.
추가 시 `:root`, `@theme inline` 없이 `@utility` 디렉티브만 사용한다.

```css
/* 18px/21px/550 — PointHistorySection 모바일 헤딩 */
@utility text-subtitle-18-sb-tight { font-size: 18px; line-height: 21px; font-weight: 550; }

/* 17px/24px/700 — 패키지 플랜 카드 이름 */
@utility text-subtitle-17-b-lh24 { font-size: 17px; line-height: 24px; font-weight: 700; letter-spacing: -0.04em; }

/* 17px/24px/800 — 패키지 플랜 카드 가격 (extrabold) */
@utility text-price-17-eb { font-size: 17px; line-height: 24px; font-weight: 800; letter-spacing: -0.05em; }

/* 14px/19px/600 — 할인율·원가 (semibold, tight leading) */
@utility text-price-14-sb { font-size: 14px; line-height: 19px; font-weight: 550; letter-spacing: -0.05em; }

/* 14px/19px/700 — 월 요금제 라벨 */
@utility text-price-14-b { font-size: 14px; line-height: 19px; font-weight: 700; letter-spacing: -0.05em; }
```

---

## 주의 사항

- `text-subtitle-16-b-tight`는 `letter-spacing: -0.05em` 내장 — 교체 시 기존 `tracking-[-0.04em]` 제거
- `text-body-14-sb-tight`는 `letter-spacing: -0.02em` 내장 — 교체 시 기존 `tracking-` 제거
- `SubscribePlansSection.tsx`와 `PackagePlansSection.tsx`의 카드 UI는 동일 패턴 — 동시 수정 필수
- `style={{ color: badgeColor }}`처럼 CSS 변수 참조값을 style로 쓰는 것은 허용 범위이므로 건드리지 않음
- `SubscribePlansSection.tsx` 라인 327: SVG filter의 `#00000033` — 그라디언트/그림자 rgba이므로 color token 대상 아님

---

## 검증

1. `pnpm build` 통과
2. `pnpm lint` 통과
3. 브라우저 확인:
   - [ ] `/mypage/point` — 잔액 카드 36px 숫자, 모바일 헤딩 18px 확인
   - [ ] `/mypage/subscription` — 구독 목록 카드 BOX 뱃지, 구독추가 버튼, 세로 구분선 색상 확인
   - [ ] 계정정보 모달 — 헤더 타이포그래피, 비밀번호 변경 버튼 확인
   - [ ] `/subscribe` 플랜 섹션 — 카드 이름/가격/할인율 타이포그래피 (모바일/태블릿/데스크탑)
   - [ ] `/` 홈 패키지 섹션 — 동일 카드 타이포그래피 확인
