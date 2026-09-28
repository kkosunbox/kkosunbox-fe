"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { tierFromSubscriptionPlan, tierLabel } from "@/entities/package";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import Stars from "@/widgets/subscribe/plans/ui/reviews/Stars";
import styles from "./HomeReviews.module.css";

const PAGE_SIZE = 8;
const MEDIA_POSITIONS: Record<number, string> = {
  3: "50% 60%",
  5: "50% 40%",
  7: "50% 70%",
  8: "50% 50%",
  9: "50% 30%",
  10: "50% 35%",
  11: "50% 35%",
  16: "50% 30%",
};

function ReviewArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="26" viewBox="0 0 16 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d={direction === "left" ? "M14 2L2 12.6667L14 23.3333" : "M2 2L14 12.6667L2 23.3333"} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const REVIEWS = [
  {
    id: 1,
    content: "강아지수제간식 정기구독이라니 >.< 요즘 세상 좋긴 너무 좋아요 ㅋㅋㅋ 기호성 완전 합격이에요 ♥♥ 너무 맛있게 먹더라구요!! 뜯어보니 생각보다 말랑해서 노견이나 어린 강아지들도 편하게 먹을 수 있는 식감이라 저희 아이도 잘 먹었어요.",
    email: "ye****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-01.mp4",
    poster: "/images/home/reviews/review-01-poster.webp",
    kind: "video",
  },
  {
    id: 2,
    content: "첨가물 거의 없고 재료가 단순한 편이라 믿음이 가요. 요즘은 컨디션도 더 좋아 보여서 오래 먹일 생각이에요. 소고기화식이랑 가자미화식이 진짜 식사 같고, 오트콕크런칩이랑 꼬미칩은 바삭해서 나눠주기 좋아요. 산책 끝나고 하나 주면 너무 행복해해서 저도 기분이 좋아요~",
    email: "ji****@naver.com",
    tier: "Premium",
    media: "/images/home/reviews/review-02.webp",
    kind: "image",
  },
  {
    id: 3,
    content: "마루두리는 실제로 평소에 장이 조금 예민한편이라 잘못 먹으면 설사를 하기도 하고, 배에서 꾸륵꾸륵 소리가 나기도 하는데요 .. ㅎㅎ;; 꼬순박스 간식을 먹었을때는 변 상태가 무르지도 않고 잘 먹더라고요!!",
    email: "ma****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-03.mp4",
    poster: "/images/home/reviews/review-03-poster.webp",
    kind: "video",
  },
  {
    id: 4,
    content: "이번에 직접 먹여보면서 느낀 건 역시 우리 강아지가 맛있게 먹어주는 모습만큼 뿌듯한 게 없다는 것! 우리 아이도 간식 봉투만 보면 쪼르르 달려오는 걸 보니 이번 간식은 꽤 마음에 들었나 봅니다. :)",
    email: "zj****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-04.mp4",
    poster: "/images/home/reviews/review-04-poster.webp",
    kind: "video",
  },
  {
    id: 5,
    content: "숮간식이다보니 아무래도 포장이나 보관 부분도 신경쓰일 수 밖에 없는데, 아이스박스 + 아이스팩으로 배송되어 더욱 안심이 되었어요 :)",
    email: "eh****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-05.webp",
    kind: "image",
  },
  {
    id: 6,
    content: "필요한 간식을 그때그때 다시 고르는 수고를 줄일 수 있다는 점이 눈에 들어왔어용. ㅎㅎㅎㅎ 수제간식은 종류마다 모양과 급여 방식이 달라 여러 봉지를 따로 주문하기 애매할 때가 있는데, 정기구독 한 박스로 구성해주니 한결 간편하겠더라고요 (따봉)",
    email: "ch****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-06.mp4",
    poster: "/images/home/reviews/review-06-poster.webp",
    kind: "video",
  },
  {
    id: 7,
    content: "애순이의 최애는 바로 삼색 우유껌이었어요 ♥♡ 역시 씹는 걸 좋아하는 강아지답게 삼색우유껌을 주니까 관심도가 확 올라가더라고요 ㅋㅋㅋ 간식 하나 들고 있으면 어디선가 슬금슬금 나타나는 애순이 간식 줄 때마다 맛있게 먹어주는 모습을 보니까 저도 괜히 기분이 좋아졌어요ㅎㅎ",
    email: "mi****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-07.webp",
    kind: "image",
  },
  {
    id: 8,
    content: "간식 봉지만 네 개 늘어놓았는데 금별이가 바로 옆으로 와서 코부터 들이밀더라고요. ㅋㅋㅋㅋ 아직 개봉도 안 했는데 자기 것인 줄은 어쩜 이렇게 잘 아는지 ㅋㅋ 한 가지 수제간식만 계속 주면 금방 익숙해질 수 있는데, 이렇게 형태가 다른 제품이 들어 있으니 그날그날 골라 주기 좋았어요. ㅎㅎ",
    email: "ch****@naver.com",
    tier: "Standard",
    media: "/images/home/reviews/review-08.mp4",
    poster: "/images/home/reviews/review-08-poster.webp",
    kind: "video",
  },
  {
    id: 9,
    content: "츄르를 보여주자 아이들이 냄새를 맡으며 관심을 보였는데요. 부드러운 제형이라 편하게 핥아 먹을 수 있었고, 파우치를 잡은 상태로 바로 급여할 수 있어 별도의 그릇을 준비하지 않아도 된다는 점도 좋았어요.",
    email: "jo****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-09.webp",
    kind: "image",
  },
  {
    id: 10,
    content: "사실 매달 어떤 간식을 사줘야 아이가 질려하지 않을지, 영양 성분이 한쪽으로 겹치지는 않을지 매번 고민하는 것도 은근히 숙제잖아요. 하지만 꼬순박스를 통해 반려견 수제간식 정기구독을 신청하니까 이런 고민 없이 아이 간식을 줄 수 있어서 얼마나 편한지 몰라요! 그리고, 정기구독을 하기 위해 홈페이지를 들어가면 가입 시 꼼꼼한 체크리스트를 작성하게 되는데요. 우리 아이의 건강 상태, 기호성, 알러지 여부 등을 세심하게 반영해서 아이에게 딱 맞춘 최적의 패키지를 권유해 준답니다.",
    email: "qu****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-10.webp",
    kind: "image",
  },
  {
    id: 11,
    content: "처음에는 조금 경계하나 했더니 냄새를 맡아보고서는 자연스럽게 입에 넣고 씹기 시작했어요. 생각보다 끝까지 잘 먹어줘서 사길 잘했다는 생각이 들었어요~",
    email: "pu****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-11.webp",
    kind: "image",
  },
  {
    id: 12,
    content: "요거트볼은 한 알씩 간편하게 급여하기 좋아서 평소 간식으로 챙겨주기 편했고, 츄르는 부드러운 타입이라 간식으로 주거나 조금씩 나눠 급여하기에도 좋았어요.",
    email: "bb****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-12.mp4",
    poster: "/images/home/reviews/review-12-poster.webp",
    kind: "video",
  },
  {
    id: 13,
    content: "또 한 가지 좋았던 건 냉동 보관이 가능하다는 점이에요. 간식을 직접 만들었을 때는 한 번 만들고 나면 소분부터 보관까지 신경 써야 했는데, 이제는 필요한 만큼만 꺼내서 급여할 수 있으니 확실히 편해졌어요.",
    email: "pu****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-13.webp",
    kind: "image",
  },
  {
    id: 14,
    content: "너무 딱딱하지 않고 봉지를 열었을 때 기분 나쁜 냄새가 나지 않아서 걱정하지 않고 급여 할 수 있을 것 같았어요",
    email: "an****@naver.com",
    tier: "Standard",
    media: "/images/home/reviews/review-14.mp4",
    poster: "/images/home/reviews/review-14-poster.webp",
    kind: "video",
  },
  {
    id: 15,
    content: "말랑한 것부터 바삭해 보이는 것까지 모양과 색도 서로 달라서 하나씩 열어보는 재미가 있었답니다.",
    email: "th****@naver.com",
    tier: "Basic",
    media: "/images/home/reviews/review-15.webp",
    kind: "image",
  },
  {
    id: 16,
    content: "은근 향이 좋지 않은 우유껌도 많은데 꼬순박스 베이직 패키지 박스 우유껌은 제가 씹어보고 싶을 정도로 맛있는 냄새가 나서 걱정하지 않고 급여할 수 있었답니다~",
    email: "lu****@naver.com",
    tier: "Standard",
    media: "/images/home/reviews/review-16.webp",
    kind: "image",
  },
] as const;

