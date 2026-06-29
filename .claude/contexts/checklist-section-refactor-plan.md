# ChecklistSection 리팩토링 계획

> 작성일: 2026-06-29
> 대상: `widgets/checklist/ui/ChecklistSection.tsx` (690줄 / useState 13 / useEffect 10)
> 출처 진단: `.claude/contexts/god-component-audit.md` §1 우선순위 **2번** (모달 1번의 쌍둥이)
> 선행: `checklist-form-refactor-plan.md` (모달 = 우선순위 1번, Phase 0~6 완료)
> 상태: **Phase 0 완료(이 문서)**, Phase 1~5 대기. 구현은 단계별 승인 후 진행.

---

## 0. 원칙 (절대 흔들리지 않을 것)

1. **모달을 6단계로 복제하지 않는다.** Section과 모달은 겉만 쌍둥이고 **흐름이 갈린다.**
   추출 유닛을 무비판적으로 공유 훅으로 합치면 모달(이탈형)·Section(인라인형)을 잘못 결합하는
   **조기 추상화**가 된다.
2. **"동일한 것만 공유, 갈리는 것은 복제 후 분화"** — 행위가 픽셀·로직 100% 동일한 것만 승격,
   설계상 다른 것은 Section 로컬에 둔다. (§2 재사용 맵)
3. **동작·픽셀 100% 동등.** 모든 단계는 기계적 추출만 한다. 로직 변경 0.
4. **Context 생성 금지.** 상태가 Section 내부에서만 쓰이므로 `ChecklistSectionContext` 같은 건 만들지 않는다.
   훅 조합만으로 충분하다.
5. **`void (async()=>)()` 래퍼는 유지한다.** 복원 effect의 마이크로태스크 지연은 커밋 `f8a2e07`의
   `react-hooks/set-state-in-effect`(연쇄 렌더) 해결 패턴이다. 제거하지 않는다.

---

## 1. 지금 하는 이유 (god 길이가 아니라 "단일 출처 무시")

모달 리팩토링이 추출해 둔 코드를 **Section이 그대로 중복 보유**하고 있다 — 살아있는 버그 위험:

- `checklistFormHelpers.ts`의 날짜/PetInfo/answers 비교 헬퍼 8개 + `EMPTY_PET_INFO` + `Baseline` 타입
  → Section 34~112행에 **글자 단위 동일 복사본** 존재.
- 모달 리팩토링 때 페이로드 중복 제거용으로 만든 `buildCreateProfileBody` DRY 픽스(2026-06-29)
  → **Section 505~513행에는 전파 안 됨.** 한쪽만 고쳐진 상태가 이미 발생.

즉 "god라서"보다 **"방금 만든 단일 출처를 Section이 무시하고 있어서"** 지금이 적기.

---

## 2. 재사용 맵 (Section vs 모달 추출 유닛)

| 유닛 | Section | 처리 |
|---|---|---|
| `checklistFormHelpers`(원시 헬퍼: 날짜·PetInfo·answers·buildBody·fallback·EMPTY·Baseline) | ✅ 완전 중복 | **공유 승격** |
| `useChecklistQuestions` | ✅ 100% 동일 (Section 125·152~171) | **공유 승격** |
| `useChecklistNavigation` | ✅ 동일 (검증은 coordinator 주입) | **공유 승격** |
| `useChecklistDraft` | ⚠️ 90% 동일. Section은 **아바타 S3 업로드/`avatarFileRef` 없음**(display-only), `isDirty`에 `step < resultStep` 게이트 추가 | **Section 로컬** |
| `useChecklistSubmit` | ❌ 갈림. Section은 화면 이탈 X → **인라인 결과**(`setStep(resultStep)`+`ChecklistResult`), `returnTo=mypage` 리다이렉트, `trackChecklistComplete`, 에러 alert. 모달은 `/checklist/result`로 이탈 | **Section 전용** |
| `useUnsavedChangesGuard` | ❌ 완전 다름. Section은 **페이지 이탈 가드**(beforeunload·앵커클릭 가로채기·`history.pushState` 몽키패치·popstate, `unsavedLeaveAlertOptions`). 모달은 ESC/닫기 + `unsavedCloseAlertOptions` | **Section 전용** |
| `computeInitialState` | ❌ 갈림. 모달=options(isNewProfile/editProfile). Section=sessionStorage `kkosun_from_new_profile`(→step1)·`rewrite`·`editQuestionId` | **Section 전용** |
| `?result=1` 자동 결과 표시 effect (Section 243~279) | — Section 고유 | **Section 전용** |
| CTA 라벨/disabled | ⚠️ Section은 editProfile 모드 없음 → 단순. | Section 로컬 파생 |

