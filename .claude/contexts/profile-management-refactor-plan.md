# ProfileManagementSection 리팩토링 계획

> 작성일: 2026-06-29
> 대상: `widgets/mypage/ui/ProfileManagementSection.tsx` (741줄 / useState 13 / useEffect 2 / useRef 4)
> 출처 진단: `.claude/contexts/god-component-audit.md` §1 우선순위 **4번** (상태 과다)
> 참고 패턴: `widgets/register/ui/register-section/` (Coordinator + 도메인 훅 + View)
> 선행: 없음 (`PointHistorySection`과 **독립** — 병렬 가능)
> 상태: **Phase 0~6 완료** (2026-06-29). 회귀 검증(PM-V)은 수동 시나리오 일부 제한(§4 참고).

---

## 0. 원칙 (절대 흔들리지 않을 것)

1. **동작·픽셀 100% 동등.** 모든 단계는 기계적 추출만 한다. 로직 변경 0.
2. **Context 생성 금지.** 상태는 `/mypage/profile` 페이지 내부에서만 쓰이므로 Provider를 추가하지 않는다.
3. **패턴은 RegisterSection을 차용한다.** `useRegisterSection`처럼 Coordinator가 단위 훅을 조립하고,
   Root 컴포넌트는 표현(데스크탑·모바일 레이아웃)만 담당한다.
4. **데스크탑·모바일 폼 JSX는 억지로 하나로 합치지 않는다.** 레이아웃·스타일이 다르다
   (데스크탑=가로 라벨 그리드, 모바일=세로 스택·다른 gender 버튼 스타일). View에 각각 유지.
5. **BackIcon·PencilIcon은 이번 범위에서 `mypage-icons`로 승격하지 않는다.** `PasswordManagementSection` 등
   마이페이지 전역 아이콘 통합은 별도 작업. 기계적 추출만 한다.

---

## 1. Phase 0 — 의존성 / 이벤트 맵

### 1.1 현재 책임 (한 파일에 혼재)

| 책임 | 위치(대략) | useState/effect |
|---|---|---|
| 프로필 필드 draft (이름·품종·생일·몸무게·성별·특징) | 206~225 | state 8 + sync effect 1 |
| 신규 프로필 개수 제한 가드 | 227~238 | effect 1 + ref 2 |
| 이미지 업로드 (S3 presigned) | 278~310 | state 2 + ref 1 |
| 저장 (create / update) | 312~364 | transition + saveError |
| 삭제 | 240~276 | isDeleting |
| 인라인 UI 조각 (PetAvatar, BaseInput, GenderButtons, 아이콘) | 54~183 | — |
| 데스크탑·모바일 레이아웃 JSX | 366~721 | — |

### 1.2 데이터 흐름

```
props(profile, isNewProfile)
        │
        ├─ isNewProfile ──► useNewProfileLimitGuard ──► router.replace("/mypage")
        │
        ▼
activeProfile ?? serverProfile  →  isCreating 분기
        │
        ▼
useProfileDraft(profile)  ── sync effect ──► petName, breed, birthDate, weight, gender, specialNotes
        │
        ├─ useProfileImage(profile, isCreating) ──► profileImageUrl, upload, imageError
        │
        ▼
useProfilePersistence(draft, image, isCreating, profile)
        ├─ handleSave  → createProfile | updateProfile → refreshProfile → router/checklist
        └─ handleDelete → deleteProfile → refreshProfile → /mypage

View: desktopLayout + mobileLayout (표현만)
```

### 1.3 맵에서 도출된 사실

