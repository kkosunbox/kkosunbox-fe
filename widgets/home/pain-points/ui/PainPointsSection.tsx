"use client";

import Image from "next/image";
import painPointDogs from "../assets/pain-point-dogs.png";
import painPointQuestion from "../assets/pain-point-question.png";

const PAIN_POINTS = [
  "시중 간식 성분이 걱정돼서 아무거나 먹이기 불안해요",
  "우리 강아지 입맛이 까다로워서 간식 고르기 어려워요",
  "건강한 간식을 주고 싶은데 어떤 걸 골라야 할지 모르겠어요",
  "매번 간식 쇼핑하기가 번거로워요",
];

export default function PainPointsSection() {
  return (
    <section style={{ background: "var(--color-ingredients-bg)" }} className="pb-10 md:pb-16 md:pt-[46px]">
      <div className="mx-auto flex max-w-content flex-col items-center max-md:px-8 md:flex-row md:items-start md:justify-start md:gap-8 md:px-0">
        {/* Left — 텍스트 (남는 가로 공간 우선 확보, 체크리스트가 중앙선 넘어 확장 가능) */}
        <div className="flex w-full min-w-0 flex-col max-md:items-center md:items-start md:flex-1 md:pr-4 md:pt-8">
          <p
            className="text-[32px] md:text-[40px] leading-[64px] tracking-[-0.08em] underline lowercase text-[var(--color-accent-orange)] mb-0 md:mb-3"
            style={{ fontFamily: "var(--font-give-you-glory)" }}
          >
            for you
          </p>
          <Image
            src={painPointQuestion}
            alt="이런 고민 있으신가요?"
            className="mb-6 h-auto w-full max-w-[258px] md:mb-8 md:max-w-[323px]"
          />
          {/* 모바일 전용 구분선 */}
          <div className="md:hidden mb-3 w-full max-w-[294px] border-t border-[var(--color-divider-warm)]" />
          <ul className="flex flex-col gap-2 md:gap-0 w-full">
            {PAIN_POINTS.map((item) => (
              <li key={item} className="flex items-start gap-2 md:gap-3">
                <div className="md:mt-1 shrink-0">
                  <svg
                    className="max-md:size-5 md:size-6 shrink-0"
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
                <span className="max-md:text-body-12-r-griun-lh210 md:text-body-16-r-griun-lh210 text-[var(--color-text-body-warm)] md:whitespace-nowrap">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — 강아지 이미지 2장 */}
        <div className="flex w-full shrink-0 items-end justify-center max-md:pt-4 md:w-auto md:flex-none md:py-0">
          <Image
            src={painPointDogs}
            alt="귀여운 강아지들"
            className="object-contain w-full max-w-[320px] md:max-w-[495px] h-auto"
          />
        </div>
      </div>
    </section>
  );
}
