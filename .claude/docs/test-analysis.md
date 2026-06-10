# 테스트 코드 현황 분석 및 개선 로드맵

> 작성일: 2026-06-09

---

## 현황 요약

| 항목 | 상태 |
|---|---|
| E2E 테스트 (Playwright) | ✅ 45개 케이스, 912줄 |
| 단위 테스트 (Vitest/Jest) | ❌ 미도입 |
| 통합 테스트 | ❌ 없음 |
| 컴포넌트 테스트 | ❌ 없음 |
| CI 자동 실행 | ❓ 확인 필요 |
| 커버리지 리포트 | ❌ 없음 |

테스트 파일은 `tests/e2e/` 5개뿐이며 소스 코드 281개 파일 대비 단위 테스트 커버리지는 **0%**.

---

## 테스트를 잘 안 쓰게 되는 원인 분석

### 1. 피드백 루프가 너무 느리다

`playwright.config.ts`가 `pnpm build`(프로덕션 빌드)를 완료한 뒤 테스트를 실행하도록 되어 있다.
코드 한 줄 바꾸고 테스트 하나 돌리는 데 1–2분이 걸리면 개발 중 습관적으로 실행하기 어렵다.

### 2. 단위 테스트 인프라 자체가 없다

Vitest/Jest가 없으니 `shared/lib/api/token.ts`, `errorMessages.ts` 같은 순수 유틸 함수조차 테스트할 환경이 없다.
테스트를 추가하고 싶어도 "어디에 어떻게" 써야 하는지 진입점이 불분명하다.

### 3. 새 기능에 테스트를 추가하려면 Mock API도 같이 건드려야 한다

E2E 테스트를 새로 쓰려면 `tests/helpers/mockApiServer.ts`에 엔드포인트를 추가해야 한다.
현재 12개 엔드포인트만 스터빙 되어 있어, 커버되지 않는 페이지의 테스트는 시작하기 전부터 막힌다.

### 4. 테스트가 소스 파일과 멀리 떨어져 있다

모든 테스트가 `tests/e2e/` 한 곳에만 있다.
`features/auth/lib/session.ts`를 수정할 때 관련 테스트가 옆에 없으니 테스트를 챙겨야 한다는 신호 자체를 받지 못한다.

### 5. CI 파이프라인에 통합되어 있지 않은 것으로 추정

자동으로 실패 알림을 받지 않으면 수동으로 잊게 된다.
PR 시점에 테스트가 돌지 않으면 점점 테스트는 "가끔 돌리는 것"이 된다.

### 6. 커버리지 시각화가 없다

어떤 코드가 테스트되고 있는지 볼 수 없으니 기여 동기가 낮다.
새 코드를 짜도 "이미 충분히 테스트됐겠지"라고 착각하기 쉽다.

### 7. 구독·결제처럼 복잡한 흐름이 E2E 한 파일에 다 몰려 있다

`mypage.spec.ts` 하나에 비밀번호 변경, 애견 프로필, 구독 변경이 섞여 있다.
파일이 커질수록 어떤 케이스가 이미 있는지 파악하기 어렵고, 추가하기도 꺼려진다.

---

## 개선 로드맵

### 시급 과제 (1–2주 내)

> "지금 당장 테스트를 추가하려 해도 가로막히는 구조적 문제" 해소

#### T-1. Vitest 도입 및 첫 단위 테스트 작성

단위 테스트 인프라가 아예 없는 게 가장 근본적인 문제다.

