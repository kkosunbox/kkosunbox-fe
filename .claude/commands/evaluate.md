스프린트 계약(`{slug}-contract.md`)을 읽고 Playwright MCP로 실행 중인 앱을 테스트하여
`.claude/sprints/{slug}-eval.md` 평가 결과 파일을 생성한다.

## 사용법

```
/evaluate {slug}                          # 평가 결과 파일만 생성
/evaluate {slug} --next-sprint            # 평가 결과 + 다음 sprint contract 초안
/evaluate {slug} --update-tasks           # 평가 결과 + task 우선순위 재정렬
/evaluate {slug} --next-sprint --update-tasks   # 세 가지 모두
```

## 사전 조건

- `.claude/sprints/{slug}-contract.md` 가 존재해야 한다
- 계약 파일의 상태가 `승인됨` 이어야 한다 (`협의중` 이면 경고 후 계속 진행)
- 개발 서버(`pnpm dev`)가 `http://localhost:3000`에서 실행 중이어야 한다

## 절차

### 1단계 — 계약 파일 읽기
- `.claude/sprints/{slug}-contract.md` 를 읽는다
- 완료 기준 목록과 평가 기준·기준치를 추출한다

### 2단계 — 빌드·린트 검증
```bash
pnpm build
pnpm lint
```
결과를 기록한다 (통과/실패, 오류 메시지 포함).

### 3단계 — Playwright MCP로 UI 테스트
완료 기준의 각 항목을 순서대로 실행한다.

```
// 각 완료 기준 항목에 대해:
1. playwright_navigate → 대상 URL 접속
2. playwright_screenshot → 초기 상태 캡처
3. 항목에 명시된 인터랙션 수행 (click / fill / 등)
4. playwright_screenshot → 결과 상태 캡처
5. 결과 평가: 통과 ✅ / 실패 ❌ / 부분 통과 ⚠️
```

각 테스트 결과에 발견된 버그와 실제 vs 기대 동작을 기록한다.

### 4단계 — 평가 기준 채점
계약의 평가 기준표를 기반으로 각 항목을 채점한다.

| 기준 | 채점 방법 |
|---|---|
| 기능성 | 완료 기준 통과 항목 수 / 전체 항목 수 × 100 |
| 제품 완성도 | 구현 범위 체크리스트 완료율 |
| 시각 디자인 | `/design-check` 결과 및 스크린샷 검토 |
| 코드 품질 | build + lint 통과 여부 |

하나라도 기준치 미달 → 스프린트 **실패**.

### 5단계 — 결과 파일 작성
아래 형식으로 `.claude/sprints/{slug}-eval.md` 를 작성한다.

```markdown
# 평가 결과: {제목}

> 결과: 통과 ✅ / 실패 ❌  
> 평가일: {날짜}  
> 계약 파일: [{slug}-contract.md](./{slug}-contract.md)

---

## 채점표

| 기준 | 점수 | 기준치 | 통과 |
|---|---|---|---|
| 기능성 | X% | 80% | ✅/❌ |
| 제품 완성도 | X% | 100% | ✅/❌ |
| 시각 디자인 | 위반 N건 | 0건 | ✅/❌ |
| 코드 품질 | build ✅ lint ✅ | 통과 | ✅/❌ |

---

## 완료 기준 테스트 결과

| # | 기준 | 결과 | 비고 |
|---|---|---|---|
| 1 | ... | ✅/❌/⚠️ | |

---

## 발견된 버그

버그가 없으면 "없음" 기재.

### [BUG-1] {제목}
- **경로**: `http://localhost:3000/...`
- **재현 절차**: 1. ... 2. ...
- **기대 동작**: ...
- **실제 동작**: ...
- **심각도**: Critical / High / Medium / Low

---

## 피드백 (실패 항목 상세)

실패하거나 기준치 미달한 항목에 대한 구체적인 개선 방향.

---

## 다음 액션

<!-- --next-sprint 옵션 시 채워짐 -->
<!-- --update-tasks 옵션 시 채워짐 -->
```

### 6단계 (--next-sprint 옵션)
실패한 항목과 발견된 버그를 기반으로 `.claude/sprints/{slug}-v2-contract.md` 초안을 생성한다.
- 이번 스프린트에서 실패한 완료 기준을 최우선으로 반영
- 새로 발견된 버그 수정을 구현 범위에 추가
- 상태는 `협의중` 으로 설정

### 7단계 (--update-tasks 옵션)
`.claude/tasks/` 디렉터리의 기존 태스크 파일들을 읽고, 평가 결과를 반영해 우선순위를 재정렬한다.
- Critical/High 버그 수정 태스크를 상위로 이동
- 이미 완료된 것으로 확인된 항목은 완료 표시

## 주의

- Playwright 테스트는 계약의 완료 기준 항목을 **그대로** 기준으로 삼는다 — 임의 추가 금지
- 개발 서버가 실행 중이지 않으면 테스트 전에 알린다 (자동 시작 금지)
- 스크린샷은 `.claude/assets/screenshots/sprint-{slug}-{번호}.png` 에 저장한다
- 평가 결과는 객관적 증거(스크린샷, 오류 메시지) 기반으로만 기술한다
