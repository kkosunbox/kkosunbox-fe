import { notFound } from "next/navigation";
import PointHistorySection from "@/widgets/mypage/ui/PointHistorySection";
import {
  POINT_HISTORY_MOCK_BALANCE,
  POINT_HISTORY_MOCK_ITEMS,
  POINT_HISTORY_MOCK_REFERRAL,
} from "@/widgets/mypage/ui/point-history/pointHistoryMock";

export const metadata = { title: "MY 포인트 미리보기 | 꼬순박스" };

export default function PointHistoryPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PointHistorySection
      balance={POINT_HISTORY_MOCK_BALANCE}
      items={POINT_HISTORY_MOCK_ITEMS}
      referral={POINT_HISTORY_MOCK_REFERRAL}
    />
  );
}
