"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, ScrollReveal, useModal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import ingredientsDetailHappy from "../assets/ingredients-detail-happy.webp";
import ingredientsDetailProfitPackage from "../assets/ingredients-detail-profit-package.webp";

export default function IngredientsSection() {
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const router = useRouter();

  function handleChecklistClick() {
    if (isLoggedIn) {
      router.push("/checklist");
      return;
    }
    openAlert({
      type: "info",
      title: "로그인이 필요해요",
      description: "체크리스트 작성은 로그인 후 이용할 수 있어요.",
      primaryLabel: "로그인 하러 가기",
      onPrimary: () => router.push("/login?next=/checklist"),
      secondaryLabel: "취소",
    });
  }

  return (
    <section style={{ background: "var(--color-ingredients-bg)" }} className="pt-7 pb-10 md:pt-16 lg:pt-16 md:pb-16 lg:pb-16">
      <div className="mx-auto flex flex-col md:flex-row lg:flex-row md:max-w-[838px] lg:max-w-content max-md:justify-between md:justify-start lg:justify-between max-md:items-center md:items-end lg:items-center gap-5 md:gap-[80px] lg:gap-[54px] md:px-0 lg:px-0">
        {/* Left — 이미지 */}
        <ScrollReveal variant="slide-left" duration={800} className="relative flex w-full items-center justify-center md:max-w-[458px] lg:max-w-[630px] px-6 md:px-0 lg:px-0">
          <Image
            src={ingredientsDetailHappy}
            alt="행복한 강아지와 수제간식 재료"
            className="h-auto w-full max-md:max-w-[640px] md:max-w-[458px] lg:max-w-[645px] max-md:rounded-[32px] md:rounded-[24px] lg:rounded-[52px] object-cover"
          />
        </ScrollReveal>

        {/* Right — 텍스트 */}
        <div className="flex flex-col items-center md:items-start lg:items-start lg:pt-28">
          <ScrollReveal variant="slide-right" delay={200}>
            <p
              className="text-[22px] md:text-[18px] lg:text-[28px] leading-[35px] tracking-[-0.08em] capitalize text-[var(--color-amber)] mb-2"
              style={{ fontFamily: "Griun PolFairness" }}
            >
              우리 아이를 위한
            </p>
          </ScrollReveal>
          <ScrollReveal variant="slide-right" delay={350}>
            <Image
              src={ingredientsDetailProfitPackage}
              alt="맞춤 패키지 박스 찾기"
              className="mb-6 h-auto w-full max-w-[220px] md:mb-4 lg:mb-8 md:max-w-[223px] lg:max-w-[318px]"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={500}>
            <p className="max-lg:text-body-14-m lg:text-subtitle-18-m mb-6 md:mb-8 max-w-[299px] lg:max-w-[328px] text-[var(--color-text-body-warm)] lg:leading-[28px] max-md:text-center">
              우리 아이를 위한 체크리스트를 완성해 보세요! <br />꼭 필요한 재료만 쏙쏙 골라 <br />맞춤 패키지 박스를 추천해 드려요.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={650}>
            <Button
              onClick={handleChecklistClick}
              size="lg"
              className="max-lg:h-10 max-lg:w-[212px] max-lg:text-[13px] max-lg:font-semibold max-lg:leading-[30px] max-lg:tracking-[-0.04em] lg:h-[52px] lg:w-[196px] lg:text-[16px] lg:font-semibold lg:leading-[30px] lg:tracking-[-0.04em] bg-[var(--color-text)] text-white rounded-[8px]"
            >
              체크리스트 작성 하러가기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
