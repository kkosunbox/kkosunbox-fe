"use client";

import Link from "next/link";

export default function UnderConstruction() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
      <p
        className="text-primary"
        style={{ fontFamily: "GangwonEduPower", fontSize: "28px" }}
      >
        꼬순박스
      </p>
      <p className="text-subtitle-18-m text-[var(--color-text)]">
        아직 개발중인 기능입니다
      </p>
      <Link
        href="/"
        className="text-body-14-r text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-primary"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
