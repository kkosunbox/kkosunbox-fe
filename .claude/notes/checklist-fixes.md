# 체크리스트 수정 계획

> 작성일: 2026-05-07  
> 배경: 백엔드가 `isMultiSelect`를 응답에 포함하기 시작하면서 관련 코드 전반을 점검한 결과

---

## 수정 1 — `shortText` 타입 누락 추가

**파일:** `features/profile/api/types.ts`  
**위치:** `ChecklistQuestion` 인터페이스 (13번째 줄)

**현재:**
```ts
export interface ChecklistQuestion {
  id: number;
  text: string;
  description: string | null;
  isMultiSelect: boolean;
  sortOrder: number;
  options: ChecklistOption[];
}
```

**수정 후:**
```ts
export interface ChecklistQuestion {
  id: number;
  text: string;
  shortText: string;        // ← 추가
  description: string | null;
  isMultiSelect: boolean;
  sortOrder: number;
  options: ChecklistOption[];
}
```

**이유:** API 응답에 `shortText`('식습관과 입맛' 등)가 이미 내려오고 있으나 타입에 없어 조용히 드롭됨. 진행 바 스텝 레이블 등 추후 활용 시 TypeScript 오류 발생 방지.

---

## 수정 2 — `resultStep` 폴백 `6` 제거

**파일:** `widgets/checklist/ui/ChecklistSection.tsx`  
**위치:** 200번째 줄

**현재:**
```ts
const resultStep = questions && questions.length > 0 ? questions.length + 1 : 6;
```

**수정 후:**
```ts
const resultStep = (questions?.length ?? 0) + 1;
```

**이유:** `6`은 "질문 4개 + step0 + result"이던 시절 가정이 남은 것. 질문이 로딩 중(`questions === null`)일 때는 `initReady`가 false라 실제 동작에 영향은 없지만 의미가 모호하고 질문 수 변경 시 혼란을 줄 수 있음.

---

## 수정 3 — `EXCLUSIVE_OPTION_SLUGS` 하드코딩 제거 (백엔드 협의 필요)

**현재 상태 — 프론트 하드코딩:**

`widgets/checklist/ui/ChecklistSection.tsx:163-165`
```ts
const EXCLUSIVE_OPTION_SLUGS = new Set<string>([
  "no_allergy",
]);
```

현재 알러지 질문의 "알러지 없음" 선택지만 배타적으로 처리 중.  
다른 질문에 "해당 없음" 계열 옵션이 추가되면 프론트가 자동으로 반응하지 못함.

**목표 상태 — 백엔드에서 메타데이터 제공:**

### 백엔드 요청 사항
`ChecklistOption` 응답에 `isExclusive: boolean` 필드 추가 요청.

```json
// 현재
{ "id": 1, "text": "알러지 없음", "slug": "no_allergy", "sortOrder": 0 }

// 요청 후
{ "id": 1, "text": "알러지 없음", "slug": "no_allergy", "sortOrder": 0, "isExclusive": true }
```

### 프론트 수정 사항 (백엔드 배포 후)

1. **타입 추가** — `features/profile/api/types.ts`
```ts
export interface ChecklistOption {
  id: number;
  text: string;
  slug: string;
  sortOrder: number;
  isExclusive: boolean;   // ← 추가
}
```

2. **로직 교체** — `widgets/checklist/ui/ChecklistSection.tsx`의 `toggleOptionForQuestion`

```ts
// 현재: slug 기반 하드코딩 Set으로 판단
const isClickedExclusive = !!clickedOption && EXCLUSIVE_OPTION_SLUGS.has(clickedOption.slug);
const exclusiveIds = new Set(
  options.filter((o) => EXCLUSIVE_OPTION_SLUGS.has(o.slug)).map((o) => o.id),
);

// 수정 후: isExclusive 필드로 판단
const isClickedExclusive = !!clickedOption && clickedOption.isExclusive;
const exclusiveIds = new Set(
  options.filter((o) => o.isExclusive).map((o) => o.id),
);
```

3. **`EXCLUSIVE_OPTION_SLUGS` 상수 전체 삭제**

---

## 우선순위

| 순위 | 수정 | 난이도 | 필요 조율 |
|------|------|--------|-----------|
| 1 | `shortText` 타입 추가 | 1분 | 없음 |
| 2 | `resultStep` 폴백 정리 | 1분 | 없음 |
| 3 | `EXCLUSIVE_OPTION_SLUGS` 제거 | 중간 | 백엔드 `isExclusive` 필드 추가 선행 |
