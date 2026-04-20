"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type RevealVariant =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "scale-in";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  as?: "div" | "section" | "span" | "article" | "aside" | "li";
  /** true면 인터섹션 관찰 없이 즉시 표시 (재방문 시 애니메이션 스킵용) */
  immediate?: boolean;
}

const HIDDEN_TRANSFORMS: Record<RevealVariant, string> = {
  "fade-up": "translateY(32px)",
  "fade-in": "none",
  "slide-left": "translateX(-48px)",
  "slide-right": "translateX(48px)",
  "scale-in": "scale(0.92)",
};

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = "",
  as: Tag = "div",
  immediate = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, immediate]);

  if (immediate) {
    return <Tag className={className}>{children}</Tag>;
  }

  const hiddenTransform = HIDDEN_TRANSFORMS[variant];

  const style: CSSProperties = visible
    ? {
        opacity: 1,
        transform: "none",
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }
    : {
        opacity: 0,
        transform: hiddenTransform,
      };

  return (
    <Tag
      // @ts-expect-error -- ref type differs per tag but always HTMLElement
      ref={ref}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
