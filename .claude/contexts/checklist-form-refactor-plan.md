# ChecklistFormModal 리팩토링 계획

> 작성일: 2026-06-26
> 대상: `widgets/checklist/ui/ChecklistFormModal.tsx` (798줄 / useState 14 / useEffect 10)
> 출처 진단: `.claude/contexts/god-component-audit.md` §1 우선순위 1번
> 상태: **Phase 0 완료(이 문서)**, Phase 1~6 대기. 구현은 단계별 승인 후 진행.

---

## 0. 원칙 (절대 흔들리지 않을 것)

1. **패턴은 차용하되 구조는 복제하지 않는다.** `widgets/order/ui/order-section/`에서 가져올 것은
   "**응집 단위 추출 + 조합 훅**" 메커니즘이다. OrderSection은 **도메인 병렬**(배송·결제·초대·동의)이라
   도메인별로 잘랐지만, ChecklistFormModal은 **단일 Flow**(Question → Answer → Next → Submit)이므로
   절단축을 **행위(Draft / Navigation / Submit / Guard)** 로 다시 설정한다.
2. **동작·픽셀 100% 동등.** 모든 단계는 기계적 추출만 한다. 로직 변경 0.
3. **Context 생성 금지.** 상태가 모달 내부에서만 쓰이므로 `ChecklistFormContext` 같은 건 만들지 않는다.
   훅 조합만으로 충분하다.
4. **새 방식을 발명하지 않는다.** 기존 코드베이스에 정착한 방식이 있으면 우선한다.

---

## 1. Phase 0 — 의존성 / 이벤트 맵

### 1.1 데이터 흐름

```
questions ──────────────┐ (loader, 독립)
                        ▼
        computeInitialState(options, profile, questions)   ← 동기 순수함수 (*)
                        │ seed
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   draft(petInfo,    step /          baseline
   avatar, answers)  maxVisitedStep
        │               │
        ├──── isDirty = draft vs baseline   ← Answer/Profile만 봄, Submit 무관
        │
        ▼
   UnsavedGuard(isDirty, onClose)   ← ESC · X버튼 · 배경클릭
        
   Submit(draft, questions, options, profile, router) → isAnalyzing / isSaving / tier
```

### 1.2 맵에서 도출된 사실

1. **`isDirty`는 Submit이 아니라 draft(Answer/Profile)에만 의존** → Dirty는 Draft 유닛 소속.
2. **초기 복원 effect의 순수 계산부**를 동기 함수 `computeInitialState`로 추출한다.
   단, `void (async()=>)()` 래퍼는 **유지한다** — 이는 setState를 마이크로태스크로 미뤄
   `react-hooks/set-state-in-effect`(연쇄 렌더) 경고를 막는 기존(f8a2e07) 패턴이다.
   effect 자체의 완전 제거/재설계는 Draft가 소유하는 Phase 5에서. (\*)
3. **CTA 버튼이 진짜 Coordinator다.** `handleMobileCta` → (검증 → editProfile? save : 마지막step? submit : next).
   이 분기는 Navigation·Submit·Validation을 가로지르므로 Navigation의 책임이 아니라
   **조합 계층의 조정자**여야 한다. (현 `handleNext`가 `handleSaveProfile`를 직접 호출하는 smell 제거)

### 1.3 결정 확정 (리뷰 미해결 질문 해소)

**Q1. restore는 Draft 책임인가 초기화 책임인가? (Draft가 하나의 Aggregate인가)**
→ **분리한다.** Draft의 책임은 `생성 · 수정 · 비교(isDirty)` 3개뿐.
복원(restore) **계산**은 Draft 밖의 순수 함수 `computeInitialState(options, profile, questions)`가
담당하고, Draft 훅은 그 결과를 **seed로 주입받기만** 한다.

```
초기화 책임 = computeInitialState()  [순수, helpers]  → seed
Draft 책임  = seed로 시작 → 수정 → baseline 대비 비교(isDirty)
```

**Q2. 훅 분할이 리렌더를 늘리는가? (성능)**
→ **늘리지 않는다.** 분리된 훅은 전부 동일한 `ChecklistFormModalInner` 한 컴포넌트 안에서 호출된다.
훅을 쪼개도 render boundary는 그대로(컴포넌트 1개가 함께 리렌더). 즉 **훅 분할은 렌더 중립**이며
선제적 `memo`/`useCallback` 도배를 하지 않는다. 성능 최적화는 분할의 목표가 아니다.

