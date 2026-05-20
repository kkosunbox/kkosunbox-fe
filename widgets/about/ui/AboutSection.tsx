"use client";



import Image from "next/image";

import { Text, ScrollReveal } from "@/shared/ui";

import logoMain from "@/shared/assets/logo-main.svg";

import aboutHeroCollage from "../assets/about-hero-collage.webp";

import aboutHeroCollageMobile from "../assets/about-hero-collage-mobile.webp";

import aboutFeatureHealthy from "../assets/about-feature-healty.webp";

import aboutFeatureCircle01 from "../assets/about-feature-circle-01.webp";

import aboutFeatureCircle02 from "../assets/about-feature-circle-02.webp";

import aboutFeatureCircle03 from "../assets/about-feature-circle-03.webp";

import aboutCtaProduct from "../assets/about-cta-product.png";

import aboutCtaMark from "../assets/about-cta-mark.webp";

import aboutCtaLogo from "../assets/about-cta-logo.webp";

import {

  BREAKPOINT_LG_PX,

  MEDIA_MAX_LG_SIZES,

  MEDIA_MAX_MD_SIZES,

} from "@/shared/config/breakpoints";



/** logo-main.svg viewBox 94×29 */

const ABOUT_HERO_LOGO_W = 158;

const ABOUT_HERO_LOGO_H = Math.round((29 * ABOUT_HERO_LOGO_W) / 94);



/* ── 피처 카드 ───────────────────────────────────────────── */

type FeatureCardProps = {

  circleIcon: typeof aboutFeatureCircle01;

  title: string;

  description: string;

};