**기준선:** 행위가 픽셀·로직 100% 동일(원시 헬퍼·questions·nav)만 공유. 갈리는 것(draft·submit·guard·init)은 복제 후 분화.

---

## 3. 목표 구조

```
widgets/checklist/ui/
├─ checklist-shared/              # NEW: 모달·섹션 공용 (행위 동일한 것만)
│  ├─ checklistDomain.ts          # checklist-form에서 이동: 날짜/PetInfo/answers/buildBody/fallback/EMPTY/Baseline
│  ├─ useChecklistQuestions.ts    # 이동(100% 동일)
│  └─ useChecklistNavigation.ts   # 이동(100% 동일)
├─ checklist-form/                # 모달(기존): 위 공용 import. computeInitialState·CTA·Draft·Submit·ESC가드 잔류
└─ checklist-section/             # NEW: 섹션
   ├─ checklistSectionInit.ts     # computeSectionInitialState (sessionStorage·rewrite·editQuestionId·result)
   ├─ hooks/
   │  ├─ useChecklistSectionDraft.ts    # 아바타 단순화 + resultStep 게이트
   │  ├─ useChecklistSectionSubmit.ts   # 인라인 결과 + returnTo + tracking + 에러 alert
   │  └─ useLeaveGuard.ts               # 페이지 이탈 가드(가장 fragile → 격리·단독 테스트 가능)
   ├─ useChecklistSection.ts      # Coordinator (≤130)
   └─ ChecklistSectionView.tsx    # 표현 전담
```

- `checklist-form/`의 `computeInitialState`·`getChecklistCtaLabel`·`isChecklistCtaDisabled`는 **모달 흐름 전용**이므로
  `checklistFormHelpers.ts`에 잔류한다 (원시 헬퍼만 `checklistDomain.ts`로 이동).
- 기존 `ChecklistSection.tsx`는 **Root 역할 유지**(public API·라우트 진입점), Coordinator+View로 위임만.
- `widgets/checklist/index.ts` public API 변경 없음.
- Spinner는 모달과 동일하게 **별도 파일로 빼지 않는다**(과분할 회피). View 파일 내부에 둔다.

### Coordinator 책임 경계 (비대화 차단)

`useChecklistSection`은 **배선(wiring)만** 한다. 검증식·API 호출·파싱·tier 계산을 Coordinator 안에 쓰지 않는다.
`if`가 늘면 하위 유닛이 자기 판단(predicate)을 노출 안 한 신호 → 로직을 유닛으로 내려보낸다.
(모달 `useChecklistForm`의 `primaryAction` 패턴 차용 — `handleMobileCta` 분기를 그대로 옮긴다.)

---

## 4. 정량 기준 (재분할 트리거) — 모달과 동일

| 대상 | 상한 | 초과 시 |
|---|---|---|
| `useChecklistSection` (Coordinator) | **130줄** | 로직을 하위 유닛으로 이동 |
| 개별 hook | **180줄 / useState 6 / useEffect 4** | 행위 재분할 검토 |
| hook → 다른 hook 직접 참조 | **3개 미만** | 조합 계층으로 끌어올림 |
| `checklistDomain.ts` / `checklistSectionInit.ts` | **제한 없음** (순수 함수) | — |
| `useLeaveGuard` | **제한 완화** (effect 4 초과 허용 — beforeunload·click·pushState·popstate 4개가 본질) | 행위는 1개(이탈 차단)라 분할 안 함 |
| `ChecklistSectionView` (View) | **240줄** | 표현 조각 추가 분리 |

