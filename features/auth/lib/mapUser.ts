import type { User } from "../api/types";
import type { AuthUser } from "../model/types";

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    isAllowTerms: user.isAllowTerms,
    isAllowPrivacy: user.isAllowPrivacy,
    isAllowMarketing: user.isAllowMarketing,
    isInfluencer: user.isInfluencer,
  };
}
