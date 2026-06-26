/**
 * 구조화 데이터(JSON-LD) 삽입용 컴포넌트.
 * schema.org 스키마 객체를 <script type="application/ld+json">로 렌더링한다.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 정적 스키마 객체만 전달되므로 XSS 위험 없음
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