---

## 5. Phase별 Exit Criteria (공통)

```
□ 기능 동일 (동작 변화 0 — 기계적 추출만)
□ UI 동일 (픽셀 동등)
□ tsc + lint 통과 (신규 오류 0; 기존 경고 ChecklistResult.tsx·ChecklistSection.tsx 는 대상 아님)
□ Hook 책임 증가 없음 (§4 상한 내)
□ Coordinator ≤ 130줄
□ 어떤 hook도 다른 hook 3개 이상 직접 참조 안 함
□ Context 미생성 (Section 내부 전용 → 훅 조합만)
□ public API(widgets/checklist/index.ts) 불변
```

---

## 6. 단계표 (모달과 달리 5단계 — 위험 순서로 배치)

| Phase | 작업 | 위험 | 상태 |
|---|---|---|---|
| **0** | 재사용 맵 + 구조 확정 (이 문서) | — | ✅ 완료 |
| **1** | `checklist-shared/` 신설 + 원시 헬퍼·questions·nav 이동, **모달 import 경로 갱신** (동작 0) | 低 | ✅ 완료 |
| **2** | Section을 공용 헬퍼·questions·nav 소비하도록 교체 (**중복 ~120줄 제거**) | 低 | ✅ 완료 |
| **3** | `useChecklistSectionDraft` 추출 (petInfo·avatar·answers·baseline·isDirty·toggle) | 中 | ✅ 완료 |
| **4** | `useChecklistSectionSubmit` + `checklistSectionInit` + `?result=1` effect 추출 | 中 | ✅ 완료 |
| **5** | **`useLeaveGuard` 격리** + View 전담화 + Coordinator 완성 | **高 — 단독 게이트** | ✅ 완료 |

> **중단 안전점:** Phase 1~4만으로 중복 제거·god 해소의 ~80%를 확보한다. 5(이탈 가드)는 가장 fragile하므로
> 단독 단계로 분리했고, 여기서 멈춰도 회귀 노출이 1~4에 섞이지 않는다.

---

## 7. 현재 상태 인벤토리 (추출 대상 매핑) — 현 `ChecklistSection.tsx` 기준

| 현 위치 | 항목 | → 이동처 |
|---|---|---|
| 31~32행 | CTA_CLASS | View (또는 section 로컬 상수) |
| 34~112행 | fallbackRecommend·날짜·PetInfo·answers 헬퍼·EMPTY_PET_INFO·Baseline | **checklist-shared/checklistDomain** (중복 제거) |
| 125~126, 150, 152~171행 | questions·questionsError·resultStep·로드 effect | **checklist-shared/useChecklistQuestions** + Coordinator(resultStep 파생) |
| 128~130행 | step·stepRef·maxVisitedStep | **checklist-shared/useChecklistNavigation** |
| 173~175행 | stepRef 동기화 effect | useChecklistNavigation 내부 |
| 131~133, 142행 | initReady·baseline·avatarSrc·petInfo·answersByQuestion | useChecklistSectionDraft |
| 177~240행 | 초기 복원 effect | → checklistSectionInit(순수) + Draft seed 주입 |
| 224~227, 297~302행 | blob URL 정리·handleAvatarChange | useChecklistSectionDraft |
| 281~295행 | isDirty·isDirtyRef | useChecklistSectionDraft |
| 399~429행 | toggleOptionForQuestion | useChecklistSectionDraft |
| 143~145, 243~279행 | recommendedTier·recommendedProfileId·`?result=1` effect | useChecklistSectionSubmit (또는 별도 result 훅) |
| 144, 466~555행 | isAnalyzing·handleSubmit | useChecklistSectionSubmit |
| 146~148, 304~397행 | openAlert·pendingNavigateRef·promptLeaveConfirm·beforeunload·click·pushState·popstate | **useLeaveGuard** |
| 438~464행 | handleNext·handleBack·handleStepClick | useChecklistNavigation (검증·trackChecklistStart 분기는 Coordinator) |
| 431~436, 599~612행 | currentQuestionId·isCurrentQuestionAnswered·ctaLabel·isMobileCtaDisabled·handleMobileCta | Coordinator(useChecklistSection) |
| 557~597행 | isAnalyzing 스피너 + result step ChecklistResult 렌더 | View |
| 614~689행 | JSX | View |
| 115~123행 | Root(useRouter·searchParams·useAuth·useProfile 진입) | ChecklistSection.tsx(Root) 유지 |

