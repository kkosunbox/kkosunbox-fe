"use client";

import Image from "next/image";

import { Text, ScrollReveal } from "@/shared/ui";
import {
  BREAKPOINT_LG_PX,
  MEDIA_MAX_LG_SIZES,
  MEDIA_MAX_MD_SIZES,
} from "@/shared/config/breakpoints";

import aboutHeroTitle from "../assets/about-hero-title.png";
import aboutHeroCollage from "../assets/about-hero-collage.png";
import aboutFeatureHealthy from "../assets/about-feature-healty.webp";
import aboutFeatureCircle01 from "../assets/about-feature-circle-01.png";
import aboutFeatureCircle02 from "../assets/about-feature-circle-02.png";
import aboutFeatureCircle03 from "../assets/about-feature-circle-03.png";
import aboutCtaBg from "../assets/about-cta-bg.png";
import aboutCtaProduct from "../assets/about-cta-product.png";
import aboutCtaMark from "../assets/about-cta-mark.webp";
import aboutCtaLogo from "../assets/about-cta-logo.webp";

/** about-hero-title.png intrinsic ratio */
const ABOUT_HERO_LOGO_W = 176;
const ABOUT_HERO_LOGO_H = 58;

type FeatureCardProps = {
  circleIcon: typeof aboutFeatureCircle01;
  title: string;
  description: string;
};