export default function HomeReviews({ plans }: { plans: SubscriptionPlanDto[] }) {
  const [slide, setSlide] = useState(1);
  const [animate, setAnimate] = useState(true);
  const moving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  function move(direction: number) {
    if (moving.current) return;
    moving.current = true;
    const next = slide + direction;
    setAnimate(true);
    setSlide(next);
    timer.current = setTimeout(() => {
      setAnimate(false);
      setSlide(next === 0 ? 2 : next === 3 ? 1 : next);
      frame.current = requestAnimationFrame(() => {
        frame.current = requestAnimationFrame(() => {
          moving.current = false;
        });
      });
    }, 460);
  }
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackRef.current?.querySelectorAll("video").forEach(video => {
      if (video.closest("[inert]")) video.pause();
      else void video.play().catch(() => {});
    });
  }, [slide]);

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.container}>
        <h2 id="reviews-title" className={styles.heading}><span>먼저 경험한 보호자들의</span> 이야기를 들어보세요.</h2>
        <p className={styles.description}>꼬순박스를 직접 경험한 보호자들의 솔직한 후기를 모았습니다.</p>
        <div className={styles.carousel}>
          <div className={styles.viewport}>
          <div ref={trackRef} className={styles.track} style={{ transform: `translateX(calc(${-slide} * (100% + 40px)))`, transition: animate ? undefined : "none" }}>
          {[2, 1, 2, 1].map((pageNumber, index) => (
          <div key={index} className={styles.cards} inert={slide !== index} aria-hidden={slide !== index}>
            {REVIEWS.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE).map(review => {
              const plan = plans.find(item => tierFromSubscriptionPlan(item) === review.tier);
              const planHref = plan
                ? `/subscribe/detail?planId=${plan.id}`
                : `/subscribe?tier=${review.tier}`;

              return (
              <article key={review.id} className={styles.card}>
                <div className={styles.photo}>
                  <div className={review.id === 14 ? styles.croppedMedia : styles.media}>
                  {review.kind === "video" ? (
                    <video style={{ objectPosition: MEDIA_POSITIONS[review.id] }} autoPlay={slide === index} muted loop playsInline preload="auto" poster={review.poster} aria-label={`${review.id}번 리뷰 영상`}>
                      <source src={review.media} type="video/mp4" />
                      브라우저에서 영상을 재생할 수 없습니다.
                    </video>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- 앱 정적 폴더의 리뷰 에셋.
                    <img style={{ objectPosition: MEDIA_POSITIONS[review.id] }} src={review.media} alt={`${review.id}번 리뷰 사진`} loading="lazy" />
                  )}
                </div>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.stars}><Stars rating={5} size={20} /></span>
                    <Link className={styles.packageLink} href={planHref}>{tierLabel(review.tier)} 패키지</Link>
                  </div>
                  <p className={styles.content}>{review.content}</p>
                  <span className={styles.author}>{review.email}</span>
                </div>
              </article>
              );
            })}
          </div>
          ))}
          </div>
          </div>
          <nav className={styles.controls} aria-label="후기 페이지">
            <button type="button" onClick={() => move(-1)} aria-label="이전 후기 페이지"><ReviewArrow direction="left" /></button>
            <button type="button" onClick={() => move(1)} aria-label="다음 후기 페이지"><ReviewArrow direction="right" /></button>
          </nav>
        </div>
      </div>
    </section>
  );
}
