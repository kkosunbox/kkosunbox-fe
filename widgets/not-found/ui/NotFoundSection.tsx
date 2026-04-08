import Image from "next/image";
import Link from "next/link";
import notFoundImage from "@/public/images/404-not-found.png";

export default function NotFoundSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-54px)] bg-[var(--color-surface-light)]">
      <div className="flex flex-col items-center">
        {/* 404 NOT FOUND 이미지 — 웹 240×151, 모바일 180 auto */}
        <Image
          src={notFoundImage}
          alt="404 Not Found"
          width={240}
          height={151}
          className="max-md:w-[180px] max-md:h-auto"
          priority
        />

        {/* 서브텍스트 — image 하단과 11px 간격 */}
        <p
          className="mt-3 text-[var(--color-text-secondary)] text-center"
          style={{ fontSize: "16px", fontWeight: 500, lineHeight: "19px", letterSpacing: "-0.114286px" }}
        >
          찾으시는 페이지를 발견할 수 없습니다.
        </p>

        {/* 버튼 — 서브텍스트 하단과 142px 간격 */}
        <Link
          href="/"
          className="mt-[142px] max-md:mt-16 w-[400px] max-md:w-[312px] h-[48px] flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
          style={{ fontWeight: 600, fontSize: "16px", lineHeight: "140%", letterSpacing: "0.2px" }}
        >
          처음으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