1. **폼 필드 state 8개는 하나의 draft aggregate**다. `profile?.id` 변경 시 일괄 sync하는 effect가 이미 있다.
2. **이미지 업로드는 create/edit 분기**가 있지만 draft 필드와 독립적이다 → 별도 훅.
3. **저장·삭제는 API 오케스트레이션**이며 draft+image를 소비한다 → persistence 훅 (또는 save/delete 분리).
4. **데스크탑 GenderButtons vs 모바일 인라인 gender**는 스타일이 달라 공용 컴포넌트 강제 병합 금지.
5. **`formatWeightInput` + `isWeightFocused`는 데스크탑 전용** (모바일은 `kg` suffix 고정). draft 훅이 소유하되 View가 포커스 UI만 분기.

### 1.4 결정 확정

**Q1. `useReducer`로 draft를 통합할까?**
→ **하지 않는다.** RegisterSection·ChecklistForm 패턴과 동일하게 **필드별 useState + sync effect**를 유지한다.
리팩토링 목표는 가독성·책임 분리이지 상태 모델 변경이 아니다.

**Q2. 모바일·데스크탑 폼 필드를 `ProfileFormFields` 하나로 합칠까?**
→ **Phase 6에서 View 줄 수가 240을 넘을 때만** `variant="desktop"|"mobile"` 조각으로 분리 검토.
초기에는 View에 JSX를 그대로 둔다 (억지 DRY 금지).

---

## 2. 목표 구조

```
widgets/mypage/ui/profile-management/
├─ profileManagementHelpers.ts   # 상수 + birthDate/weight 순수 헬퍼 + buildSaveBody(선택)
├─ hooks/
│  ├─ useProfileDraft.ts         # 필드 state + profile sync effect + isWeightFocused
│  ├─ useProfileImage.ts         # fileInputRef, upload, imageError, isUploadingImage
│  ├─ useNewProfileLimitGuard.ts # 신규 등록 시 MAX_PROFILE_COUNT 가드 effect
│  ├─ useProfileSave.ts          # handleSave, saveError, isPending(transition)
│  └─ useProfileDelete.ts        # handleDelete, isDeleting
├─ useProfileManagement.ts       # Coordinator (≤130줄) — 위 훅 조립 + 파생값
├─ components/
│  ├─ PetAvatar.tsx
│  ├─ BaseInput.tsx
│  └─ GenderButtons.tsx          # 데스크탑 전용 (기존 그대로 이동)
└─ ProfileManagementView.tsx     # desktopLayout + mobileLayout + hidden file input

widgets/mypage/ui/ProfileManagementSection.tsx  # Root — props 전달 + View 렌더만 (public API 유지)
```

- `widgets/mypage/index.ts` public API 변경 없음.
- `app/(main)/mypage/profile` 라우트 import 경로 불변.

### Coordinator 책임 경계

`useProfileManagement`는 **배선(wiring)만** 한다. 몸무게 숫자 파싱·API body 조립·S3 업로드 세부는 각 훅이 소유.
Coordinator에 `if`가 늘면 해당 로직을 하위 훅으로 내린다.

---

## 3. 정량 기준 (재분할 트리거)

| 대상 | 상한 | 초과 시 |
|---|---|---|
| `useProfileManagement` (Coordinator) | **130줄** | 로직을 하위 유닛으로 이동 |
| 개별 hook | **180줄 / useState 6 / useEffect 4** | 행위 재분할 검토 |
| hook → 다른 hook 직접 참조 | **3개 미만** | Coordinator로 끌어올림 |
| `profileManagementHelpers.ts` | **제한 없음** (순수 함수) | — |
| `ProfileManagementView` | **280줄** | 레이아웃 조각 추가 분리 (데스크탑/모바일 각각) |

---

## 4. Phase별 Exit Criteria (공통)

```
□ 기능 동일 (동작 변화 0 — 기계적 추출만)
□ UI 동일 (픽셀 동등 — 데스크탑·모바일 각각)
□ tsc + lint 통과 (신규 오류 0; 기존 오류는 대상 아님)
□ Hook 책임 증가 없음 (§3 상한 내)
□ Coordinator ≤ 130줄
□ Context 미생성
```

### 회귀 검증 시나리오 (수동)

