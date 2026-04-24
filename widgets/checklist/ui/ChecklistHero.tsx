import Image from "next/image";
import { Text } from "@/shared/ui";
import checklistHeroPcPattern from "../assets/checklist-hero-pc-pattern.webp";
import checklistHeroMobilePaw from "../assets/checklist-hero-mobile-paw.webp";
import checklistHeroTitle from "../assets/checklist-hero-title.webp";
import checklistHeroTitleMobile from "../assets/checklist-hero-title-mobile.webp";

const MOBILE_PADDING_TOP_PX = 20;
const DESKTOP_FORM_OVERLAP_PX = 50;
const DESKTOP_CONTENT_OFFSET_PX = DESKTOP_FORM_OVERLAP_PX / 2;

export default function ChecklistHero() {
  return (
    <section
      className="relative flex h-[210px] shrink-0 flex-col items-center overflow-hidden px-4 max-md:h-[143px] max-md:justify-start md:justify-center"
      style={
        {
          background: "var(--gradient-checklist-hero)",
          "--checklist-hero-mobile-pt": `${MOBILE_PADDING_TOP_PX}px`,
          "--checklist-hero-desktop-offset": `${DESKTOP_CONTENT_OFFSET_PX}px`,
        } as React.CSSProperties
      }
      aria-label="체크리스트 페이지 소개"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4"
        aria-hidden
      >
        <Image
          src={checklistHeroPcPattern}
          alt=""
          width={checklistHeroPcPattern.width}
          height={checklistHeroPcPattern.height}
          className="h-auto w-full max-w-[940px] object-contain max-md:hidden"
          sizes="(max-width: 940px) 100vw, 940px"
          priority
        />
      </div>
      <div className="relative z-10 flex w-full flex-col items-center text-center max-md:pt-[var(--checklist-hero-mobile-pt)] md:-translate-y-[var(--checklist-hero-desktop-offset)] md:pt-0">
        <h1 className="m-0 flex w-full max-w-[940px] flex-col items-center justify-center px-1">
          <Image
            src={checklistHeroTitleMobile}
            alt="체크리스트 작성"
            width={checklistHeroTitleMobile.width}
            height={checklistHeroTitleMobile.height}
            className="mx-auto h-auto w-full max-w-[150px] object-contain md:hidden"
            sizes="(max-width: 767px) min(100vw, 150px), 1px"
            priority
          />
          <Image
            src={checklistHeroTitle}
            alt="체크리스트를 작성해주세요!"
            width={checklistHeroTitle.width}
            height={checklistHeroTitle.height}
            className="h-auto object-contain max-md:hidden md:w-full md:max-w-[347px]"
            sizes="(max-width: 767px) 100vw, 347px"
            priority
          />
        </h1>
        <div className="relative w-full max-w-[345px] px-2 max-md:mt-2 md:mt-3">
          <Text
            as="p"
            variant="body-16-r"
            mobileVariant="body-14-r"
            className="leading-5 tracking-[-0.02em] text-[var(--color-text)]"
            style={{
              fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}
          >
            강아지의 특징과 선호하는 간식을 작성해주세요!
          </Text>
          <Image
            src={checklistHeroMobilePaw}
            alt=""
            width={checklistHeroMobilePaw.width}
            height={checklistHeroMobilePaw.height}
            className="pointer-events-none absolute right-0 top-1/2 h-[35px] w-[39px] -translate-y-1/2 object-contain md:hidden"
            sizes="39px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
