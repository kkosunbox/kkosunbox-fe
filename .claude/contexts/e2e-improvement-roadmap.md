# E2E 테스트 개선 로드맵

> 작성: 2026-06-29 · 근거: Playwright E2E 정밀 평가 리포트(66/100, "구조 개선 권장") + 외부 AI(ChatGPT) 교차 검토 로그
> 관련 문서: [[e2e-test-status.md]](실패 분석), [[visual-regression-testing.md]](시각 회귀 전략)

## 0. 핵심 전제 (의사결정 기록)

이 프로젝트는 **1인(솔로) 개발**이며, 기능 개발이 거의 마무리 단계다.
따라서 리포트의 모든 지적을 지금 해결하지 않는다. **사용자 가치·운영 안정성에 영향이 큰 순서**로만 처리한다.

**확정 결정:**
- ✅ **CI에서 E2E 자동 실행은 PG(결제대행) 연동 이후로 미룬다.**
  - 이유: PG가 붙으면 주문/결제 흐름이 크게 바뀌어 테스트가 함께 수정된다. CI를 먼저 붙이면 Workflow·Secret·테스트를 두 번 손봐야 함. **CI에 올리는 순간의 테스트가 최종 형태에 가깝도록** 순서를 잡는다.
  - 전제: CI에 안 올리는 대신 **로컬에서 꾸준히 `pnpm test`를 돌린다.**
- ⚠️ 단, **"CI를 안 만드는 것"과 "CI를 만들기 어렵게 두는 것"은 다르다.**
  - 전자는 일정 판단, 후자는 기술 부채.
  - 그래서 지금부터 **CI-ready 구조**(명령 한 줄로 전체 E2E 실행)는 유지한다. → Phase 1에 포함.

## 1. 리포트가 말한 "66점"의 의미

"코드 품질이 낮다"가 아니라 **"품질을 자동으로 지켜주는 운영 체계가 미완성"**이라는 뜻.
한 줄 요약: **"잘 만든 엔진을 차에 아직 연결하지 않은 상태."**

- 잘 된 것: mock API 서버 + 런타임 에러 주입, role 기반 셀렉터, 비즈니스 매트릭스(레퍼럴 4-모드, 할인 합산), 회귀 테스트, 이중 로그인 전략.
- 미흡한 것: ① E2E가 CI에 없음 ② Error Boundary 11개가 어서션 없는 스크린샷 ③ 구매 완료 미검증 ④ networkidle/자기모순 테스트.

---

## 2. 우선순위 매트릭스

| 순위 | 항목 | 영향도 | 비용 | 처리 시점 |
|---|---|---|---|---|
| ⭐⭐⭐⭐⭐ | PG 연동 후 **구매 완료 E2E** (subscription 생성 + payload 검증) | 매우 큼 | 중 | Phase 2 |
| ⭐⭐⭐⭐⭐ | **CI에서 E2E 자동 실행** (GitHub Actions) | 매우 큼 | 낮 | **Phase 3 (PG 이후)** |
| ⭐⭐⭐⭐☆ | Error Boundary → `toHaveScreenshot` 시각 회귀 전환 | 큼 | 중 | Phase 4 |
| ⭐⭐⭐☆☆ | `networkidle` 제거 | 중 | 낮 | Phase 1 |
| ⭐⭐⭐☆☆ | 로그인 중복 제거 (`login()` 헬퍼로 통일) | 중 | 낮 | Phase 1 |
| ⭐⭐⭐☆☆ | 자기모순 테스트 정리 (referral `referralLink=null`) | 중 | 낮 | Phase 1 |
| ⭐⭐☆☆☆ | Page Object 도입 | 상황 의존 | 중 | **보류** (필요해지면) |
| ⭐☆☆☆☆ | `fullyParallel` 병렬화 | 작음(현재) | 큼 | **보류** (테스트 200~300개 시점) |

---

## 3. 단계별 실행 계획

### Phase 1 — 지금 (싸고 리스크 낮은 것만)

목표: PG가 흔들기 전에, **건드려도 안전한 정리**만 끝낸다.

- [x] **1-1. `networkidle` 제거** — 완료(2026-06-29)
  - `error-boundaries.spec.ts`의 `waitForLoadState("networkidle")` 20곳 전부 제거 → 페이지별 종착 상태 기반 결정적 대기로 교체. 죽은 헬퍼 `goAndSettle` 삭제. 11/11 통과.
  - 이유: Playwright 공식 비권장 방식, flaky 유발.
