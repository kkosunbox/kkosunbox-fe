// ── User ──────────────────────────────────────────────────────────

export type UserStatus = "active" | "inactive" | "suspended";

/** 현재 사용자가 초대 관계로 추종 중인 추천인 정보 */
export interface UserReferrer {
  referralCode: string;
  displayName: string;
}

export interface User {
  id: number;
  email: string;
  phone: string | null;
  status: UserStatus;
  lastLoginAt: string;
  isAllowTerms: boolean;
  isAllowPrivacy: boolean;
  isAllowMarketing: boolean;
  isInfluencer: boolean;
  referrer: UserReferrer | null;
  createdAt: string;
  updatedAt: string;
}

// ── 공통 ──────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

// ── 회원가입 ──────────────────────────────────────────────────────

export interface SendSignupEmailVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  emailVerifiedToken: string;
  message: string;
}

export interface SignupRequest {
  emailVerifiedToken: string;
  password: string;
  /** 숫자만 포함한 휴대전화 번호 */
  phone: string;
  isAllowTerms: boolean;
  isAllowPrivacy: boolean;
  isAllowMarketing: boolean;
  /** 가입 시 계정에 귀속할 추천인 코드. 없으면 생략한다. */
  referralCode?: string;
}

// API 스펙: 성공(200)이어도 accessToken / refreshToken / user 가 null 일 수 있음
export interface SignupResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

// ── 이메일/패스워드 로그인 ────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

// API 스펙: 성공(200)이어도 accessToken / refreshToken / user 가 null 일 수 있음
export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

// ── 소셜 로그인 ───────────────────────────────────────────────────

export interface SocialLoginRequest {
  code: string;
  callbackUrl: string;
}

export interface SocialLoginResponse extends AuthTokens {
  isNewUser: boolean;
  user: User;
}

// ── 토큰 갱신 ────────────────────────────────────────────────────

export interface RefreshRequest {
  refreshToken: string;
}

// ── 비밀번호 ──────────────────────────────────────────────────────

export interface SendPasswordResetCodeRequest {
  email: string;
}

export interface VerifyPasswordResetCodeRequest {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetCodeResponse {
  resetToken: string;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ── 약관 / 회원 탈퇴 ─────────────────────────────────────────────

export interface TermsRequest {
  isAllowTerms: boolean;
  isAllowPrivacy: boolean;
  isAllowMarketing: boolean;
}

export interface CompleteSignupRequest extends TermsRequest {
  /** 숫자만 포함한 휴대전화 번호 */
  phone: string;
  /** 소셜 가입 완료 시 계정에 귀속할 추천인 코드. 없으면 생략한다. */
  referralCode?: string;
}

export interface UpdatePhoneRequest {
  /** 숫자만 포함한 휴대전화 번호 */
  phone: string;
}

export interface WithdrawRequest {
  reason: string;
}
