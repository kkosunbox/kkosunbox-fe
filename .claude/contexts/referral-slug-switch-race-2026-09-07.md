# 레퍼럴 slug 전환 쿠키 레이스 (2026-09-07)

**상태: 90% 완료, 잔여 레이스 1건 미해결 — 내일 아침 이어서 진행**

원 신고: `/r/test` 방문 → `ggosoon-ref-slug=test` 저장 → 조작 없이 `/r/kkosun` 방문 →
`ggosoon-ref-slug`가 `kkosun`으로 안 바뀌고 `test`로 남음.

---

## 0. 오늘 한 일 요약

| # | 항목 | 상태 |
|---|---|---|
| 1 | 원인 진단 — 중첩 `ReferralProvider` 쿠키 기록 effect 경합 | ✅ 완료 |
| 2 | 구조적 수정 — Provider 단일화 | ✅ 완료 (커밋 전) |
| 3 | 회귀 테스트 4건 추가 | ✅ 완료 (커밋 전) |
| 4 | 복합 시나리오 테스트로 잔여 리스크 탐색 | ✅ 완료 |
| 5 | 잔여 레이스(activeA→activeB 연속 이동, 비로그인) | ❌ **간헐적으로 여전히 재현** — 미해결 |
| 6 | 별개로 발견한 기존 버그(`isPageVisible:false`에서 인플루언서 이름 노출) | 🔍 보고만 함, 미수정 |

브랜치: `refactor/register-section`. 전부 **미커밋 상태**(working tree).

---

## 1. 근본 원인 (해결됨)

`(main)/layout.tsx`와 `(main)/r/[slug]/page.tsx`가 **각자** `ReferralProvider`를 만들고 있었다.

- layout: `resolveReferralContext()` — 쿠키에 남아있는 예전 slug를 읽음
- `r/[slug]/page.tsx`: `resolveReferralContext(slug)` — 방금 들어온 새 slug를 읽음

두 Provider 모두 마운트 시 쿠키를 기록하는 `useEffect`를 갖고 있고, React는 **자식 effect를 부모보다 먼저** 커밋한다. 즉:

1. 안쪽(페이지) Provider effect 먼저 실행 → 새 slug로 쿠키 기록
2. 바깥쪽(layout) Provider effect 나중 실행 → **예전 slug로 다시 덮어씀**

최종적으로 항상 layout이 이긴다 — 그래서 `test → kkosun` 이동 후에도 쿠키가 `test`로 남았다.

## 2. 구조적 수정 (완료)

Provider를 하나로 통합해 경합 자체를 제거했다.

- **`proxy.ts`** — `/r/{slug}` pathname을 정규식(`/^\/r\/([^/]+)\/?$/`)으로 매칭해
  `x-referral-slug` 요청 헤더를 심어 다운스트림으로 전달 (기존 `?r=CODE` 캡처와 같은 위치, 같은 패턴)
- **`app/(main)/layout.tsx`** — `headers()`로 그 헤더를 읽어 `resolveReferralContext(landingSlug)`에 전달.
  이제 layout의 Provider **하나만** 존재하고, 항상 올바른(방금 들어온) slug 기준으로 렌더된다.
- **`app/(main)/r/[slug]/page.tsx`** — 자체 `ReferralProvider`/`resolveReferralContext(slug)` 호출 제거.
  layout이 이미 정확한 context를 내려주므로 불필요.

`tsc`/`eslint` 통과 확인.

## 3. 추가한 회귀 테스트 (완료)

`tests/e2e/referral.spec.ts`에 4건, `tests/helpers/mockApiServer.ts`에 두 번째 활성 slug
(`MOCK_ACTIVE_SLUG_2` = `second-influencer`, `MOCK_REFERRAL_PAGE_2`, 코드 `SECOND20`) 추가.

1. 활성 slug A → 활성 slug B 이동 → 코드·slug 쿠키 둘 다 B로 교체 (`referral.spec.ts:120`)
2. `?r=CODE`로 코드만 캡처된 상태 → 활성 slug 랜딩 → 쿠키가 그 slug 소유 값으로 교체 (`:155`)
3. 숨김 slug → 다른 활성 slug → 쿠키 교체 (`:185`)
4. 유효 쿠키(A) 보유 중 **비활성** slug 방문 → 리다이렉트 후에도 A 유지, 안 지워짐 (`:221`)

## 4. 별개로 발견한 기존 버그 — 미수정, 보고만 함

`widgets/home/referral-package-plans/ui/ReferralPackagePlansSection.tsx:52`

```tsx
<span className="... text-[var(--color-text-discount)]">
  [{influencerName}]
</span>
```