```
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- `vitest.config.ts` 생성 (jsdom 환경, path alias 등록)
- `package.json`에 `"test:unit": "vitest"` 스크립트 추가
- 첫 테스트 대상: `shared/lib/api/errorMessages.ts`, `shared/lib/api/token.ts`
  - 순수 함수라 Mock 없이 바로 작성 가능
  - 에러 메시지 매핑, 토큰 저장/로드 로직 검증

#### T-2. E2E 테스트를 dev 빌드에서도 실행할 수 있도록 설정 분리

`playwright.config.ts`에 빌드 모드를 환경변수로 분기한다.

```ts
// playwright.config.ts
webServer: {
  command: process.env.CI ? 'pnpm start' : 'pnpm dev',
  port: process.env.CI ? 3001 : 3000,
}
```

- 로컬 개발 중: `pnpm dev` + `playwright test` → 즉시 실행
- CI: 프로덕션 빌드 유지

#### T-3. Mock API 엔드포인트 확장 (기존 테스트 누락분)

현재 Mock API 12개 엔드포인트로 커버 안 되는 주요 흐름:

| 미커버 기능 | 필요 엔드포인트 |
|---|---|
| 결제수단 관리 | `GET /billing`, `POST /billing`, `DELETE /billing/:id` |
| 배송지 관리 | `GET /addresses`, `POST /addresses` |
| 구독 취소/일시정지 | `POST /subscriptions/:id/cancel`, `POST /subscriptions/:id/pause` |
| 회원 탈퇴 | `DELETE /users/me` |

---

### 중기 과제 (1–2개월 내)

> "테스트가 개발 흐름에 자연스럽게 녹아드는" 환경 구축

#### M-1. 핵심 비즈니스 로직 단위 테스트 작성

우선순위 순:

1. **`features/auth/lib/`** — 세션 로직, 토큰 갱신, OAuth 처리
2. **`shared/lib/api/client.ts`** — API 에러 파싱, 401 처리
3. **`features/subscription/`** — 구독 상태 계산, 플랜 변경 가능 여부 판별
4. **`features/order/`** — 쿠폰 적용, 금액 계산

각 `features/*/` 폴더 안에 `__tests__/` 서브디렉토리를 두어 소스와 테스트를 가까이 위치시킨다.

#### M-2. 컴포넌트 단위 테스트 도입 (Testing Library)

UI 회귀가 잦은 컴포넌트부터:

1. `shared/ui/Button.tsx` — variant, disabled, loading 상태
2. `shared/ui/custom-modals/` — 모달 열기/닫기, 콜백 호출
3. `widgets/header/` — 로그인/비로그인 상태별 렌더링

#### M-3. CI 파이프라인에 테스트 통합

GitHub Actions 기준:

```yaml
# .github/workflows/test.yml
- name: Unit tests
  run: pnpm test:unit

- name: E2E tests
  run: pnpm build && pnpm test
```

PR 머지 전 단위 테스트 통과를 필수 조건으로 설정.

#### M-4. E2E 테스트 파일 도메인별 분리

현재 `mypage.spec.ts` 한 파일에 여러 도메인이 혼재한다.

```
tests/e2e/
├── auth/
│   ├── login.spec.ts        (기존)
│   └── session.spec.ts      (신규 분리)
├── subscription/
│   ├── subscribe.spec.ts    (기존)
│   ├── change.spec.ts       (분리)
│   └── cancel.spec.ts       (신규)
├── order/
│   └── order.spec.ts        (기존)
├── mypage/
│   ├── profile.spec.ts      (분리)
│   ├── password.spec.ts     (분리)
│   └── billing.spec.ts      (신규)
└── checklist/
    └── checklist.spec.ts    (기존)
```

---

### 장기 과제 (3개월~)

> "테스트가 없으면 불안한" 문화와 기반 정착

#### L-1. 커버리지 리포트 및 임계값 설정

```ts
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  thresholds: {
    lines: 60,      // 초기 목표
    functions: 60,
  }
}
```

- `pnpm test:coverage` 스크립트 추가
- CI에서 임계값 미달 시 빌드 실패 처리

#### L-2. 새 기능 테스트 작성 가이드 문서화

`.claude/contexts/testing-guide.md` 작성:

- 단위 테스트 대상 판별 기준 (순수 함수 vs 사이드 이펙트)
- Mock 작성 패턴 (API 클라이언트 모킹, 서버 액션 모킹)
- E2E vs 단위 테스트 선택 기준
- 새 Mock API 엔드포인트 추가 절차

#### L-3. 불안정한 E2E 테스트 안정화

현재 E2E 테스트에 잠재적 플레이크 원인이 있다:

- `page.waitForTimeout()` 하드코딩 → `page.waitForSelector()` / `expect().toBeVisible()` 교체
- 네트워크 타이밍 의존 케이스 → `route.fulfill()` 방식으로 완전 격리
- 실패 시 스크린샷/비디오 자동 저장 설정 (`playwright.config.ts` `screenshot: 'only-on-failure'`)

#### L-4. MSW(Mock Service Worker) 도입 검토

현재 커스텀 Mock API 서버(`mockApiServer.ts`)를 MSW로 교체하면:

- 단위 테스트 / 컴포넌트 테스트 / E2E 테스트가 동일한 핸들러를 공유
- Mock 엔드포인트 확장이 훨씬 간단해짐
- 스토리북 연동 시에도 재사용 가능

---

## 우선순위 요약

```
[즉시] T-1. Vitest 도입 + 첫 단위 테스트
[즉시] T-2. E2E dev 빌드 분기 (빠른 로컬 실행)
[즉시] T-3. Mock API 엔드포인트 확장

[1–2개월] M-1. 핵심 비즈니스 로직 단위 테스트
[1–2개월] M-2. 주요 컴포넌트 단위 테스트
[1–2개월] M-3. CI 파이프라인 통합
[1–2개월] M-4. E2E 파일 도메인별 분리

[3개월~] L-1. 커버리지 리포트 + 임계값
[3개월~] L-2. 테스트 작성 가이드 문서
[3개월~] L-3. E2E 플레이크 안정화
[3개월~] L-4. MSW 도입 검토
```
