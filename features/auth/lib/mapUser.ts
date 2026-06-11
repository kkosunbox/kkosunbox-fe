import type { User } from "../api/types";
import type { AuthUser } from "../model/types";

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    isInfluencer: user.isInfluencer,
  };
}