> ⚠️ `trackChecklistStart()`(현 442행, handleNext step0→1)와 제출 전 검증은 **Coordinator로 올린다** —
> nav는 순수 stepping만(모달과 동일 절단). `returnTo`·`editQuestionId`·`rewrite`·`result`·sessionStorage
> 판독은 Root→options 객체로 묶어 하위에 주입(모달의 `ChecklistFormOptions` 패턴 차용, Section 전용 타입).

---

## 8. 진행 상황 / 다음 세션 인계 (마지막 갱신: 2026-06-29)

### 완료: Phase 0 ~ 4 (각 단계 tsc + eslint + 단위테스트 통과, 신규 오류 0)

**Phase 1** — `checklist-shared/` 신설:
- `checklistDomain.ts`(원시 헬퍼: 날짜·PetInfo·answers·buildBody·fallback·EMPTY·Baseline),
  `useChecklistQuestions.ts`, `useChecklistNavigation.ts` 생성(모달에서 이동).
- `checklist-form/checklistFormHelpers.ts`는 **모달 전용**(`computeInitialState`·`InitialChecklistState`·CTA 2종)만 잔류, 원시 헬퍼는 domain에서 import.
- 모달 import 경로 갱신: `useChecklistDraft`·`useChecklistSubmit`·`useChecklistForm` + 단위테스트(원시→domain, 모달전용→helpers 분리).
- 삭제: `checklist-form/hooks/useChecklistQuestions.ts`·`useChecklistNavigation.ts`.

**Phase 2** — `ChecklistSection.tsx` **690 → 497줄** (−193):
- 인라인 헬퍼 8개 + `EMPTY_PET_INFO` + `ChecklistBaseline` 제거 → `checklistDomain` 소비.
- questions state·로드 effect → `useChecklistQuestions`. step/stepRef/maxVisitedStep state·핸들러 → `useChecklistNavigation`(`const { step, maxVisitedStep, getStep, initTo } = nav`).
- `handleSubmit` 페이로드 중복(§1에서 지적한 L505~513) → `buildCreateProfileBody`/`buildUpdateProfileBody`로 DRY. (미사용된 `petBirthToIso`·`CreateProfileRequest`·`Profile` import 제거.)
- **알아둘 결정:** result-step 점프(`?result=1` effect·handleSubmit)는 `nav.initTo(resultStep)`로 처리. `initTo`가 `maxVisitedStep`도 resultStep으로 올리지만, result 뷰(`ChecklistResult`)는 `maxVisitedStep`을 읽지 않고 step 흐름으로 복귀 경로도 없어 **관찰상 동등**. shared nav에 Section 전용 jump API를 추가하지 않기 위한 선택.
- handleNext의 `trackChecklistStart()`·이름검증·`isCurrentQuestionAnswered` 가드는 컴포넌트에 잔류(Phase 5에서 Coordinator로 이동 예정).

**Phase 3** — `ChecklistSection.tsx` **497 → 462줄**, `useChecklistSectionDraft` 추출:
- 신규 `checklist-section/hooks/useChecklistSectionDraft.ts` — petInfo·avatarSrc·answersByQuestion·baseline·initReady 소유 + isDirty·handleAvatarChange·toggleOptionForQuestion·applyInitial(seed). 모달 draft와 달리 **avatarFileRef/S3 없음**, isDirty는 `step>0 && step<resultStep` 게이트.
- 컴포넌트: 5개 useState·isDirty식·handleAvatarChange·toggle 제거 → draft 소비. init effect는 `applyInitial({petInfo,avatarSrc,answers}) + nav.initTo(step)`로 교체.
- **result effect 미세 결정:** 원래 `setAvatarSrc(remoteUrl)`(blob 정리 없음) → `handleAvatarChange(remoteUrl)`로 통일. result=1 진입 시 prev는 항상 원격 URL(blob 아님)이라 revoke가 no-op → **관찰상 동등**.
- effect 의존성에 stable 훅 반환값 추가(`applyInitial`/`setPetInfo`/`handleAvatarChange`) — 재실행 없음.
- import 정리: `clonePetInfo`·`petInfoEqual`·`answersEqual`·`Baseline`·`ChecklistQuestion`·`PetInfo` 제거(draft로 이동).

