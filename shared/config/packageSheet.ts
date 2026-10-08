/** 단품몰 내 패키지 바텀시트를 열고 진입하는 쿼리 (헤더 장바구니 아이콘 → 단품몰). 단품몰이 읽은 뒤 주소에서 지운다 */
export const PACKAGE_SHEET_PARAM = "package";
export const PACKAGE_SHEET_OPEN_VALUE = "open";
export const PACKAGE_SHEET_HREF = `/products?${PACKAGE_SHEET_PARAM}=${PACKAGE_SHEET_OPEN_VALUE}`;
