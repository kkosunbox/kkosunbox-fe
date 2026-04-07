"use client";

import { useState, useCallback, ElementType } from "react";
import Button from "./Button";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "lg" | "md" | "sm";

type ButtonWithPawEffectProps = {
  as?: ElementType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: React.MouseEventHandler;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  [key: string]: unknown;
};

type Particle = {
  id: number;
  tx: number;
  ty: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  color: string;
};

// 3:1 비율로 primary(갈색) 위주, 간헐적으로 accent-orange
const PAW_COLORS = [
  "var(--color-primary)",
  "var(--color-primary)",
  "var(--color-primary)",
  "var(--color-accent-orange)",
];

function spawnParticles(count = 8): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angleRad = Math.random() * Math.PI * 2;
    const distance = 32 + Math.random() * 44; // 32–76px
    return {
      id: Date.now() + i,
      tx: Math.cos(angleRad) * distance,
      ty: Math.sin(angleRad) * distance,
      size: 10 + Math.random() * 9,   // 10–19px
      rotation: Math.random() * 360,
      duration: 380 + Math.random() * 200, // 380–580ms
      delay: Math.random() * 80,           // 0–80ms 스태거
      color: PAW_COLORS[Math.floor(Math.random() * PAW_COLORS.length)],
    };
  });
}

function PawParticle({
  particle,
  onEnd,
}: {
  particle: Particle;
  onEnd: () => void;
}) {
  const { tx, ty, size, rotation, duration, delay, color } = particle;

  return (
    <span
      aria-hidden="true"
      className="animate-paw-particle pointer-events-none absolute left-1/2 top-1/2"
      style={
        {
          "--tx": `${tx}px`,
          "--ty": `${ty}px`,
          "--rot": `${rotation}deg`,
          "--dur": `${duration}ms`,
          "--delay": `${delay}ms`,
          color,
          width: size,
          height: size,
        } as React.CSSProperties
      }
      onAnimationEnd={onEnd}
    >
      {/* 발바닥 모양 인라인 SVG — fill="currentColor"로 color 변수를 상속 */}
      <svg
        viewBox="-19 -23 38 41"
        width={size}
        height={size}
        fill="currentColor"
      >
        <ellipse cx="0" cy="6" rx="13" ry="10" />
        <circle cx="-11" cy="-9" r="6" />
        <circle cx="-3" cy="-15" r="6" />
        <circle cx="3" cy="-15" r="6" />
        <circle cx="11" cy="-9" r="6" />
      </svg>
    </span>
  );
}

export default function ButtonWithPawEffect({
  onClick,
  ...buttonProps
}: ButtonWithPawEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleClick = useCallback<React.MouseEventHandler>(
    (e) => {
      onClick?.(e);
      // 누적 append — 빠른 연속 클릭 시 이전 파티클이 계속 날아가는 채로 새 파티클 추가
      setParticles((prev) => [...prev, ...spawnParticles()]);
    },
    [onClick]
  );

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <span className="relative inline-flex">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Button {...(buttonProps as any)} onClick={handleClick} />
      {particles.map((p) => (
        <PawParticle key={p.id} particle={p} onEnd={() => removeParticle(p.id)} />
      ))}
    </span>
  );
}
