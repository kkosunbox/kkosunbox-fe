# 디자인 시스템 토큰 전략

## 왜 타이포그래피가 중구난방이 되는가

### 실제 원인 흐름

```
피드백 → 디자인 변경 → 개발자가 Figma 스펙 확인
→ 기존 토큰과 맞지 않음 → 시간 압박 → raw 값 하드코딩
→ 토큰은 추가되지 않음 → 다음 번에도 반복
```

핵심은 토큰 추가가 누구의 책임인지 불명확하고, **구현보다 토큰이 먼저여야 한다는 프로세스가 없었던 것**이다.

---

## 토큰 계층을 두 단계로 나눠야 하는 이유

### 현재 시스템의 문제: 구현 기반 이름

지금 토큰 이름은 역할이 아니라 구현 값을 설명한다.

```css
@utility text-title-24-b { font-size: 24px; line-height: 36px; font-weight: 700; }
```

디자이너가 "이 타이틀 22px로 바꿔주세요"라고 하면 개발자 선택지는 세 가지다.

| 선택지 | 문제 |
|---|---|
| `text-title-24-b` 내부 값을 22px로 수정 | 이름이 거짓말됨 ("24"인데 실제는 22px) |
| `text-title-22-b` 신규 토큰 추가 + JSX 교체 | 22와 24의 차이가 불명확, 혼란 |
| `text-[22px] font-bold` 하드코딩 | 현실에서 가장 많이 선택됨 → 이게 203건이 된 이유 |

**이름에 숫자가 들어있는 순간, 디자인이 바뀌면 이름이 거짓말이 된다.**  
그것이 하드코딩을 유발하는 근본 원인이다.

---

## 두 단계 토큰 시스템

### 1단계: Primitive 토큰

"어떤 값이 우리 시스템에서 허용되는가"를 선언한다.

```css
:root {
  /* 폰트 크기 스케일 */
  --font-size-12: 12px;
  --font-size-13: 13px;
  --font-size-14: 14px;
  --font-size-16: 16px;
  --font-size-18: 18px;
  --font-size-20: 20px;
  --font-size-22: 22px;
  --font-size-24: 24px;
  --font-size-28: 28px;

  /* 폰트 굵기 */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 550;
  --font-weight-bold: 700;
}
```

### 2단계: Semantic 토큰

"이 텍스트는 어떤 역할인가"를 설명한다. Primitive를 참조한다.

```css
/* 이름이 구현(24px)이 아니라 역할(상품명)을 설명함 */
@utility text-product-name {
  font-size: var(--font-size-24);    /* primitive 참조 */
  line-height: 29px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.04em;
}

@utility text-section-heading {
  font-size: var(--font-size-28);
  line-height: 40px;
  font-weight: var(--font-weight-bold);
}
```

---

## 실제 시나리오 비교

### 시나리오: "상품명 폰트를 24px → 22px로 바꿔주세요"

**현재 시스템 (구현 기반 이름)**

```tsx
// JSX — 하드코딩되어 있는 경우
<h2 className="text-[24px] font-bold leading-[29px] tracking-[-0.04em]">
  {selectedPlan.name}
</h2>
```

→ 파일 전체를 grep해서 찾아 수동으로 교체. 하나라도 놓치면 불일치 발생.

---

**두 단계 시스템 (역할 기반 이름)**

```tsx
// JSX — 역할 이름으로 작성
<h2 className="text-product-name">
  {selectedPlan.name}
</h2>
```

```css
/* globals.css 딱 한 줄만 바꿈 */
@utility text-product-name {
  font-size: var(--font-size-22);  /* ← 여기만 */
  line-height: 29px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.04em;
}
```

→ JSX 파일은 단 한 줄도 건드리지 않음.  
→ `text-product-name`을 쓰는 모든 파일이 자동으로 22px이 됨.

---

### 시나리오 2: "22px 텍스트를 전체적으로 21px로 통일해주세요"

**현재 시스템**: 파일 전체 grep 후 수동 교체.

**두 단계 시스템**: Primitive 토큰 한 줄만 바꿈.

```css
:root {
  --font-size-22: 21px;  /* 이 한 줄 */
}
```

→ `var(--font-size-22)`를 참조하는 모든 semantic 토큰이 자동으로 21px가 됨.

---

## 올바른 프로세스

```
❌ 잘못된 순서
디자인 변경 → 구현 → (토큰은 나중에 정리하자) → 영원히 안 함

✅ 올바른 순서
디자인 변경 → 토큰 추가/수정 → 구현
```

**규칙**: Figma에서 새로운 폰트 조합이 나왔을 때, 그 조합이 기존 토큰에 없으면 구현 전에 반드시 토큰을 먼저 만든다.

---

## 현재 코드베이스에서의 실용적 마이그레이션

203건을 한 번에 고치려 하면 안 된다. 단계적으로 접근한다.

### 1단계: 감사(Audit)

현재 raw 값들이 실제로 몇 종류인지 파악한다.  
203건이라도 고유한 조합은 10~20가지일 가능성이 높다.

### 2단계: 기존 토큰과 매핑

`text-[24px] font-bold leading-[29px]`가 기존 `text-title-24-b`와 동일하거나 충분히 가깝다면 교체한다.

### 3단계: 진짜 새로운 조합만 토큰화

기존 토큰에 없는 조합만 신규 토큰으로 추가한다.  
이때 이름을 **역할 기반**으로 짓는다.

```
text-title-24-b        →   text-product-name
text-subtitle-18-b     →   text-section-heading
text-body-14-r         →   text-card-description
```

### 4단계: 트래픽 많은 페이지부터 점진적 정리

home, subscribe 페이지부터 시작한다.

---

## 디자이너와의 계약

Figma에서 임의의 px 값을 쓸 수 있는 구조라면 개발자는 항상 raw 값을 하드코딩할 수밖에 없다.

**이상적**: Figma Variables로 디자이너가 토큰으로만 타이포그래피를 지정하도록 제한.

**현실적 최소 합의**: "이 폰트 조합이 토큰에 없으면 먼저 얘기해라"는 약속.

---

## 한 줄 요약

> 토큰 이름에 숫자(구현)가 들어가면 디자인이 바뀔 때마다 이름이 거짓말이 된다.  
> 역할로 이름을 지으면 CSS 한 줄 수정이 전체에 전파된다.
