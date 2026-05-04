import Image from "next/image";
import { Text, ScrollReveal } from "@/shared/ui";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { fetchPlanReviews } from "@/features/review/api/queries";
import type { ReviewResponse } from "@/features/review/api/types";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import reviewsTitle from "../assets/reviews-title.webp";
import reviewsProfile01 from "../assets/reviews-profile-01.webp";
import reviewsProfile02 from "../assets/reviews-profile-02.webp";
import reviewsProfile03 from "../assets/reviews-profile-03.webp";

const FALLBACK_REVIEWS = [
  {
    name: "코코 (웰시코기)",
    subscription: "구독 32일째, 프리미엄",
    review:
      "처음엔 가격대가 있어서 고민했는데 받아보고 생각 바뀌었어요. 포장부터 너무 깔끔하고 고급스럽고, 무엇보다 우리 강아지가 진짜 잘 먹어요. 평소 간식 가리던 아이인데 꼬순박스는 뜯자마자 달려오네요ㅎㅎ 재구독 의사 100%입니다!",
    profile: reviewsProfile01,
    imageUrl: null as string | null,
  },
  {
    name: "보리 (웰시코기)",
    subscription: "구독 58일째, 스탠다드",
    review:
      "성분 보고 선택했는데 진짜 만족이에요. 불필요한 첨가물 없고 믿고 먹일 수 있어서 좋아요. 간식 종류도 다양해서 매번 새로운 느낌이라 강아지도 질려하지 않네요. 구독 서비스 중에서는 제일 만족스러워요.",
    profile: reviewsProfile02,
    imageUrl: null as string | null,
  },
  {
    name: "두부 (리트리버)",
    subscription: "구독 91일째, 프리미엄",
    review:
      "강아지 키우면서 간식 고민 많았는데 꼬순박스로 정착했어요. 매달 어떤 구성이 올지 기대하는 재미도 있고, 퀄리티가 확실히 일반 간식이랑 달라요. 주변 견주들한테도 추천 많이 하고 있어요",
    profile: reviewsProfile03,
    imageUrl: null as string | null,
  },
];

type DisplayReview = {
  name: string;
  subscription: string;
  review: string;
  profile: typeof reviewsProfile01 | null;
  imageUrl: string | null;
};

function formatReviewDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchDisplayReviews(): Promise<DisplayReview[]> {
  const plans = await fetchSubscriptionPlans();
  if (!plans.length) return [];

  const results = await Promise.all(
    plans.map((plan: SubscriptionPlanDto) =>
      fetchPlanReviews(plan.id, 1, 5).then((res) =>
        res.items.map((item: ReviewResponse) => ({ item, planName: plan.name })),
      ),
    ),
  );

  const allReviews = results.flat().sort(
    (a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime(),
  );

  return allReviews.slice(0, 3).map(({ item, planName }) => ({
    name: item.snapshotPetName ?? "익명",
    subscription: `${formatReviewDate(item.createdAt)} · ${planName}`,
    review: item.content,
    profile: null,
    imageUrl: item.snapshotPetProfileImageUrl ?? null,
  }));
}

function StarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill="var(--color-star)"
      />
    </svg>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className="relative flex h-full flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-[84px] shadow-[0px_4px_10px_rgba(82,82,82,0.1)]">
      <div className="absolute -top-[60px] left-1/2 h-[120px] w-[120px] -translate-x-1/2 overflow-hidden rounded-full border-[8px] border-white">
        {review.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.imageUrl}
            alt={`${review.name} 프로필`}
            className="h-full w-full object-cover"
          />
        ) : review.profile ? (
          <Image
            src={review.profile}
            alt={`${review.name} 프로필`}
            width={120}
            height={120}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-warm)] text-[40px]">
            🐾
          </div>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col items-center">
        <div className="mb-6 flex gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>

        <p className="mb-6 flex-1 text-[14px] leading-[140%] text-[var(--color-review-text)]">
          {review.review}
        </p>

        <div className="flex w-full shrink-0 flex-col items-center gap-2">
          <span className="text-center text-[18px] font-bold leading-[21px] text-[var(--color-review-text)]">
            {review.name}
          </span>
          <span className="text-center text-[14px] font-medium leading-[17px] text-[var(--color-text-label)]">
            {review.subscription}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function ReviewsSection() {
  const apiReviews = await fetchDisplayReviews();
  const reviews: DisplayReview[] = apiReviews.length > 0 ? apiReviews : FALLBACK_REVIEWS;

  return (
    <section
      className="py-16 md:pt-[86px] md:pb-[116px]"
      style={{ background: "var(--gradient-reviews)" }}
    >
      <div className="mx-auto max-w-content max-md:px-6 md:px-0">
        <ScrollReveal variant="fade-up">
          <Image
            src={reviewsTitle}
            alt="생생한 리뷰를 확인하세요!"
            className="mx-auto h-auto w-full max-w-[min(100%,300px)] md:max-w-[412px]"
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <Text
            variant="body-16-r"
            mobileVariant="body-14-m"
            className="mt-4 md:mt-5.5 mb-12 md:mb-[55px] text-center text-[var(--color-text-warm)] tracking-[-0.02em]"
          >
            실제 꼬순박스 패키지를 구매하신&nbsp;<br className="md:hidden"/>고객님들의 생생한 리뷰입니다.
          </Text>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[88px] md:gap-9 pt-[60px]">
          {reviews.map((review, i) => (
            <ScrollReveal key={review.name + i} variant="fade-up" delay={300 + i * 200} className="h-full">
              <ReviewCard review={review} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