| # | 시나리오 | 기대 |
|---|---|---|
| 1 | 기존 프로필 수정 → 저장 | `/mypage` 이동, 데이터 반영 |
| 2 | 신규 프로필 생성 → 저장 | checklist 모달 오픈, activeProfile 전환 |
| 3 | 신규 프로필 + 이미 MAX개 | alert 후 `/mypage` replace |
| 4 | 이미지 업로드 (create / edit 각각) | 미리보기·S3·에러 인라인 |
| 5 | 프로필 삭제 | confirm → loading → `/mypage` |
| 6 | 몸무게 비숫자 저장 시도 | saveError 인라인 |
| 7 | 취소 버튼 | `router.back()` |

---

## 5. 단계표

| Phase | 작업 | 상태 |
|---|---|---|
| **0** | 의존성·이벤트 맵 + Q1/Q2 확정 (이 문서) | ✅ 완료 |
| **1** | `profileManagementHelpers.ts` — 상수·birthDate/weight 순수 헬퍼 추출 | ✅ 완료 |
| **2** | `useProfileDraft` — 필드 state + sync effect | ✅ 완료 |
| **3** | `useProfileImage` — 업로드·file input·imageError | ✅ 완료 |
| **4** | `useNewProfileLimitGuard` + `useProfileDelete` + `useProfileSave` | ✅ 완료 |
| **5** | `useProfileManagement` Coordinator + Root 위임 | ✅ 완료 |
| **6** | `components/` + `ProfileManagementView` — 표현 분리, Root ≤ 30줄 | ✅ 완료 |

### Phase별 상세

**Phase 1** — `profileManagementHelpers.ts`
- 이동: `MAX_PROFILE_IMAGE_BYTES`, `ACCEPT_IMAGE`, `SPECIAL_NOTES_*`
- 이동: `birthDateInputValue`, `formatBirthDateDisplayDots`, `birthDateToValue`, `formatWeightInput`
- (선택) `parseWeightForSave(weight: string)` — `handleSave`의 trim/parse 검증을 순수 함수로

**Phase 2** — `useProfileDraft`
- 입력: `profile: Profile | null`, `isNewProfile`
- 출력: 필드 값·setter, `isWeightFocused`·setter, sync effect 유지

**Phase 3** — `useProfileImage`
- 입력: `profile`, `isCreating`, `refreshProfile`, `router`
- 출력: `profileImageUrl`, `fileInputRef`, `imageError`, `isUploadingImage`, `handleProfileImageSelected`, hidden input props

**Phase 4** — persistence 훅
- `useNewProfileLimitGuard({ isNewProfile, profiles, openAlert, router })`
- `useProfileDelete({ profile, isCreating, ... })`
- `useProfileSave({ draft, imageUrl, isCreating, profile, ... })` — `useTransition` 단일 소유

**Phase 5** — Coordinator
- `useProfileManagement(props)` 가 위 훅을 조립
- `ProfileManagementSection.tsx`는 `const vm = useProfileManagement(props); return <ProfileManagementView {...vm} />;`

**Phase 6** — View 분리
- `PetAvatar`, `BaseInput`, `GenderButtons` → `components/`
- `ProfileManagementView.tsx`에 desktop/mobile layout + file input
- View > 280줄이면 `ProfileManagementDesktop.tsx` / `ProfileManagementMobile.tsx` 추가 분할

---

## 6. 검증 재현

```bash
npx tsc --noEmit
npx eslint widgets/mypage/ui/ProfileManagementSection.tsx widgets/mypage/ui/profile-management/
```

---

## 7. 범위 밖 (이번 리팩토링에서 하지 않음)

- `BackIcon` / `PencilIcon` → `mypage-icons.tsx` 통합
- 비밀번호 변경 UI (`TASKS.md` P1 미완료 항목)
- `GenderButtons`와 모바일 gender UI 스타일 통합
- birthDate 헬퍼를 checklist 도메인과 공유 승격
