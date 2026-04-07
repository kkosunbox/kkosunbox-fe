"use client";

import Image from "next/image";
import dogImage from "../assets/home-benefits-right-dog.png";
import benefitsTitle from "../assets/home-benefits-title.png";
import benefitsContents01 from "../assets/home-benefits-contents-01.png";
import benefitsContents02 from "../assets/home-benefits-contents-02.png";
import mobilebottom from "../assets/home-benefits-mobi-bottom.png";

const TAGS = ["#프리미엄", "#수제간식", "#국내산", "#구독"];

export default function BenefitsSection() {
  return (
    <>
    <section className="bg-[var(--color-background)] md:h-[370px]">
      <div className="h-full mx-auto flex flex-col md:flex-row max-w-content items-center justify-between gap-7 md:gap-16 max-md:px-8 md:px-0 py-8.5 md:py-0">
        {/* Left */}
        <div className="w-full flex flex-col items-center md:items-start">
          <span className="sr-only">Point 1</span>
          <Image src={benefitsTitle} alt="" aria-hidden className="w-full h-full object-cover max-w-[66px] max-h-[28px] mb-5" />
          <h2 className="sr-only">우리아이 행복 간식</h2>
          <Image src={benefitsContents01} alt="" aria-hidden className="w-full h-full object-cover max-w-[193px] md:max-w-[254px] max-md:mb-2 md:mb-4" />
          <p className="sr-only">다양하게 즐겨요</p>
          <Image src={benefitsContents02} alt="" aria-hidden className="w-full h-full object-cover max-w-[243px] md:max-w-[292px] mb-5" />
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-tag)] px-2 text-white text-body-14-r tracking-[-0.02em]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right — 강아지 원형 사진 */}
        <div className="flex w-full md:w-auto shrink-0 items-center justify-center">
          <Image src={dogImage} alt="강아지 사진" className="w-full h-full object-cover max-h-[310px] md:max-h-[300px] translate-x-3 md:translate-x-0" />
        </div>
      </div>
    </section>
    <Image src={mobilebottom} alt="" aria-hidden className="md:hidden w-full h-auto" />
    </>
  );
}
