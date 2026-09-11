# checklist-result 시각회귀 상시 실패 해소 — 실행 지시

작성일: 2026-09-11
브랜치: `refactor/register-section`
선행 문서: `.claude/contexts/e2e-review-2026-09-10.md` (원인 조사·기각 가설 기록)
대상 모델: Sonnet 5 (실행 전용). 아래 범위를 벗어나는 판단이 필요해지면 **중단하고 보고**한다.

---

## 배경 (한 줄)

`/checklist/result`의 상품 이미지가 Playwright `fullPage`(captureBeyondViewport) 캡처에서만
백지/흐림/선명으로 갈린다. **뷰포트 캡처(`fullPage: false`)로는 항상 선명하게 찍힌다**는 사실이
2026-09-10 조사로 확인됐다. 그 성질을 이용해 이 라우트만 뷰포트 캡처로 전환한다.

현재 상태: `checklist-result` tablet-1024·1199 = 상시 실패, tablet-768 = 백지 baseline으로 거짓 통과.

## 결정 사항 (이미 확정됨 — 재검토 대상 아님)

- `checklist-result` 라우트만 뷰포트 캡처로 전환한다. 다른 라우트는 `fullPage: true` 유지.
- 접힌 화면 아래 커버리지 상실은 **의도적으로 수용**한다. 상시 실패를 안고 가는 것보다 낫다.
- 1024·1199를 옛(틀린) baseline으로 되돌리는 안은 **채택하지 않는다**. 거짓 녹색이기 때문.
- `captureBeyondViewport` 래스터 문제의 원인 규명은 이번 범위가 **아니다**. 별도 과제로 남긴다.

---

## 작업 단계

### 1. 스펙 수정 — `tests/e2e/visual-regression-tablet-auth.spec.ts`

`AUTH_ROUTES` 항목 타입에 `fullPage?: boolean`을 추가하고, `checklist-result`에만 `false`를 준다.
캡처 호출부는 `fullPage: route.fullPage ?? true`로 바꾼다.

`checklist-result` 위에 달린 기존 ⚠️ 주석 블록은 **지우지 말고 갱신**한다. 갱신 시 남겨야 할 내용:

- 뷰포트 캡처를 쓰는 이유 (fullPage 래스터 단계에서 상품 이미지가 안 그려짐, 2026-09-10 조사)
- 접힌 화면 아래는 이 테스트가 커버하지 않는다는 사실
- 기각된 가설 3종과 원인 미규명 상태라는 점 (`.claude/contexts/e2e-review-2026-09-10.md` 참조)

`waitForStableRender` / `loadLazyImages` / `freezeVideos`는 **건드리지 않는다**.
뷰포트 캡처로 바뀌어도 이 준비 과정은 그대로 필요하다.

### 2. baseline 후보 생성

3개 프로젝트(tablet-768 / 1024 / 1199)의 `checklist-result`만 대상으로 스냅샷을 갱신한다.

```
pnpm exec playwright test tests/e2e/visual-regression-tablet-auth.spec.ts \
  --project=tablet-768 --project=tablet-1024 --project=tablet-1199 \
  -g "checklist-result" --update-snapshots
```

### 3. 채택 게이트 — 두 조건을 **모두** 통과해야 한다

**게이트 A · 결정성:** 갱신 없이 동일 명령을 **3회 연속** 실행해 3회 모두 통과해야 한다
(`maxDiffPixelRatio` 기본값 0 유지, 허용치를 올려서 통과시키지 말 것).

```
pnpm exec playwright test tests/e2e/visual-regression-tablet-auth.spec.ts \
  --project=tablet-768 --project=tablet-1024 --project=tablet-1199 -g "checklist-result"
```

**게이트 B · 백지 아님:** 생성된 3장을 Read로 직접 열어 **스탠다드 패키지 대표 이미지가 실제로
그려져 있는지** 눈으로 확인한다.

> ⚠️ 게이트 B를 생략하면 안 된다. tablet-768의 기존 백지 baseline은 13회 연속 완전히 동일했다 —
> 즉 **결정적이면서 동시에 틀린** 상태였다. 게이트 A만으로는 그런 baseline을 다시 못 걸러낸다.

**둘 중 하나라도 실패하면:** baseline 3장과 스펙 수정을 모두 되돌리고 중단한다. 통과할 때까지
반복 시도하거나 허용치를 조정하지 말 것.

```
git checkout HEAD -- tests/e2e/visual-regression-tablet-auth.spec.ts-snapshots/checklist-result-tablet-768-win32.png
git checkout HEAD -- tests/e2e/visual-regression-tablet-auth.spec.ts-snapshots/checklist-result-tablet-1024-win32.png
git checkout HEAD -- tests/e2e/visual-regression-tablet-auth.spec.ts-snapshots/checklist-result-tablet-1199-win32.png
```

(주의: 1024·1199는 현재 워킹트리에서 이미 수정된 상태다. 위 명령은 9/10 리뷰에서 교체한 "선명한
정착 화면" 버전을 버리고 커밋된 옛 버전으로 되돌린다. 중단 보고 시 이 사실을 명시할 것.)

### 4. 검증

1. `pnpm exec tsc --noEmit`
2. `pnpm lint`
3. 태블릿 인증 스펙 전체 1회 — 다른 라우트에 영향이 없는지 확인
4. e2e 전체 스위트 1회 — 기대치는 **215 통과 / 0 실패**

전체 스위트 결과가 215/0이 아니면, 남은 실패가 이번 변경 때문인지
`.claude/contexts/e2e-known-flakes` 계열의 기존 알려진 건인지 구분해서 보고한다.

### 5. 보고

커밋은 하지 않는다. 아래를 보고하고 사용자 지시를 기다린다.

- 게이트 A 3회 실행 결과 (통과/실패 각각)
- 게이트 B 육안 확인 결과 (3장 각각 이미지가 그려졌는지)
- 전체 스위트 최종 수치
- baseline 3장의 변경 전후 성격 요약

---

## 하지 말 것

- 제품 코드 수정 — 이번 작업은 `tests/` 이하로 끝난다.
- 9/10에 이미 기각된 가설 재시도: (1) 캡처 직전 강제 리페인트(body transform + double rAF),
  (2) 버려지는 뷰포트 예열 캡처, (3) `PlanPicker` `crossfadeStyle`의 no-op `blur(0px)` 제거.
- `maxDiffPixelRatio`를 올려서 실패를 흡수하기.
- `checklist-result` 외 다른 baseline 파일 갱신. 워킹트리에 이미 있는 다른 미커밋 변경분도
  건드리지 말 것(9/10 리뷰 산출물이다).
- `.next` 삭제, 임의 `pnpm build`, 포트 3000의 dev 서버 종료·재시작.
  Playwright는 포트 3001을 쓰며 `reuseExistingServer`가 켜져 있다. 3001이 안 떠 있으면
  webServer가 스스로 `pnpm build && pnpm start`를 돌린다(최대 5분) — 이건 정상 경로다.
