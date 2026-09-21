# 모달 → 네이티브 `<dialog>` 점진적 마이그레이션 계획

작성일: 2026-09-16 · 완료일: 2026-09-17 · 상태: **✅ 전체 마이그레이션 완료**
발단: "브라우저가 실행하는 코드를 써라" 관점으로 코드베이스 전체 탐색 → 모달 시스템이 최대 후보로 지목됨

## 완료 요약

- Phase 0~4 전부 완료. 인벤토리의 모달 22개를 네이티브 `<dialog>.showModal()` 기반
  `ModalShell`로 통일했다.
- ESC, 포커스 트랩, 배경 inert 처리, top layer 쌓임은 브라우저에 위임하고, 스크롤 락은
  `body:has(dialog:modal)` CSS 한 곳으로 단일화했다.
- `LoadingOverlay`는 모달 위 표시 가능성을 보존하도록 manual popover로 top layer에 편입했다.
- 타입 검사·전체 ESLint·프로덕션 빌드·관련 회귀 E2E 88건과 Phase 3 타깃 브라우저 검증
  5건이 모두 통과했다. 타깃 검증에는 ESC, 배경 클릭, 스크롤 락, backdrop 강도,
  리뷰 모바일 전체화면이 포함된다.
- 신규 모달 작성 규칙은 `CLAUDE.md`에 반영했다. 후속 마이그레이션 작업은 없다.

아래 §1 인벤토리는 착수 당시의 구형 구현 현황을 보존한 기록이다.

---

## 1. 현황 (코드 실측)

### 1-1. 모달 인벤토리 — 총 22개 dialog 인스턴스

| 구분 | 파일 | z-index | 비고 |
|---|---|---|---|
| ModalProvider 관리 | `shared/ui/modal/AlertModal.tsx` | `z-[210]` | 범용 알림, 호출처 30곳+ |
| ModalProvider 관리 | `shared/ui/custom-modals/*.tsx` 14개 | `z-[100]` | `AccountInfoModal`은 한 파일에 dialog 2개 |
| 개별 렌더 | `widgets/checklist/ui/ChecklistFormModal.tsx` | `z-[200]` | `(main)/layout.tsx`에 상주 |
| 개별 렌더 | `widgets/subscribe/plans/ui/reviews/ReviewImageLightbox.tsx` | `z-[200]` | |
| 개별 렌더 | `widgets/mypage/ui/MyReviewModal.tsx` | `z-[100]` | |
| 개별 렌더 | `widgets/support/faq/ui/SupportSection.tsx` | `z-[100]` | |
| 개별 렌더 | `features/inquiry/ui/InquiryDetailModal.tsx` | `z-[100]` | |
| 개별 렌더 | `widgets/orders/ui/OrderHistorySection.tsx` | `z-[60]` | mock 상세, 한 줄 인라인 JSX |
| 개별 렌더 | `entities/package/ui/PackageNutritionGuide.tsx` | `z-50` | |
| (모달 아님) | `shared/ui/LoadingOverlay.tsx` | `z-[9999]` | `role="status"`+`aria-live`. dialog 아님 → **popover로 top layer 편입** (§2-4) |
| (모달 아님) | `widgets/header/ui/MobileDrawer.tsx` | `z-[59]` | 드로어, 범위 밖 |
| (범위 밖) | `shared/ui/DatePicker.tsx` | — | 인라인 팝오버. 별건(popover API 후보) |

### 1-2. 구조가 거의 완벽히 동일하다 (= 기계적 치환 가능)

custom-modals 14개 전부 아래 패턴을 글자 단위로 공유한다:

```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
     role="dialog" aria-modal="true" aria-label="...">
  <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
  {/* 카드 */}
</div>
```

차이는 단 3가지: `AlertModal`만 `z-[210]`·`bg-black/50`·`px-5`, `TermsViewModal`만 `bg-black/50`, `AccountInfoModal`/`ProfileSwitchModal`은 dialog가 2개거나 본문이 김.

### 1-3. 지금 직접 구현하고 있는 것 (= 브라우저에 넘길 대상)

