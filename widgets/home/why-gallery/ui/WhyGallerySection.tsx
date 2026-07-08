"use client";

import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { GalleryCTALogo } from "./GalleryCTALogo";
import { GalleryLogoMark } from "./GalleryLogoMark";
import { GalleryMutedLogo } from "./GalleryMutedLogo";
import whyGalleryTitle from "../assets/why-gallery-title.svg";
import whyGalleryTitlePawDeco from "../assets/why-gallery-title-paw-deco.webp";
import pawsPatternWithBg from "../assets/paws-patterns-with-bg.webp";
import galleryDogsUpper001 from "./gallery-dogs-upper-001.webp";
import galleryDogsUpper002 from "./gallery-dogs-upper-002.webp";
import galleryDogsUpper003 from "./gallery-dogs-upper-003.webp";
import galleryDogsDowner001 from "./gallery-dogs-downer-001.webp";
import galleryDogsDowner002 from "./gallery-dogs-downer-002.webp";
import galleryDogsDowner003 from "./gallery-dogs-downer-003.webp";

type GalleryItem =
  | { type: "image"; src: StaticImageData; alt: string }
  | { type: "logo"; bg: string; tone?: "white" }
  | { type: "paws" }
  | { type: "cta"; bg: string; text: string; wide: boolean };

