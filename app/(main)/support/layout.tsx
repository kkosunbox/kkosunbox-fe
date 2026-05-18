/**
 * 고객센터 라우트 공통: main 영역을 흰 배경으로 채워
 * tall viewport에서 푸터가 뷰포트 하단에 붙고 body 베이지가 비치지 않게 함.
 */
export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      {children}
    </div>
  );
}
