import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next 16: qualities allowlist 미설정 시 quality prop은 75로 강제 다운됨.
  // next/Image 고화질: quality={HIGH_IMAGE_QUALITY} (shared/config/imageQuality.ts, allowlist 필수)
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
