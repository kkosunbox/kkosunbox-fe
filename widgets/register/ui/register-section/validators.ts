import { PASSWORD_MAX_LENGTH } from "@/shared/config/inputLimits";

export function meetsMinPasswordLength(password: string) {
  return password.length >= 8;
}

export function meetsMaxPasswordLength(password: string) {
  return password.length <= PASSWORD_MAX_LENGTH;
}

export function meetsPasswordComplexity(password: string) {
  if (!password) return false;
  return (
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
