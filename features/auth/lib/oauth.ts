// ── OAuth 인증 URL 빌더 ─────────────────────────────────────────

export type OAuthProvider = "google" | "naver" | "kakao";

/**
 * 호스트의 선행 `www.`를 제거한다.
 * 구글·네이버·카카오 콘솔에 등록된 Redirect URI가 apex 도메인 기준이라,
 * www로 접속한 사용자도 같은 값을 보내야 인증 요청과 토큰 교환의 redirect_uri가 일치한다.
 */
function toApexOrigin(origin: string) {
  try {
    const url = new URL(origin);
    url.hostname = url.hostname.replace(/^www\./, "");
    return url.origin;
  } catch {
    return origin;
  }
}

const CALLBACK_BASE = toApexOrigin(
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

/** 소셜 로그인 콜백 라우트 prefix — 이 경로에서는 콜백 페이지가 인증 핸드셰이크를 단독으로 소유한다. */
export const OAUTH_CALLBACK_PATH_PREFIX = "/auth/callback";

export function getCallbackUrl(provider: OAuthProvider) {
  return `${CALLBACK_BASE}${OAUTH_CALLBACK_PATH_PREFIX}/${provider}`;
}

// ── Google ────────────────────────────────────────────────────────

function buildGoogleAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl("google"),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// ── Naver ─────────────────────────────────────────────────────────

function buildNaverAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  if (!clientId) return null;

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl("naver"),
    response_type: "code",
    state,
  });
  return `https://nid.naver.com/oauth2.0/authorize?${params}`;
}

// ── Kakao ─────────────────────────────────────────────────────────

function buildKakaoAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl("kakao"),
    response_type: "code",
  });
  return `https://kauth.kakao.com/oauth/authorize?${params}`;
}

// ── 통합 ──────────────────────────────────────────────────────────

const builders: Record<OAuthProvider, () => string | null> = {
  google: buildGoogleAuthUrl,
  naver: buildNaverAuthUrl,
  kakao: buildKakaoAuthUrl,
};

export function getOAuthUrl(provider: OAuthProvider): string | null {
  return builders[provider]();
}