function ArrowButton() {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.12)] md:h-9 md:w-9"
      style={{ background: "rgba(255,255,255,0.5)" }}
    >
      <svg className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M5 3L9 7L5 11"
          stroke="#2F2F2F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PawDeco() {
  return (
    <svg
      viewBox="0 0 112 123"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute right-2 top-2 h-[51px] w-[49px] select-none md:right-4 md:top-3 md:h-[123px] md:w-[112px]"
    >
      <path d="M55.9595 56.5548C50.8201 57.8148 46.1233 59.7799 41.9064 62.7886C37.4775 65.9483 31.7177 66.2095 28.0217 63.5424C24.1026 60.7142 22.8492 52.0027 30.5267 46.751C32.6522 43.6566 28.4254 37.8824 38.1027 33.552C47.7903 30.56 50.3784 37.8005 53.6815 38.2071C60.9314 36.416 65.5958 41.8132 65.3771 46.3343C65.1565 50.8944 61.3356 55.237 55.9595 56.5548Z" fill="white" fillOpacity="0.8" />
      <path d="M62.1898 29.4486C60.3909 30.5843 56.1779 30.5392 54.8964 29.5832C53.9681 28.8901 53.4172 27.9366 53.1778 26.8207C52.6007 24.1289 53.3721 21.1516 55.298 18.4182C56.0724 17.3199 57.6924 16.8772 58.3035 15.6085C58.251 15.5856 61.1744 13.7104 62.4282 14.7533C65.9088 17.6496 67.0898 26.3553 62.1898 29.4486Z" fill="white" fillOpacity="0.8" />
      <path d="M45.898 23.3396C44.5361 25.4338 42.1463 26.5201 40.0694 26.0837C34.5258 24.9233 32.1235 16.5822 35.8367 11.3373C37.2092 9.39778 39.5304 8.43742 41.5353 8.87528C46.8903 10.0466 49.3458 18.0358 45.8996 23.3384L45.898 23.3396Z" fill="white" fillOpacity="0.8" />
      <path d="M20.076 48.4136C18.7655 48.5676 17.5632 48.4057 16.475 48.028C13.3077 46.9294 10.9797 44.7411 10.0015 41.9818C9.62414 40.9183 9.58911 39.799 9.95496 38.6916C10.4806 37.0994 12.151 36.0146 14.0946 35.9071C19.5015 35.6091 24.9765 40.8782 23.9161 45.322C23.543 46.8871 22.1013 48.1769 20.0778 48.4146L20.076 48.4136Z" fill="white" fillOpacity="0.8" />
      <path d="M24.6935 32.604C18.2069 32.421 12.9228 25.265 15.5311 20.2255C16.4449 18.4585 18.5189 17.328 20.788 17.3771C27.1091 17.5116 32.4452 24.3078 30.1598 29.4943C29.3303 31.3777 27.1708 32.674 24.6935 32.604Z" fill="white" fillOpacity="0.8" />
      <path d="M85.0746 117.536C81.9077 115.752 78.6305 114.529 75.1023 114.054C71.3969 113.555 68.3895 110.979 67.7941 107.907C67.1629 104.649 70.6362 99.6973 76.9533 100.675C79.4745 100.124 80.076 95.2464 86.9608 97.6254C93.2209 100.68 91.1084 105.522 92.5712 107.278C97.045 109.788 96.8401 114.682 94.6022 116.844C92.345 119.024 88.3872 119.403 85.0746 117.536Z" fill="white" fillOpacity="0.5" />
      <path d="M100.956 106.89C99.5207 106.613 97.4321 104.611 97.2404 103.53C97.1018 102.747 97.2747 102.01 97.6802 101.339C98.6584 99.7198 100.446 98.5913 102.698 98.1275C103.602 97.9414 104.622 98.481 105.525 98.1328C105.51 98.0967 107.857 98.5314 107.994 99.6428C108.373 102.729 104.866 107.644 100.956 106.89Z" fill="white" fillOpacity="0.5" />
      <path d="M95.6735 96.1738C94.0056 96.5825 92.2974 96.0035 91.4627 94.809C89.2328 91.6227 91.9565 86.3167 96.2851 85.435C97.8855 85.1088 99.5 85.7186 100.298 86.88C102.428 89.9831 99.8969 95.138 95.6749 96.174L95.6735 96.1738Z" fill="white" fillOpacity="0.5" />
      <path d="M70.9377 96.597C70.2089 96.0582 69.683 95.4122 69.3158 94.7116C68.2469 92.6731 68.1112 90.4832 68.9203 88.6417C69.232 87.9318 69.7414 87.3548 70.4459 86.9721C71.4587 86.4217 72.8058 86.6635 73.8298 87.523C76.6778 89.9146 76.9392 95.1262 74.3162 96.8533C73.3925 97.4617 72.0634 97.4302 70.9382 96.5983L70.9377 96.597Z" fill="white" fillOpacity="0.5" />
      <path d="M80.6947 90.8491C77.5324 87.7091 78.2549 81.6423 81.9336 80.3443C83.223 79.8889 84.7938 80.2974 85.9071 81.3882C89.0092 84.4261 88.4822 90.3372 84.8961 91.8606C83.5941 92.4139 81.9023 92.0483 80.6947 90.8491Z" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

function GalleryCTACard({
  bg,
  text,
  onClick,
  wide,
}: {
  bg: string;
  text: string;
  onClick: () => void;
  wide: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={text}
      className={[
        "relative flex shrink-0 items-end justify-between overflow-hidden rounded-[20px] text-left transition-opacity hover:opacity-90",
        "max-md:p-3 md:p-5 xl:px-12 xl:pb-12",
        wide
          ? "h-[120px] w-[245px] md:h-[190px] md:w-[300px] lg:h-[220px] lg:w-[420px] xl:h-[268px] xl:w-[547px]"
          : "h-[120px] w-[129px] md:h-[190px] md:w-[190px] lg:h-[220px] lg:w-[240px] xl:h-[268px] xl:w-[289px]",
      ].join(" ")}
      style={{ background: bg }}
    >
      <PawDeco />
      <div className="flex min-w-0 flex-1 flex-col gap-4 max-md:gap-0">
        <GalleryCTALogo className="h-auto w-[52px] md:w-[64px] lg:w-[76px] xl:w-[90px]" />
        <p
          className="max-md:text-[14px] max-md:font-bold max-md:leading-[17px] font-bold text-[14px] capitalize leading-[1.35] tracking-[-0.04em] whitespace-pre-line lg:text-[18px] xl:text-[22px]"
          style={{ color: "var(--color-gallery-text)" }}
        >
          {text}
        </p>
      </div>
      <ArrowButton />
    </button>
  );
}

const TILE_SIZE =
  "h-[120px] w-[129px] shrink-0 md:h-[190px] md:w-[190px] lg:h-[220px] lg:w-[240px] xl:h-[268px] xl:w-[289px]";

function GalleryTile({ item }: { item: GalleryItem }) {
  if (item.type === "image") {
    return (
      <div className={`overflow-hidden rounded-[20px] ${TILE_SIZE}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src.src}
          alt={item.alt}
          width={item.src.width}
          height={item.src.height}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  if (item.type === "paws") {
    return (
      <div
        className={`overflow-hidden rounded-[20px] ${TILE_SIZE}`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pawsPatternWithBg.src}
          alt=""
          width={pawsPatternWithBg.width}
          height={pawsPatternWithBg.height}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  if (item.type !== "logo") return null;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[20px] ${TILE_SIZE}`}
      style={{ background: item.bg }}
      aria-hidden="true"
    >
      {item.tone === "white" ? (
        <GalleryLogoMark className="h-auto w-[43%]" />
      ) : (
        <GalleryMutedLogo className="h-auto w-[43%]" />
      )}
    </div>
  );
}

const ROW_1_BASE: GalleryItem[] = [
  { type: "image", src: galleryDogsUpper001, alt: "노란 배경에서 간식을 먹는 강아지" },
  { type: "image", src: galleryDogsUpper002, alt: "꼬순박스 간식과 함께 있는 웰시코기" },
  { type: "image", src: galleryDogsUpper003, alt: "혀를 내밀고 웃는 하얀 말티즈" },
  {
    type: "cta",
    bg: "var(--color-gallery-cta-peach)",
    text: "우리 아이를 위한\n맞춤 패키지 박스 찾기",
    wide: true,
  },
  { type: "logo", bg: "var(--color-gallery-peach-soft)" },
  { type: "paws" },
];

const ROW_2_BASE: GalleryItem[] = [
  { type: "logo", bg: "var(--color-gallery-sage-muted)", tone: "white" },
  {
    type: "cta",
    bg: "var(--color-cta-sage-bg)",
    text: "우리 아이 수제 간식 구독 패키지,\n간편하게 시작하기",
    wide: true,
  },
  { type: "image", src: galleryDogsDowner001, alt: "꼬순박스 프리미엄 간식과 함께 있는 강아지" },
  { type: "image", src: galleryDogsDowner002, alt: "혀를 내밀고 웃는 갈색 푸들" },
  { type: "image", src: galleryDogsDowner003, alt: "꼬순박스 간식과 패키지" },
  { type: "logo", bg: "var(--color-gallery-sage-light)" },
];

export default function WhyGallerySection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  function handleChecklistClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }
    const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
    if (hasChecklist) { router.push("/subscribe"); return; }
    openChecklistForm();
  }

  const goSubscribe = () => router.push("/subscribe");

  function renderItem(item: GalleryItem, key: string) {
    if (item.type === "cta") {
      return (
        <GalleryCTACard
          key={key}
          bg={item.bg}
          text={item.text}
          onClick={goSubscribe}
          wide={item.wide}
        />
      );
    }

    return <GalleryTile key={key} item={item} />;
  }

  function renderRollingRow(items: GalleryItem[], rowKey: string, direction: "left" | "right") {
    const animationClass = direction === "right" ? "animate-gallery-right" : "animate-gallery-left";

    return (
      <div className="overflow-hidden w-full">
        <div
          className={`inline-flex flex-nowrap will-change-transform ${animationClass} lg:[animation-duration:42s] xl:[animation-duration:52s]`}
        >
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex gap-4 lg:gap-6 xl:gap-8 flex-nowrap pr-4 lg:pr-6 xl:pr-8">
              {items.map((item, i) => renderItem(item, `${rowKey}-${copy}-${i}`))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white max-md:px-0 md:px-5 lg:px-16 max-md:pb-12 md:pb-16 lg:pb-[92px]">
      <div
        className="mx-auto max-lg:max-w-content lg:max-w-none overflow-hidden max-md:rounded-none pb-10 md:rounded-[40px] md:pb-14 lg:rounded-[64px] lg:pb-16"
        style={{ background: "var(--color-why-choose-bg)" }}
      >
        <div className="mx-auto flex max-w-content flex-col items-center px-5 pb-16 pt-16 text-center md:px-6 md:pb-14 md:pt-20 lg:px-0 lg:pb-[98px] lg:pt-24">
          <div className="relative mb-7 md:mb-10 lg:mb-[64px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={whyGalleryTitle.src}
              alt="왜 우리 아이를 위해 꼬순박스를 선택해야할까요?"
              width={whyGalleryTitle.width}
              height={whyGalleryTitle.height}
              className="h-auto w-full max-w-[320px] md:max-w-[466px]"
              loading="eager"
              decoding="async"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={whyGalleryTitlePawDeco.src}
              alt=""
              aria-hidden="true"
              width={whyGalleryTitlePawDeco.width}
              height={whyGalleryTitlePawDeco.height}
              className="pointer-events-none absolute right-full top-[-48px] mr-[14px] h-auto w-[52px] select-none max-md:hidden"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* 모바일 — Figma Group 1000005556 */}
          <p className="mb-11 max-w-[271px] text-center text-[14px] leading-[20px] tracking-[-0.02em] text-[var(--color-why-choose-text)] md:hidden">
            <span className="font-bold">
              모든 강아지는 다르니까, 간식도 맞춤이어야 합니다.
            </span>
            <br />
            <br />
            <span className="font-medium">
              <span className="font-bold text-[var(--color-cta-button)]">우리 아이의 취향</span>과{" "}
              <span className="font-bold text-[var(--color-cta-button)]">건강 상태를 반영</span>한
              <br />
              맞춤형 수제 간식을 꼬순박스가 제안합니다.
            </span>
          </p>
          {/* 태블릿·데스크탑 */}
          <p className="mb-8 hidden max-w-[464px] text-center text-[18px] leading-[28px] tracking-[-0.02em] text-[var(--color-why-choose-text)] md:mb-10 md:block md:text-[24px] md:leading-[32px]">
            <span className="font-bold">
              모든 강아지는 다르니까, 간식도 맞춤이어야 합니다.
            </span>
            <br />
            <br />
            <span className="font-medium">
              <span className="font-bold text-[var(--color-cta-button)]">우리 아이의 취향</span>과{" "}
              <span className="font-bold text-[var(--color-cta-button)]">건강 상태를 반영</span>한
              <br />
              맞춤형 수제 간식을 꼬순박스가 제안합니다.
            </span>
          </p>
          <button
            type="button"
            onClick={handleChecklistClick}
            className="h-10 w-[230px] rounded-[12px] text-center text-[13px] font-semibold leading-[30px] tracking-[-0.04em] text-white [font-feature-settings:'liga'_off] transition-opacity hover:opacity-90 md:h-[52px] md:w-[288px] md:text-[16px]"
            style={{ background: "var(--color-cta-button)" }}
          >
            체크리스트 작성 후 구독하러 가기
          </button>
        </div>

        <div className="flex flex-col gap-8 md:gap-4 lg:gap-6 xl:gap-8">
          {renderRollingRow(ROW_1_BASE, "r1", "right")}
          {renderRollingRow(ROW_2_BASE, "r2", "left")}
        </div>
      </div>
    </section>
  );
}