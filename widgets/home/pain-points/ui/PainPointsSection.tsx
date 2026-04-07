"use client";

import Image from "next/image";
import { Text } from "@/shared/ui";
import painPointSolutionPackage from "../assets/pain-point-solution-package.png";
import painPointQuestion from "../assets/pain-point-question.png";

const PAIN_POINTS = [
  "시중 간식 성분이 걱정돼서 아무거나 먹이기 불안해요",
  "우리 강아지 입맛이 까다로워서 간식 고르기 어려워요",
  "건강한 간식을 주고 싶은데 어떤 걸 골라야 할지 모르겠어요",
  "매번 간식 쇼핑하기가 번거로워요",
];

export default function PainPointsSection() {
  return (
    <section className="bg-[var(--color-surface-warm)] pt-8">
<div className="mx-auto flex flex-col-reverse md:flex-row justify-between max-w-content-narrow items-center md:gap-20 max-md:pl-8 max-md:pr-5 md:px-8">
        {/* Left — 제품 이미지 */}
        <div className="flex h-auto md:h-[434px] w-full max-md:max-w-[235px] md:w-[290px] shrink-0 items-center justify-center max-md:pt-6 md:py-0">
          <Image
            src={painPointSolutionPackage}
            alt="Pain Point Solution Package"
            className="object-cover max-h-[353px] md:max-h-none translate-x-10 md:translate-x-0"
          />
        </div>

        {/* Right */}
        <div className="flex flex-col items-center md:items-end pb-4 md:pb-8 md:pt-0 w-full md:w-auto">
          <Text
            as="p"
            variant="title-40-r"
            mobileVariant="title-32-r"
            className="mb-1 text-[var(--color-accent-orange)] underline tracking-[-0.08em]"
            style={{ fontFamily: "var(--font-give-you-glory)" }}
          >
            for you
          </Text>
          <Image
            src={painPointQuestion}
            alt="Pain Point Question"
            className="object-cover max-md:max-w-[280px] md:max-w-[324px]"
          />
          {/* 모바일 전용 구분선 */}
          <div className="md:hidden mt-6 w-[294px] border-t border-[var(--color-divider-warm)]" />
          <ul className="max-md:mt-3 md:mt-6 flex flex-col gap-1 md:gap-4 w-full">
            {PAIN_POINTS.map((item) => (
              <li key={item} className="flex flex-row-reverse md:flex-row justify-end gap-2 md:gap-3">
                <span
                  className="text-[var(--color-text-body-warm)] max-md:text-caption-12-r max-md:leading-[170%] md:text-body-18-r max-md:text-left md:text-right"
                  style={{ fontFamily: "Griun PolFairness" }}
                >
                  {item}
                </span>
                <div className="md:mt-1">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="8" fill="var(--color-beige)" />
                    <path
                      d="M8.5 11L10.7929 13.2929C11.1834 13.6834 11.8166 13.6834 12.2071 13.2929L19.5 6"
                      stroke="var(--color-text)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
