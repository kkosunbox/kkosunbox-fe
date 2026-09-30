import "server-only";

import { cookies } from "next/headers";
import { INVITE_CODE_COOKIE, isValidInviteCode } from "./inviteCodeCookie";

/** 서버에서 가입 요청에 사용할 캡처된 초대코드를 읽는다. */
export async function getStoredInviteCodeFromServer(): Promise<string | null> {
  const value = (await cookies()).get(INVITE_CODE_COOKIE)?.value?.trim() ?? "";
  return value && isValidInviteCode(value) ? value : null;
}