| 기능 | 현재 구현 | 위치 |
|---|---|---|
| ESC 닫기 | `window.addEventListener("keydown")` | `ModalProvider` + 개별 4곳 |
| ESC 우선순위 | **capture 단계 + `stopImmediatePropagation()`** 수동 해킹 | `useUnsavedChangesGuard.ts:55-68` |
| 배경 스크롤 락 | `document.body.style.overflow = "hidden"` | **서로 모르는 구현 6개** |
| 배경 클릭 닫기 | backdrop `<div>` + `onClick` | 전 모달 |
| 포커스 관리 | `primaryRef.current?.focus()` 1줄이 전부 | `AlertModal`만 |
| 쌓임 순서 | z-index 수동 사다리 (50 / 59 / 60 / 100 / 200 / 210 / 9999) | 전역 |

### 1-4. 이 과정에서 발견한 기존 결함

1. **포커스 트랩이 어디에도 없다.** 모달이 열려 있어도 Tab을 계속 누르면 포커스가 배경 페이지로 빠져나간다. 전 모달 공통 접근성 결함.
2. **중첩 시 스크롤 락이 조기 해제된다.** `ChecklistFormModal`(스크롤 락 O) 위에 `AlertModal`이 뜨면 `ModalProvider`도 락을 건다. 알림을 닫는 순간 `ModalProvider`의 cleanup이 `document.body.style.overflow = ""`로 **무조건 해제** → 체크리스트 모달이 아직 열려 있는데 배경이 스크롤된다.
   - 근거: `ModalProvider.tsx:91-94` + `ChecklistFormModal.tsx:105-110`(deps `[]`라 재적용 안 됨)
   - ⚠️ 코드 판독으로 확인. **실브라우저 재현은 아직 안 해봤음** — Phase 0에서 재현 확인 권장.
3. `ChecklistFormModal`이 `ModalProvider`의 window 리스너를 이기려고 capture 단계에서 ESC를 가로채는 수동 해킹이 존재한다.

---

## 2. 설계

### 2-1. 핵심 프리미티브 — `shared/ui/modal/ModalShell.tsx` (신규)

각 모달이 **자기 파일 안에서** 쓰는 공용 껍데기. Provider 안/밖 모달 모두 같은 걸 쓰므로 파일 단위 점진 이관이 가능해진다.

```tsx
interface ModalShellProps {
  label: string;                  // aria-label → E2E getByRole("dialog", {name}) 그대로 생존
  onClose: () => void;            // ESC·배경클릭 공통 경로
  children: ReactNode;
  className?: string;             // 정렬 컨테이너 (px-4, md:items-center 등 기존 클래스 이관)
  backdropClassName?: string;     // bg-black/60 vs /50 차이 흡수
  dismissOnBackdrop?: boolean;    // 기본 true
}
```

동작:
- 마운트 시 `showModal()` / 언마운트 직전 `close()` — **조건부 마운트가 이미 열림/닫힘이라 별도 상태 동기화 불필요**
- `onCancel`(ESC) → `preventDefault()` 후 `onClose()` 경유 (기존 `onDismiss` 콜백 체계 유지)
- 배경 클릭 → `e.target === dialogRef.current`일 때만 닫음
- `<dialog>` 자체를 뷰포트 전체로 깔고 flex 정렬 → 기존 `fixed inset-0 flex items-center justify-center`와 레이아웃 동일
- 기존 backdrop `<div>`는 `::backdrop`이 대체

### 2-2. `app/globals.css` 추가

```css
dialog { max-width: none; max-height: none; border: 0; padding: 0; background: transparent; }
dialog::backdrop { background: rgb(0 0 0 / 0.6); }
/* Phase 0 실측 결과 필요하다고 판명될 때만 추가 — JS 스크롤 락 6개를 이 한 줄로 대체 */
body:has(dialog[open]) { overflow: hidden; }
```

`:has()`는 Tailwind v4가 이미 요구하는 브라우저 범위 안이다.

### 2-3. 마이그레이션 순서 = **z-index 내림차순** (가장 중요한 제약)

`showModal()`로 열린 dialog는 **top layer**에 올라가 z-index와 무관하게 항상 비(非)마이그레이션 요소보다 위에 뜬다.
따라서 **위에 떠야 하는 것부터** 옮겨야 혼재 구간에서 상하 관계가 역전되지 않는다.

- 아래→위 순서로 옮기면: 예) `ChecklistFormModal`(200)을 먼저 옮기고 `AlertModal`(210)을 안 옮기면 → 알림이 체크리스트 폼 **아래로** 깔림 = 즉시 장애
- 전부 옮기고 나면 쌓임 순서는 z-index가 아니라 **연 순서**(나중에 연 게 위)로 결정됨 = 대개 의도와 일치

