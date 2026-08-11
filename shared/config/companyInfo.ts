/**
 * 법적 고지에 노출되는 회사 정보.
 *
 * 동일한 값이 개인정보처리방침 페이지(`widgets/privacy`)와 약관 모달
 * (`shared/ui/custom-modals/TermsViewModal`) 두 곳에 표시된다. 한쪽만 고쳐
 * 서로 어긋나는 일이 없도록 여기서 단일 관리한다.
 *
 * ⚠️ 개인정보 보호 책임자는 개인정보보호법상 **필수 기재 사항**이다. 비우지 말 것.
 */
export const PRIVACY_OFFICER = {
  name: "오진영",
  email: "support@petbridgecore.com",
} as const;
