import { Fragment } from "react";
import Image, { type StaticImageData } from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import salmonYogurtBallDetail01 from "../../assets/product-detail/product-001-detail-001.png";
import salmonYogurtBallDetail02 from "../../assets/product-detail/product-001-detail-002.png";
import salmonYogurtBallDetail03 from "../../assets/product-detail/product-001-detail-003.png";
import salmonYogurtBallDetail04 from "../../assets/product-detail/product-001-detail-004.png";
import salmonYogurtBallDetail05 from "../../assets/product-detail/product-001-detail-005.png";
import duckYogurtBallDetail01 from "../../assets/product-detail/product-002-detail-001.png";
import duckYogurtBallDetail02 from "../../assets/product-detail/product-002-detail-002.png";
import duckYogurtBallDetail03 from "../../assets/product-detail/product-002-detail-003.png";
import duckYogurtBallDetail04 from "../../assets/product-detail/product-002-detail-004.png";
import duckYogurtBallDetail05 from "../../assets/product-detail/product-002-detail-005.png";
import chickenYogurtBallDetail01 from "../../assets/product-detail/product-003-detail-001.png";
import chickenYogurtBallDetail02 from "../../assets/product-detail/product-003-detail-002.png";
import chickenYogurtBallDetail03 from "../../assets/product-detail/product-003-detail-003.png";
import chickenYogurtBallDetail04 from "../../assets/product-detail/product-003-detail-004.png";
import chickenYogurtBallDetail05 from "../../assets/product-detail/product-003-detail-005.png";
import beefYogurtBallDetail01 from "../../assets/product-detail/product-004-detail-001.png";
import beefYogurtBallDetail02 from "../../assets/product-detail/product-004-detail-002.png";
import beefYogurtBallDetail03 from "../../assets/product-detail/product-004-detail-003.png";
import beefYogurtBallDetail04 from "../../assets/product-detail/product-004-detail-004.png";
import beefYogurtBallDetail05 from "../../assets/product-detail/product-004-detail-005.png";
import beefFreshMealDetail01 from "../../assets/product-detail/product-005-detail-001.png";
import beefFreshMealDetail02 from "../../assets/product-detail/product-005-detail-002.png";
import beefFreshMealDetail03 from "../../assets/product-detail/product-005-detail-003.png";
import beefFreshMealDetail04 from "../../assets/product-detail/product-005-detail-004.png";
import beefFreshMealDetail05 from "../../assets/product-detail/product-005-detail-005.png";
import flatfishFreshMealDetail01 from "../../assets/product-detail/product-006-detail-001.png";
import flatfishFreshMealDetail02 from "../../assets/product-detail/product-006-detail-002.png";
import flatfishFreshMealDetail03 from "../../assets/product-detail/product-006-detail-003.png";
import flatfishFreshMealDetail04 from "../../assets/product-detail/product-006-detail-004.png";
import flatfishFreshMealDetail05 from "../../assets/product-detail/product-006-detail-005.png";
import kkomiChipDetail01 from "../../assets/product-detail/product-007-detail-001.png";
import kkomiChipDetail02 from "../../assets/product-detail/product-007-detail-002.png";
import kkomiChipDetail03 from "../../assets/product-detail/product-007-detail-003.png";
import kkomiChipDetail04 from "../../assets/product-detail/product-007-detail-004.png";
import kkomiChipDetail05 from "../../assets/product-detail/product-007-detail-005.png";
import beefChewDetail01 from "../../assets/product-detail/product-008-detail-001.png";
import beefChewDetail02 from "../../assets/product-detail/product-008-detail-002.png";
import beefChewDetail03 from "../../assets/product-detail/product-008-detail-003.png";
import beefChewDetail04 from "../../assets/product-detail/product-008-detail-004.png";
import beefChewDetail05 from "../../assets/product-detail/product-008-detail-005.png";
import unionDetail01 from "../../assets/product-detail/product-union-01.png";
import unionDetail02 from "../../assets/product-detail/product-union-02.png";
import unionDetail02Gif from "../../assets/product-detail/product-union-02-gif.gif";
import unionDetail03 from "../../assets/product-detail/product-union-03.png";
import unionDetail04 from "../../assets/product-detail/product-union-04.png";
import unionDetail05 from "../../assets/product-detail/product-union-05.png";
import unionDetail07 from "../../assets/product-detail/product-union-07.png";

