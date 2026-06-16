# 태스크: 레퍼럴 메인 페이지 인플루언서 정보 조회

## 목적

`/ref/{slug}` 랜딩 후 `/`(메인 페이지)로 이동해도 인플루언서 이름·프로필 이미지·할인율이
정확하게 표시되도록 수정한다.

현재 `ReferralProvider`는 `initialData` 없는 경우(메인 페이지 진입)
쿠키에서 `referralCode`만 읽어 `validateReferralCode(code)`만 호출한다.
이 API는 `{ isApplicable, discountRate }`만 반환하므로
`influencerName`이 "홍길동", `profileImageUrl`이 null로 하드코딩된 채 남는다.

`slug`를 별도 쿠키(`ggosoon-ref-slug`)에 함께 저장하여
메인 페이지의 `ReferralProvider`에서도 `getReferralPage(slug)` —
`/v1/referral/pages/{slug}` — 를 호출해 올바른 인플루언서 정보를 가져온다.

---

## 변경 전 / 변경 후

| 화면 | 변경 전 | 변경 후 |
|---|---|---|
| `/ref/test` 직접 접근 | 정상 (서버 fetch, initialData 경로) | 동일 (변경 없음) |
| `/` 접근 (쿠키 있음) | influencerName="홍길동", profileImageUrl=null | 실제 인플루언서 이름·프로필 표시 |
| `/` 접근 (쿠키 없음) | isReferral=false | 동일 (변경 없음) |
| slug 쿠키만 없는 경우 | — | validateReferralCode fallback (현재 동작 유지) |

---

## 대상 파일

- `features/referral/lib/inviteCodeCookie.ts` — 전체 파일 끝에 slug 쿠키 헬퍼 추가
- `features/referral/lib/index.ts` — line 1–7, 새 export 3개 추가
- `features/referral/model/ReferralProvider.tsx` — `InitialReferralData` (line 15–21), `useEffect` (line 53–83)
- `app/(main)/ref/[slug]/page.tsx` — `ReferralProvider` initialData prop (line 34–41)

---

## 구체적인 변경 사항

### 1. `inviteCodeCookie.ts` — slug 쿠키 헬퍼 추가

파일 맨 끝(line 42 다음)에 추가한다.

```ts
export const INVITE_SLUG_COOKIE = "ggosoon-ref-slug";

/** 저장된 초대 slug를 반환한다. 없거나 SSR 환경이면 null. */
export function getStoredInviteSlug(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${INVITE_SLUG_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  const slug = decodeURIComponent(match[1]);
  return slug.length > 0 && slug.length <= 128 ? slug : null;
}

/** 저장된 초대 slug를 삭제한다. clearStoredInviteCode()와 함께 호출한다. */
export function clearStoredInviteSlug(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INVITE_SLUG_COOKIE}=; Max-Age=0; path=/`;
}
```

### 2. `lib/index.ts` — 새 export 추가

기존 export 목록(line 1–7)에 3개 추가:

```ts
export {
  getStoredInviteCode,
  clearStoredInviteCode,
  isValidInviteCode,
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  INVITE_SLUG_COOKIE,          // ← 추가
  getStoredInviteSlug,         // ← 추가
  clearStoredInviteSlug,       // ← 추가
} from "./inviteCodeCookie";
```

### 3. `ReferralProvider.tsx` — `InitialReferralData`에 slug 추가

```ts
// line 15–21 현재
export interface InitialReferralData {
  refCode: string;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}

// 변경 후
export interface InitialReferralData {
  slug: string;                  // ← 추가 — slug 쿠키 저장용
  refCode: string;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}
