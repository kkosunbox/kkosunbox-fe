/**
 * Auth 환경변수 설정 모듈
 *
 * - 개발 환경: 환경변수 미설정 시 경고 + 기본값 사용
 * - 프로덕션: 환경변수 미설정 시 즉시 에러 (알려진 기본값으로 배포되는 것 방지)
 */

function resolveEnv(key: string, fallback: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[auth] 환경변수 ${key}가 설정되지 않았습니다.\n` +
        `.env.local을 확인하거나 배포 환경에 환경변수를 등록하세요.`
      );
    }
    console.warn(`[auth] ${key} 환경변수 없음 — 기본값 사용 중. .env.local을 확인하세요.`);
    return fallback;
  }
  return value;
}

export const AUTH_CONFIG = {
  id:       resolveEnv("DEV_LOGIN_ID",       "admin"),
  password: resolveEnv("DEV_LOGIN_PASSWORD",  "admin1234!"),
  token:    resolveEnv("DEV_AUTH_TOKEN",      "dev-ggosoon-token"),
} as const;