### 2-4. `LoadingOverlay` 상하관계 — popover로 top layer 편입

**결론: `popover="manual"` + `showPopover()`로 전환한다. `<dialog>`로 만들지 않는다.**

근거(호출부 실측):

- **"스피너가 모달을 덮어야 하는" 케이스는 현재 없다.** `ModalProvider.handleConfirm`이 `activeConfirm(); closeModal();` 순이라 확인 누르면 모달이 먼저 닫히고 작업이 시작된다. 열린 채로 제출하는 `ChecklistFormModal`은 `showLoading`을 아예 쓰지 않는다(자체 제출 상태 사용).
- **겹치는 건 정반대 방향뿐이다.** `useSubscriptionDetailSection.ts:85` 등은 `catch { openAlert(...) } finally { hideLoading() }` 구조라, 스피너가 떠 있는 동안 에러 알림이 뜬다. 여기선 **알림이 스피너 위**여야 읽고 닫을 수 있다. 현재 z로는 알림(210) < 스피너(9999)라 뒤에 깔릴 구조인데, 두 호출이 같은 tick이라 React 배치로 커밋 프레임엔 하나만 남아 문제가 드러나지 않았을 뿐이다.
- 즉 **`z-[9999]`는 관측된 요구사항이 아니라 방어적 사다리**다. top layer의 "나중에 연 게 위" 규칙이 두 경우를 모두 맞게 처리한다.

그럼에도 top layer로 올려야 하는 이유: 마이그레이션 후 `z-[9999]`는 무력화된다. 지금 당장은 겹치지 않지만, 나중에 `await` 사이에 모달을 띄우는 코드가 추가되면 **스피너가 조용히 모달 뒤로 숨는 회귀**가 발생한다.

`<dialog>`가 아니라 popover인 이유:
- `role="status"` / `aria-live="assertive"` 시맨틱 유지 (dialog로 만들면 의미가 틀어진다)
- `showModal()`은 `auto` 팝오버만 닫는다 — `manual`은 살아남는다
- ESC 닫기·inert 강제가 붙지 않는다 (스피너는 닫히면 안 된다)

**"항상 최상단" 보장 여부 — 미확정(2026-09-16 기준).** top layer 순서는 z-index가 아니라 개봉 순서라 이론상으로는 나중에 연 모달이 위로 간다. 그러나 Phase 0에서 실제로 확인하려 했을 때, 테스트 페이지의 스피너가 일정 시간 뒤 자동으로 숨는 탓에 "스피너와 모달이 동시에 열린 순간"을 안정적으로 포착하지 못해 **어느 쪽이 위인지 확정하지 못했다**. 중간에 "스피너가 위"로 보이는 측정이 한 번 나왔으나, 그 판정식이 dialog가 열리지 않은 경우에도 같은 답을 내는 결함이 있어 근거로 쓸 수 없다.

당장은 무해하다 — 위 근거대로 둘이 같은 프레임에 공존하는 호출부가 현재 없다. 다만 공존하게 되는 코드가 생기면 순서가 문제가 되므로, **그때 실측해서 결정**한다. 만약 스피너가 위로 와서 알림을 덮는다면 선택지는 (a) 모달 개봉 시 `hidePopover()`→`showPopover()`로 스피너를 재개봉해 꼭대기로 올리거나(깜빡임 위험), (b) 반대로 스피너를 모달 아래에 두고 알림이 보이게 하거나 둘 중 하나다.

---

---

## 3. 단계별 실행 계획

### Phase 0 — 프리미티브 + 파일럿 (`AlertModal` 하나만)
- 추가: `ModalShell.tsx`, `globals.css` dialog 리셋
- 변경: `AlertModal.tsx` 전환 (초기 포커스는 `primaryRef.focus()` → 확인 버튼에 `autoFocus`)
- 변경: `LoadingOverlay.tsx` → `popover="manual"` (§2-4). **AlertModal과 같은 Phase에서 처리해야 한다** — 알림이 top layer로 올라가는 순간 z-9999가 무력화되므로 뒤로 미루면 그 사이 구간이 깨진다
- **유지**: `ModalProvider`의 ESC·스크롤락 useEffect는 아직 **지우지 않는다** (나머지 모달이 아직 구형)
- **실측 체크리스트** (Phase 0의 존재 이유):
  - [ ] `showModal()`만으로 배경 스크롤이 막히는가? → 안 막히면 `body:has(dialog[open])` 투입
  - [ ] `::backdrop` 색/투명도가 기존 `bg-black/50`과 육안 동일한가
  - [ ] ESC / 배경 클릭 / 확인 버튼 초기 포커스 / **Tab 포커스 트랩**
  - [ ] `LoadingOverlay` popover 전환(§2-4) 동반 — 스피너 위에 알림이 뜨는지, 스피너가 `showModal()`에 안 닫히는지
  - [ ] `ChecklistFormModal` 위에 알림 띄웠다 닫기 → 1-4-2번 스크롤 락 버그 재현/해소 확인
  - [ ] E2E `getByRole("dialog")` 셀렉터 생존 (`order.spec.ts:67`의 `toHaveCount(0)` 포함)

