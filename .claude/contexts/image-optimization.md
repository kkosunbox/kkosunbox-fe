# 이미지 최적화 전략 (next/Image vs `<img>`)

## 결정 (현재 정책)

일부 이미지는 **의도적으로 `<img>` 태그로 서빙**한다. 처음엔 `next/Image`로 작성했으나
직접 압축한 webp 에셋이 `next/Image`를 거치며 **화질이 눈에 띄게 저하**되어 되돌린 것이다.

규칙 `@next/next/no-img-element`는 **켜둔 채**, 의도적으로 `<img>`를 쓰는 곳마다
**이유와 함께 per-line으로 끈다.** (전역 off가 아님 — 실수로 추가한 `<img>`는 계속 잡히도록.)

```tsx
{/* eslint-disable-next-line @next/next/no-img-element -- 원본 품질 유지 */}
<img ... />

// JSX 자식이 아닌 위치(return 루트·삼항 분기 등)에서는 라인 주석 형태:
// eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
<img ... />
```

새 이미지를 `<img>`로 넣을 때도 위 패턴으로 이유를 달면 경고가 0으로 유지된다.

## 근본 원인 (왜 next/Image에서 화질이 깨졌나)

Next.js 16 기준 두 가지가 겹친다.

1. **`images.qualities` allowlist가 Next 16부터 필수.** 미설정 시 기본값은 `[75]` 하나뿐이다.
   `<Image quality={90}>`을 줘도 허용 목록에 없으면 **가장 가까운 허용값(75)으로 강제 다운**된다.
   → 화질을 올릴 방법이 막혀 있었음.
2. **이미 최적화한 webp를 Next가 q75로 재인코딩** → 이중 압축. (`formats` 기본값은 `['image/webp']`라
   AVIF는 원인 아님.)

추가로, `fill`을 쓰는 이미지에서 `sizes`가 없거나 틀리면 브라우저가 srcset에서 **저해상 후보를
골라 업스케일**해 흐려질 수 있다 — next/Image가 흐려 보이는 또 다른 흔한 원인.

## 옵션 C — 나중에 특정 이미지를 next/Image로 "고화질" 서빙해야 할 때

대역폭 최적화가 중요한 **대용량** 이미지에 한해, 이미지별 튜닝으로 화질을 회복할 수 있다.

1. `next.config.ts`에 quality allowlist 추가:
   ```ts
   const nextConfig: NextConfig = {
     images: {
       qualities: [75, 90, 100], // 미설정 시 75로 강제 다운됨
     },
   };
   ```
2. 해당 이미지를 `next/Image`로 바꾸고 `quality={90}` 이상 지정.
3. `fill` 사용 시 `sizes`를 실제 렌더 크기에 맞게 정확히 지정 (저해상 srcset 선택 방지).

### 참고: 최적화 자체를 끄고 원본 그대로 서빙 (옵션 B)
- 이미지별: `<Image ... unoptimized />`
- 전역: `next.config.ts` `images: { unoptimized: true }`
- 원본 바이트를 그대로 내보내 화질 100%. 다만 개별 `unoptimized`는 사실상 `<img>`와 동일하므로,
  "화질이 중요한 정적 webp"는 그냥 `<img>`(현재 정책)가 더 단순하다.

## 출처
- next/image 컴포넌트(quality·unoptimized·sizes): https://nextjs.org/docs/app/api-reference/components/image
- images 설정(qualities·formats·unoptimized): https://nextjs.org/docs/app/api-reference/config/next-config-js/images
