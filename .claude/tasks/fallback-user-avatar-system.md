# 태스크: Fallback 유저 프로필 이미지 시스템 구현

## 목적
사진이 없는 유저에게 a~h 8종 중 하나를 기본 프로필 이미지로 보여준다.
여러 곳(리뷰 섹션, 마이페이지, 기타 프로필 노출)에서 재사용 가능한 `FallbackAvatar` 컴포넌트를 만든다.

핵심 제약: **한 번 정해진 이미지는 라우트 이동 · 로그인 · 로그아웃 후에도 바뀌지 않아야 한다.**

---

## 변경 전 / 변경 후

| 구분 | 변경 전 | 변경 후 |
|---|---|---|
| 이미지 없는 프로필 (`PetAvatar`) | `DefaultPetIcon` + `--color-secondary` 배경 | `FallbackAvatar` 컴포넌트 (8종 이미지 랜덤 고정) |
| 이미지 선택 방식 | 없음 | 로그인 유저: `userId` 해시, 비로그인: `localStorage` |
| 컬러 토큰 | 없음 | `--color-avatar-fallback: #B3A79D` 신규 등록 |

---

## 대상 파일

- `app/globals.css` — `:root` (line 220~225 근처) + `@theme inline` (line 391~396 근처)
- `shared/lib/fallbackAvatar.ts` — **신규 생성**
- `shared/ui/FallbackAvatar.tsx` — **신규 생성**
- `shared/ui/index.ts` — export 추가 (line 37 이후)
- `widgets/mypage/ui/ProfileSection.tsx` — `PetAvatar` 내부 (line 38–76)
  - 이미지 없을 때 fallback 분기 (line 57–64)

---

## 구체적인 변경 사항

### 1. 이미지 파일 복사

`.claude/assets/designs/fallback-user-image/` 에 있는 8개 PNG를 `public/images/fallback-user/` 디렉터리로 복사한다.

```
public/images/fallback-user/type-a.png
public/images/fallback-user/type-b.png
...
public/images/fallback-user/type-h.png
```

> `.claude/` 는 Next.js `public/` 경로가 아니므로 Next.js `<Image>` src로 직접 쓸 수 없다.

---

### 2. globals.css — 컬러 토큰 추가

`:root` 블록 `--color-avatar-6` 바로 뒤 (line 225)에 추가:

```css
--color-avatar-fallback: #B3A79D;  /* 유저 폴백 아바타 배경 */
```

`@theme inline` 블록 `--color-avatar-6` 등록 바로 뒤 (line 396)에 추가:

```css
--color-avatar-fallback: var(--color-avatar-fallback);
```

---

### 3. `shared/lib/fallbackAvatar.ts` 신규 생성

```ts
const FALLBACK_COUNT = 8;
const STORAGE_KEY = "ggb-fallback-avatar-idx";

const FALLBACK_AVATAR_PATHS = Array.from(
  { length: FALLBACK_COUNT },
  (_, i) => `/images/fallback-user/type-${String.fromCharCode(97 + i)}.png`
);

/** userId(숫자)를 0~7 인덱스로 결정론적 변환 */
function hashIndex(userId: number): number {
  return Math.abs(userId) % FALLBACK_COUNT;
}

/**
 * 로그인 유저: userId 해시 → 항상 동일
 * 비로그인: localStorage에 저장된 값 재사용, 없으면 랜덤 생성 후 저장
 */
export function getFallbackAvatarPath(userId?: number | null): string {
  if (userId != null) {
    return FALLBACK_AVATAR_PATHS[hashIndex(userId)];
  }
  if (typeof window === "undefined") {
    return FALLBACK_AVATAR_PATHS[0];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  const idx = stored !== null ? Number(stored) : Math.floor(Math.random() * FALLBACK_COUNT);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, String(idx));
  }
  return FALLBACK_AVATAR_PATHS[idx];
}
```

**주의:**
- `userId`는 `AuthUser.id`의 타입인 `number`를 받는다 (`features/auth/model/types.ts` line 2 기준).
- SSR 환경(`typeof window === "undefined"`)에서는 `localStorage` 접근 없이 항상 index 0을 반환한다.
  - 비로그인 SSR → index 0이 렌더되고, 하이드레이션 후 클라이언트에서 `useEffect`로 실제 값으로 교체된다.