const SALMON_YOGURT_BALL_DETAIL_IMAGES = [
  salmonYogurtBallDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  salmonYogurtBallDetail02,
  salmonYogurtBallDetail03,
  salmonYogurtBallDetail04,
  salmonYogurtBallDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const DUCK_YOGURT_BALL_DETAIL_IMAGES = [
  duckYogurtBallDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  duckYogurtBallDetail02,
  duckYogurtBallDetail03,
  duckYogurtBallDetail04,
  duckYogurtBallDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const CHICKEN_YOGURT_BALL_DETAIL_IMAGES = [
  chickenYogurtBallDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  chickenYogurtBallDetail02,
  chickenYogurtBallDetail03,
  chickenYogurtBallDetail04,
  chickenYogurtBallDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const BEEF_YOGURT_BALL_DETAIL_IMAGES = [
  beefYogurtBallDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  beefYogurtBallDetail02,
  beefYogurtBallDetail03,
  beefYogurtBallDetail04,
  beefYogurtBallDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const BEEF_FRESH_MEAL_DETAIL_IMAGES = [
  beefFreshMealDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  beefFreshMealDetail02,
  beefFreshMealDetail03,
  beefFreshMealDetail04,
  beefFreshMealDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const FLATFISH_FRESH_MEAL_DETAIL_IMAGES = [
  flatfishFreshMealDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  flatfishFreshMealDetail02,
  flatfishFreshMealDetail03,
  flatfishFreshMealDetail04,
  flatfishFreshMealDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const KKOMI_CHIP_DETAIL_IMAGES = [
  kkomiChipDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  kkomiChipDetail02,
  kkomiChipDetail03,
  kkomiChipDetail04,
  kkomiChipDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

const BEEF_CHEW_DETAIL_IMAGES = [
  beefChewDetail01,
  unionDetail01,
  unionDetail02,
  unionDetail02Gif,
  unionDetail03,
  unionDetail04,
  unionDetail05,
  beefChewDetail02,
  beefChewDetail03,
  beefChewDetail04,
  beefChewDetail05,
  unionDetail07,
] as const satisfies readonly StaticImageData[];

function getDetailImages(productName: string): readonly StaticImageData[] | null {
  const normalizedName = productName.replace(/\s/g, "");
  if (normalizedName.includes("연어요거트볼")) return SALMON_YOGURT_BALL_DETAIL_IMAGES;
  if (normalizedName.includes("오리요거트볼")) return DUCK_YOGURT_BALL_DETAIL_IMAGES;
  if (normalizedName.includes("꼬꼬요거트볼")) return CHICKEN_YOGURT_BALL_DETAIL_IMAGES;
  if (normalizedName.includes("소고기요거트볼")) return BEEF_YOGURT_BALL_DETAIL_IMAGES;
  if (normalizedName.includes("소고기화식")) return BEEF_FRESH_MEAL_DETAIL_IMAGES;
  if (normalizedName.includes("가자미화식")) return FLATFISH_FRESH_MEAL_DETAIL_IMAGES;
  if (normalizedName.includes("꼬미칩")) return KKOMI_CHIP_DETAIL_IMAGES;
  if (normalizedName.includes("소고기껌")) return BEEF_CHEW_DETAIL_IMAGES;
  return null;
}

function DetailImageList({ images, productName, sizes }: {
  images: readonly StaticImageData[];
  productName: string;
  sizes: string;
}) {
  return images.map((imageSrc, index) => {
    const isGif = imageSrc.src.endsWith(".gif");

    return (
      <Fragment key={`${imageSrc.src}-${index}`}>
        <Image
          src={imageSrc}
          alt={`${productName} 상품 상세 이미지 ${index + 1}`}
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
}

export default function IndependentProductInfoImages({ productName }: { productName: string }) {
  const images = getDetailImages(productName);
  if (!images) return null;

  return (
    <section className="mt-16" aria-label={`${productName} 상품 상세 설명`}>
      <div className="md:hidden">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <DetailImageList images={images} productName={productName} sizes="100vw" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[800px] max-md:hidden">
        <DetailImageList
          images={images}
          productName={productName}
          sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 800px`}
        />
      </div>
    </section>
  );
}
