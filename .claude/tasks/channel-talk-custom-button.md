# 태스크: 채널톡 플로팅 버튼 연동 + ScrollToTopButton 제거

## 목적

채널톡 SDK를 전역 초기화해 기본 플로팅 버튼을 상시 노출한다.
기존 모바일 전용 ScrollToTopButton(스크롤 감지 후 표시)은 제거한다.
로그인 사용자는 `memberId` + `memberHash`(서버 HMAC-SHA256)로 식별해 채팅 이력이 연동되도록 한다.

---

## 변경 전 / 변경 후

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 채널톡 플로팅 버튼 | 없음 | 상시 표시 (채널톡 기본 UI) |
| ScrollToTopButton | 모바일에서 스크롤 감지 후 표시 | 제거 |
| 지원 페이지 버튼 | 변경 없음 | 변경 없음 |

---

## 환경변수

`.env.local` 설정 완료 상태. 참고용:

```env
# 채널톡 웹데스크 → 채널 설정 → 일반 설정 → 버튼 설치
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=6a1dc18d-1c49-4e6d-bffd-f627a7e46e58

# 채널톡 웹데스크 → 채널 설정 → 개발자 설정 → Secret Key
CHANNEL_TALK_SECRET_KEY=...
```

---

## 대상 파일

### 신규 생성
- `shared/ui/ChannelTalkProvider.tsx` — 스크립트 로드 + SDK 초기화 클라이언트 컴포넌트
- `app/api/channel-talk/member-hash/route.ts` — HMAC-SHA256 서버 API 라우트

### 수정
- `shared/ui/index.ts` — `ChannelTalkProvider` export 추가 / `ScrollToTopButton` export 제거
- `app/layout.tsx` (line 7, 75) — `ChannelTalkProvider` 추가 / `ScrollToTopButton` 제거

### 삭제
- `shared/ui/ScrollToTopButton.tsx`

---

## 구체적인 변경 사항

### 1. memberHash 서버 API 라우트 생성

`app/api/channel-talk/member-hash/route.ts` (신규)

- 로그인한 사용자의 `user.id`를 받아 HMAC-SHA256으로 서명 후 반환
- 서버 전용 — `CHANNEL_TALK_SECRET_KEY`를 클라이언트에 노출하지 않는다

```ts
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/features/auth/lib/session";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ hash: null });

  const secret = process.env.CHANNEL_TALK_SECRET_KEY;
  if (!secret) return NextResponse.json({ hash: null });

  const hash = createHmac("sha256", secret)
    .update(String(user.id))
    .digest("hex");

  return NextResponse.json({ hash });
}
```

---

### 2. ChannelTalkProvider 컴포넌트 생성

`shared/ui/ChannelTalkProvider.tsx` (신규)

- `next/script`로 CDN 스크립트(`ch-plugin-web.js`) 로드
- `onLoad` 콜백에서 `boot()` 호출
- `hideChannelButtonOnBoot` 미사용 → 플로팅 버튼 상시 노출
- 로그인 상태 변경 시 `updateUser()`로 회원 식별 정보 전달
- `declare global`로 `window.ChannelIO` 타입 선언 (프로젝트 전역 적용)

```tsx
"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAuth } from "@/features/auth";

declare global {
  interface Window {
    ChannelIO?: (...args: unknown[]) => void;
    ChannelIOInitialized?: boolean;
  }
}

const PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY ?? "";

export function ChannelTalkProvider() {
  const { user } = useAuth();

  function handleScriptLoad() {
    window.ChannelIO?.("boot", {
      pluginKey: PLUGIN_KEY,
      language: "ko",
    });
  }

  useEffect(() => {
    return () => {
      window.ChannelIO?.("shutdown");
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    void fetch("/api/channel-talk/member-hash")
      .then((r) => r.json())
      .then(({ hash }: { hash: string | null }) => {
        window.ChannelIO?.("updateUser", {
          memberId: String(user.id),
          ...(hash ? { memberHash: hash } : {}),
          profile: { email: user.email },
        });
      });
  }, [user]);

  return (
    <Script
      src="https://cdn.channel.io/plugin/ch-plugin-web.js"
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
    />
  );
}
```

---

### 3. shared/ui/index.ts — export 교체

현재 line 36:
```ts
export { default as ScrollToTopButton } from "./ScrollToTopButton";
```

→ 제거하고 아래로 교체:
```ts
export { ChannelTalkProvider } from "./ChannelTalkProvider";
```

---

### 4. app/layout.tsx — Provider 교체

line 7 import 수정:
```ts
// 변경 전
import { ModalProvider, LoadingOverlayProvider, ScrollToTopButton } from "@/shared/ui";

// 변경 후
import { ModalProvider, LoadingOverlayProvider, ChannelTalkProvider } from "@/shared/ui";
```

line 73–77 JSX 수정:
```tsx
// 변경 전
<ModalProvider>
  {children}
  <ScrollToTopButton />
</ModalProvider>

// 변경 후
<ModalProvider>
  <ChannelTalkProvider />
  {children}
</ModalProvider>
```

---

### 5. ScrollToTopButton.tsx 삭제

`shared/ui/ScrollToTopButton.tsx` 파일 삭제.

> 파일 내 `EXCLUDED_PATH_PREFIXES` (`/mypage`, `/support`) 설정은 채널톡 플로팅 버튼에는 적용되지 않는다.
> 채널톡 플로팅 버튼의 페이지별 표시 제어가 필요하면 별도 작업으로 분리한다.

---

## 주의 사항

- **npm 패키지 불필요**: CDN 방식이므로 `@channel.io/channel-web-sdk-loader` 설치 없이 동작한다.
- **`ChannelTalkProvider` 위치**: `<AuthProvider>` 트리 안에 있어야 `useAuth()`가 동작한다.
- **`ChannelTalkProvider` 중복 금지**: 레이아웃에 단 하나만 존재해야 한다.
- **로그아웃 처리**: `user`가 null로 바뀌어도 현재 구현은 채널톡 세션을 자동 초기화하지 않는다. 채팅 이력 분리가 필요하면 `logout` 시 `shutdown` + 익명 `boot` 재호출 작업을 별도로 추가한다.

---

## 검증

1. `pnpm build` 통과 (타입 오류 없음)
2. `pnpm lint` 통과
3. 브라우저 확인:
   - [ ] 전 페이지에서 채널톡 플로팅 버튼 우측 하단 상시 표시
   - [ ] 모바일에서 ScrollToTopButton이 더 이상 표시되지 않음
   - [ ] 채널톡 플로팅 버튼 클릭 시 메신저 팝업 열림
   - [ ] 로그인 상태: 채널톡 웹데스크 인박스에서 회원 이메일 확인됨
   - [ ] 비로그인 상태: 채널톡이 익명으로 열림
