import "server-only";

/** 운영 기본값은 비활성. dev 배포에서만 명시적으로 true를 설정한다. */
export const HOME_REDESIGN_ENABLED = process.env.HOME_REDESIGN_ENABLED === "true";
