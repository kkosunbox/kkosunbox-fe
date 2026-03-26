"use client";

import Image from "next/image";
import { Text, Button } from "@/shared/ui";
import heroContents01 from "../assets/hero-contents-01.png";
import heroContents01Mobi from "../assets/hero-contents-01-mobi.png";
import heroContents02 from "../assets/hero-contents-02.png";
import heroItem from "../assets/hero-item.png";

export default function HeroSection() {
  return (
    <section style={{ background: "var(--gradient-hero)" }} className="flex flex-col">
      <div className="mx-auto flex flex-col md:flex-row md:h-[537px] max-w-content items-center gap-2 md:gap-16 px-8 pt-10 md:pt-0 w-full">
        {/* Left */}
        <div className="flex-1 w-full flex flex-col items-center md:items-start">
          {/* 모바일 로고 이미지 */}
          <Image src={heroContents01} alt="꼬순박스 로고" className="md:hidden w-full max-w-[94px] max-h-[32px] mb-6" />
          <Image src={heroContents01Mobi} alt="꼬순박스 프리미엄 패키지 BOX" className="md:hidden w-full max-w-[265px] max-h-[96px] mb-2" />
          {/* 데스크톱 로고 이미지 */}
          <Image src={heroContents01} alt="꼬순박스 로고" className="max-md:hidden w-full max-w-[146px] max-h-[50px]" />
          <Image src={heroContents02} alt="패키지 알아보기" className="max-md:hidden mt-6 w-full" />
          <Text variant="title-24-sb" mobileVariant="body-14-m" className="text-white text-center md:text-left">
            100% 국내산 휴먼그레이드 수제간식 구독
          </Text>
          {/* 데스크톱 전용 버튼 */}
          <Button variant="primary" size="lg" className="mt-5 max-md:hidden">
            구독하러 가기
          </Button>
        </div>

        {/* Right */}
        <div className="flex flex-1 w-full items-end justify-center md:translate-x-[20%] md:h-full md:pb-0">
          <div className="relative w-full max-w-[280px] md:max-w-[324px]">
            <Image src={heroItem} alt="꼬순박스 패키지" className="h-auto w-full" />
            {/* 모바일 전용 — premium box 장식 텍스트 */}
            <p
              className="md:hidden absolute -top-1 -right-8 w-[108px] text-center capitalize rotate-[-16deg] text-[32px] leading-[32px] font-normal text-[var(--color-accent-rust)]"
              style={{ fontFamily: "var(--font-ms-madi)" }}
            >
              premium box
            </p>
            {/* 모바일 전용 — 이미지 하단에 걸쳐 있는 버튼, 뷰포트 기준 좌우 24px 여백 */}
            <Button
              variant="primary"
              size="lg"
              className="md:hidden absolute bottom-[26px] left-1/2 -translate-x-1/2 w-[calc(100vw-48px)]"
            >
              구독하러 가기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
