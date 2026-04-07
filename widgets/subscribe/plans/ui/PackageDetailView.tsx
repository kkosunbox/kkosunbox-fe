"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { PACKAGES, COMPARE_PACKAGES, type PackageTier } from "./packageData";

/* ─── Icons ─── */
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path
        d="M6 9L8 11L12 7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  const color = filled ? "var(--color-primary)" : "var(--color-text-muted)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PawStampIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 17) / 14)}
      viewBox="0 0 14 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M5.78171 7.62922L4.88916 7.75595C4.0582 7.87435 3.21988 7.9724 2.43396 8.27951C2.01113 8.44509 1.56991 8.59124 1.14983 8.43584L1.21877 8.1574C1.22888 8.1167 1.11766 8.0908 1 8.03345C1.56715 6.14086 2.17015 7.10288 1.92196 6.54509C2.24828 6.26203 2.72719 5.88092 3.02869 5.53312L3.83024 4.60902C3.15738 3.88288 3.6804 3.70805 3.37247 3.30566L3.23459 3.86993C3.00387 3.68492 2.91654 3.43886 2.8807 3.27329C2.86139 3.26404 2.8044 3.24091 2.78418 3.22981C2.75384 3.21408 2.67479 3.17061 2.68582 3.17708L2.77039 2.98745C2.79061 2.94213 2.60953 2.89495 2.55622 2.8968C2.34204 2.90143 2.2731 2.77655 2.10213 2.61374L1.49637 2.03468C1.46328 2.00323 1.46696 1.83395 1.42283 1.82008C1.37871 1.8062 1.23899 1.77752 1.19119 1.74977C1.03033 1.65912 1.1103 1.25581 1.25186 1.15961C1.4642 1.01438 1.7179 1.0042 1.96609 1.09856L3.07832 1.52037C3.11601 1.53424 3.17944 1.74237 3.21896 1.74237L3.4506 1.747C3.67121 1.81175 3.96352 1.92368 4.16115 2.04948C4.7715 2.43614 4.23652 1.9431 5.43517 2.62207C6.04368 2.9671 6.38195 2.39544 7.23957 1.62767L8.1027 0.856201L8.34538 1.26229C8.39225 0.530593 8.8969 -0.0327454 9.59733 0.00148047C9.83633 0.281762 9.69937 0.773874 9.65616 1.10411L9.55321 1.88945L9.4521 2.65537C9.26734 2.49442 9.1938 2.44817 9.30411 2.58229C9.64605 3.00503 9.31698 3.91063 9.03018 4.18258C9.14968 4.31486 9.24528 4.49154 9.24528 4.61272C9.36202 4.6784 9.5192 4.79217 9.56608 4.77737C10.0266 4.78662 10.4448 5.20473 10.9293 5.36939C11.7281 5.64134 12.6178 5.85132 13.4994 6.03355C13.6795 6.07055 13.8992 6.04465 13.9755 6.19728C14.0518 6.34991 13.936 6.62187 13.8183 6.72825L13.628 6.54324L13.4773 6.83925C13.4415 6.90955 13.276 6.8263 13.1933 6.7967C12.8881 6.9447 12.514 7.0483 12.1132 7.09178L9.26182 7.39704L8.58621 7.39889L8.29482 8.99363C8.5044 9.24986 9.23425 10.7752 8.8969 11C8.73236 10.9167 8.5283 10.7012 8.46671 10.5708C8.45476 10.5458 8.65147 10.457 8.62665 10.4459L8.4134 10.3525C8.21301 10.2646 8.06042 10.1721 7.92897 9.9908L7.81132 10.1166C7.77547 10.1545 7.60449 10.112 7.66424 10.1009C7.80764 9.10278 7.19912 8.99733 6.82777 8.37109C6.62462 8.30078 6.5998 8.00108 6.51615 7.817L6.01795 7.40906C5.96923 7.49416 5.84881 7.62182 5.77987 7.63107L5.78171 7.62922ZM8.79395 3.80702L8.63033 3.22703L9.11015 2.01988C9.19656 1.80157 9.62951 1.6397 9.21586 1.30391L9.15887 1.79047L8.67905 1.17996C8.50072 1.56662 8.08432 1.74792 7.79477 2.04578L6.67426 3.20113L7.4804 3.59242C7.87934 3.78575 8.27 3.9689 8.51451 4.26768L8.56874 3.96243C8.57701 3.91525 8.8059 3.8542 8.79303 3.80795L8.79395 3.80702ZM5.22099 3.44071C4.79081 2.95045 4.04441 3.10678 3.62985 2.28166L3.49197 2.58322L2.94596 2.15216C2.95791 2.48887 3.2447 2.73862 3.4745 2.94583L3.28423 3.14563C3.26125 3.17061 3.4074 3.21686 3.4359 3.19928L3.61514 3.08921L4.16666 3.72655C4.30087 3.88195 4.45438 4.054 4.66304 4.00035C4.8717 3.9467 5.2118 3.43054 5.22099 3.44071ZM11.5828 6.44796C11.2473 6.0613 10.2371 6.19081 9.95031 5.48872C9.78485 5.50629 9.49071 5.46744 9.3087 5.31389C9.34179 5.24636 9.41441 5.17236 9.38775 5.12981L9.23792 4.89578L8.93642 5.77177C8.92356 5.8097 8.74707 5.89572 8.76637 5.92718L8.91161 6.15473C8.691 6.15196 8.40512 6.12328 8.23231 6.08073L8.41615 5.78287L8.26265 5.52942C8.20106 5.42859 8.58621 4.59884 8.17532 4.51929C8.05031 4.49524 7.49419 4.50449 7.47029 4.41014L7.39951 4.12708C7.36642 4.16593 7.28093 4.31671 7.23957 4.27416C7.18534 4.21958 7.08606 4.12153 7.09434 4.06418L7.14397 3.72932L6.87005 4.13263L6.10159 3.68215L5.22283 4.38701C5.15849 4.43881 5.02888 4.58312 5.0537 4.64694C5.07852 4.71077 5.14286 4.82085 5.20077 4.91428L5.57121 5.50907C6.21741 5.86427 6.08505 6.44796 6.70643 6.77265L7.21659 7.03905C7.45283 6.56637 8.08432 7.05108 8.16061 6.81427L8.22036 6.62834L8.4088 6.70789C8.43638 6.71992 8.44649 6.60799 8.43362 6.58117L8.33434 6.37951C8.30125 6.40726 8.17532 6.51179 8.1744 6.51271C8.07329 6.10386 8.46303 6.22781 8.62573 6.27591C8.89322 6.35639 8.75442 6.91972 8.98147 6.86515C9.04213 6.85035 9.20208 6.76987 9.2655 6.76062L11.5837 6.44519L11.5828 6.44796ZM5.38002 6.9965L6.00048 6.86052C5.49859 6.66812 5.19434 6.55064 5.20445 6.06778C5.0537 6.25556 5.01141 6.26758 5.04175 6.09646L4.42037 5.27041C3.90285 5.62562 3.28423 6.24261 2.73546 6.89105L2.13338 7.60239L3.37063 7.34524L5.38094 6.99743L5.38002 6.9965ZM7.91059 8.30633C8.00251 8.46266 8.06042 8.58847 8.09535 8.55517C8.41799 8.24991 8.00159 7.80035 7.87106 7.39149L7.23222 7.50619L7.57048 7.96963C7.5475 8.11763 7.5521 8.29801 7.62839 8.38496C7.68538 8.44971 7.82694 8.35629 7.91059 8.30633Z" fill="#F07F3D"/>
      <path d="M2.94259 14.855L2.39333 14.9356C1.88197 15.0109 1.36608 15.0733 0.882438 15.2688C0.622232 15.3741 0.350712 15.4672 0.0922034 15.3683L0.134628 15.1911C0.140851 15.1652 0.0724051 15.1487 0 15.1122C0.349015 13.9078 0.720092 14.52 0.567362 14.1651C0.768173 13.9849 1.06288 13.7424 1.24842 13.5211L1.74168 12.933C1.32762 12.4709 1.64948 12.3597 1.45998 12.1036L1.37513 12.4627C1.23315 12.3449 1.17941 12.1884 1.15735 12.083C1.14547 12.0771 1.1104 12.0624 1.09796 12.0553C1.07929 12.0453 1.03064 12.0177 1.03743 12.0218L1.08947 11.9011C1.10192 11.8723 0.99048 11.8422 0.957671 11.8434C0.825871 11.8464 0.783446 11.7669 0.678233 11.6633L0.305459 11.2948C0.285095 11.2748 0.287358 11.1671 0.260206 11.1582C0.233054 11.1494 0.147073 11.1312 0.117658 11.1135C0.0186669 11.0558 0.0678798 10.7992 0.154992 10.7379C0.285661 10.6455 0.441785 10.639 0.594514 10.6991L1.27897 10.9675C1.30216 10.9763 1.34119 11.1088 1.36552 11.1088L1.50806 11.1117C1.64382 11.1529 1.8237 11.2242 1.94532 11.3042C2.32092 11.5503 1.99171 11.2365 2.72933 11.6686C3.1038 11.8882 3.31197 11.5244 3.83974 11.0358L4.37089 10.5449L4.52023 10.8033C4.54908 10.3377 4.85963 9.97916 5.29067 10.0009C5.43774 10.1793 5.35346 10.4925 5.32687 10.7026L5.26351 11.2024L5.20129 11.6898C5.08759 11.5874 5.04234 11.5579 5.11022 11.6433C5.32065 11.9123 5.11814 12.4886 4.94165 12.6616C5.01519 12.7458 5.07402 12.8583 5.07402 12.9354C5.14586 12.9772 5.24259 13.0496 5.27143 13.0401C5.55483 13.046 5.81221 13.3121 6.11032 13.4169C6.60188 13.5899 7.14944 13.7236 7.69192 13.8395C7.80279 13.8631 7.93798 13.8466 7.98493 13.9437C8.03188 14.0409 7.96061 14.2139 7.8882 14.2816L7.77111 14.1639L7.67834 14.3522C7.65628 14.397 7.55446 14.344 7.50355 14.3252C7.31575 14.4194 7.08552 14.4853 6.83889 14.513L5.0842 14.7072L4.66843 14.7084L4.48912 15.7232C4.61809 15.8863 5.06723 16.857 4.85963 17C4.75838 16.947 4.6328 16.8099 4.5949 16.7269C4.58754 16.711 4.7086 16.6545 4.69332 16.6474L4.56209 16.5879C4.43877 16.532 4.34487 16.4732 4.26398 16.3578L4.19158 16.4378C4.16952 16.462 4.0643 16.4349 4.10107 16.4278C4.18932 15.7927 3.81485 15.7256 3.58632 15.3271C3.46131 15.2823 3.44603 15.0916 3.39456 14.9745L3.08797 14.7149C3.05799 14.769 2.98388 14.8502 2.94146 14.8561L2.94259 14.855ZM4.79628 12.4227L4.69559 12.0536L4.99086 11.2854C5.04404 11.1465 5.31046 11.0434 5.05592 10.8298L5.02084 11.1394L4.72557 10.7509C4.61583 10.9969 4.35958 11.1123 4.1814 11.3019L3.49185 12.0371L3.98794 12.2861C4.23344 12.4091 4.47385 12.5257 4.62431 12.7158L4.65769 12.5215C4.66278 12.4915 4.80363 12.4527 4.79571 12.4232L4.79628 12.4227ZM2.59753 12.1895C2.3328 11.8776 1.87348 11.977 1.61837 11.452L1.53352 11.6439L1.19751 11.3696C1.20487 11.5838 1.38135 11.7428 1.52277 11.8746L1.40568 12.0018C1.39154 12.0177 1.48148 12.0471 1.49901 12.0359L1.60932 11.9659L1.94872 12.3714C2.0313 12.4703 2.12577 12.5798 2.25418 12.5457C2.38258 12.5115 2.59188 12.1831 2.59753 12.1895ZM6.5125 14.1032C6.30604 13.8572 5.68437 13.9396 5.50788 13.4928C5.40606 13.504 5.22505 13.4793 5.11305 13.3816C5.13341 13.3386 5.1781 13.2915 5.16169 13.2644L5.06949 13.1155L4.88395 13.6729C4.87603 13.6971 4.76743 13.7518 4.77931 13.7718L4.86868 13.9166C4.73292 13.9149 4.557 13.8966 4.45065 13.8696L4.56379 13.68L4.46932 13.5187C4.43142 13.4546 4.66844 12.9265 4.41558 12.8759C4.33865 12.8606 3.99642 12.8665 3.98172 12.8065L3.93816 12.6263C3.9178 12.651 3.86519 12.747 3.83974 12.7199C3.80636 12.6852 3.74527 12.6228 3.75036 12.5863L3.78091 12.3732L3.61234 12.6299L3.13944 12.3432L2.59867 12.7917C2.55907 12.8247 2.47931 12.9165 2.49458 12.9571C2.50986 12.9978 2.54945 13.0678 2.58509 13.1273L2.81305 13.5058C3.21072 13.7318 3.12926 14.1032 3.51165 14.3099L3.82559 14.4794C3.97097 14.1786 4.35958 14.4871 4.40653 14.3364L4.4433 14.218L4.55926 14.2687C4.57623 14.2763 4.58245 14.2051 4.57453 14.188L4.51344 14.0597C4.49308 14.0773 4.41558 14.1439 4.41502 14.1445C4.35279 13.8843 4.59264 13.9632 4.69276 13.9938C4.85737 14.045 4.77195 14.4035 4.91167 14.3687C4.949 14.3593 5.04743 14.3081 5.08646 14.3022L6.51307 14.1015L6.5125 14.1032ZM2.69539 14.4523L3.07722 14.3658C2.76837 14.2433 2.58113 14.1686 2.58735 13.8613C2.49458 13.9808 2.46856 13.9885 2.48723 13.8796L2.10484 13.3539C1.78637 13.5799 1.40568 13.9726 1.06798 14.3852L0.697465 14.8379L1.45885 14.6742L2.69596 14.4529L2.69539 14.4523ZM4.25267 15.2858C4.30924 15.3853 4.34487 15.4654 4.36637 15.4442C4.56492 15.2499 4.30867 14.9639 4.22835 14.7037L3.83521 14.7767L4.04338 15.0716C4.02923 15.1658 4.03206 15.2806 4.07901 15.3359C4.11408 15.3771 4.2012 15.3176 4.25267 15.2858Z" fill="#F07F3D"/>
    </svg>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="목록으로 돌아가기"
      className="flex h-6 w-6 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/* ─── Props ─── */
