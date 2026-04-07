import Image from "next/image";
import { Text } from "@/shared/ui";
import logoMain2x from "@/shared/assets/logo-main@2x.png";
import howItWorksAsset01 from "../assets/how-it-works-asset-01.png";
import howItWorksAsset02 from "../assets/how-it-works-asset-02.png";
import howItWorksAsset03 from "../assets/how-it-works-asset-03.png";
import howItWorksAsset04 from "../assets/how-it-works-asset-04.png";

const STEPS = [
  {
    image: howItWorksAsset01,
    text: "베이직 / 플러스 / 프리미엄 중 우리 아이에게 맞는 플랜을 선택하세요.",
    iconWidth: 75,
    iconHeight: 76,
  },
  {
    image: howItWorksAsset02,
    text: "선택한 플랜에 맞춰 프리미엄 수제간식이 정기 배송됩니다.",
    iconWidth: 89,
    iconHeight: 76,
  },
  {
    image: howItWorksAsset03,
    text: "하루 1~2회 간식으로 간편하게 급여해주세요.",
    iconWidth: 92,
    iconHeight: 76,
  },
  {
    image: howItWorksAsset04,
    text: "정성으로 만든 수제간식으로 우리 아이의 행복한 간식 시간을 완성하세요.",
    iconWidth: 101,
    iconHeight: 76,
  },
] as const;

/** Display 208px wide; source is 414×136 @2x (Figma logo group ≈207×68) */
const LOGO_WIDTH = 208;
const LOGO_HEIGHT = Math.round((136 * LOGO_WIDTH) / 414);

export default function HowItWorksSection() {
  return (
    <section
      className="bg-[var(--color-surface-light)] py-[60px] md:py-[90px] text-center"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-content max-md:px-8 md:px-0">
        <h2 id="how-it-works-heading" className="mb-6 md:mb-8 flex justify-center">
          <Image
            src={logoMain2x}
            alt="꼬순박스"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-auto w-[140px] md:w-[208px] max-w-full"
          />
        </h2>
        <Text
          variant="section-intro-griun"
          mobileVariant="section-intro-griun-sm"
          className="mb-10 md:mb-12 text-[var(--color-text)]"
        >
          꼬순박스의 배송 방법과 급여 방법을 알려드립니다.
        </Text>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-14 lg:gap-y-0">
          {STEPS.map((step) => (
            <li key={step.text} className="flex flex-col items-center gap-5 md:gap-9">
              <div className="flex min-h-[60px] md:min-h-[76px] w-full items-center justify-center" aria-hidden>
                <Image
                  src={step.image}
                  alt=""
                  width={step.iconWidth}
                  height={step.iconHeight}
                  className="h-auto max-h-[60px] md:max-h-[76px] w-auto max-w-full object-contain"
                />
              </div>
              <Text
                variant="body-18-r"
                mobileVariant="body-13-r"
                className="max-w-[218px] text-[var(--color-text)] max-md:tracking-[-0.04em]"
              >
                {step.text}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