---

## 2. 목표 구조

```
widgets/checklist/ui/checklist-form/
├─ checklistFormHelpers.ts      # 순수 헬퍼 + computeInitialState(동기) + 상수 + Baseline 타입
├─ hooks/
│  ├─ useChecklistQuestions.ts  # fetch · sort · questionsError (독립)
│  ├─ useChecklistDraft.ts      # petInfo · avatar · answers · baseline · isDirty · 필드 mutator
│  ├─ useChecklistNavigation.ts # step · maxVisitedStep · next/back/stepClick (순수 stepping, save 모름)
│  └─ useChecklistSubmit.ts     # handleSaveProfile · handleSubmit · tier · isAnalyzing/isSaving
├─ useChecklistForm.ts          # 조합 + Coordinator (primaryAction · ctaLabel · ctaDisabled · headerTitle)
└─ ChecklistFormModalInner.tsx  # 표현 전담 (Spinner · CloseIcon 내부 유지)
```

- 기존 `ChecklistFormModal.tsx`(Root: 이벤트 리스너 + 마운트 + pathname 가드, ~40줄)는 **위치·역할 유지**,
  import 경로만 갱신.
- `widgets/checklist/index.ts` public API 변경 없음.
- Spinner·CloseIcon은 **별도 파일로 빼지 않는다**(20/15줄 수준 → 과분할). View 파일 내부에 둔다.

### Coordinator 책임 경계 (비대화 차단)

`useChecklistForm`은 **배선(wiring)만** 한다. 비즈니스 로직을 먹지 않는다.

```ts
// 허용: 유닛 호출 + 얇은 디스패치
const draft  = useChecklistDraft(...);
const nav    = useChecklistNavigation(...);
const submit = useChecklistSubmit(...);
const guard  = useUnsavedChangesGuard({ isDirty: draft.isDirty, onClose });

const primaryAction = () => {
  if (!nav.canAdvance) return;            // 검증 판단은 nav/draft가 소유
  if (options.editProfile) submit.saveProfile();
  else if (nav.isLastStep) submit.run();
  else nav.next();
};

// 금지: Coordinator 안에서 검증식 · API 호출 · 파싱 · tier 계산 작성
```

`if`가 늘어나면 그건 하위 유닛이 자기 판단(predicate)을 노출하지 않았다는 신호 →
로직을 **유닛으로 내려보낸다**.

---

## 3. 정량 기준 (재분할 트리거)

> 여유분을 상한에 흡수했다. "10~20줄 초과해도 되나?"라는 모호함을 없애기 위해 상한 자체를 넉넉히 잡고,
> **이 수치를 넘으면 예외 없이 멈추고 절단축을 재검토한다.**

| 대상 | 상한 | 초과 시 |
|---|---|---|
| `useChecklistForm` (Coordinator) | **130줄** | 로직을 하위 유닛으로 이동 |
| 개별 hook (`useChecklist*`) | **180줄 / useState 6 / useEffect 4** | 행위 재분할 검토 |
| hook → 다른 hook 직접 참조 | **3개 미만** | 조합 계층으로 끌어올림 |
| `checklistFormHelpers.ts` | **제한 없음** (순수 함수 모음) | — |
| `ChecklistFormModalInner` (View) | **240줄** | 표현 조각 추가 분리 |

---

## 4. Phase별 Exit Criteria (공통)

각 Phase는 아래를 **모두** 만족해야 완료로 간주한다.

```
□ 기능 동일 (동작 변화 0 — 기계적 추출만)
□ UI 동일 (픽셀 동등)
□ tsc + lint 통과 (신규 오류 0; 기존 오류는 대상 아님)
□ Hook 책임 증가 없음 (§3 상한 내)
□ Coordinator ≤ 130줄
□ 어떤 hook도 다른 hook 3개 이상 직접 참조 안 함
□ Context 미생성 (모달 내부 전용 → 훅 조합만)
```

> **회귀 검증의 구체 시나리오(Question 이동 · Back · Edit · Submit · Unsaved)** 설계는
> **별도 프롬프트**에서 다룬다. 위 "기능/UI 동일"은 그 게이트가 채울 자리만 표시해 둔 것이다.

