/**
 * 구조화 데이터(JSON-LD) 삽입용 컴포넌트.
 * schema.org 스키마 객체를 <script type="application/ld+json">로 렌더링한다.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // API에서 받은 상품명·설명도 안전하게 사용할 수 있도록 script 종료 문자를 무력화한다.
  const serializedData = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedData }}
    />
  );
}
