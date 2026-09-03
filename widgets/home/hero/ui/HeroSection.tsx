"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import heroVideoHeading from "../assets/hero-video-heading.svg";

const HOME_HERO_VIDEOS = [
  { src: "/videos/home-hero.mp4", type: "video/mp4" },
] as const;
const HOME_HERO_POSTER_SRC = "/videos/home-hero-poster.webp";
const SNAP_LOCK_MS = 900;
const SWIPE_THRESHOLD = 48;

export default function HeroSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const snapLockedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = HOME_HERO_VIDEOS[currentVideoIndex];

  const snapToContent = useCallback(() => {
    if (snapLockedRef.current) return;

    const content = document.getElementById("home-content");
    if (!content) return;

    snapLockedRef.current = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerHeight = Number.parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
    ) || 0;
    const targetTop = content.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({
      top: targetTop,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    window.setTimeout(() => {
      snapLockedRef.current = false;
    }, SNAP_LOCK_MS);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function isHeroActive() {
      if (!section) return false;
      const rect = section.getBoundingClientRect();
      const bannerHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue("--banner-height"),
      ) || 0;
      return rect.top <= bannerHeight + 1 && rect.bottom > window.innerHeight * 0.45;
    }

    function handleWheel(event: WheelEvent) {
      if (event.deltaY <= 0 || !isHeroActive()) return;
      event.preventDefault();
      snapToContent();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isHeroActive()) return;
      if (!["ArrowDown", "PageDown", " "].includes(event.key)) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      snapToContent();
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [snapToContent]);

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const startY = touchStartYRef.current;
    touchStartYRef.current = null;
    const endY = event.changedTouches[0]?.clientY;
    if (startY === null || endY === undefined || startY - endY < SWIPE_THRESHOLD) return;
    snapToContent();
  }

  function handleCta() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }

    if ((profile?.checklistAnswers?.length ?? 0) > 0) {
      router.push("/checklist/result");
      return;
    }

    openChecklistForm();
  }

  return (
    <section
      ref={sectionRef}
      aria-label="꼬순박스 소개 영상"
      className="relative h-[calc(100svh-var(--banner-height))] overflow-hidden bg-black [touch-action:pan-x]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- generated first-frame poster */}
      <img
        src={HOME_HERO_POSTER_SRC}
        alt="간식을 기다리는 강아지들"
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />

      <video
        key={currentVideo.src}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={HOME_HERO_POSTER_SRC}
        aria-hidden="true"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
        onEnded={() => {
          setVideoReady(false);
          setCurrentVideoIndex((index) => (index + 1) % HOME_HERO_VIDEOS.length);
        }}
      >
        <source src={currentVideo.src} type={currentVideo.type} />
      </video>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.18) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-y-0 left-0 w-[min(664px,50%)]"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-y-0 right-0 w-[min(664px,50%)]"
        style={{
          background: "linear-gradient(270deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full items-end max-md:w-full max-md:px-5 md:max-lg:w-full md:max-lg:px-8 lg:w-[calc(100%_-_80px)] lg:max-w-[1520px]">
        <div className="max-w-[510px] pb-[18svh] text-white">
          <h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- exact supplied heading artwork */}
            <img
              src={heroVideoHeading.src}
              alt="강아지가 먼저 찾는 간식"
              width={heroVideoHeading.width}
              height={heroVideoHeading.height}
              className="h-auto max-md:w-[230px] md:w-[286px]"
            />
          </h2>
          <p className="mt-8 font-medium leading-[1.6] tracking-[-0.02em] text-white/85 max-md:text-[15px] md:text-[18px]">
            먹는 순간 표정이 달라지는
            <br className="md:hidden" /> 휴먼그레이드 수제 간식 구독
          </p>
          <button
            type="button"
            onClick={handleCta}
            className="mt-6 rounded-[12px] bg-[var(--color-cta-button)] font-semibold tracking-[-0.03em] text-white transition-opacity hover:opacity-90 max-md:h-12 max-md:px-6 max-md:text-[14px] md:h-[52px] md:w-[282px] md:text-[16px]"
          >
            10초 진단하고 우리 아이 맞춤 추천 받기
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={snapToContent}
        className="absolute left-1/2 z-20 -translate-x-1/2 text-white transition-opacity hover:opacity-70 max-md:bottom-5 md:bottom-7"
        aria-label="다음 섹션으로 이동"
      >
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <path
            d="M44.3327 32.6667L27.9994 49L11.666 32.6667M27.9994 49V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
