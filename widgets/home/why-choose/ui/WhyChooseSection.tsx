"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import whyGalleryTitle from "../../why-gallery/assets/why-gallery-title.png";

export default function WhyChooseSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  function handleChecklistClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }
    const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
    router.push(hasChecklist ? "/subscribe" : "/checklist");
  }

  return (
    <section
      className="pt-16 md:pt-20 lg:pt-24 pb-10 md:pb-12 lg:pb-14"
      style={{ background: "var(--color-why-bg)" }}
    >
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0 flex flex-col items-center text-center">
        <ScrollReveal variant="fade-up">
          <Image
            src={whyGalleryTitle}
            alt="왜 우리 아이를 위해 꼬순박스를 선택해야할까요?"
            className="mb-5 h-auto w-full max-w-[320px] md:max-w-[466px] lg:mb-8"
            sizes="(min-width: 768px) 466px, 320px"
            priority
          />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={160}>
          <p className="text-white/70 max-md:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.6] mb-4 lg:mb-5">
            모든 강아지는 다르니까, 간식도 맞춤이어야 합니다.
          </p>
          <p className="font-bold max-md:text-[17px] md:text-[20px] lg:text-[24px] leading-[1.35] tracking-[-0.02em] mb-9 lg:mb-11">
            <span style={{ color: "var(--color-accent-orange)" }}>
              우리 아이의 취향과 건강 상태를 반영한
            </span>
            <br />
            <span className="text-white">맞춤형 수제 간식을 꼬순박스가 제안합니다.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={300}>
          <button
            type="button"
            onClick={handleChecklistClick}
            className="max-md:h-10 max-md:w-[270px] max-md:text-[13px] md:h-[52px] md:w-[288px] md:text-[15px] lg:h-[56px] lg:w-[288px] lg:text-[16px] rounded-full font-semibold tracking-[-0.04em] text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-cta-button)" }}
          >
            체크리스트 작성 후 구독하러 가기
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
