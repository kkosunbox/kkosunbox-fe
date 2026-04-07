import { apiClient } from "@/shared/lib/api";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RefreshRequest,
  ResetPasswordRequest,
  SendPasswordResetCodeRequest,
  SendSignupEmailVerificationRequest,
  SignupRequest,
  SignupResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  TermsRequest,
  User,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyPasswordResetCodeRequest,
  VerifyPasswordResetCodeResponse,
  WithdrawRequest,
} from "./types";

// ── 회원가입 플로우 ───────────────────────────────────────────────

/**
 * 1단계: 회원가입용 이메일 인증 코드 발송
 * 이미 가입된 이메일이면 409 ALREADY_EXISTS
 */
export function sendSignupEmailVerification(
  body: SendSignupEmailVerificationRequest,
) {
  return apiClient.post<MessageResponse>(
    "/v1/auth/send-signup-email-verification",
    body,
  );
}

/**
 * 2단계: 이메일 인증 코드 검증
 * 반환된 emailVerifiedToken(10분 유효)을 signup 요청에 사용
 */
export function verifyEmail(body: VerifyEmailRequest) {
  return apiClient.post<VerifyEmailResponse>("/v1/auth/verify-email", body);
}

/** 인증 대기 중 코드 재전송 (60초에 1회, 하루 최대 5회) */
export function resendEmailVerification(
  body: SendSignupEmailVerificationRequest,
) {
  return apiClient.post<MessageResponse>(
    "/v1/auth/resend-email-verification",
    body,
  );
}

/**
 * 3단계: 회원가입 완료
 * 성공 시 accessToken/refreshToken 반환 — tokenStore.setTokens() 로 저장
 */
export function signup(body: SignupRequest) {
  return apiClient.post<SignupResponse>("/v1/auth/signup", body);
}

// ── 로그인 ────────────────────────────────────────────────────────

/**
 * 이메일/패스워드 로그인
 * 성공 시 accessToken/refreshToken 반환 — tokenStore.setTokens() 로 저장
 */
export function login(body: LoginRequest) {
  return apiClient.post<LoginResponse>("/v1/auth/login", body);
}

/** 구글 소셜 로그인 (OAuth authorization code + callbackUrl) */
export function loginWithGoogle(body: SocialLoginRequest) {
  return apiClient.post<SocialLoginResponse>("/v1/auth/google", body);
}

/** 네이버 소셜 로그인 (OAuth authorization code + callbackUrl) */
export function loginWithNaver(body: SocialLoginRequest) {
  return apiClient.post<SocialLoginResponse>("/v1/auth/naver", body);
}

/** 카카오 소셜 로그인 (OAuth authorization code + callbackUrl) */
export function loginWithKakao(body: SocialLoginRequest) {
  return apiClient.post<SocialLoginResponse>("/v1/auth/kakao", body);
}

// ── 토큰 갱신 ─────────────────────────────────────────────────────

/**
 * Refresh Token으로 Access Token 갱신
 * ※ apiClient 내부에서 401 시 자동 호출됨. 직접 호출 시에는 skipRefresh 옵션 사용.
 */
export function refreshToken(body: RefreshRequest) {
  return apiClient.post<{ accessToken: string; refreshToken: string }>(
    "/v1/auth/refresh",
    body,
    { skipRefresh: true },
  );
}

// ── 비밀번호 ──────────────────────────────────────────────────────

/** 비밀번호 재설정 인증코드 발송 */
export function sendPasswordResetCode(body: SendPasswordResetCodeRequest) {
  return apiClient.post<MessageResponse>(
    "/v1/auth/send-password-reset-code",
    body,
  );
}

/**
 * 비밀번호 재설정 인증코드 검증
 * 반환된 resetToken을 resetPassword 요청에 사용
 */
export function verifyPasswordResetCode(body: VerifyPasswordResetCodeRequest) {
  return apiClient.post<VerifyPasswordResetCodeResponse>(
    "/v1/auth/verify-password-reset-code",
    body,
  );
}

/** 비밀번호 재설정 (resetToken + 새 비밀번호) */
export function resetPassword(body: ResetPasswordRequest) {
  return apiClient.post<MessageResponse>("/v1/auth/reset-password", body);
}

/** 비밀번호 변경 (로그인 상태 필수, 이메일/패스워드 가입 유저만) */
export function changePassword(body: ChangePasswordRequest) {
  return apiClient.patch<MessageResponse>("/v1/auth/change-password", body);
}

// ── 유저 / 약관 / 탈퇴 ───────────────────────────────────────────

/** 현재 로그인 유저 정보 조회 (로그인 상태 필수) */
export function getUser() {
  return apiClient.get<User>("/v1/auth/user");
}

/** 이용 약관 동의 (로그인 상태 필수) */
export function agreeToTerms(body: TermsRequest) {
  return apiClient.post<User>("/v1/auth/terms", body);
}

/** 회원 탈퇴 (로그인 상태 필수) */
export function withdraw(body: WithdrawRequest) {
  return apiClient.delete<void>("/v1/auth/withdraw", body);
}
