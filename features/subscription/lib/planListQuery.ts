/**
 * `GET /v1/subscriptions/plans` 쿼리스트링 조립 — 클라이언트(`subscriptionApi`)와
 * 서버(`queries`) 양쪽이 같은 함수를 쓴다. 한쪽만 `referralCode`를 빠뜨리면 같은 사용자가
 * 진입 경로에 따라 다른 가격을 보게 되므로 조립을 한 곳에 모은다.
 */
export function planListQuery(profileId?: number, referralCode?: string): string {
  const params = new URLSearchParams();
  if (profileId !== undefined) params.set("profileId", String(profileId));
  // 빈 문자열은 파라미터를 아예 안 보낸 것과 같게 취급한다 — 서버가 무효 코드로 해석하지 않도록.
  if (referralCode) params.set("referralCode", referralCode);
  const query = params.toString();
  return query ? `?${query}` : "";
}