function FeatureCard({ circleIcon, title, description }: FeatureCardProps) {
  return (
    <div className="flex min-h-[196px] flex-col items-center justify-center gap-4 rounded-3xl bg-[var(--color-support-faq-surface)] px-6 py-6">
      <Image src={circleIcon} alt="" width={52} height={52} aria-hidden />
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-subtitle-20-b tracking-[-0.02em] text-black capitalize">{title}</p>
        <p className="whitespace-pre-line text-center text-[14px] leading-[140%] tracking-[-0.02em] text-black capitalize">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AboutSection() {
  return (
    <>
      {/* Section 1: 꼬순박스 소개 */}
      <section className="overflow-hidden bg-[var(--color-about-hero-bg)] text-white max-lg:pt-[62px] max-md:pb-9 md:pb-14 max-lg:pb-14 lg:py-0 lg:max-h-[590px]">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 lg:px-0">
          <h1 className="flex justify-center max-lg:mb-10 lg:hidden">
            <Image
              src={aboutHeroTitle}
              alt="About Us"
              width={ABOUT_HERO_LOGO_W}
              height={ABOUT_HERO_LOGO_H}
              className="h-auto w-[134px]"
              sizes="134px"
              priority
            />
          </h1>

          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-12">
            <ScrollReveal
              variant="slide-right"
              duration={900}
              className="flex w-full max-w-[520px] flex-1 shrink-0 max-md:max-w-none lg:max-h-[590px] lg:max-w-none lg:min-w-[640px] lg:order-last"
            >
              <div className="flex w-full justify-center lg:h-[590px] lg:max-h-[590px] lg:items-center lg:justify-end lg:overflow-hidden">
                <div className="w-full overflow-hidden rounded-2xl lg:overflow-visible lg:rounded-none">
                  <Image
                    src={aboutHeroCollage}
                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"
                    width={1186}
                    height={1276}
                    className="mx-auto h-auto w-full max-w-[390px] object-contain object-top lg:hidden"
                    sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 390px`}
                    priority
                  />
                  <Image
                    src={aboutHeroCollage}
                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"
                    width={1186}
                    height={1276}
                    className="max-lg:hidden h-auto w-full object-contain lg:h-[447px] lg:max-h-none lg:w-auto lg:max-w-none lg:object-right lg:-translate-y-2"
                    sizes={`(min-width: ${BREAKPOINT_LG_PX}px) min(720px, 50vw)`}
                    priority
                  />
                </div>
              </div>
            </ScrollReveal>

            <div className="flex w-full flex-1 flex-col max-lg:mt-[44px] max-lg:items-center lg:items-start lg:min-w-[426px]">
              <ScrollReveal variant="fade-up" delay={100}>
                <h1 className="max-lg:hidden mb-10 w-fit max-w-full">
                  <Image
                    src={aboutHeroTitle}
                    alt="꼬순박스 로고"
                    width={ABOUT_HERO_LOGO_W}
                    height={ABOUT_HERO_LOGO_H}
                    priority
                  />
                </h1>
              </ScrollReveal>

              <div className="max-w-[426px] max-md:space-y-6 md:space-y-[24px] max-lg:mx-auto max-lg:text-center lg:mx-0 lg:text-left">
                <ScrollReveal variant="fade-up" delay={200}>
                  <p className="max-md:text-body-14-r text-body-16-r">간식을 고를 때마다 고민이 됩니다.</p>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={350}>
                  <p className="max-md:text-body-14-r text-body-16-r">
                    번거롭기도 하고,<br />
                    우리 아이에게 맞는 건지 늘 불안합니다.
                  </p>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={500}>
                  <p className="max-md:text-body-14-r-griun text-title-20-r-griun">
                    그래서, 안심하고 먹일 수 있는 간식만<br />
                    주고 싶었습니다.
                  </p>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={650}>
                  <p className="text-body-16-b-lh130 text-[var(--color-about-hero-accent)]">
                    꼬순박스는<br />
                    그 고민을 대신하기 위해 시작되었습니다.
                  </p>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 믿고 먹일 수 있는 간식, 생각보다 어렵습니다. + 피처 카드 */}
      <section className="bg-white py-10 md:py-[72px] lg:pt-[107px] lg:pb-[111px]">
        <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-0 px-6 md:gap-12 md:px-0">
          <ScrollReveal variant="fade-up">
            <Text
              as="h2"
              variant="title-28-r-griun"
              mobileVariant="title-24-r-griun"
              className="text-center text-[var(--color-about-feature-heading)] md:hidden"
            >
              믿고 먹일 수 있는 간식,<br />
              생각보다 어렵습니다.
            </Text>
          </ScrollReveal>

          <div className="flex flex-col items-center gap-0 max-md:mt-6 lg:flex-row lg:gap-[84px] lg:pl-[70px]">
            <ScrollReveal variant="scale-in" duration={800} className="flex w-full justify-center lg:w-[336px] lg:flex-none">
              <Image
                src={aboutFeatureHealthy}
                alt="건강한 수제 간식"
                width={336}
                height={312}
                className="h-auto w-full max-w-[320px] rounded-[30px] lg:max-w-[336px]"
                sizes={`${MEDIA_MAX_MD_SIZES} min(100vw - 48px, 320px), ${MEDIA_MAX_LG_SIZES} 320px, 336px`}
              />
            </ScrollReveal>

            <div className="flex w-full flex-1 flex-col gap-4 max-lg:items-center max-lg:text-center lg:max-w-[426px] lg:items-start lg:gap-6 lg:text-left">
              <ScrollReveal variant="slide-right" delay={200}>
                <h2 className="max-md:hidden max-lg:text-center lg:text-left text-title-28-r-griun text-[var(--color-about-feature-heading)]">
                  믿고 먹일 수 있는 간식,<br/>생각보다 어렵습니다.
                </h2>
              </ScrollReveal>

              <ScrollReveal variant="slide-right" delay={350}>
                <p className="max-w-[426px] whitespace-pre-line font-medium text-[var(--color-text)] max-md:text-[14px] max-md:leading-[140%] md:text-[16px] md:leading-[130%] max-lg:mx-auto lg:mx-0">
                  좋은 재료여도 맞지 않을 수 있고,<br/>
                  수제 간식도 매번 고르기 쉽지 않습니다.<br/><br/>
                  <span className="text-[var(--color-about-hero-accent)] font-bold">그래서 기준을 만들었습니다.</span><br/><br/>
                  제대로 확인된 재료,&nbsp;<br className="md:hidden"/>믿을 수 있는 과정,<br/>
                  그리고 우리 아이에게 맞는 선택.<br/><br/>
                  꼬순박스는 그 기준으로 간식을 담습니다.
                </p>
              </ScrollReveal>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-5 max-md:mt-[22px] md:max-w-[680px] md:mx-auto lg:max-w-none lg:mx-0 lg:grid-cols-3">
            {[
              { icon: aboutFeatureCircle01, title: "건강한 재료", desc: "반려견에게 안전하고 건강한\n재료만 사용합니다." },
              { icon: aboutFeatureCircle02, title: "정성 가득 수제간식", desc: "대량 생산이 아닌,\n직접 만든 간식만 담습니다." },
              { icon: aboutFeatureCircle03, title: "우리 아이 맞춤 간식", desc: "우리 아이의 특성과 알러지를\n고려해 추천드립니다." },
            ].map((card, i) => (
              <ScrollReveal key={card.title} variant="fade-up" delay={200 + i * 150}>
                <FeatureCard circleIcon={card.icon} title={card.title} description={card.desc} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="relative overflow-hidden py-14 lg:pt-[44px] lg:pb-[72px]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={aboutCtaBg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[var(--max-width-content)] flex-col gap-8 px-6 lg:px-0">
          <ScrollReveal variant="fade-up">
            <Text
              as="h2"
              variant="title-28-sb"
              mobileVariant="title-20-sb"
              className="text-center text-[var(--color-text-cta)] lg:leading-[65px]"
            >
              건강하고 안전한 간식을&nbsp;
              <br className="lg:hidden" />
              선물하세요!
            </Text>
          </ScrollReveal>

          <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-stretch lg:gap-[25px]">
            <div className="flex flex-col gap-5 max-lg:order-2 lg:w-[403px] lg:shrink-0">
              <ScrollReveal variant="fade-up" delay={150}>
                <div className="flex items-center justify-center rounded-[24px] bg-[var(--color-cta-logo-bg)] px-6 py-5 min-h-[108px] max-lg:min-h-[108px] lg:min-h-[135px] lg:rounded-2xl lg:py-0">
                  <Image
                    src={aboutCtaLogo}
                    alt="꼬순박스"
                    width={200}
                    height={52}
                    className="h-auto w-auto min-w-[111px] max-w-[200px]"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={300}>
                <div className="relative flex flex-col justify-end rounded-[20px] bg-[var(--color-cta-sage-bg)] px-6 min-h-[208px] max-lg:min-h-[208px] max-lg:pb-[24px] max-lg:pt-6 lg:flex-1 lg:h-[314px] lg:min-h-[314px] lg:pb-[42px] lg:pt-10 lg:rounded-2xl lg:px-10">
                  <Image
                    src={aboutCtaMark}
                    alt=""
                    width={78}
                    height={64}
                    aria-hidden
                    className="absolute right-5 top-[14px] h-[30px] w-[36px] lg:h-16 lg:w-[78px]"
                  />
                  <Text
                    variant="title-24-sb-lh42"
                    className="text-[var(--color-text-cta)] max-lg:text-[16px] max-lg:font-semibold max-lg:leading-[28px] max-lg:tracking-[-0.04em] lg:text-title-24-sb-lh42"
                  >
                    우리 아이의<br />
                    행복한 간식 시간을<br />
                    꼬순박스와 함께하세요.
                  </Text>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal
              variant="scale-in"
              delay={200}
              className="w-full max-lg:order-1 lg:flex-1 lg:min-h-0 lg:self-stretch"
            >
              <div
                className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[20px] lg:h-full lg:min-h-[469px] lg:rounded-2xl"
                style={{ background: "var(--gradient-cta-product)" }}
              >
                <Image
                  src={aboutCtaProduct}
                  alt="꼬순박스 상품"
                  width={aboutCtaProduct.width}
                  height={aboutCtaProduct.height}
                  className="h-full w-auto max-w-none"
                  sizes={`${MEDIA_MAX_MD_SIZES} calc(100vw - 48px), ${MEDIA_MAX_LG_SIZES} calc(100vw - 48px), 585px`}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
