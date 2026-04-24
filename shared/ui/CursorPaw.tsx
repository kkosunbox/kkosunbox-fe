"use client";

import { useEffect, useState } from "react";

/**
 * 데스크톱 전용 커서 팔로워.
 * 기본 커서 위에 발바닥 이미지를 우하단 오프셋으로 따라다닙니다.
 * 터치 디바이스에서는 렌더링되지 않습니다.
 */
export default function CursorPaw() {
  const [pos, setPos] = useState({ x: -80, y: -80 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  // visible을 의존성에서 제외 — onMove 내부 조건 분기만 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <img
      src="/images/cursor-paw.webp"
      alt=""
      aria-hidden="true"
      // max-md:hidden — 터치 디바이스(모바일/태블릿)에서 숨김
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 max-md:hidden"
      style={{
        transform: `translate(${pos.x + 14}px, ${pos.y + 14}px)`,
        opacity: visible ? 0.88 : 0,
        transition: "transform 90ms ease-out, opacity 200ms ease",
      }}
    />
  );
}