- [ ] **1-2. 로그인 중복 제거**
  - 대상: `login.spec.ts` 내 반복되는 폼 fill 3줄, `mypage.spec.ts:98`, `checklist.spec.ts:160`.
  - 방법: 이미 있는 `auth.ts`의 `login()` / `loginAndGoTo()`로 통일. (인증 플로우 *자체*를 검증하는 `login.spec.ts`의 일부는 의도적으로 직접 조작 — 그건 유지.)
- [ ] **1-3. 자기모순 테스트 정리**
  - 대상: `referral.spec.ts:161` "referralLink=null일 때 → 초대링크 행 미표시".
  - 문제: 주석에서 재현 불가를 인정하고 무관한 리다이렉트로 대체 검증 → 이름과 내용 불일치.
  - 방법: mock에 `slug:null`인 인플루언서 응답 분기를 추가해 **제대로 재현**하거나, 검증 불가하면 삭제.
- [x] **1-4. CI-ready 구조만 미리 갖추기** (CI 자체는 안 만듦) — 완료(2026-06-29)
  - `package.json`에 `"test:e2e"`(CI 호출 의도 명시) + `"test:e2e:update"`(VR baseline 생성) 추가.
  - 목표 상태: 나중에 GitHub Actions가 `pnpm install → playwright install → pnpm build → pnpm test:e2e` **명령만 호출**하면 되도록 둠.
  - 새 워크플로우 파일은 만들지 않음(Phase 3).

> Phase 1은 "테스트가 더 정확해지고 덜 흔들리게" 만드는 작업이지 새 커버리지 추가가 아니다.

### Phase 2 — PG 연동 전후 (가장 중요한 구간)

목표: **매출 전환(구매 완료)을 자동으로 보장**한다. 현재 가장 큰 공백.

- [ ] **2-1. PG(Toss) 연동** — 기능 작업.
- [ ] **2-2. 구매 완료 E2E 작성** ⭐
  - 현재: `order.spec.ts`는 할인 계산·"결제하기" 버튼 활성화까지만 검증하고 멈춤.
  - 추가할 흐름:
    ```
    결제하기 클릭 → PG SDK(mock) → 결제 승인 → POST /v1/subscriptions 호출 → 성공 페이지
    ```
  - 핵심 단언: `POST /v1/subscriptions`가 **올바른 payload**(planId, couponCode, referralCode)로 호출되는지 검증.
    - mock 서버(`mockApiServer.ts:429`)는 이미 엔드포인트를 받지만 **응답을 무시**하고 어떤 테스트도 호출/payload를 확인하지 않음 → 여기를 메운다.
  - PG SDK는 외부이므로 mock/route stub 처리. ([[subscription-api.md]] 참고)
- [ ] **2-3. (함께) 기존 order 테스트의 PG 변경분 반영.**

### Phase 3 — PG 이후 (CI 연결)

목표: 거의 최종 형태가 된 테스트를 **자동 품질 게이트**로 만든다.

- [ ] **3-1. E2E 안정화** — Phase 2 변경으로 깨진 spec 정리, 그린 베이스라인 확보. ([[e2e-test-status.md]]의 분류 A/B 잔여분 해소)
- [ ] **3-2. `.github/workflows/playwright.yml` 추가** ⭐
  - 현재 워크플로우는 `depcruise.yml` 단 1개. Playwright를 돌리는 CI가 없음.
  - 동작: PR/push 시 `checkout → setup-node + pnpm → install → playwright install → pnpm build → pnpm test:e2e`. 실패 시 PR 빨간불 → merge 차단.
  - config(`playwright.config.ts`)의 `forbidOnly`/`retries:2`/`reporter:"github"` CI 분기는 **이때 비로소 실제로 동작**한다(현재는 죽은 설정).
  - 실패 산출물: `trace`는 이미 `on-first-retry`. screenshot/video on-failure 추가 검토.

> "CI 연동 = 거창한 것"이 아니라 **"push하면 Playwright가 자동 실행되게 만드는 것"**. 사람이 "아 맞다 테스트 안 돌렸네"를 막는 장치.

### Phase 4 — 배포 후 / 성장기