---

## 5. 단계표

| Phase | 작업 | 상태 |
|---|---|---|
| **0** | 의존성·이벤트 맵 + Q1/Q2 확정 (이 문서) | ✅ 완료 |
| **1** | `checklistFormHelpers.ts` — 순수 헬퍼 + `computeInitialState`(복원 계산 격리, async 래퍼는 유지) | ✅ 완료 |
| **2** | `useChecklistQuestions` | ✅ 완료 |
| **3** | `useUnsavedChangesGuard` (ESC·닫기 가드, isDirty 입력) | ✅ 완료 |
| **4** | `useChecklistSubmit` (save·submit·tier, nav 미참조) | ✅ 완료 |
| **5** | `useChecklistDraft` + `useChecklistNavigation` + `useChecklistForm`(Coordinator ≤130) | ✅ 완료 |
| **6** | `ChecklistFormModalInner` → View 전담 (Spinner·CloseIcon 내부 유지, View ≤240) | ✅ 완료 |

---

## 6. 현재 상태 인벤토리 (추출 대상 매핑)

추출 시 누락 방지용. 현 `ChecklistFormModal.tsx` 기준.

| 현 위치 | 항목 | → 이동처 |
|---|---|---|
| 37~110행 | parseProfileBirthDate, petBirthToIso, profileToPetInfo, clonePetInfo, petInfoEqual, answersEqual, fallbackRecommend | helpers |
| 112~125행 | EMPTY_PET_INFO, Baseline | helpers |
| 127행 | CTA_CLASS | helpers (또는 View) |
| 130~182행 | CloseIcon, AnalyzingSpinner | View 내부 유지 |
| 201~202행 | questions, questionsError | Questions |
| 227~247행 | 질문 로드 effect | Questions |
| 203~205행 | step, stepRef, maxVisitedStep | Navigation |
| 439~472행 | handleNext, handleBack, handleStepClick | Navigation (단 save 호출 분기는 Coordinator로) |
| 206~215행 | initReady, baseline, avatarSrc, petInfo, answersByQuestion, avatarFileRef | Draft |
| 254~322행 | 초기 복원 effect | → computeInitialState(helpers) + Draft seed 주입 |
| 325~332행 | blob URL 정리 effect | Draft |
| 334~348행 | isDirty, isDirtyRef | Draft |
| 396~429행 | handleAvatarChange, handleAvatarFileSelect, toggleOptionForQuestion | Draft |
| 213~214행 | isAnalyzing, isSaving | Submit |
| 474~621행 | handleSaveProfile, handleSubmit | Submit |
| 351~394행 | promptCloseConfirm, ESC effect, handleCloseRequest, closeConfirmOpenRef | UnsavedChangesGuard |
| 219~224행 | body scroll lock effect | View 또는 Draft 무관 → View 내부 작은 effect로 유지 |
| 623~647행 | ctaLabel, isMobileCtaDisabled, handleMobileCta, headerTitle 등 파생 | Coordinator(useChecklistForm) |
| 649~753행 | JSX | View |
| 757~798행 | Root (이벤트/마운트/pathname) | 유지 |

---

## 7. 진행 상황 / 다음 세션 인계 (마지막 갱신: 2026-06-29)

### 완료: Phase 0 ~ 6 전부 (각 단계 `tsc` + `eslint` 통과 — 변경 파일 신규 오류 0)

> **2026-06-29 마무리 작업:** Phase 6 최종 검토 + `useChecklistSubmit` 게이트 초과 해소 완료.
> - `useChecklistSubmit.ts` **211 → 174줄** (게이트 ≤180 진입). 원인이던 `CreateProfileRequest`
>   페이로드 중복(2곳) + trim/parse 블록 중복(2곳)을 순수 헬퍼 2개로 DRY:
>   `buildCreateProfileBody(petInfo, checklistAnswers)`, `buildUpdateProfileBody(petInfo)`
>   (둘 다 `checklistFormHelpers.ts`, 추가 훅 분할 없음 — 행위 단위는 그대로 persist 하나).
> - Phase 6: `ChecklistFormModalInner`는 `useChecklistForm` 하나만 소비하는 얇은 View(≤240) 확인.
>   Spinner·CloseIcon 인라인 유지, body 스크롤 잠금 작은 effect만 보유, 미사용 import·죽은 코드 0.
> - **남은 것: 커밋만.** (동작·UI·public API 불변, 기계적 추출)

