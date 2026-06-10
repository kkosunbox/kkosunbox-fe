# 태스크: /mypage/withdraw 페이지 Hero 배너 교체

## 목적
기존에 별도 이미지 파일(`withdraw-confirm-title.webp` / `withdraw-confirm-title-mobile.png`)로 렌더링하던 페이지 상단 타이틀 영역을, 다른 마이페이지 섹션(ReviewWriteSection 등)과 동일한 **full-width hero 이미지 배너** 방식으로 교체한다.  
새 에셋(`withdraw-confirm-hero-web.png`, `withdraw-confirm-hero-mobile.png`)에 제목·부제목 텍스트가 포함되어 있으므로 별도 텍스트 오버레이는 불필요하다.

---

## 변경 전 / 변경 후

| 영역 | 변경 전 | 변경 후 |
|------|---------|---------|
| 데스크톱 상단 | `<img src={titleImgDesktop.src}>` (h-8, justify-center) | `<Image>` full-width hero, h-[118px], `bg-support-hero-side-bg` |
| 모바일 상단 | `<img src={titleImgMobile.src}>` (max-w-[172px], mx-auto) | `<Image>` full-width hero, h-[111px], `object-cover` |
| import | `titleImgDesktop`, `titleImgMobile` | `withdrawHeroDesktop`, `withdrawHeroMobile` |
| 데스크톱 콘텐츠 패딩 | `pt-[64px]` | `pt-6` (hero가 상단 여백 대체) |
| 모바일 콘텐츠 패딩 | `pt-6` (타이틀 이미지 포함) | `pt-6` 유지 (타이틀 블록만 제거) |

---

## 대상 파일

- `widgets/mypage/ui/WithdrawConfirmSection.tsx` — 전체 컴포넌트 (line 1–392)
- 참고 패턴: `widgets/mypage/ui/ReviewWriteSection.tsx` (line 309–331)

---

## 구체적인 변경 사항

### 1. import 교체 (line 5–7)

**제거:**
```tsx
import titleImgDesktop from "../assets/withdraw-confirm-title.webp";
import titleImgMobile from "../assets/withdraw-confirm-title-mobile.png";
import pawsImg from "../assets/widthraw-confirm-paws.webp";
```

**추가:**
```tsx
import Image from "next/image";
import withdrawHeroDesktop from "../assets/withdraw-confirm-hero-web.png";
import withdrawHeroMobile from "../assets/withdraw-confirm-hero-mobile.png";
import pawsImg from "../assets/widthraw-confirm-paws.webp";
```

> `next/image`의 `Image`는 현재 import 없음 — 추가 필요.  
> `pawsImg`는 프로필 배너 장식용이므로 유지.

---

### 2. 최상위 return 구조에 Hero 섹션 추가 (line 386–391)

**현재 (line 386–391):**
```tsx
return (
  <div className="flex min-h-0 flex-1 flex-col bg-white pt-[var(--header-offset)]">
    {desktopLayout}
    {mobileLayout}
  </div>
);
```

**변경 후:**
```tsx
const HERO_ALT = "정말로 꼬순박스를 탈퇴하실 건가요?";

return (
  <div className="flex min-h-0 flex-1 flex-col bg-white pt-[var(--header-offset)]">
    {/* Hero 배너 */}
    <section aria-label="탈퇴 페이지 안내">
      {/* 모바일 (<md2) */}
      <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
        <Image
          src={withdrawHeroMobile}
          alt={HERO_ALT}
          className="h-[111px] w-full object-cover object-center"
          priority
        />
      </div>
      {/* 데스크톱 (≥md2) */}
      <div className="max-md2:hidden w-full bg-support-hero-side-bg">
        <div className="relative mx-auto h-[118px] w-full max-w-[1920px] overflow-hidden">
          <Image
            src={withdrawHeroDesktop}
            alt={HERO_ALT}
            className="absolute inset-0 h-full w-full object-cover object-center"
            priority
          />
        </div>
      </div>
    </section>
    {desktopLayout}
    {mobileLayout}
  </div>
);
```