목표: 신호 정확도와 확장성. 급하지 않음.

- [x] **4-1. Error Boundary 테스트 개선** ⭐ — 완료(2026-06-29)
  - `snap()`(수동 파일 저장) → `expect(page).toHaveScreenshot()`(baseline 자동 비교)로 전환. `animations:"disabled"`, 폰트 로드 대기, `maxDiffPixelRatio:0.01`. baseline은 `tests/e2e/error-boundaries.spec.ts-snapshots/`에 커밋(플랫폼 suffix `-chromium-win32`).
  - **중대 발견**: 어서션을 추가하니 "에러 폴백이 안 뜬다"가 드러남. 마이페이지 카드 로더의 모든 서버 쿼리(fetchBillingInfo/fetchActiveSubscription/fetchSubscriptions/fetchEligiblePlans/fetchMyReviews/fetchInquiries/fetchDeliveryAddresses)가 `.catch()`로 500을 흡수 → API 실패 시 **에러 바운더리가 발동하지 않고 graceful degradation(빈 상태)** 으로 떨어진다. 게다가 mock `/v1/billing`은 평소에도 빈 배열이라 01은 baseline과 사실상 동일. subscribe/order도 plans·billing의 `.catch`로 error.tsx 미발동(07=빈 플랜, 09=리다이렉트, 10=정상 렌더).
  - 따라서 테스트를 **"graceful degradation 시각회귀"로 재정의**: 강등/격리(무관 카드 정상)/미크래시를 기능 단정 + toHaveScreenshot로 고정. 제품 로직은 미변경(관찰만). 기존 11개는 사실상 무의미했음(어서션 0개라 아무도 몰랐던 "가짜 커버리지" — 리포트 지적이 코드로 확정됨).
  - 남은 후속(별도 작업): ① 진짜 에러 폴백을 검증하려면 쿼리 `.catch` 정책 재검토(제품 결정 필요) ② 모바일 뷰포트 project 추가는 전체 spec에 영향 → 보류. ([[visual-regression-testing.md]])
- [ ] **4-2. (필요 시) Page Object 일부 도입** — 아래 "보류" 참고.

---

## 4. 의도적으로 "보류"하는 것 (지금 하지 않는 결정)

> 성숙 단계의 핵심은 "무엇을 더 할까"보다 **"무엇을 지금 안 할까"**. 아래는 *나중에*가 정답.

- **Page Object 전면 도입 — 보류.**
  - Page Object는 "좋다"가 아니라 **"필요할 때 좋다"**. spec 7 + helper 3 규모에선 fixture/helper로 충분.
  - 과설계 위험(PageObject → Base → Section → Component → Fixture …). `.first()/.last()` 분기가 정말 아파질 때, **아픈 페이지부터** 가볍게 도입.
- **`fullyParallel` 병렬화 — 보류.**
  - 현재 `workers:1`은 게으름이 아니라 **mock의 전역 가변 상태(`failingPaths`)** 때문(병렬 시 에러 주입 오염). 구조를 바꿔야 풀 수 있는 큰 작업.
  - 테스트가 100 → 300 → 500개로 늘어 **CI 시간이 실제로 아파질 때** 고민. 그때 mock 요청별 격리 + sharding을 함께.

---

## 5. 한눈에 보는 순서

```
[Phase 1: 지금]
  networkidle 제거 → 로그인 중복 제거 → 자기모순 테스트 정리 → CI-ready 스크립트
        ↓
[Phase 2: PG 전후]
  PG 연동 → 구매 완료 E2E(payload 검증)  ← 가장 중요
        ↓
[Phase 3: PG 이후]
  E2E 안정화 → GitHub Actions에 Playwright 연결  ← 자동 품질 게이트
        ↓
[Phase 4: 배포 후/성장기]
  Error Boundary → toHaveScreenshot 시각회귀 → (필요시) Page Object 일부
        ↓
[보류]
  Page Object 전면 도입 · fullyParallel 병렬화 (프로젝트가 더 커질 때)
```

**가장 중요한 이정표: PG 연동 후 "구매 완료 E2E"가 안정적으로 통과하는 상태.**
그 시점에 테스트 스위트가 거의 최종 형태가 되므로, 그때 CI(Phase 3)를 붙이는 것이 가장 자연스럽고 효율적이다.