#### Phase 0 실측 결과 (2026-09-16, Chrome / localhost:3001 `/test`)

**확인됨** (JS 프로브 기준, 신뢰 가능)

| 항목 | 결과 |
|---|---|
| 네이티브 dialog 여부 | `<DIALOG>`, `open=true`, `:modal=true` |
| 접근성 이름 | `aria-label="Alert 모달 예시"` 유지 → E2E `getByRole("dialog", {name})` 생존 |
| 배경 딤 색 | `::backdrop` = `rgba(0, 0, 0, 0.5)` — 기존 `bg-black/50`과 정확히 일치 |
| UA 스타일 리셋 | padding 0 / border 0 / 배경 transparent / 박스 1920×945(뷰포트 전체) |
| 초기 포커스 | `[data-autofocus]` → 확인 버튼에 정확히 잡힘 |
| CSS 스크롤 락 | 인라인 스타일을 지워도 `body` computed overflow = `hidden`, 모달 닫으면 `visible` |
| ESC 배선 | `cancel` 이벤트 → `preventDefault` 적용 + dialog 언마운트 + 락 해제 |
| 배경 클릭 | 카드 클릭은 안 닫힘 / 배경 클릭은 닫힘 |
| LoadingOverlay | `popover="manual"`, `:popover-open`, `role="status"` 유지. **`showModal()` 후에도 열린 채 유지됨**(manual 선택이 맞았다는 근거) |

**확인 못 함** (브라우저 자동화 하네스 한계 — 실제 사람이 확인 필요)

| 항목 | 왜 |
|---|---|
| ESC 키로 실제 닫힘 | 키 입력이 페이지에 전혀 도달하지 않음(Tab·`a`·Escape 모두 window keydown 0건). `cancel` 이벤트를 직접 쏘는 것으로 **배선만** 대체 검증함 |
| Tab 포커스 트랩 | 위와 동일. 확인 버튼이 유일한 포커스 대상이라 "안 움직임"과 "입력 무시"가 구분되지 않음 |
| 실제 휠 스크롤 차단 | CDP 합성 휠이 overflow 락을 우회한다. **대조군**(모달 없이 기존 JS 락만)도 똑같이 스크롤되어, 측정 방법 자체가 이 질문에 답할 수 없음이 확인됨 |
| 스피너 vs 모달 상하관계 | §2-4 참조 |

⚠️ 이 하네스에서는 **ref 기반 클릭과 JS 프로브만 신뢰할 수 있다.** 좌표 클릭·키 입력·휠은 페이지에 도달하지 않는다. 다음 Phase에서도 같은 제약을 전제할 것.

### Phase 1 — z-200 계층
- `ChecklistFormModal` — 전환 + `useUnsavedChangesGuard`의 capture-phase ESC 해킹 제거 + 자체 스크롤 락 제거
- `ReviewImageLightbox` — 전환 + 자체 ESC 리스너 제거
- ⚠️ `/checklist`는 진입 시 `ChecklistRedirectClient`가 폼을 자동으로 연다 → **VR 스냅샷 `checklist-tablet-768/1024/1199` 3장 영향 가능**. diff 나면 의도된 변경인지 확인 후 베이스라인 재생성

#### Phase 1 실측 결과 (2026-09-16, Chrome / localhost:3001)

**확인됨**