**Phase 4** — `ChecklistSection.tsx` **462 → 337줄**:
- 신규 `checklist-section/checklistSectionInit.ts` — 순수 `computeSectionInitialState({questions,isLoggedIn,activeProfile,fromNewProfile,isRewrite,editQuestionId})` → `SectionInitialState`(=`SectionDraftSeed` + `initialStep`). sessionStorage 판독·제거(부수효과)는 init effect에 잔류하고 `fromNewProfile`만 주입.
- 신규 `checklist-section/hooks/useChecklistSectionSubmit.ts` — recommendedTier·recommendedProfileId·isAnalyzing 소유 + `handleSubmit` + `?result=1` 자동표시 effect + viewResultDone. useRouter/useAuth/useProfile/useModal 내부 호출. 입력: draft setter(setPetInfo·handleAvatarChange)·initTo·resultStep·initReady·isViewResult·returnTo·isConfirmedLeaveRef.
- **모달 §4.2와 동일 결정:** handleSubmit의 `if(!isCurrentQuestionAnswered) return` 가드를 호출부 `handleMobileCta`로 이동(마지막 질문 step에서 CTA가 이미 disabled라 동작 동등).
- 컴포넌트 import 대거 정리: checklistDomain·createProfile/updateProfile·getSubscriptionPlans·tierFromSubscriptionPlan·hasChecklistAnswers·trackChecklistComplete·getErrorMessage·useState 등 제거. **남은 useState 0**(모두 hook 소유).
- **부수효과(의도된 개선):** init effect 재구성 시 `isRewrite`를 deps에 정상 포함 → 기존 exhaustive-deps 경고 1건 해소. 이제 checklist 위젯 경고는 `ChecklistResult.tsx` 미사용 변수 1건뿐(무관).

**Phase 5 (高·단독 게이트)** — `ChecklistSection.tsx` **337 → 149줄**(순수 View):
- 신규 `checklist-section/hooks/useLeaveGuard.ts`(122줄) — 이탈 가드 4종(beforeunload·앵커클릭 캡처·`history.pushState` 몽키패치·popstate) + `isDirtyRef`/`isConfirmedLeaveRef`/`pendingNavigateRef`/`promptLeaveConfirm`/`clearPendingLeave`. **effect 본문 바이트 단위 동일 이동**. `isConfirmedLeaveRef`를 노출해 submit이 의도된 이탈을 통과.
- 신규 `checklist-section/useChecklistSection.ts`(Coordinator, **125줄 ≤130 게이트**) — 유닛 조립 + 초기 복원 오케스트레이션 + CTA 파생/디스패치. wiring 전용. **모달 `useChecklistForm` 패턴대로 명시 인터페이스 없이 추론 반환 + 그룹화 return**(초안의 ViewModel 인터페이스는 게이트 초과 유발해 제거 — 로직 이동 아닌 보일러플레이트 축소).
- `ChecklistSection.tsx`는 Coordinator 소비 + 표현(스피너·결과·JSX)만. **Root 책임이 없는 페이지 위젯이라 별도 `ChecklistSectionView.tsx`를 만들지 않고 공개 컴포넌트 자체를 얇은 View로** 둠(불필요한 indirection 회피, public export 경로 불변).
- `sessionStorage` 1회 소비를 `checklistSectionInit.consumeFromNewProfileFlag()`로 격리 → **Coordinator는 브라우저 API 직접 호출 0**.