### (이력) 완료: Phase 0 ~ 5 (각 단계 `tsc` + `eslint` 통과 — 변경 파일 신규 오류 0)

생성된 파일 (`widgets/checklist/ui/checklist-form/`):

| 파일 | 줄 | §3 게이트 | 비고 |
|---|---|---|---|
| `checklistFormHelpers.ts` | 203 | 제한 없음 | 순수 헬퍼 + `computeInitialState` + CTA 라벨/disabled 순수 함수 |
| `useChecklistForm.ts` (Coordinator) | 130 | ≤130 ✅ | 유닛 조립 + 초기화 오케스트레이션 + `primaryAction` 디스패치 |
| `hooks/useChecklistQuestions.ts` | 45 | ≤180 ✅ | 독립 로더 |
| `hooks/useChecklistNavigation.ts` | 70 | ≤180 ✅ | 순수 stepping |
| `hooks/useChecklistDraft.ts` | 150 | ≤180 ✅ | petInfo·avatar·answers·baseline·isDirty·applyInitial |
| `hooks/useChecklistSubmit.ts` | ~~211~~ **174** | ≤180 ✅ | DRY 헬퍼 적용으로 해소(2026-06-29) |
| `hooks/useUnsavedChangesGuard.ts` | 80 | ≤180 ✅ | ESC·닫기 가드 |
| `ChecklistFormModal.tsx` (수정) | 261 | View ≤240 | 파일 = Root + CloseIcon + Spinner + Inner. **Inner 컴포넌트 자체는 ~150줄**로 게이트 내 |

> 상태: **아직 커밋 안 함.** 변경: `ChecklistFormModal.tsx`(M), 신규 `checklist-form/` 디렉터리, 이 계획 문서.
> `index.ts` public API·`ChecklistFormModal` Root·동작·UI 모두 불변(기계적 추출).

### 남은 작업

**Phase 6 — View 전담화 (대부분 이미 달성됨):**
- 현재 `ChecklistFormModalInner`는 이미 `useChecklistForm(options, onClose)` 하나만 소비하는 얇은 View다.
  구조적 목표는 사실상 Phase 5에서 함께 완료됨.
- 남은 체크: ① Spinner·CloseIcon 인라인 유지(결정: **분리 안 함**, 과분할 회피) 재확인, ② View 컴포넌트 ≤240 확인,
  ③ 최종 리뷰(불필요 import·죽은 코드 없는지).

**게이트 초과 처리 (Phase 6 또는 별도):**
- `useChecklistSubmit.ts` = 211줄 > 180 게이트. 원인은 로직 밀도가 아니라 **동일한 `CreateProfileRequest`
  페이로드 리터럴이 2곳(`isNewProfile` / `isLoggedIn` 분기)에 중복**된 것.
  해결안: `buildCreateProfileBody(petInfo, checklistAnswers)` 순수 헬퍼로 DRY → 약 25~30줄 감소, 게이트 내 진입 예상.
  행위(persist) 자체는 하나라 **추가 훅 분할은 부적절** — DRY로만 처리할 것.

### 작업 중 정정한 사항 (이미 코드/문서 반영, 참고용)
1. **Phase 1 정정**: 복원 effect의 `void (async()=>)()` 래퍼는 커밋 `f8a2e07`의 `set-state-in-effect`
   해결 패턴 → 제거하면 안 됨. `computeInitialState`(순수 계산)만 추출하고 래퍼는 유지함.
2. **Phase 4**: `handleSubmit` 안의 `isCurrentQuestionAnswered` 가드를 호출부(Coordinator `primaryAction`)로
   이동 → Submit을 nav 개념에서 분리. CTA가 그 상태에서 이미 `disabled`라 동작 동등.

### 검증 재현
```
npx tsc --noEmit
npx eslint widgets/checklist/
```
> 남은 경고 2건(`ChecklistResult.tsx`, `ChecklistSection.tsx`)은 **이번 리팩토링과 무관한 기존 경고**다.
