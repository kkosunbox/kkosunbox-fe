"use client";

import Image from "next/image";
import { Text } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import aboutHeroCollage from "../assets/about-hero-collage.png";
import aboutHeroCollageMobile from "../assets/about-hero-collage-mobile.png";
import aboutFeatureHealthy from "../assets/about-feature-healty.png";
import aboutFeatureCircle01 from "../assets/about-feature-circle-01.png";
import aboutFeatureCircle02 from "../assets/about-feature-circle-02.png";
import aboutFeatureCircle03 from "../assets/about-feature-circle-03.png";
import aboutCtaProduct from "../assets/about-cta-product.png";
import aboutCtaMark from "../assets/about-cta-mark.png";
import aboutCtaLogo from "../assets/about-cta-logo.png";

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
      <section className="bg-white max-md:pt-5 max-md:pb-9 md:py-0 md:max-h-[578px]">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 md:px-0">

          {/* 모바일: 콜라주보다 위 — 데스크톱은 텍스트 열 타이틀만 사용 */}
          <h1 className="flex justify-center max-md:-mb-[30px] md:hidden">
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

          <div className="flex flex-col items-center md:flex-row md:items-center md:gap-12">

            {/* 이미지 — 모바일: 오른쪽 패딩까지 넓혀 콜라주 비율 유지 / 데스크톱: md:order-last 오른쪽 */}
            <div className="flex w-full max-w-[520px] flex-1 shrink-0 max-md:max-w-none max-md:self-stretch max-md:-mr-6 max-md:w-[calc(100%+1.5rem)] md:max-h-[578px] md:max-w-none md:min-w-[640px] md:order-last">
              <div className="flex w-full justify-center md:h-[578px] md:max-h-[578px] md:items-center md:justify-end md:overflow-hidden">
                <div className="w-full overflow-hidden rounded-2xl max-md:rounded-l-2xl max-md:rounded-r-none md:overflow-visible md:rounded-none">
                  <Image
                    src={aboutHeroCollageMobile}
                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"
                    width={aboutHeroCollageMobile.width}
                    height={aboutHeroCollageMobile.height}
                    className="h-auto w-full object-contain object-top md:hidden max-w-[390px] mx-auto"
                    sizes="(max-width: 767px) 100vw"
                    priority
                  />
                  <Image
                    src={aboutHeroCollage}
                    alt="꼬순박스 소개 — 반려견 사진과 브랜드 로고가 담긴 콜라주"
                    width={1186}
                    height={1276}
                    className="max-md:hidden h-auto w-full object-contain md:h-[650px] md:max-h-none md:w-auto md:max-w-none md:object-right md:-translate-y-2"
                    sizes="(min-width: 768px) min(720px, 50vw)"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* 텍스트 — DOM 두 번째 (모바일: 이미지 아래, 데스크톱: 왼쪽) */}
            <div className="flex w-full flex-1 flex-col max-md:items-center md:min-w-[426px]">
              <h1 className="max-md:hidden mb-10 w-fit max-w-full">
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
              <div className="max-w-[426px] space-y-6 max-md:mx-auto max-md:text-center max-md:text-body-14-r text-body-16-r text-[var(--color-text)]">
                <p>우리는 반려견에게 간식을 고를 때 늘 고민했습니다.</p>
                <p className="max-md:text-body-14-r-griun text-body-16-r-griun">
                  &ldquo;이 간식은 정말 건강할까?&rdquo;
                  <br />
                  &ldquo;우리 아이에게 맞는 간식일까?&rdquo;
                </p>
                <p>꼬순박스는 이런 고민에서 시작되었습니다.</p>
                <p>
                  사랑하는 반려견에게 안심하고 먹일 수 있는<br/>건강한 수제간식을 정기적으로 전달하고
                  싶었습니다.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━━ Section 2: 믿을 수 있는 건강한 간식 + 피처 카드 ━━━━ */}
      <section className="bg-[var(--color-secondary)] py-10 md:py-[72px]">
        <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-0 md:gap-12 px-6 md:px-8">

          {/* 모바일 전용: 헤딩 최상단 (데스크톱에서 숨김) */}
          <Text
            as="h2"
            variant="title-28-r-griun"
            mobileVariant="title-20-r-griun"
            className="text-center text-[var(--color-amber)] md:hidden"
          >
            믿을 수 있는 건강한 간식!
          </Text>

          {/* 상단: 이미지 + 텍스트 */}
          <div className="flex flex-col items-center gap-0 md:flex-row md:gap-16">

            {/* Left — 간식 이미지 */}
            <div className="flex w-full flex-1 justify-center">
              <Image
                src={aboutFeatureHealthy}
                alt="건강한 수제 간식"
                width={378}
                height={351}
                className="h-auto w-full max-w-[320px] rounded-[30px] md:max-w-[378px]"
                sizes="(max-width: 767px) min(100vw - 48px, 320px), 378px"
              />
            </div>

            {/* Right — 텍스트 */}
            <div className="flex w-full flex-1 flex-col gap-4 md:gap-8 max-md:items-center max-md:text-center">
              {/* 데스크톱 전용 헤딩 (모바일에서 숨김) */}
              <h2 className="max-md:hidden text-title-28-r-griun text-[var(--color-amber)]">
                믿을 수 있는 건강한 간식!
              </h2>
              <div className="flex max-w-[426px] flex-col gap-4 text-[var(--color-text)]">
                <Text variant="body-16-m" mobileVariant="body-14-r" as="p">
                  꼬순박스는 단순한 간식이 아닌
                  <br className="max-md:hidden" />
                  우리 아이의 건강과
                  <br className="md:hidden" />
                  행복을 위한 작은 정성이라고 생각합니다.
                </Text>
                <Text variant="body-16-m" mobileVariant="body-14-r" as="p">좋은 재료로 정직하게 만들고,</Text>
                <Text variant="body-16-m" mobileVariant="body-14-r" as="p">
                  반려견에게 꼭 필요한 영양을 고려하여<br />
                  건강하고 안전한 간식을 제공합니다.
                </Text>
              </div>
            </div>

          </div>

          {/* 하단: 피처 카드 3개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-md:mt-[22px]">
            <FeatureCard
              circleIcon={aboutFeatureCircle01}
              title="건강한 재료"
              description={"반려견에게 안전하고 건강한\n재료만 사용합니다."}
            />
            <FeatureCard
              circleIcon={aboutFeatureCircle02}
              title="정성 가득 수제간식"
              description={"사람의 손길로 정성을\n가득 넣어 만듭니다."}
            />
            <FeatureCard
              circleIcon={aboutFeatureCircle03}
              title="우리 아이 맞춤 간식"
              description={"반려견의 특성과\n건강 상태를 고려합니다."}
            />
          </div>

        </div>
      </section>

      {/* ━━━━ Section 4: CTA ━━━━ */}
      <section className="bg-[var(--color-support-faq-surface)] py-14 md:pt-[44px] md:pb-[72px]">
        <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-8 px-6 md:px-0">

          {/* 헤딩 */}
          <Text
            as="h2"
            variant="title-28-sb"
            mobileVariant="title-20-sb"
            className="text-center text-[var(--color-text-cta)] md:leading-[65px]"
          >
            건강하고 안전한 간식을
            <br className="md:hidden" />
            선물하세요!
          </Text>

          {/* 카드 영역 */}
          <div className="flex flex-col items-stretch gap-5 md:flex-row md:gap-[25px]">

            {/* Left: 로고 카드 + 텍스트 카드 — 모바일에서 상품 카드 아래 (order-2) */}
            <div className="flex flex-col gap-5 max-md:order-2 md:w-[403px] md:shrink-0">

              {/* 로고 카드 (피치) */}
              <div className="flex items-center justify-center rounded-[20px] bg-[var(--color-cta-logo-bg)] px-6 py-5 max-md:h-[108px] md:h-[135px] md:rounded-2xl md:py-0">
                <Image
                  src={aboutCtaLogo}
                  alt="꼬순박스"
                  width={200}
                  height={52}
                  className="h-auto w-auto min-w-[111px] max-w-[200px]"
                />
              </div>

              {/* 텍스트 카드 (세이지 그린) */}
              <div className="relative flex flex-1 flex-col justify-end rounded-[20px] bg-[var(--color-cta-sage-bg)] px-6 max-md:pb-[24px] max-md:pt-6 md:pb-[42px] md:pt-10 max-md:min-h-[208px] md:h-[314px] md:rounded-2xl md:px-10">
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

            </div>

            {/* Right: 상품 이미지 카드 — 모바일에서 최상단 (order-1) */}
            <div
              className="relative overflow-hidden rounded-[20px] max-md:order-1 max-md:h-[259px] md:flex-1 md:min-h-[469px] md:rounded-2xl"
              style={{ background: "var(--gradient-cta-product)" }}
            >
              {/* 모바일 장식 보더 프레임 */}
              <div
                className="absolute left-0 right-0 mx-auto md:hidden"
                style={{
                  top: "59px",
                  width: "calc(100% - 12px)",
                  height: "178px",
                  border: "24px solid rgba(255, 249, 243, 0.3)",
                  borderRadius: "12px",
                }}
              />

              {/* 상품 이미지 */}
              <Image
                src={aboutCtaProduct}
                alt="꼬순박스 상품"
                fill
                className="object-contain max-md:object-[center_12px] md:object-top"
                sizes="(max-width: 767px) 165px, 585px"
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
