import Image from "next/image";
import subscribeBannerPackage from "../assets/subscribe-banner-package.png";

export function SubscriptionPromoBanner() {
  return (
    <section
      className="min-h-[70px] bg-[var(--color-purchase-banner-bg)]"
      aria-label="구독몰 안내"
    >
      <div className="mx-auto flex min-h-[70px] max-w-[1240px] items-center justify-center gap-6 px-6 max-md:gap-3">
        <p className="text-body-16-b tracking-[-0.04em] text-white max-md:text-body-14-b">
          매달 기다려지는 <strong className="font-extrabold text-[var(--color-star)]">꼬순박스,정기적으로 집 앞에서</strong> 만나보세요.
        </p>
        <Image
          src={subscribeBannerPackage}
          alt=""
          width={134}
          height={64}
          className="h-auto self-end object-contain max-md:w-[110px] md:w-[134px]"
        />
      </div>
    </section>
  );
}