| 항목 | 결과 |
|---|---|
| ChecklistFormModal 렌더 | `:modal=true`, `aria-label="체크리스트 작성"` 유지 → E2E `checklist.spec.ts:179` 셀렉터 생존 |
| 데스크탑 레이아웃 | 카드 **908×610, 위치 (506,168)** — `md:max-w-[908px]`·`md:h-[610px]`에 정확히 일치하고 뷰포트(1920×945) 정중앙 |
| 배경 딤 | `::backdrop` = `rgba(0,0,0,0.5)` — 기존 `bg-black/50`과 일치 |
| 스크롤 락 | `body` computed `hidden`인데 **인라인 스타일은 빈 문자열** → JS가 아니라 CSS가 잠그고 있음 |
| **중첩 동작 (핵심)** | 체크리스트 폼 위에 AlertModal을 띄우면 dialog 2개가 동시에 열리고, **알림이 위에** 쌓인다(top layer 개봉 순서 실증) |
| **§1-4-2 버그 해소** | 알림만 닫은 뒤에도 `body` overflow가 `hidden` 유지 — 예전에는 ModalProvider cleanup이 `""`로 무조건 풀어 폼이 열린 채 배경이 스크롤됐다 |

**확인 못 함**

| 항목 | 왜 |
|---|---|
| 모바일 전체화면 레이아웃 | `resize_window`가 성공을 보고하면서도 뷰포트를 바꾸지 못한다(두 번 확인). `md:` 미만 분기는 미검증 — **사람이 실제 좁은 창에서 봐야 한다** |
| VR 스냅샷 `checklist-tablet-*` 3장 | 실행하지 않음. 데스크탑이 픽셀 단위로 일치했고 `md:` 클래스를 그대로 옮긴 것이라 통과 예상이지만 단정할 수 없다 |
| ESC 키 실제 닫힘 | Phase 0과 동일한 하네스 한계 |

### Phase 2 — custom-modals 14개 + Provider 정리
- 14개 파일 기계적 치환 (외곽 div + backdrop div → `ModalShell`)
- `ModalProvider`에서 ESC useEffect + 스크롤락 useEffect **삭제**
- 커밋은 3~4개로 쪼갬 (구독계열 / 결제·탈퇴계열 / 프로필·약관계열)

#### Phase 2 실측 결과 (2026-09-16, Chrome)

**확인됨**

| 항목 | 결과 |
|---|---|
| 변환 범위 | custom-modals 15개 파일 전부 ModalShell 사용. 구형 `fixed inset-0 z-[100]` 래퍼·backdrop div·`role="dialog"`·`aria-modal` 잔재 0건 |
| 배경 딤 | 커스텀 모달 `::backdrop` = `rgba(0,0,0,0.6)` — 기존 `bg-black/60`과 일치 |
| 접근성 이름 | 원래 `aria-label`이 없던 모달은 `null` 유지(이름을 새로 붙이지 않음), 있던 3개는 그대로 |
| **Provider 정리 후 스크롤 락** | ModalProvider의 JS 락을 지운 뒤에도 `body` computed `hidden` + 인라인 빈 문자열 → CSS 단독으로 동작 |
| 배경 클릭 | 닫힘 + 잠금 해제(`visible`) 확인 |
| **AccountInfoModal 뷰 전환** | `계정 정보` ↔ `비밀번호 변경` 전환 시 React가 같은 dialog 엘리먼트를 재사용해(`dialogCount: 1`) 열린 채 `aria-label`만 교체. 재마운트·깜빡임 없음 |

**주의해서 처리한 것**

- 카드 div의 `relative z-10`은 **건드리지 않았다.** `z-10`은 이제 불필요하지만 `relative`는 내부 `absolute` 자식(예: ChecklistDeferModal의 상단 이미지)이 의존하므로, 함께 지우면 레이아웃이 깨진다. 죽은 `z-10` 정리는 Phase 4로 미룬다.
- `TermsViewModal`의 `confirmBtnRef.current?.focus()`는 `data-autofocus`로 교체했다. 자식의 focus 이펙트는 ModalShell의 `showModal()`보다 **먼저** 실행돼 덮어씌워지기 때문이다. 같은 패턴이 다른 파일에 있으면 동일하게 처리할 것.

**확인 못 함**: 모바일 폭 레이아웃, ESC 키 실제 닫힘 (Phase 0·1과 동일한 하네스 한계)

### Phase 3 — 잔여 개별 모달 ✅ 구현 완료 (2026-09-17)
- `MyReviewModal`, `SupportSection`의 FAQ 상세, `InquiryDetailModal`, `OrderHistorySection`,
  `PackageNutritionGuide`를 모두 `ModalShell`로 전환했다.
- FAQ·문의·주문 상세의 기존 40% 딤을 보존하도록 `backdrop="light"`, 영양정보의 기존
  투명 배경을 보존하도록 `backdrop="none"` 옵션을 추가했다.
