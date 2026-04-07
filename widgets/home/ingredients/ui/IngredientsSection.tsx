"use client";

import { Button, Text } from "@/shared/ui";
import ingredientsDetail from "../assets/ingredients-detail.png";
import Image from "next/image";
import ingredientsTitle from "../assets/ingredients-title.png";
import ingredientsContents01 from "../assets/ingredients-contents-01.png";
import ingredientsContents02 from "../assets/ingredients-contents-02.png";

export default function IngredientsSection() {
  return (
    <section className="bg-white pt-10 pb-10 md:pt-[62px] md:pb-[52px]">
      <div className="mx-auto flex flex-col md:flex-row max-w-content items-center gap-10 md:gap-20 md:px-0">
        {/* Left */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <Image
            src={ingredientsTitle}
            alt="Ingredients Title"
            className="object-cover max-w-[52px] md:w-[68px] mb-5 md:mb-8"
          />
          <Image
            src={ingredientsContents01}
            alt="Ingredients Contents 01"
            className="object-cover w-full max-w-[220px] md:max-w-[266px] mb-2 md:mb-[22px]"
          />
          <Image
            src={ingredientsContents02}
            alt="Ingredients Contents 02"
            className="object-cover w-full max-w-[210px] md:max-w-[251px] mb-5"
          />
          <Text
            variant="body-16-r"
            className="max-md:hidden mb-8 max-w-sm text-[var(--color-text-body-warm)]"
          >
            체크리스트 작성 후 우리 아이에게 적절한 패키지 박스를 추천받을 수 있습니다!
          </Text>
          <Button size="lg" className="max-md:hidden">
            체크리스트 작성하기
          </Button>
        </div>

        {/* Right */}
        <div className="flex w-full md:max-h-[410px] flex-1 items-center justify-center px-[25px] md:px-0">
          <Image
            src={ingredientsDetail}
            alt="Ingredients Detail"
            className="object-cover h-auto w-full md:max-h-[410px] md:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
