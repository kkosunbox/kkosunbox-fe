import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

/**
 * 로그인 페이지 레이아웃
 * - 모바일: Header/Footer 미노출 (전체화면 앱 스타일)
 * - 데스크톱(md+): Header/Footer 노출
 *
 * `display: none`은 position: fixed 자식 포함 하위 요소 전체를
 * 렌더링 트리에서 제거하므로 max-md:hidden 감싸기가 정상 동작한다.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-md:hidden">
        <Header />
      </div>
      {children}
      <div className="max-md:hidden">
        <FooterSection />
      </div>
    </>
  );
}
