"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { socialLoginAction, getCallbackUrl } from "@/features/auth";
import { tokenStore } from "@/shared/lib/api/token";
import type { OAuthProvider } from "@/features/auth";

const VALID_PROVIDERS = new Set<OAuthProvider>(["google", "naver", "kakao"]);

function getValidationError(
  provider: string,
  code: string | null,
  errorParam: string | null,
): string | null {
  if (!VALID_PROVIDERS.has(provider as OAuthProvider)) {
    return "잘못된 로그인 요청입니다.";
  }
  if (!code) {
    return errorParam === "access_denied"
      ? "로그인이 취소되었습니다."
      : "인증 코드를 받지 못했습니다.";
  }
  return null;
}

export default function OAuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const provider = params.provider as string;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  const validationError = getValidationError(provider, code, errorParam);
  const [apiError, setApiError] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current || validationError || !code) return;
    called.current = true;

    const callbackUrl = getCallbackUrl(provider as OAuthProvider);

    socialLoginAction(provider as OAuthProvider, code, callbackUrl).then(
      (result) => {
        if (result.error) {
          setApiError(result.error);
          return;
        }
        if (result.accessToken && result.refreshToken) {
          tokenStore.setTokens(result.accessToken, result.refreshToken);
        }
        router.replace("/");
      },
      () => {
        setApiError("소셜 로그인 중 오류가 발생했습니다.");
      },
    );
  }, [provider, code, validationError, router]);

  const error = validationError ?? apiError;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
        <p
          className="text-center text-body-16-m"
          style={{ color: "var(--color-accent-rust)" }}
        >
          {error}
        </p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="rounded-full bg-[var(--color-accent)] px-8 py-3 text-white text-body-16-sb transition-opacity hover:opacity-90"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p
        className="text-body-16-m"
        style={{ color: "var(--color-text-secondary)" }}
      >
        로그인 처리 중...
      </p>
    </div>
  );
}