```

### 4. `ReferralProvider.tsx` — import 수정

line 4 현재:
```ts
import { getStoredInviteCode, INVITE_CODE_COOKIE, INVITE_CODE_MAX_AGE_SEC } from "@/features/referral/lib";
import { validateReferralCode } from "@/features/referral/api";
```

변경 후:
```ts
import {
  getStoredInviteCode,
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  INVITE_SLUG_COOKIE,
  getStoredInviteSlug,
} from "@/features/referral/lib";
import { validateReferralCode, getReferralPage } from "@/features/referral/api";
```

`getReferralPage`는 이미 `features/referral/api/referralApi.ts` line 10–12에 구현돼 있음 — 새로 만들 필요 없음.

### 5. `ReferralProvider.tsx` — initialData 경로에 slug 쿠키 저장 추가

line 58–60 현재:
```ts
document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(data.refCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
```

변경 후 (한 줄 추가):
```ts
document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(data.refCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(data.slug)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
```

### 6. `ReferralProvider.tsx` — initialData 없는 경로 교체

line 63–79 현재 (validateReferralCode만 호출, influencerName 하드코딩):
```ts
const code = getStoredInviteCode();
if (!code) return () => { isMounted.current = false; };

validateReferralCode(code)
  .then((apiData) => {
    if (!isMounted.current) return;
    if (apiData.isApplicable) {
      setState({
        refCode: code,
        isReferral: true,
        discountRate: apiData.discountRate,
        influencerName: "홍길동",      // 버그: 하드코딩
        profileImageUrl: null,
      });
    }
  })
  .catch(() => {});
```

변경 후 — slug가 있으면 getReferralPage로 풀 정보 조회, 없으면 기존 fallback:
```ts
const code = getStoredInviteCode();
if (!code) return () => { isMounted.current = false; };

const slug = getStoredInviteSlug();
if (slug) {
  getReferralPage(slug)
    .then((pageData) => {
      if (!isMounted.current) return;
      // referralCode 일치 확인 — slug 쿠키 조작으로 잘못된 인플루언서 표시 방지
      if (pageData.isActive && pageData.referralCode === code) {
        setState({
          refCode: code,
          isReferral: true,
          discountRate: pageData.discountRate,
          influencerName: pageData.displayName,
          profileImageUrl: pageData.profileImageUrl,
        });
      }
    })
    .catch(() => {});
} else {
  validateReferralCode(code)
    .then((apiData) => {
      if (!isMounted.current) return;
      if (apiData.isApplicable) {
        setState({
          refCode: code,
          isReferral: true,
          discountRate: apiData.discountRate,
          influencerName: DEFAULT_STATE.influencerName,
          profileImageUrl: null,
        });
      }
    })
    .catch(() => {});
}
```

### 7. `/ref/[slug]/page.tsx` — initialData에 slug 전달

line 34–41 현재:
```tsx
<ReferralProvider
  initialData={{
    refCode: data.referralCode,
    discountRate: data.discountRate,
    influencerName: data.displayName,
    profileImageUrl: data.profileImageUrl,
  }}
>
```

변경 후 (`slug` 추가 — page params에서 이미 `const { slug } = await params;`로 해체됨):
```tsx
<ReferralProvider
  initialData={{
    slug,
    refCode: data.referralCode,
    discountRate: data.discountRate,
    influencerName: data.displayName,
    profileImageUrl: data.profileImageUrl,
  }}
>
```

---

## 주의 사항

- **PackagePlansSection / ReferralPackagePlansSection 전환 로직은 이 태스크 범위 밖** — 다른 세션에서 작업 중이므로 건드리지 않는다
- `clearStoredInviteSlug()`는 구독 완료 시 `clearStoredInviteCode()`와 함께 호출해야 하나, 해당 호출 지점 변경은 이 태스크에 포함하지 않는다 — slug 쿠키는 `INVITE_CODE_MAX_AGE_SEC`(30일)로 자동 만료됨
- `getReferralPage`는 `features/referral/api/index.ts`를 통해 export되는지 확인 후 import 경로 결정

---

## 검증

1. `pnpm build` 통과
2. `pnpm lint` 통과
3. `/ref/test` 접근 후 DevTools Application → Cookies 확인: `ggosoon-ref`, `ggosoon-ref-slug` 모두 설정됨
4. `/ref/test` 접근 후 `/`로 이동 → 인플루언서 이름, 프로필 이미지, 할인율이 올바르게 표시됨
5. 쿠키 없는 상태에서 `/` 접근 → 일반 HeroSection 표시 (`isReferral = false`)
6. `ggosoon-ref-slug`만 삭제 후 `/` 접근 → `validateReferralCode` fallback으로 동작 (이름 기본값이나 할인율은 정상)
