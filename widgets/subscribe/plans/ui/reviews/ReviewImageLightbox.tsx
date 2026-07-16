"use client";

import { useEffect, useRef } from "react";

export type ReviewLightboxState = { urls: string[]; index: number };

export default function ReviewImageLightbox({
  urls,
  index,
  onClose,
  onNavigate,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowLeft") onNavigateRef.current(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onNavigateRef.current(Math.min(urls.length - 1, index + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, urls.length]);

  const url = urls[index];
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="리뷰 사진"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="닫기"
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-[24px] font-light leading-none text-white hover:bg-black/70 md:right-6 lg:right-6 md:top-6 lg:top-6"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
      {urls.length > 1 ? (
        <span className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-body-13-m text-white">
          {index + 1} / {urls.length}
        </span>
      ) : null}
      {urls.length > 1 ? (
        <button
          type="button"
          aria-label="이전 사진"
          className="absolute max-lg:left-3 lg:left-10 top-1/2 z-10 flex h-10 w-10 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
          disabled={index <= 0}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
        >
          ‹
        </button>
      ) : null}
      {urls.length > 1 ? (
        <button
          type="button"
          aria-label="다음 사진"
          className="absolute max-lg:right-3 lg:right-10 top-1/2 z-10 flex h-10 w-10 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
          disabled={index >= urls.length - 1}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
        >
          ›
        </button>
      ) : null}
      <div
        className="relative flex max-h-[90vh] max-w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={`리뷰 사진 ${index + 1}`} className="max-h-[85vh] max-w-full object-contain" />
      </div>
    </div>
  );
}
