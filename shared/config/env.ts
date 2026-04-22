/**
 * 환경변수 타입 안전 접근.
 *
 * ⚠️ process.env[key] (동적 대괄호 접근)는 Next.js/Turbopack이 빌드 타임에
 *    값을 인라인할 수 없어 브라우저 런타임에서 undefined가 됩니다.
 *    NEXT_PUBLIC_* 변수는 반드시 리터럴 점 표기법(process.env.NEXT_PUBLIC_XXX)으로만
 *    참조해야 Next.js가 클라이언트 번들에 정적으로 삽입합니다.
 */

const _apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!_apiUrl) throw new Error("환경변수 NEXT_PUBLIC_API_URL 가 설정되지 않았습니다.");

export const env = {
  apiUrl: _apiUrl.replace(/\/$/, ""),

  // asset 모듈의 attachment presigned-url 발급에 사용되는 x-project-id 헤더 값.
  // 백엔드 팀에서 값이 내려오면 .env.local 의 NEXT_PUBLIC_PROJECT_ID 에 설정.
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",

  oauth: {
    google: { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "" },
    naver:  { clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID  ?? "" },
    kakao:  { clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID  ?? "" },
  },
} as const;
