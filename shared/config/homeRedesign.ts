import "server-only";

/** 승인된 새 디자인을 기본 노출한다. 명시적으로 false를 설정한 경우에만 이전 디자인을 노출한다. */
export const HOME_REDESIGN_ENABLED = process.env.HOME_REDESIGN_ENABLED !== "false";
