import type { User } from "../api/types";
import type { AuthUser } from "../model/types";

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    isInfluencer: user.isInfluencer,
  };
}
