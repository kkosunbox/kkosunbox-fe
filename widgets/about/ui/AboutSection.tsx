import Image from "next/image";
import Link from "next/link";
import logo from "@/shared/assets/logo-main@2x.webp";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import hero from "../assets/brand-story-hero.png";
import paper from "../assets/brand-story-paper.png";
import restingDog from "../assets/brand-story-rest.png";
import ingredients from "../assets/brand-story-ingredients.png";
import allergy from "../assets/about-section-2-svg-01.svg";
import skin from "../assets/about-section-2-svg-02.svg";
import digestion from "../assets/about-section-2-svg-03.svg";
import odor from "../assets/about-section-2-svg-04.svg";
import handmade from "../assets/about-section-4-thumbnail.png";
import mealLeft from "../assets/about-section-5-left.png";
import mealRight from "../assets/about-section-5-right.png";
import cta from "../assets/about-section-cta-bg.png";
import styles from "./AboutSection.module.css";

const concerns = [
  { label: "알레르기", image: allergy },
  { label: "피부질환", image: skin },
  { label: "배변문제", image: digestion },
  { label: "체취문제", image: odor },
];
const steps = [
  { title: "주문에 맞춰 소량 제작", description: "필요한 만큼만 정성껏 만들어 더 신선하게 전달합니다." },
  { title: "하나하나 직접 확인", description: "만드는 과정부터 완성까지 작은 부분도 꼼꼼하게 살핍니다." },
  { title: "정성스럽게 포장", description: "정성스러운 마음을 담아 마지막 포장까지 직접 챙깁니다." },
];

export default function AboutSection() {
  return (
    <div className={styles.story}>
      <section className={styles.hero} aria-labelledby="story-title">
        <Image src={paper} alt="" fill priority sizes="100vw" className={styles.paper} />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><Image src={logo} alt="꼬순박스" width={51} /> 브랜드 스토리</p>
            <h1 id="story-title" className={styles.heroTitle}>우리도 같은 <span>보호자니까</span></h1>
            <p className={styles.body}>꼬순박스를 만드는 우리도 반려견과 함께 살아가는 보호자입니다.<br />그래서 매일 무엇을 먹는지가<br />얼마나 중요한지 잘 알고 있습니다.</p>
          </div>
          <Image src={hero} alt="산책 중인 포메라니안과 웰시코기" priority quality={HIGH_IMAGE_QUALITY} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 60vw, 714px" className={styles.heroImage} />
        </div>
      </section>

      <section className={styles.concerns} aria-labelledby="story-concerns">
        <div className={`${styles.container} ${styles.concernsInner}`}>
          <div>
            <h2 id="story-concerns" className={styles.heading}>잘 먹는다고, <span>다 같은 간식은 아니니까!</span></h2>
            <p className={styles.body}>잘 먹어주는 것만으로는 부족하다고 생각했습니다.<br />무엇을 먹느냐에 따라 알레르기, 피부, 배변, 체취 같은 작은 변화가 나타나니까요.</p>
            <ul className={styles.concernCards}>
              {concerns.map(({ label, image }) => (
                <li key={label}><Image src={image} alt="" width={79} height={68} /><p className="text-subtitle-18-b">{label}</p></li>
              ))}
            </ul>
          </div>
          <Image src={restingDog} alt="포근한 이불 속에서 쉬는 강아지" quality={HIGH_IMAGE_QUALITY} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 38vw, 455px" className={styles.restImage} />
        </div>
      </section>

      <section className={styles.ingredients} aria-labelledby="story-ingredients">
        <Image src={ingredients} alt="햇살이 드는 주방에 준비한 신선한 채소와 원료" fill quality={HIGH_IMAGE_QUALITY} sizes="100vw" className={styles.backgroundImage} />
        <div className={styles.ingredientShade} />
        <div className={`${styles.container} ${styles.ingredientInner}`}>
          <h2 id="story-ingredients" className={styles.heading}>맛있는 건 기본,<br /><span className={styles.white}>재료부터 꼼꼼하게</span></h2>
          <p className={styles.body}>사람이 먹어도 안심할 수 있는 원료를 사용하고 방부제·착색료·인공향료는 넣지 않습니다.<br /><br />재료 본연의 맛과 영양을 중요하게 생각합니다.</p>
        </div>
      </section>

      <section className={styles.handmade} aria-labelledby="story-handmade">
        <div className={styles.container}>
          <h2 id="story-handmade" className={styles.heading}>기계보다, <span>손이 한 번 더 가더라도</span></h2>
          <p className={styles.body}>꼬순박스는 전 공정을 직접 수작업으로 진행하고 주문에 맞춰 소량씩 만듭니다.<br />조금 더 손이 가더라도 하나하나 직접 확인합니다.</p>
          <div className={styles.handmadeGrid}>
            <Image src={handmade} alt="직접 만들고 개별 포장한 꼬순박스 수제간식" quality={HIGH_IMAGE_QUALITY} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 58vw, 752px" className={styles.handmadeImage} />
            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <li key={step.title}>
                  <h3><span>{String(index + 1).padStart(2, "0")}.</span> {step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.balance} aria-labelledby="story-balance">
        <div className={styles.container}>
          <h2 id="story-balance" className={styles.heading}><span>맛과 건강의 균형까지</span><br />생각합니다.</h2>
          <p className={styles.body}>좋은 재료뿐만 아니라 반려견에게 필요한 영양과 원료의 균형까지 고려합니다.<br />맛있게 먹는 즐거움과 건강을 함께 생각합니다.</p>
          <div className={styles.meals}>
            <Image src={mealLeft} alt="수제 식사 앞에서 입맛을 다시는 비숑" quality={HIGH_IMAGE_QUALITY} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 46vw, 600px" />
            <Image src={mealRight} alt="채소와 고기로 만든 간식을 기다리는 웰시코기" quality={HIGH_IMAGE_QUALITY} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 46vw, 600px" />
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="story-cta">
        <div className={styles.ctaBackdrop}>
          <Image src={cta} alt="편안하게 누워 쉬는 웰시코기" fill quality={HIGH_IMAGE_QUALITY} sizes="(min-width: 1920px) 1920px, 100vw" className={styles.backgroundImage} />
        </div>
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <h2 id="story-cta" className={styles.heading}>“우리 강아지에게도<br /><span>마음 놓고 먹일 수 있을까?”</span></h2>
          <p className={styles.body}>우리의 기준은 아주 단순합니다<br />그 질문에 자신 있게 답할 수 있는 것만 만듭니다.<br /><br />내 강아지에게 먹일 수 없는 것은 만들지 않습니다.</p>
          <Link href="/subscribe" className={styles.ctaButton}>꼬순박스 구독하러 가기 <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
