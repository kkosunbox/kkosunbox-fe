import type { ReferralValidation } from "@/features/referral/api/types";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { ApiError } from "@/shared/lib/api/types";

export type InviteValidationStatus =
  | "idle"
  | "loading"
  | "applicable"
  | "blocked"
  | "networkError";

export interface InviteValidationOutcome {
  status: Exclude<InviteValidationStatus, "loading">;
  blockedMsg: string | null;
  discountRate: number;
}

/** validate 요청이 최신 요청인지 확인한다. 늦게 도착한 응답은 무시한다. */
export function isStaleValidationRequest(
  requestId: number,
  latestRequestId: number,
): boolean {
  return requestId !== latestRequestId;
}

export function resolveReferralValidationSuccess(
  res: ReferralValidation,
): InviteValidationOutcome {
  if (res.isApplicable) {
    return {
      status: "applicable",
      blockedMsg: null,
      discountRate: res.discountRate ?? 0,
    };
  }
  return {
    status: "blocked",
    blockedMsg: null,
    discountRate: 0,
  };
}

export function resolveReferralValidationFailure(err: unknown): InviteValidationOutcome {
  if (err instanceof ApiError) {
    return {
      status: "blocked",
      blockedMsg: getErrorMessage(err, "사용할 수 없는 코드입니다."),
      discountRate: 0,
    };
  }
  return {
    status: "networkError",
    blockedMsg: null,
    discountRate: 0,
  };
}
