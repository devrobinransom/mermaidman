"use client";

import React from "react";
import { CRMDeal } from "@/lib/types/crm.generated";
import { WarfareDealCard } from "./WarfareDealCard";
import { DecayingDealCard, useLastActivityDate } from "../DecayingDealCard";

interface DecayWarfareDealCardProps {
  deal: CRMDeal;
  index: number;
  lastActivityDate?: string | null;
}

/**
 * Example integration: WarfareDealCard wrapped with DecayingDealCard
 *
 * This demonstrates how to combine the existing card UI with decay physics.
 * The decay layer is completely transparent to the original card component.
 */
export function DecayWarfareDealCard({
  deal,
  index,
  lastActivityDate,
}: DecayWarfareDealCardProps) {
  // Auto-detect activity date if not provided
  const activityDate = useLastActivityDate(deal);
  const finalActivityDate = lastActivityDate ?? activityDate;

  return (
    <DecayingDealCard deal={deal} lastActivityDate={finalActivityDate}>
      <WarfareDealCard deal={deal} index={index} />
    </DecayingDealCard>
  );
}
