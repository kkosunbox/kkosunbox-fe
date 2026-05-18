/**
 * 구독 라우트 공통: main 영역 전체를 흰 배경으로 채워
 * tall viewport(iPad Pro 등)에서 body 베이지가 푸터 위로 비치지 않게 함.
 */
export default function SubscribeLayout({
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