function FeatureCard({ circleIcon, title, description }: FeatureCardProps) {

  return (

    <div

      className="flex flex-col items-center gap-4 rounded-3xl px-6 py-6"

      style={{ background: "rgba(255, 255, 255, 0.8)", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.04)" }}

    >

      <Image src={circleIcon} alt="" width={52} height={52} aria-hidden />

      <div className="flex flex-col items-center gap-2 text-center">

        <p className="text-subtitle-20-b text-[var(--color-text)]">{title}</p>

        <p className="whitespace-pre-line text-body-14-r">{description}</p>

      </div>

    </div>

  );

}



/* ── 메인 컴포넌트 ───────────────────────────────────────── */

export default function AboutSection() {

  return (

    <>

      {/* ━━━━ Section 1: 꼬순박스 소개 ━━━━ */}

      <section className="overflow-hidden bg-white max-md:pt-5 max-md:pb-9 lg:py-0 lg:max-h-[578px]">

        <div className="mx-auto max-w-[var(--max-width-content)] px-6 lg:px-0">



          {/* 모바일·태블릿: 콜라주보다 위 — 데스크톱은 텍스트 열 타이틀만 사용 */}

          <h1 className="flex justify-center max-md:-mb-[30px] lg:hidden">

            <Image

              src={logoMain}

              alt="꼬순박스 로고"

              width={ABOUT_HERO_LOGO_W}

              height={ABOUT_HERO_LOGO_H}

              className="h-auto w-[120px]"

              sizes="120px"

              priority

            />

          </h1>



          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-12">



            {/* 이미지 — 모바일·태블릿: 오른쪽 패딩까지 넓혀 콜라주 비율 유지 / 데스크톱: lg:order-last 오른쪽 */}

            <ScrollReveal variant="slide-right" duration={900} className="flex w-full max-w-[520px] flex-1 shrink-0 max-md:max-w-none max-md:self-stretch max-md:-mr-6 max-md:w-[calc(100%+1.5rem)] lg:max-h-[578px] lg:max-w-none lg:min-w-[640px] lg:order-last">

              <div className="flex w-full justify-center lg:h-[578px] lg:max-h-[578px] lg:items-center lg:justify-end lg:overflow-hidden">

                <div className="w-full overflow-hidden rounded-2xl max-md:rounded-l-2xl max-md:rounded-r-none lg:overflow-visible lg:rounded-none">

                  <Image

                    src={aboutHeroCollageMobile}

                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"

                    width={aboutHeroCollageMobile.width}

                    height={aboutHeroCollageMobile.height}

                    className="mx-auto h-auto w-full max-w-[390px] object-contain object-top lg:hidden"

                    sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 390px`}

                    priority

                  />

                  <Image

                    src={aboutHeroCollage}

                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"

                    width={1186}

                    height={1276}

                    className="max-lg:hidden h-auto w-full object-contain lg:h-[650px] lg:max-h-none lg:w-auto lg:max-w-none lg:object-right lg:-translate-y-2"

                    sizes={`(min-width: ${BREAKPOINT_LG_PX}px) min(720px, 50vw)`}

                    priority

                  />

                </div>

              </div>

            </ScrollReveal>



            {/* 텍스트 — DOM 두 번째 (모바일·태블릿: 이미지 아래, 데스크톱: 왼쪽) */}

            <div className="flex w-full flex-1 flex-col max-md:items-center lg:min-w-[426px]">

              <ScrollReveal variant="fade-up" delay={100}>

                <h1 className="max-lg:hidden mb-10 w-fit max-w-full">

                  <Image

                    src={logoMain}

                    alt="꼬순박스 로고"

                    width={ABOUT_HERO_LOGO_W}

                    height={ABOUT_HERO_LOGO_H}

                    className="h-auto w-[158px]"

                    sizes="158px"

                    priority

                  />

                </h1>

              </ScrollReveal>

              <div className="max-w-[426px] space-y-6 max-md:mx-auto max-md:text-center max-md:text-body-14-r text-body-16-r text-[var(--color-text)]">

                <ScrollReveal variant="fade-up" delay={200}>

                  <p>우리는 반려견에게 간식을 고를 때 늘 고민했습니다.</p>

                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={350}>

                  <p className="max-md:text-body-14-r-griun text-body-16-r-griun">

                    &ldquo;이 간식은 정말 건강할까?&rdquo;

                    <br />

                    &ldquo;우리 아이에게 맞는 간식일까?&rdquo;

                  </p>

                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={500}>

                  <p>꼬순박스는 이런 고민에서 시작되었습니다.</p>

                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={650}>

                  <p>

                    사랑하는 반려견에게 안심하고 먹일 수 있는<br/>건강한 수제간식을 정기적으로 전달하고

                    싶었습니다.

                  </p>

                </ScrollReveal>

              </div>

            </div>



          </div>

        </div>

      </section>



      {/* ━━━━ Section 2: 믿을 수 있는 건강한 간식 + 피처 카드 ━━━━ */}

      <section className="bg-[var(--color-secondary)] py-10 lg:py-[72px]">

        <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-0 lg:gap-12 px-6 lg:px-0">



          {/* 모바일·태블릿 전용: 헤딩 최상단 (데스크톱에서 숨김) */}

          <ScrollReveal variant="fade-up">

            <Text

              as="h2"

              variant="title-28-r-griun"

              mobileVariant="title-20-r-griun"

              className="text-center text-[var(--color-amber)] lg:hidden"

            >

              믿을 수 있는 건강한 간식!

            </Text>

          </ScrollReveal>



          {/* 상단: 이미지 + 텍스트 */}

          <div className="flex flex-col items-center gap-0 lg:flex-row lg:gap-16">



            {/* Left — 간식 이미지 */}

            <ScrollReveal variant="scale-in" duration={800} className="flex w-full flex-1 justify-center">

              <Image

                src={aboutFeatureHealthy}

                alt="건강한 수제 간식"

                width={378}

                height={351}

                className="h-auto w-full max-w-[320px] rounded-[30px] lg:max-w-[378px]"

                sizes={`${MEDIA_MAX_MD_SIZES} min(100vw - 48px, 320px), ${MEDIA_MAX_LG_SIZES} 320px, 378px`}

              />

            </ScrollReveal>



            {/* Right — 텍스트 */}

            <div className="flex w-full flex-1 flex-col gap-4 lg:gap-8 max-md:items-center max-md:text-center">

              {/* 데스크톱 전용 헤딩 (모바일·태블릿에서 숨김) */}

              <ScrollReveal variant="slide-right" delay={200}>

                <h2 className="max-lg:hidden text-title-28-r-griun text-[var(--color-amber)]">

                  믿을 수 있는 건강한 간식!

                </h2>

              </ScrollReveal>

              <ScrollReveal variant="slide-right" delay={350}>

                <div className="flex max-w-[426px] flex-col gap-4 text-[var(--color-text)]">

                  <Text variant="body-16-m" mobileVariant="body-14-r" as="p">

                    꼬순박스는 단순한 간식이 아닌

                    <br className="max-lg:hidden" />

                    우리 아이의 건강과

                    <br className="lg:hidden" />

                    행복을 위한 작은 정성이라고 생각합니다.

                  </Text>

                  <Text variant="body-16-m" mobileVariant="body-14-r" as="p">좋은 재료로 정직하게 만들고,</Text>

                  <Text variant="body-16-m" mobileVariant="body-14-r" as="p">

                    반려견에게 꼭 필요한 영양을 고려하여<br />

                    건강하고 안전한 간식을 제공합니다.

                  </Text>

                </div>

              </ScrollReveal>

            </div>



          </div>



          {/* 하단: 피처 카드 3개 */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-md:mt-[22px]">

            {[

              { icon: aboutFeatureCircle01, title: "건강한 재료", desc: "반려견에게 안전하고 건강한\n재료만 사용합니다." },

              { icon: aboutFeatureCircle02, title: "정성 가득 수제간식", desc: "사람의 손길로 정성을\n가득 넣어 만듭니다." },

              { icon: aboutFeatureCircle03, title: "우리 아이 맞춤 간식", desc: "반려견의 특성과\n건강 상태를 고려합니다." },

            ].map((card, i) => (

              <ScrollReveal key={card.title} variant="fade-up" delay={200 + i * 150}>

                <FeatureCard

                  circleIcon={card.icon}

                  title={card.title}

                  description={card.desc}

                />

              </ScrollReveal>

            ))}

          </div>



        </div>

      </section>



      {/* ━━━━ Section 4: CTA ━━━━ */}

      <section className="bg-[var(--color-support-faq-surface)] py-14 lg:pt-[44px] lg:pb-[72px]">

        <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-8 px-6 lg:px-0">



          {/* 헤딩 */}

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



          {/* 카드 영역 */}

          <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:gap-[25px]">



            {/* Left: 로고 카드 + 텍스트 카드 — 모바일·태블릿에서 상품 카드 아래 (order-2) */}

            <div className="flex flex-col gap-5 max-lg:order-2 lg:w-[403px] lg:shrink-0">



              {/* 로고 카드 (피치) */}

              <ScrollReveal variant="fade-up" delay={150}>

                <div className="flex items-center justify-center rounded-[20px] bg-[var(--color-cta-logo-bg)] px-6 py-5 max-md:h-[108px] lg:h-[135px] lg:rounded-2xl lg:py-0">

                  <Image

                    src={aboutCtaLogo}

                    alt="꼬순박스"

                    width={200}

                    height={52}

                    className="h-auto w-auto min-w-[111px] max-w-[200px]"

                  />

                </div>

              </ScrollReveal>



              {/* 텍스트 카드 (세이지 그린) */}

              <ScrollReveal variant="fade-up" delay={300}>

                <div className="relative flex flex-1 flex-col justify-end rounded-[20px] bg-[var(--color-cta-sage-bg)] px-6 max-md:pb-[24px] max-md:pt-6 lg:pb-[42px] lg:pt-10 max-md:min-h-[208px] lg:h-[314px] lg:rounded-2xl lg:px-10">

                  <Image

                    src={aboutCtaMark}

                    alt=""

                    width={78}

                    height={64}

                    aria-hidden

                    className="absolute right-5 top-[14px] max-md:w-[36px] max-md:h-[30px]"

                  />

                  <p className="max-md:text-[16px] max-md:font-semibold max-md:leading-[28px] max-md:tracking-[-0.04em] text-title-28-sb text-[var(--color-text-cta)]">

                    우리 아이의<br />

                    행복한 간식 시간을<br />

                    꼬순박스와 함께하세요.

                  </p>

                </div>

              </ScrollReveal>



            </div>



            {/* Right: 상품 이미지 카드 — 모바일·태블릿에서 최상단 (order-1) */}

            <ScrollReveal variant="scale-in" delay={200} className="w-full max-lg:order-1 lg:flex-1">

              <div

                className="relative w-full overflow-hidden rounded-[20px] max-md:aspect-[586/469] lg:h-full lg:min-h-[469px] lg:aspect-auto lg:rounded-2xl"

                style={{ background: "var(--gradient-cta-product)" }}

              >

                <Image

                  src={aboutCtaProduct}

                  alt="꼬순박스 상품"

                  fill

                  className="object-contain lg:object-top"

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


