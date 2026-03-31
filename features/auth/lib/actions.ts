"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "./constants";

// ── Dev credentials (실제 인증으로 교체 시 이 파일만 수정) ──────────────
const DEV_ID       = process.env.DEV_LOGIN_ID       ?? "admin";
const DEV_PASSWORD = process.env.DEV_LOGIN_PASSWORD  ?? "admin1234!";
const DEV_TOKEN    = process.env.DEV_AUTH_TOKEN      ?? "dev-ggosoon-token";

export async function loginAction(
  id: string,
  password: string,
): Promise<{ error?: string }> {
  if (id !== DEV_ID || password !== DEV_PASSWORD) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, DEV_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  return {};
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

