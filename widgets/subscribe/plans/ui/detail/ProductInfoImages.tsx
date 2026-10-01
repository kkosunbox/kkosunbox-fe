import { Fragment } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import type { PackageTier } from "@/entities/package";

interface ProductInfoImagesProps {
  variant: "mobile" | "desktop";
  images: readonly StaticImageData[];
  planName: string;
  tier: PackageTier;
}

export default function ProductInfoImages({ variant, images, planName, tier }: ProductInfoImagesProps) {
  const renderImages = (sizes: string) =>
    images.map((imageSrc, index) => {
      const isGif = imageSrc.src.endsWith(".gif");

      return (
        <Fragment key={`${tier}-${imageSrc.src}-${index}`}>
          <Image
            src={imageSrc}
            alt={`${planName} 구독정보 상세 이미지 ${index + 1}`}
            quality={HIGH_IMAGE_QUALITY}
            sizes={sizes}
            unoptimized={isGif}
            className="h-auto w-full"
          />
          {isGif ? (
            <div
              aria-hidden="true"
              className="aspect-[100/7] w-full bg-[var(--color-product-detail-gif-gap)]"
            />
          ) : null}
        </Fragment>
      );
    });

  if (variant === "mobile") {
    return (
      <div className="pt-5">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="mx-auto w-full">
            {renderImages("100vw")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5 md:pt-10 lg:pt-[54px]">
      <div className="mx-auto w-full md:max-w-[800px] lg:max-w-[800px]">
        {renderImages(`${MEDIA_MAX_MD_SIZES} 100vw, 800px`)}
      </div>
    </div>
  );
}
