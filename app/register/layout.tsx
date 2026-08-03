/** 회원가입 페이지 레이아웃 — Header·Footer 모두 로그인 페이지와 동일하게 모든 화면에서 미노출 */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
