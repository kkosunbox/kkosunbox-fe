"use client";

import { ScrollReveal } from "@/shared/ui";
import Image from "next/image";
import painPointDogs from "../assets/pain-point-dogs.webp";
import painPointQuestion from "../assets/pain-point-question.webp";

const PAIN_POINTS = [
  "아무 간식이나 먹이기 불안해요 ",
  "알러지 때문에 간식을 고르기 어려워요",
  "간식을 먹다가 질려서 남기는 경우가 많아요",
  "믿고 먹일 수 있는 간식이 없어요",
];

export default function PainPointsSection() {
  return (
    <section style={{ background: "var(--color-ingredients-bg)" }} className="pb-10 md:pb-16 md:pt-[46px]">
      <div className="mx-auto flex max-w-content flex-col items-center max-md:px-8 md:flex-row md:items-start md:justify-start md:gap-8 md:px-0">
        {/* Left — 텍스트 (남는 가로 공간 우선 확보, 체크리스트가 중앙선 넘어 확장 가능) */}
        <div className="flex w-full min-w-0 flex-col max-md:items-center md:items-start md:flex-1 md:pr-4 md:pt-8">
          <ScrollReveal variant="fade-up">
            <p
              className="text-[32px] md:text-[40px] leading-[64px] tracking-[-0.08em] underline lowercase text-[var(--color-accent-orange)] mb-0 md:mb-3"
              style={{ fontFamily: "var(--font-give-you-glory)" }}
            >
              for you
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={150}>
            <Image
              src={painPointQuestion}
              alt="이런 고민 있으신가요?"
              className="mb-6 h-auto w-full max-w-[258px] md:mb-8 md:max-w-[387px]"
            />
          </ScrollReveal>
          {/* 모바일 전용 구분선 */}
          <div className="md:hidden mb-3 w-full border-t border-[var(--color-divider-warm)]" />
          <ul className="flex w-full max-w-full flex-col items-start gap-2 text-left md:mx-0 md:w-full md:gap-0">
            {PAIN_POINTS.map((item, i) => (
              <ScrollReveal key={item} variant="fade-up" delay={300 + i * 120}>
                <li className="flex items-start gap-2 md:gap-3">
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
              </ScrollReveal>
            ))}
          </ul>
        </div>

        {/* Right — 강아지 이미지 2장 */}
        <ScrollReveal variant="slide-right" duration={900} className="flex w-full shrink-0 items-end justify-center max-md:pt-4 md:w-auto md:flex-none md:py-0">
          <Image
            src={painPointDogs}
            alt="귀여운 강아지들"
            className="object-contain w-full max-w-[320px] md:max-w-[495px] h-auto"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
