import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next 16: qualities allowlist 미설정 시 quality prop은 75로 강제 다운됨.
  // next/Image 고화질: quality={HIGH_IMAGE_QUALITY} (shared/config/imageQuality.ts, allowlist 필수)
  images: {
    qualities: [75, 90, 100],
  },
  async redirects() {
    return [
      {
        // 구 인플루언서 랜딩 경로 — /r/[slug]로 개편. 백엔드가 아직 예전 /ref/ 링크를
        // 내려주고 있을 수 있어 하위호환용으로 유지한다.
        source: "/ref/:slug",
        destination: "/r/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
