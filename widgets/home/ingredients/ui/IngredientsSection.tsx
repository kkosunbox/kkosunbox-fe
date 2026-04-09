"use client";

import { Button, Text } from "@/shared/ui";
import ingredientsDetailHappy from "../assets/ingredients-detail-happy.png";
import ingredientsDetailFlavor from "../assets/ingredients-detail-flavor.png";
import Image from "next/image";

function PawPrint({ className }: { className?: string }) {
  return (
    <svg
      width="70"
      height="58"
      viewBox="0 0 70 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="35" cy="40" rx="24" ry="16" fill="rgba(255,255,255,0.8)" />
      <circle cx="18" cy="20" r="8" fill="rgba(255,255,255,0.8)" />
      <circle cx="33" cy="12" r="8" fill="rgba(255,255,255,0.8)" />
      <circle cx="48" cy="14" r="8" fill="rgba(255,255,255,0.8)" />
      <circle cx="58" cy="24" r="7" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

function PawPrintSmall({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="40"
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="24" cy="28" rx="16" ry="11" fill="rgba(255,255,255,0.5)" />
      <circle cx="13" cy="14" r="5.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="23" cy="8" r="5.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="33" cy="10" r="5.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="40" cy="17" r="5" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

export default function IngredientsSection() {
  return (
    <section style={{ background: "var(--color-ingredients-bg)" }} className="pt-10 pb-10 md:pt-16 md:pb-16">
      <div className="mx-auto flex flex-col md:flex-row max-w-content justify-between items-center gap-10 md:gap-[76px] md:px-0">
        {/* Left — 이미지 + 발바닥 장식 */}
        <div className="relative flex w-full items-center justify-center md:max-w-[645px]">
          <Image
            src={ingredientsDetailHappy}
            alt="행복한 강아지와 수제간식 재료"
            className="h-auto w-full md:max-w-[645px] rounded-[32px] md:rounded-[52px] object-cover"
          />
        </div>

        {/* Right — 텍스트 */}
        <div className="flex flex-col items-center md:items-start md:pt-28">
          <p
            className="text-[22px] md:text-[28px] leading-[35px] tracking-[-0.08em] capitalize text-[var(--color-amber)] mb-2"
            style={{ fontFamily: "Griun PolFairness" }}
          >
            원재료에서 느껴지는
          </p>
          <Image
            src={ingredientsDetailFlavor}
            alt="생생한 재료의 맛"
            className="mb-6 h-auto w-full max-w-[220px] md:mb-8 md:max-w-[252px]"
          />
          <Text
            variant="subtitle-18-m"
            mobileVariant="body-14-m"
            className="mb-8 max-w-[291px] text-[var(--color-text-body-warm)] md:leading-[28px]"
          >
            체크리스트 작성 후 우리 아이에게 적절한<br className="hidden md:block"/> 원재료가 들어간 패키지 박스를<br className="hidden md:block" /> 추천받을 수 있습니다!
          </Text>
          <Button size="lg" className="max-md:hidden">
            체크리스트 작성하기
          </Button>
        </div>
      </div>
    </section>
  );
}
