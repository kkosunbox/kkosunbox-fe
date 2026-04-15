"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";
import { login as loginApi, signup as signupApi } from "../api/authApi";
import { ApiError, getErrorMessage } from "@/shared/lib/api";
import type { AuthUser } from "../model/types";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7일
};

export async function loginAction(
  email: string,
  password: string,
): Promise<{
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  try {
    const data = await loginApi({ email, password });

    // API 스펙상 200이어도 null 가능
    if (!data.accessToken || !data.refreshToken || !data.user) {
      return { error: "로그인 처리 중 오류가 발생했습니다." };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, data.accessToken, COOKIE_OPTS);

    return {
      user: { id: data.user.id, email: data.user.email },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("[loginAction] ApiError", err.statusCode, err.code, err.message);
      if (err.isUnauthorized || err.statusCode === 400) {
        return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
      }
    } else {
      console.error("[loginAction] Unexpected error:", err);
    }
    return { error: getErrorMessage(err, "로그인 중 오류가 발생했습니다.") };
  }
}

export async function signupAction(
  emailVerifiedToken: string,
  password: string,
  isAllowTerms: boolean,
  isAllowPrivacy: boolean,
  isAllowMarketing: boolean,
): Promise<{
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  try {
    const data = await signupApi({
      emailVerifiedToken,
      password,
      isAllowTerms,
      isAllowPrivacy,
      isAllowMarketing,
    });

    // API 스펙상 200이어도 null 가능
    if (!data.accessToken || !data.refreshToken || !data.user) {
      return { error: "회원가입 처리 중 오류가 발생했습니다." };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, data.accessToken, COOKIE_OPTS);

    return {
      user: { id: data.user.id, email: data.user.email },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("[signupAction] ApiError", err.statusCode, err.code, err.message);
    } else {
      console.error("[signupAction] Unexpected error:", err);
    }
    return { error: getErrorMessage(err, "회원가입 중 오류가 발생했습니다.") };
  }
}

export async function socialLoginAction(
  provider: "google" | "naver" | "kakao",
  code: string,
  callbackUrl: string,
): Promise<{
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  error?: string;
}> {
  try {
    const { loginWithGoogle, loginWithNaver, loginWithKakao } = await import(
      "../api/authApi"
    );

    const apiByProvider = {
      google: loginWithGoogle,
      naver: loginWithNaver,
      kakao: loginWithKakao,
    } as const;

    const data = await apiByProvider[provider]({ code, callbackUrl });

    if (!data.accessToken || !data.refreshToken || !data.user) {
      return { error: "소셜 로그인 처리 중 오류가 발생했습니다." };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, data.accessToken, COOKIE_OPTS);

    return {
      user: { id: data.user.id, email: data.user.email },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isNewUser: data.isNewUser,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(
        `[socialLoginAction:${provider}] ApiError`,
        err.statusCode,
        err.code,
        err.message,
      );
    } else {
      console.error(`[socialLoginAction:${provider}] Unexpected error:`, err);
    }
    return {
      error: getErrorMessage(err, "소셜 로그인 중 오류가 발생했습니다."),
    };
  }
}

/** 클라이언트 세션 복구(refresh) 후 SSR 쿠키도 동기화 */
export async function syncAuthCookieAction(accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, accessToken, COOKIE_OPTS);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
