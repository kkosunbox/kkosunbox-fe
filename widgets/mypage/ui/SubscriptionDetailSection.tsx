"use client";

import type { UserSubscriptionDto, SubscriptionPaymentDto } from "@/features/subscription/api/types";
import { SubscriptionDetailView } from "./subscription-detail/SubscriptionDetailView";
import { useSubscriptionDetailSection } from "./subscription-detail/useSubscriptionDetailSection";

interface Props {
  subscription: UserSubscriptionDto;
  payments: SubscriptionPaymentDto[];
}

/* Widget (표현 전담 — 상태·핸들러는 useSubscriptionDetailSection 소유) */
export default function SubscriptionDetailSection({ subscription, payments }: Props) {
  const vm = useSubscriptionDetailSection({ subscription, payments });
  return <SubscriptionDetailView {...vm} />;
}
