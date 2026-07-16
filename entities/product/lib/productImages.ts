import type { StaticImageData } from "next/image";
import shopYogurtBall from "../assets/shop-yogurt-ball.webp";
import shopChuru from "../assets/shop-churu.webp";
import shopSeaweedChipChicken from "../assets/shop-seaweed-chip-chicken.webp";
import shopSeaweedChipPork from "../assets/shop-seaweed-chip-pork.webp";
import shopBeefGum from "../assets/shop-beef-gum.webp";
import shopMilkGum from "../assets/shop-milk-gum.webp";
import shopKkokkoRiceball from "../assets/shop-kkokko-riceball.webp";
import shopHomemadeMeal from "../assets/shop-homemade-meal.webp";

/** /shop 단품 상품 id → 상세 이미지 */
export const SHOP_PRODUCT_IMAGES: Record<string, StaticImageData> = {
  "yogurt-ball": shopYogurtBall,
  churu: shopChuru,
  "seaweed-chip-chicken": shopSeaweedChipChicken,
  "seaweed-chip-pork": shopSeaweedChipPork,
  "beef-gum": shopBeefGum,
  "milk-gum": shopMilkGum,
  "kkokko-riceball": shopKkokkoRiceball,
  "homemade-meal": shopHomemadeMeal,
};