interface Props {
  selectedTier: PackageTier;
  onSelectTier: (tier: PackageTier) => void;
  onClose: () => void;
}

export default function PackageDetailView({ selectedTier, onSelectTier, onClose }: Props) {
  const router = useRouter();
  const pkg = PACKAGES.find((p) => p.tier === selectedTier)!;
  const [compareIndex, setCompareIndex] = useState(
    COMPARE_PACKAGES.findIndex((p) => p.tier === selectedTier)
  );
  const comparePkg = COMPARE_PACKAGES[compareIndex];

  function handleSubscribe() {
    router.push("/order");
  }

  return (
    <>
      {/* ══ MOBILE LAYOUT (lg 미만) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-4">

        {/* 상단: 패키지 정보 카드 */}
        <div
          className="flex flex-col rounded-[20px] px-7 pb-7 pt-5"
          style={{ background: "var(--color-background)" }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: pkg.colorVar }}
            >
              {pkg.tier}
            </span>
          </div>

          <div className="mb-[56px] flex justify-center">
            <Image
              src={mockTempPackage}
              alt={`${pkg.name} 이미지`}
              className="h-[150px] w-auto object-contain"
            />
          </div>

          <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
            {pkg.name}
          </h2>

          <ul className="mb-7 flex flex-col gap-[14px]">
            {pkg.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
              >
                <CheckIcon color={pkg.colorVar} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-auto mb-7 flex items-center justify-between border-t border-white pt-3">
            <span className="text-body-14-b text-black">월 요금제</span>
            <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
              {pkg.price}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubscribe}
            className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: pkg.colorVar }}
          >
            구독하기
          </button>
        </div>

        {/* 하단: 비교 상세 카드 */}
        <div
          className="relative rounded-[20px] px-5 pb-6 pt-5"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="absolute right-5 top-5">
            <CloseButton onClick={onClose} />
          </div>

          <p className="mb-3 text-center text-subtitle-16-sb leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
            {comparePkg.name}
          </p>

          <div className="mb-4 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: comparePkg.colorVar }}
            >
              {comparePkg.tier}
            </span>
          </div>

          <div className="overflow-hidden rounded-[20px] bg-white">
            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p
                className="text-center text-body-13-r text-[var(--color-text)]"
                style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
              >
                &ldquo;{comparePkg.quote}&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-b border-[var(--color-text-muted)] px-5 py-4">
              {comparePkg.contents.map((c, i) => {
                const isHighlighted =
                  comparePkg.tier === "Premium" && i === comparePkg.contents.length - 1;
                return isHighlighted ? (
                  <span
                    key={c}
                    className="relative inline-block text-body-13-b leading-[20px] text-[var(--color-text)]"
                  >
                    <span className="absolute" style={{ top: "-8px", left: "-5px" }}>
                      <PawStampIcon size={12} />
                    </span>
                    {c}
                  </span>
                ) : (
                  <p key={c} className="text-center text-body-13-r text-[var(--color-text)]">
                    {c}
                  </p>
                );
              })}
            </div>

            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p
                className="text-center text-body-13-r leading-[18px]"
                style={{
                  color:
                    comparePkg.tier === "Premium"
                      ? "var(--color-accent-orange)"
                      : "var(--color-text)",
                  fontWeight: comparePkg.tier === "Premium" ? 600 : 400,
                }}
              >
                {comparePkg.special}
              </p>
            </div>

            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p className="text-center text-body-13-r leading-[18px] text-[var(--color-text)]">
                {comparePkg.customization}
              </p>
            </div>

            <div className="flex justify-center gap-1 px-5 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <HeartIcon key={i} filled={i < comparePkg.hearts} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {COMPARE_PACKAGES.map((p, i) => (
              <button
                key={p.tier}
                type="button"
                onClick={() => setCompareIndex(i)}
                aria-label={`${p.name} 비교 보기`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === compareIndex ? "16px" : "8px",
                  background:
                    i === compareIndex ? "var(--color-accent-orange)" : "var(--color-text-muted)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ DESKTOP LAYOUT (lg 이상) ══════════════════════════════════ */}
      <div
        className="max-lg:hidden relative overflow-hidden rounded-[20px]"
        style={{ background: "var(--color-surface-warm)" }}
      >
        <div className="absolute right-6 top-5 z-10">
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex lg:flex-row lg:items-stretch lg:min-h-[570px]">

          {/* Left panel */}
          <div className="flex w-full flex-col px-7 pb-7 pt-5 lg:w-[327px] lg:shrink-0">
            <div className="mb-2.5">
              <span
                className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
                style={{ background: pkg.colorVar }}
              >
                {pkg.tier}
              </span>
            </div>

            <div className="mb-[56px] flex justify-center">
              <Image
                src={mockTempPackage}
                alt={`${pkg.name} 이미지`}
                className="h-[150px] w-auto object-contain"
              />
            </div>

            <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
              {pkg.name}
            </h2>

            <ul className="mb-7 flex flex-col gap-[14px]">
              {pkg.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
                >
                  <CheckIcon color={pkg.colorVar} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto mb-7 flex items-center justify-between border-t border-white pt-3">
              <span className="text-body-14-b text-black">월 요금제</span>
              <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
                {pkg.price}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: pkg.colorVar }}
            >
              구독하기
            </button>
          </div>

          {/* Right: comparison table */}
          <div className="flex flex-1 flex-col pb-8 pl-0 pr-7 pt-[61px]">
            <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] bg-white">

              {/* Tabs */}
              <div className="flex gap-0.5 px-6 pt-8">
                {COMPARE_PACKAGES.map((p) => (
                  <button
                    key={p.tier}
                    type="button"
                    onClick={() => onSelectTier(p.tier)}
                    className="h-[37px] flex-1 truncate px-2 font-semibold tracking-[-0.04em] transition-colors text-body-13-sb"
                    style={{
                      borderRadius: "20px 20px 0 0",
                      background: selectedTier === p.tier ? p.tabActiveBg : "var(--color-ui-inactive-bg)",
                      color: selectedTier === p.tier ? "var(--color-text)" : "var(--color-text-secondary)",
                      fontSize: selectedTier === p.tier ? "14px" : "13px",
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="mx-6 h-px bg-[var(--color-text-muted)]" />

              {/* Comparison table */}
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[360px] px-6">

                  <div className="grid grid-cols-3">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center py-5">
                        <span
                          className="inline-block rounded-full px-3 py-[3px] text-body-13-sb text-white"
                          style={{
                            background:
                              selectedTier === p.tier ? p.colorVar : "var(--color-text-muted)",
                          }}
                        >
                          {p.tier}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--color-text-muted)] border-t border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p
                          className="text-center text-body-13-r leading-[17px] text-[var(--color-text)]"
                          style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
                        >
                          &ldquo;{p.quote}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--color-text-muted)] border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
                        {p.contents.map((c, i) => {
                          const isHighlighted =
                            p.tier === "Premium" && i === p.contents.length - 1;
                          return isHighlighted ? (
                            <span
                              key={c}
                              className="relative inline-block text-body-13-b text-[var(--color-text)]"
                            >
                              <span className="absolute" style={{ top: "-7px", left: "-4px" }}>
                                <PawStampIcon size={11} />
                              </span>
                              {c}
                            </span>
                          ) : (
                            <p key={c} className="text-center text-body-13-r leading-[18px] text-[var(--color-text)]">
                              {c}
                            </p>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--color-text-muted)] border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p
                          className="text-center text-body-13-r leading-[16px]"
                          style={{
                            color:
                              p.tier === "Premium"
                                ? "var(--color-accent-orange)"
                                : "var(--color-text)",
                            fontWeight: p.tier === "Premium" ? 600 : 400,
                          }}
                        >
                          {p.special}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--color-text-muted)] border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p className="text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
                          {p.customization}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[var(--color-text-muted)] py-3">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center gap-1">
                        {Array.from({ length: p.hearts }).map((_, i) => (
                          <HeartIcon key={i} filled={selectedTier === p.tier} />
                        ))}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