#### Phase 5 Acceptance Criteria (외부 리뷰 피드백 반영 — 통과)
1. 기능 변경 금지(behavior 100% identical) — 가드는 바이트 단위 이동, 그 외 mechanical. ✅
2. `tsc --noEmit` ✅
3. `eslint` — 신규 0(남은 1건 `ChecklistResult.tsx` 무관) ✅
4. 기존 Unit Test 전부 통과 — `vitest run` 7파일/57 ✅
5. StrictMode listener 중복 등록 없음 — 모든 addEventListener가 동일 핸들러 참조·동일 capture로 대칭 cleanup ✅
6. `history.pushState` patch/unpatch 대칭 — mount 시 `original=pushState.bind`, cleanup 시 복원. StrictMode 이중호출에도 누적 없음 ✅
7. 모든 effect cleanup 확인 — 리스너 effect 4종 모두 cleanup, 나머지는 ref-write/취소가드(원본과 동일) ✅
8. Dirty/Clean 수동 회귀 — **주의:** `ChecklistSection`은 현재 어떤 app 라우트에서도 import되지 않음(／checklist→홈+모달; app 외부 import는 result 페이지·layout의 **모달**뿐). 라이브 페이지 부재로 in-app 수동 시나리오 불가. 대신 ①가드 바이트 동일 이동 ②모달의 동일 dirty-guard E2E(`checklist.spec.ts` 13/13) 통과로 대체. 라우팅 도입 시 jsdom 통합테스트(@testing-library/react) 추가 권장.

#### Phase 5 추가 검증 결과 (엄격 모드)
- **프로덕션 빌드** `pnpm build` 통과(전 라우트 생성, 에러 0).
- **depcruise**(FSD 경계) — checklist-section/shared 신규 위반 0(기존 무관 경고 3건만).
- **E2E** `npx playwright test` 전체 90개 중 86 pass / 4 fail. **4 fail은 `login.spec.ts`(빈제출·세션복구)·`error-boundaries.spec.ts`(주문 결제수단)로 체크리스트와 무관** — ①변경 파일이 `widgets/checklist/`로만 국한(git status) ②`/order`·`/login`은 checklist 모듈 import 0(grep), layout의 import는 **모달**뿐(E2E 13/13 통과) → 코드 경로 무연결로 **기존 실패 확정**. 4건 재실행도 동일 실패(flaky 아님, baseline 이슈).
- **checklist.spec.ts 단독 13/13 통과**(모달 흐름·미저장 가드 포함).
9. 이탈 가드 훅 외부 브라우저 이벤트 등록 코드 0 — grep으로 addEventListener/pushState/popstate가 `useLeaveGuard.ts`에만 존재함 확인 ✅
10. Coordinator 브라우저 API 직접 호출 금지 — `sessionStorage`를 `consumeFromNewProfileFlag` 유닛으로 격리, coordinator엔 직접 호출 0 ✅

### 최종 구조 (`widgets/checklist/ui/`)
```
checklist-shared/  checklistDomain.ts · useChecklistQuestions.ts · useChecklistNavigation.ts   (모달·섹션 공용)
checklist-form/    (모달, 기존)
checklist-section/
  checklistSectionInit.ts        computeSectionInitialState(순수) + consumeFromNewProfileFlag
  hooks/useChecklistSectionDraft.ts   useChecklistSectionSubmit.ts   useLeaveGuard.ts
  useChecklistSection.ts         Coordinator(ViewModel)
ChecklistSection.tsx             얇은 View (공개 export, 149줄)
```
줄 수 추이: **690 → 497 → 462 → 337 → 149**. (god component: state 13/effect 10 → View state 0/effect 0)

### 검증 재현
```
npx tsc --noEmit
npx eslint widgets/checklist/
npx vitest run                 # 전체 단위(7파일/57)
npm run depcruise              # FSD 경계(신규 위반 0)
pnpm build                     # 프로덕션 빌드
npx playwright test            # E2E(모달 흐름·dirty guard 회귀)
```
> 남은 경고 1건(`ChecklistResult.tsx` 미사용 변수)은 무관 기존 경고. (Phase 4에서 `isRewrite` 경고는 해소됨.)
> 상태: **아직 커밋 안 함.** Phase 0~5 전부 미커밋.
