export function meetsMinPasswordLength(password: string) {
  return password.length >= 8;
}

export function meetsPasswordComplexity(password: string) {
  if (!password) return false;
  return (
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
