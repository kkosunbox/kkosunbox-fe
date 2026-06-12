"use client";

import { useEffect, useRef, useState } from "react";

const REVIEW_CONTENT_COLLAPSED_LINES = 3;

export default function ReviewContent({ content, className }: { content: string; className: string }) {
  const contentRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || expanded) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCanExpand(el.scrollHeight > el.clientHeight + 1);
      });
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [content, expanded]);

  return (
    <div className={className}>
      <p
        ref={contentRef}
        className="whitespace-pre-line text-[14px] font-medium leading-[20px] tracking-[-0.04em] text-[var(--color-text)]"
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: REVIEW_CONTENT_COLLAPSED_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {content}
      </p>
      {canExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex h-5 items-center gap-1 text-[14px] font-medium leading-5 tracking-[-0.04em] text-[var(--color-text-secondary)] capitalize transition-opacity hover:opacity-80"
        >
          {expanded ? "접기" : "더보기"}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={expanded ? "-rotate-90" : "rotate-90"}
          >
            <path
              d="M8 5L13 10L8 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