`isPageVisible: false`(인플루언서가 자기 페이지를 숨김 처리한 상태)에서 Hero는 공용 문구로
personalization을 숨기는데, 그 아래 `ReferralPackagePlansSection`은 **여전히 인플루언서
이름을 노출**한다. 기존 테스트 `referral.spec.ts:86`("isPageVisible=false slug → 추천
코드를 유지하고 공용 할인 Hero 렌더링")가 이 assertion 때문에 3/3 재현 실패.

**이번 세션의 Provider 통합과 무관** — `influencerName` 값 자체는 신/구 구조에서 동일하게
계산됨. 페이지 스냅샷으로 직접 확인(`ReferralPackagePlansSection`이 항상 렌더되는 컴포넌트
라서 `isPageVisible` 분기 밖에 있음). 고칠지 여부는 제품 판단 필요 — "숨김 페이지"의
정의가 Hero만 가리는 건지, 페이지 전체에서 이름을 지우는 건지 확인 필요.

## 5. 미해결 — 간헐적 레이스 (내일 이어서)

**증상**: 비로그인 상태에서 활성 slug A → 활성 slug B로 **연속** 방문(원 신고와 동일 패턴)
시, 화면은 항상 B로 정확히 뜨는데 쿠키가 가끔(10/10 실패한 적도, 방금은 통과한 적도 있음)
A에 멈춰 있음. **느린 게 아니라 18초를 기다려도 안 바뀜** — 진짜 경합이지 타임아웃 문제가 아님.

### 지금까지 확인한 것

서버는 **항상 정답**을 계산한다 (`proxy.ts`/`layout.tsx`에 임시 `console.error` 찍어서 확인,
지금은 제거됨):

```
[DEBUG proxy] method=GET  pathname=/r/second-influencer slugMatch=second-influencer
[DEBUG layout] landingSlug=second-influencer resolved.slug=second-influencer  ← 정상
[DEBUG proxy] method=POST pathname=/r/second-influencer next-action=00684eb5...  ← 아래 참고
[DEBUG layout] landingSlug=second-influencer resolved.slug=second-influencer  ← 이것도 정상
```

두 번째 `POST .../next-action=...` 요청의 정체: `features/auth/ui/AuthProvider.tsx:82-89`.
비로그인 + refreshToken 없음 상태에서 **매 페이지 마운트마다** 무조건

```ts
void logoutAction().catch(() => {});
```

를 쏜다("혹시 남은 무효 인증쿠키를 정리" — idempotent cleanup 목적, 주석 참고). 이 Server
Action이 쿠키를 건드리기 때문에 Next.js가 **현재 라우트를 암묵적으로 재검증(revalidate)**
한다. 서버 쪽 재검증 결과는 위 로그처럼 항상 옳다 — 그런데 **클라이언트가 이 재검증 응답을
반영하는 시점과, 방금 마운트된 `ReferralProvider`의 쿠키-쓰기 effect가 맞물리는 타이밍**에서
가끔 쿠키 쓰기가 아예 안 일어나거나 유실되는 것으로 보인다. 정확히 React 리컨실리에이션의
어느 단계에서 씹히는지는 **아직 못 밝힘**.

### 재현 조건 정리

- 비로그인 (로그인 상태에서는 `AuthProvider`가 이 분기를 안 탐 — 미확인, 내일 검증 필요)
- 활성 slug **두 개를 연속** 방문 (단일 방문은 100% 안정적으로 통과함)
- `page.goto()` 풀 네비게이션 기준으로 재현됨 — 실제 사용자의 링크 클릭(soft nav)에서도
  똑같이 재현되는지는 미확인

### 내일 시도해볼 것

1. **가장 빠른 확인**: `AuthProvider.tsx:87`의 `void logoutAction()` 호출을 임시로 주석
   처리하고 `activeA→activeB` 테스트를 반복 실행 — 사라지면 원인 100% 확정.
2. 확정되면 고치는 방향 두 가지 중 택1:
   - `logoutAction()`을 `/r/[slug]` 경로에서는 건너뛰거나 지연시킨다 (증상 회피, 근본은 아님)
   - `ReferralProvider`의 쿠키 쓰기를 이런 암묵적 재검증에 영향받지 않는 시점/방식으로
     옮긴다 (예: 서버가 첫 응답에 쿠키를 심거나, 클라이언트에서 재검증 완료를 기다렸다가 씀)
3. 로그인 상태에서도 재현되는지 별도 확인 (원 신고자가 로그인 상태였는지 불명 — 확인 필요)
4. §4의 별개 버그는 이번 티켓 범위에 넣을지 여부 결정

### 전체 스위트 현재 상태

`referral.spec.ts` 26개 중 21 통과 / 5 실패:
- 2건: `/mypage/point` 달력 "element detached" — **무관**, 기존 문제
- 1건: §4의 `isPageVisible:false` 인플루언서 이름 노출 — **무관**, 기존 버그
- 2건: 이번에 추가한 activeA→activeB류 테스트 — **본 문서의 잔여 레이스**, 간헐적

---

## 재개 시 체크리스트

- [ ] `git diff --stat`로 현재 미커밋 변경사항 재확인 (proxy.ts, layout.tsx, r/[slug]/page.tsx,
      tests/e2e/referral.spec.ts, tests/helpers/mockApiServer.ts)
- [ ] §5-1 실험으로 원인 확정
- [ ] 로그인 상태 재현 여부 확인
- [ ] 고치고 나서 `activeA→activeB`, `숨김→activeB` 테스트 각 10회 반복 돌려서 안정성 확인
- [ ] §4 버그 처리 여부 결정 (제품 판단 필요하면 먼저 물어볼 것)
- [ ] 전부 정리되면 커밋 + PR

---

# 후속 조사 (2026-09-08)

위 문서의 "잔여 레이스" 가설은 **폐기됐다.** 다음 날 브라우저 재현 실험으로 결론이 바뀌었다.

## 1. `logoutAction()`은 원인이 아니다

`AuthProvider`가 비로그인 상태에서 쏘는 인증 정리 서버 액션을 1순위 용의자로 적어뒀지만,
허용/차단 양쪽으로 각각 10회씩 돌린 결과 **20/20 모두 통과**했다. 응답의 `Set-Cookie`는
`ggosoon-auth` 삭제만 포함했고 초대 쿠키를 건드리지 않았다. 인과를 뒷받침할 차이가 없다.

원 신고였던 "전체 페이지 이동에서 slug 쿠키가 안 바뀜"도 `af91a0c` 이후 재현되지 않았다
(전체 이동 20/20, 중간 응답 직후 연속 이동 10/10 통과). **원 신고는 해결된 것으로 본다.**

## 2. 대신 서로 다른 결함 두 건을 확정했다

### (1) 소프트 내비게이션에서 초대 상태가 갱신되지 않음

Next는 라우트 이동 시 layout을 다시 렌더하지 않는데, `(main)/layout.tsx`가 `x-referral-slug`
헤더로 초대 맥락을 계산하고 있었다. `/r/A` → `/r/B` 이동에서 URL만 바뀌고 화면·쿠키가 A로
남았다(양방향 3/3 실패, 18초 대기로도 회복 안 됨, `router.refresh()` 후 회복).

수정: `r/[slug]/page.tsx`가 그 요청의 맥락을 직접 확정해 `ReferralLandingSync`로 Provider에
**값만** 올려보낸다. 쿠키 쓰기 주체는 여전히 Provider 하나다(중첩 Provider 재도입 금지).

**단, 프로덕션 도달 경로는 현재 없다.** `/r/{slug}`로 가는 내부 `<Link>`가 하나도 없어 모든
진입이 전체 로드다. `page.goto` 두 번 뒤의 뒤로가기도 문서 단위 이동이라 재현되지 않는다
(수정 전 코드에서 e2e가 통과함을 실측). 재현은 dev 전용 라우터 핸들을 쓰는
`scripts/referral-investigation.mjs`로만 가능하다.

### (2) `?r=새코드`가 이전 slug에 밀림

기존 slug 쿠키가 있는 상태에서 `?r=` 링크로 들어오면 proxy는 새 코드를 저장하지만,
`resolveReferralContext`가 slug를 코드보다 우선해 예전 맥락을 만들고 `ReferralProvider`가
그 slug의 예전 코드를 다시 써서 방금 캡처한 코드를 되돌렸다. **외부 링크 클릭만으로 발생하는
실사용 버그였다.**

수정: proxy가 유효한 새 코드를 캡처할 때 이전 `ggosoon-ref-slug`도 함께 삭제한다. 단 새 코드가
기존 코드 쿠키와 같으면(같은 초대) slug를 유지해 인플루언서 이름·프로필 개인화를 잃지 않는다.

## 3. 함께 고친 기존 버그 — 숨김 페이지에서 인플루언서 이름 노출

`isPageVisible: false`가 초대 맥락에 실리지 않아, 페이지가 개인화 Hero만 바꿔 끼울 뿐
`ReferralPackagePlansSection`은 `[이름]님이 추천하는` 헤더를 그대로 렌더했다.

수정: `resolveReferralContext`가 노출이 꺼진 페이지에서 `influencerName`·`profileImageUrl`을
내려보내지 않고, Provider가 `hasInfluencerIdentity` 술어를 제공해 이름을 쓰는 화면이 렌더
여부를 먼저 판단한다. 할인율·코드는 그대로 유지된다.

## 4. 검증

- 조사 하네스 45개 판정 전부 통과(조사 시작 시점 9건 실패).
- e2e `referral.spec.ts` 회귀 테스트 추가: `?r=` 캡처 3건(다른 초대/같은 초대/형식 오류),
  뒤로·앞으로 가기 1건, 숨김 페이지 단언 강화. `?r=` 건은 수정 전 실패를 확인했다.
- 실브라우저(로컬 dev + dev 백엔드) 실데이터 확인: 숨김 페이지에서 이름 미노출·할인 유지,
  `?r=` 교차 진입 시 코드 교체·이전 slug 정리, 인플루언서 자기감지 차단 유지.
  주문서 단계의 코드 적용은 계정에 구독 이력이 있어(`firstSubscriptionEligible: false`)
  확인하지 못했다 — 첫 구독 전 계정이 필요하다.
