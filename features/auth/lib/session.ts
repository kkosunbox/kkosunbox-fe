import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";

const DEV_TOKEN = process.env.DEV_AUTH_TOKEN ?? "dev-ggosoon-token";
const DEV_ID    = process.env.DEV_LOGIN_ID   ?? "admin";

/**
 * Server Component에서 현재 로그인 유저를 조회합니다.
 * Server Action이 아닌 순수 서버 유틸리티 함수입니다.
 */
export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token !== DEV_TOKEN) return null;
  // 실제 인증으로 교체 시: token으로 유저 정보 fetch 후 반환
  return { id: DEV_ID, name: "관리자" };
}
