# 태스크: P3-c — dependency-cruiser CI 파이프라인 추가

> **진행 상태**: 미착수  
> **위험도**: 낮음  
> **권장 순서**: P3 **1번** (P3-d/b 작업의 회귀 방지용 인프라)  
> **선행 완료**: P0–P2, **P3-a 완료 (2026-06-12)**

## 목적

FSD 레이어 위반(`features → widgets` 등)이 **재발하지 않도록** `pnpm depcruise`를 CI에서 자동 실행한다.

P0–P2에서 수동으로 추가한 [`.dependency-cruiser.cjs`](../../.dependency-cruiser.cjs) 규칙을 파이프라인에 연결하는 작업이다. **애플리케이션 동작·UI 변경 없음.**

## 배경

| 항목 | 현황 |
|------|------|
| depcruise 설정 | [`.dependency-cruiser.cjs`](../../.dependency-cruiser.cjs) — **error 7규칙**, warn 4규칙 (P3-a에서 3건 추가·승격) |
| npm script | [`package.json`](../../package.json) — `"depcruise": "depcruise app widgets features entities shared --config .dependency-cruiser.cjs"` |
| CI | `.github/` **없음** — 워크플로 신규 생성 필요 |
| 로컬 기준선 | `pnpm depcruise` → **0 errors**, 4 warnings (2026-06-12 P3-a 후) |

### error 규칙 (CI 실패 대상) — 현재 7건

- `no-features-to-widgets`
- `no-entities-to-widgets`
- `no-shared-to-widgets`
- `no-widgets-to-app`
- `no-entities-to-features` ← P3-a 추가
- `package-plans-is-leaf` ← P3-a 추가
- `widget-mypage-subscribe-coupling` ← P3-a에서 warn→error 승격, 0 violations 확인

### warn 규칙 (초기에는 통과 허용) — 현재 4건

- `widget-order-subscribe-coupling`
- `widget-forgot-password-register-coupling`
- `widget-inquiry-support-coupling`
- `widget-subscribe-support-coupling`

---

## 대상 파일

| 파일 | 작업 |
|------|------|
| `.github/workflows/depcruise.yml` | **신규** — PR/push 시 depcruise 실행 |
| [`.dependency-cruiser.cjs`](../../.dependency-cruiser.cjs) | 필요 시 주석·규칙 설명만 보강 (동작 변경 최소) |
| [`package.json`](../../package.json) | 선택: `depcruise:ci` alias 추가 |

---

## 구체적인 변경 사항

### 1단계. GitHub Actions 워크플로 생성

`.github/workflows/depcruise.yml` 예시:

```yaml
name: Dependency Cruiser

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  depcruise:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm depcruise
```

> 저장소 기본 브랜치명(`main` vs `master`) 확인 후 `branches` 수정.

### 2단계. warn 처리 정책 결정

**권장(초기):** warn은 CI 통과. error만 fail.

- dependency-cruiser는 기본적으로 `severity: error`만 exit code 1.
- warn 5건은 P3-a 완료 후 점진적으로 error 승격 검토.

**선택(엄격):** `--no-config-follow` 없이 warn도 fail하려면 규칙 severity를 `error`로 올리거나 별도 스크립트로 warn 카운트 검사. **P3-c 범위 밖** — 별도 태스크.

### 3단계. (선택) package.json 스크립트

```json
"depcruise:ci": "depcruise app widgets features entities shared --config .dependency-cruiser.cjs --output-type err"
```

워크플로에서 `pnpm depcruise:ci` 사용 가능.

---

## 주의 사항

- **warn 4건은 현재 유효한 커플링** — error 승격 전에 각 커플링 제거 작업(P3-b 등) 선행 필요.
- `pnpm install` 시 lockfile 동기화 필수. `--frozen-lockfile`로 CI 재현성 확보.
- depcruise는 TypeScript path alias(`@/*`)를 [`tsconfig.json`](../../tsconfig.json) 기준으로 해석함 — 설정 이미 존재.
- 이 태스크는 **코드 리팩터 없음**. 워크플로 파일만 추가.

---

## 검증

1. 로컬: `pnpm depcruise` → exit code 0, errors 0
2. PR 생성 후 GitHub Actions `Dependency Cruiser` job green
3. (선택) 의도적 위반 스크래치 브랜치에서 error 규칙이 CI를 fail시키는지 확인 후 폐기

```bash
pnpm depcruise
npx tsc --noEmit
```

---

## 완료 기준

- [ ] `.github/workflows/depcruise.yml` (또는 동등 CI) 존재
- [ ] main/PR push 시 `pnpm depcruise` 자동 실행
- [ ] error 규칙 위반 시 CI fail
- [ ] 로컬·CI 모두 0 errors

---

## 롤백

워크플로 파일 삭제만으로 롤백. 앱 코드 변경 없음.

---

## 관련 태스크

| 태스크 | 관계 |
|--------|------|
| [widgets-p3d-deprecated-cleanup.md](widgets-p3d-deprecated-cleanup.md) | 다음 권장 |
| [widgets-p3b-order-section-split.md](widgets-p3b-order-section-split.md) | 완료 후 `widget-order-subscribe-coupling` warn 제거 검토 |
