import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next 16: qualities allowlist 미설정 시 quality prop은 75로 강제 다운됨.
  // About 등 next/Image 고화질 구간은 quality={90} 사용 (.claude/contexts/image-optimization.md)
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