> `HERO_ALT` 상수는 파일 상단(컴포넌트 바깥)에 선언.

---

### 3. 데스크톱 레이아웃 — 타이틀 이미지 블록 제거 및 패딩 조정 (line 106–115)

**현재 (line 106–114):**
```tsx
<div className="max-md:hidden mx-auto w-full max-w-[1013px] px-5 pt-[64px] pb-[104px]">
  {/* 타이틀 이미지 */}
  <div className="flex justify-center md:max-w-[387px] lg:max-w-[387px] mx-auto">
    <img
      src={titleImgDesktop.src}
      alt="정말로 꼬순박스를 탈퇴하실건가요?"
      className="h-8 object-contain"
    />
  </div>

  {/* 프로필 배너 */}
  <div className="relative mt-11 overflow-hidden ...">
```

**변경 후:**
```tsx
<div className="max-md:hidden mx-auto w-full max-w-[1013px] px-5 pt-6 pb-[104px]">
  {/* 프로필 배너 — 타이틀 이미지 블록 제거, mt-11 → 제거 (pt-6이 상단 여백) */}
  <div className="relative overflow-hidden rounded-[20px] px-14 py-7"
```

- `pt-[64px]` → `pt-6`
- "타이틀 이미지" `<div>` 전체(line 108–114) 제거
- 프로필 배너의 `mt-11` → 불필요하므로 제거 (또는 `mt-0` 유지)

---

### 4. 모바일 레이아웃 — 타이틀 이미지 블록 제거 (line 237–246)

**현재 (line 237–246):**
```tsx
<div className="md:hidden lg:hidden bg-white px-5 pb-10 pt-6">
  {/* 타이틀 이미지 */}
  <div className="flex justify-center w-full max-w-[172px] mx-auto">
    <img
      src={titleImgMobile.src}
      alt="정말로 꼬순박스를 탈퇴하실건가요?"
      className="object-contain"
    />
  </div>

  {/* 프로필 배너 */}
  <div className="relative mt-12">
```

**변경 후:**
```tsx
<div className="md:hidden lg:hidden bg-white px-5 pb-10 pt-6">
  {/* 프로필 배너 — 타이틀 이미지 블록 제거, mt-12는 유지 */}
  <div className="relative mt-6">
```

- "타이틀 이미지" `<div>` 전체(line 239–246) 제거
- 프로필 배너의 `mt-12` → `mt-6` (타이틀 높이만큼 줄어든 간격 조정)

---

## 주의 사항

- `pawsImg` import는 프로필 배너 장식(line 122, 260)에서 계속 사용 중 — 제거 금지
- 기존 폼 로직(라디오, 기타 텍스트 입력, `handleWithdraw`, `canSubmit`)은 변경 없음
- `md2` breakpoint가 프로젝트 tailwind 설정에 정의되어 있는지 확인 필요 (`ReviewWriteSection`에서 이미 사용 중이므로 있을 가능성 높음)
- 데스크톱 레이아웃은 `max-md:hidden`, 모바일 레이아웃은 `md:hidden lg:hidden` — Hero 섹션은 두 레이아웃 밖에 위치하므로 양쪽 모두에 표시됨 (Hero 내부 `md2:hidden` / `max-md2:hidden`으로 이미지 전환)
- `Image` (next/image)는 현재 파일에 import 없음 — 반드시 추가

---

## 검증
1. `pnpm build` 통과 (TypeScript 오류 없음)
2. `pnpm lint` 통과 (ESLint 오류 없음)
3. 브라우저 확인:
   - 데스크톱 (≥md2): `withdraw-confirm-hero-web.png`가 full-width 118px로 표시
   - 모바일 (<md2): `withdraw-confirm-hero-mobile.png`가 111px으로 표시
   - 구버전 이미지(`withdraw-confirm-title.webp`) 렌더링되지 않음
   - 프로필 배너, 탈퇴 이유 폼, 버튼 정상 작동