---

### 4. `shared/ui/FallbackAvatar.tsx` 신규 생성

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getFallbackAvatarPath } from "@/shared/lib/fallbackAvatar";

interface FallbackAvatarProps {
  userId?: number | null;
  size?: number;
  className?: string;
}

export default function FallbackAvatar({ userId, size = 80, className }: FallbackAvatarProps) {
  const [src, setSrc] = useState(() => getFallbackAvatarPath(userId));

  // 비로그인 유저는 SSR에서 0번을 렌더하고, 마운트 후 localStorage 값으로 동기화
  useEffect(() => {
    if (userId == null) {
      setSrc(getFallbackAvatarPath(null));
    }
  }, [userId]);

  return (
    <div
      className={["relative overflow-hidden rounded-full", className].filter(Boolean).join(" ")}
      style={{
        width: size,
        height: size,
        background: "var(--color-avatar-fallback)",
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        aria-hidden
      />
    </div>
  );
}
```

---

### 5. `shared/ui/index.ts` — export 추가

line 37 (현재 마지막 줄) 다음에 추가:

```ts
export { default as FallbackAvatar } from "./FallbackAvatar";
```

---

### 6. `widgets/mypage/ui/ProfileSection.tsx` — `PetAvatar` 폴백 교체

**현재 코드 (line 57–64):**

```tsx
) : (
  <div
    className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--color-secondary)]"
    aria-hidden
  >
    <DefaultPetIcon className="h-12 w-12 shrink-0 lg:h-16 lg:w-16" />
  </div>
)}
```

**교체 후:**

```tsx
) : (
  <FallbackAvatar userId={userId} className="absolute inset-0 h-full w-full" size={undefined} />
)}
```

`PetAvatar` Props에 `userId?: number | null` 추가:

```tsx
function PetAvatar({
  imageUrl,
  userId,
  onEditProfile,
}: {
  imageUrl: string | null;
  userId?: number | null;
  onEditProfile: () => void;
}) {
```

`ProfileSection` (line 551~)에서 `vm.imageUrl` 외에 `user.id`를 내려줄 수 있도록 `ProfileViewModel`과 호출부도 업데이트:

- `ProfileViewModel` 인터페이스에 `userId?: number | null` 필드 추가 (line 248~265)
- `vm` 생성부 (line 572~593)에 `userId: user?.id ?? null` 추가
- `ProfileSectionMobile` (line 341), `ProfileSectionDesktop` (line 449)에서 `PetAvatar`에 `userId={vm.userId}` prop 전달

`DefaultPetIcon` import는 이후 사용처가 없으면 제거한다.

---

## 주의 사항

- `FallbackAvatar`의 `size` prop을 `PetAvatar` 내부에서 사용할 때는 `div`가 `absolute inset-0`으로 부모 크기를 따르므로 `size` 대신 `fill` 레이아웃을 쓴다.
- `DefaultPetIcon`이 다른 곳에서도 사용 중인지 확인 후 제거 여부 결정 (`shared/ui/index.ts` line 34에 export 존재).
- `localStorage` 키 `"ggb-fallback-avatar-idx"` 는 앱 전역에서 단 하나 사용. 로그아웃 시 이 값을 지우면 안 된다 (의도: 로그아웃 후에도 같은 이미지 유지).
- `getFallbackAvatarPath`는 `shared/lib/` 에서 직접 export하지 않아도 된다. `FallbackAvatar` 컴포넌트가 유일한 소비처이면 컴포넌트 파일 안에 인라인해도 무방하다. 단, 향후 서버 사이드에서도 해시 결과가 필요해질 수 있으므로 별도 파일로 분리를 권장한다.

---

## 검증

1. `pnpm tsc --noEmit` — TypeScript 오류 없음
2. `pnpm lint` — ESLint 오류 없음
3. 브라우저 확인:
   - **로그인 유저** — 마이페이지 프로필 아바타에 fallback 이미지 표시, 페이지 이동 후 동일 이미지 유지
   - **비로그인 유저** — 새 탭에서 동일 이미지 표시 (localStorage 공유)
   - **로그아웃 → 재로그인** — 동일 이미지 유지 (userId 해시 기반)
   - **이미지 있는 유저** — 기존 프로필 이미지 그대로 표시, fallback 비노출
