import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ── 이미지 최적화 메모 (옵션 C — 현재 비활성) ───────────────────────────
  // 일부 이미지는 직접 만든 webp의 화질 저하 때문에 의도적으로 <img>로 서빙한다.
  // (배경·근거: .claude/contexts/image-optimization.md)
  // 특정 대용량 이미지를 next/Image로 "고화질" 서빙하고 싶을 때만 아래를 켠다:
  //   images: {
  //     // Next 16부터 allowlist가 필수. 미설정 시 quality는 75로 강제 다운된다.
  //     qualities: [75, 90, 100],
  //   },
  // 그리고 해당 <Image>에 quality={90} 이상 + (fill일 경우) 정확한 sizes를 지정한다.
};

export default nextConfig;
