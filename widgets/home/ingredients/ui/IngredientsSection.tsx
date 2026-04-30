"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Text, ScrollReveal, useModal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import ingredientsDetailHappy from "../assets/ingredients-detail-happy.webp";
import ingredientsDetailFlavor from "../assets/ingredients-detail-flavor.webp";

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
      title: "로그인이 필요해요",
      description: "체크리스트 작성은 로그인 후 이용할 수 있어요.",
      primaryLabel: "로그인 하러 가기",
      onPrimary: () => router.push("/login?next=/checklist"),
      secondaryLabel: "취소",
    });
  }

  return (
    <section style={{ background: "var(--color-ingredients-bg)" }} className="pt-7 pb-10 md:pt-16 md:pb-16">
      <div className="mx-auto flex flex-col md:flex-row max-w-content justify-between items-center gap-5 md:gap-[76px] md:px-0">
        {/* Left — 이미지 + 발바닥 장식 */}
        <ScrollReveal variant="slide-left" duration={800} className="relative flex w-full items-center justify-center md:max-w-[645px] px-6 md:px-0">
          <Image
            src={ingredientsDetailHappy}
            alt="행복한 강아지와 수제간식 재료"
            className="h-auto w-full md:max-w-[645px] rounded-[32px] md:rounded-[52px] object-cover"
          />
        </ScrollReveal>

        {/* Right — 텍스트 */}
        <div className="flex flex-col items-center md:items-start md:pt-28">
          <ScrollReveal variant="slide-right" delay={200}>
            <p
              className="text-[22px] md:text-[28px] leading-[35px] tracking-[-0.08em] capitalize text-[var(--color-amber)] mb-2"
              style={{ fontFamily: "Griun PolFairness" }}
            >
              원재료에서 느껴지는
            </p>
          </ScrollReveal>
          <ScrollReveal variant="slide-right" delay={350}>
            <Image
              src={ingredientsDetailFlavor}
              alt="생생한 재료의 맛"
              className="mb-6 h-auto w-full max-w-[220px] md:mb-8 md:max-w-[252px]"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={500}>
            <Text
              variant="subtitle-18-m"
              mobileVariant="body-14-m"
              className="mb-8 max-w-[291px] text-[var(--color-text-body-warm)] md:leading-[28px] max-md:text-center"
            >
              체크리스트 작성 후 우리 아이에게 적절한<br /> 원재료가 들어간 패키지 박스를<br /> 추천받을 수 있습니다!
            </Text>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={650}>
            <Button
              onClick={handleChecklistClick}
              size="lg"
              className="max-md:h-10 max-md:w-[186px] max-md:text-body-16-sb max-md:leading-[30px] md:h-[52px] md:w-[192px] md:text-[18px] md:font-semibold md:leading-[30px]"
            >
              체크리스트 작성하기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
