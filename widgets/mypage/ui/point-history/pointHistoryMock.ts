import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import type { MyReferralCode } from "@/features/referral/api";

export const POINT_HISTORY_MOCK_BALANCE: PointBalance = {
  totalAmount: 124_000,
  monthlyAmount: 38_000,
  year: 2026,
  month: 9,
};

export const POINT_HISTORY_MOCK_ITEMS: PointLedgerItem[] = [
  { id: 1, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "test@test.test", createdAt: "2026-09-02T09:15:00+09:00", referenceId: 101, referralCode: "GGOSOON" },
  { id: 2, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "hello@example.com", createdAt: "2026-09-01T14:30:00+09:00", referenceId: 102, referralCode: "GGOSOON" },
  { id: 3, amount: 8_000, type: "REFERRAL_REWARD", description: "구독 추천 보너스 적립", email: "long-email-address@example.com", createdAt: "2026-08-29T11:20:00+09:00", referenceId: 103, referralCode: "GGOSOON" },
  { id: 4, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "puppy@ggosoon.co.kr", createdAt: "2026-08-22T16:45:00+09:00", referenceId: 104, referralCode: "GGOSOON" },
  { id: 5, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "sample@sample.net", createdAt: "2026-08-14T08:10:00+09:00", referenceId: 105, referralCode: "GGOSOON" },
  { id: 6, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "subscriber@example.org", createdAt: "2026-08-03T12:00:00+09:00", referenceId: 106, referralCode: "GGOSOON" },
  { id: 7, amount: 5_000, type: "REFERRAL_REWARD", description: "친구 추천 포인트 적립", email: "doglover@example.com", createdAt: "2026-07-28T19:05:00+09:00", referenceId: 107, referralCode: "GGOSOON" },
];

export const POINT_HISTORY_MOCK_REFERRAL: MyReferralCode = {
  referralCode: "GGOSOON",
  slug: "ggosoon",
  referralLink: "/r/ggosoon",
};
