/** 환경변수 타입 안전 접근. 누락 시 빌드 타임에 에러를 낸다. */

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`환경변수 ${key} 가 설정되지 않았습니다.`);
  return value;
}

export const env = {
  apiUrl: required("NEXT_PUBLIC_API_URL"),

  oauth: {
    google: { clientId: required("NEXT_PUBLIC_GOOGLE_CLIENT_ID") },
    naver: { clientId: required("NEXT_PUBLIC_NAVER_CLIENT_ID") },
    kakao: { clientId: required("NEXT_PUBLIC_KAKAO_CLIENT_ID") },
  },
} as const;
