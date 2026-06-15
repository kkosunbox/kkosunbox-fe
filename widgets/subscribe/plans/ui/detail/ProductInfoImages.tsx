import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { PackageTier } from "@/entities/package";

interface ProductInfoImagesProps {
  variant: "mobile" | "desktop";
  images: readonly StaticImageData[];
  planName: string;
  tier: PackageTier;
}

export default function ProductInfoImages({ variant, images, planName, tier }: ProductInfoImagesProps) {
  if (variant === "mobile") {
    return (
      <div className="pt-5">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="mx-auto w-full">
            {images.map((imageSrc, index) => (
              <Image
                key={`${tier}-${index}`}
                src={imageSrc}
                alt={`${planName} 구독정보 상세 이미지 ${index + 1}`}
                className="h-auto w-full"
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5 md:pt-10 lg:pt-[54px]">
      <div className="mx-auto w-full md:max-w-[800px] lg:max-w-[800px]">
        {images.map((imageSrc, index) => (
          <Image
            key={`${tier}-${index}`}
            src={imageSrc}
            alt={`${planName} 구독정보 상세 이미지 ${index + 1}`}
            className="h-auto w-full"
            priority={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
