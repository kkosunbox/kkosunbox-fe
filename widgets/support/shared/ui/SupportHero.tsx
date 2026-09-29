import Image from "next/image";
import contactBanner from "../assets/support-contact-banner.png";
import styles from "./SupportHero.module.css";

export function SupportHero() {
  return (
    <section className={styles.hero} aria-label="고객센터 안내">
      <p><strong>궁금한 점이 있다면</strong> 꼬순박스에 편하게 문의하기</p>
      <Image
        src={contactBanner}
        alt=""
        aria-hidden="true"
        width={143}
        height={63}
        className={styles.illustration}
      />
    </section>
  );
}