- FAQ·문의의 수동 body 스크롤 락과 ESC 전역 리스너를 제거했다. `MyReviewModal`은 ESC만
  `ModalShell`로 이관하고 기존 좌우 화살표 리뷰 탐색 리스너는 유지했다.
- 기존 접근성 이름이 있던 `MyReviewModal`·주문 상세는 `label`로 유지하고, 없던 FAQ·문의·
  영양정보에는 새 이름을 임의로 추가하지 않았다.

### Phase 4 — 정리 ✅ 구현 완료 (2026-09-17)
- 모달 스크롤 락은 `body:has(dialog:modal) { overflow: hidden; }` 한 곳으로 단일화했다.
  모달이 아닌 모바일 헤더 메뉴의 수동 락은 범위 밖이므로 유지했다.
- 마이그레이션된 카드 래퍼의 죽은 `z-10`만 제거하고, 내부 absolute 요소의 기준인
  `relative`와 카드 내부 요소 간 쌓임에 필요한 z-index는 유지했다.
- `CLAUDE.md`에 신규 모달은 `ModalShell`을 사용하고 수동 backdrop·ESC·스크롤 락을
  중복 구현하지 않는다는 필수 규칙을 추가했다.

### Phase 3·4 검증 (2026-09-17)

| 항목 | 결과 |
|---|---|
| `tsc --noEmit --incremental false` | 통과 |
| `pnpm lint` (저장소 전체) | 통과 |
| 잔여 수동 모달 래퍼 검색 | Phase 3 대상 및 기존 마이그레이션 범위에서 `fixed inset-0` 0건 |
| 잔여 수동 스크롤 락 검색 | 모달 범위에서 `document.body.style.overflow` 0건 |
| 잔여 카드 래퍼 `relative z-10` 검색 | 마이그레이션된 모달 카드에서 0건 |
| `pnpm build` | 통과 (Next.js 16.1.7, 47개 페이지 생성) |
| 관련 브라우저 E2E | `checklist`·`mypage`·`order`·`referral`·`inquiry` Chromium **88/88 통과** |
| Phase 3 타깃 브라우저 검증 | 임시 하네스로 5개 모달을 직접 열어 native `:modal`, CSS 스크롤 락, ESC, 배경 클릭, 40%·투명 backdrop, 리뷰 모바일 390×844 전체화면을 검증 — **5/5 통과** 후 하네스 제거 |

### 단계별 공통 검증
`npx tsc --noEmit` → `pnpm lint` → 관련 E2E(`checklist` `mypage` `order` `referral` `inquiry`) → Phase 1·2는 VR 태블릿까지

---

## 4. 리스크

| 리스크 | 대응 |
|---|---|
| top-layer가 z-index를 무시해 혼재 구간 상하 역전 | **z 내림차순 순서 고정** (2-3) |
| `LoadingOverlay`(9999)가 top layer 모달 아래로 내려감 | §2-4 — Phase 0에서 `popover="manual"`로 동시 전환 |
| `<dialog>` UA 기본 스타일(margin auto, padding 1em, border, white bg) 미리셋 시 레이아웃 붕괴 | `globals.css` 리셋을 Phase 0에 선투입 |
| `::backdrop` 상속 규칙 | 리터럴 색 사용, CSS 변수 쓸 거면 `:root` 정의분만 |
| VR 베이스라인 재생성 | checklist 3장만 영향 예상, Phase 1에서 확인 |
| E2E 셀렉터 파손 | 네이티브 dialog도 role=dialog + aria-label 유지 → 생존 예상, Phase 0에서 선검증 |
| 브라우저 지원 | **문제 없음** — Tailwind v4가 이미 Safari 16.4+를 요구, `<dialog>`는 Safari 15.4+ |
| 진입/퇴장 애니메이션 | **해당 없음** — 현재 모달에 enter/exit 애니메이션이 없다(`animate-float`는 내부 장식 요소). `@starting-style` 복잡도 회피 |

## 5. 규모

신규 1 · 수정 약 24개 파일 (custom-modals 14, AlertModal 1, LoadingOverlay 1, Provider 1, 개별 모달 5, guard 훅 1, globals.css 1)
Phase 0은 4파일(ModalShell 신규 + globals.css + AlertModal + LoadingOverlay). 각 Phase 독립 커밋·독립 롤백 가능.
