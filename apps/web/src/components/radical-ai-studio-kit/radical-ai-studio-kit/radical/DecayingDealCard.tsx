"use client";

import React, { useMemo, useState } from "react";
import { CRMDeal } from "@/lib/types/crm.generated";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { cn, Badge, Avatar, Tooltip } from "@frappe-ui/neobrutalism";
import { IconAlertTriangle, IconClock, IconSkull, IconFileInvoice, IconUser } from "@tabler/icons-react";

interface DecayingDealCardProps {
  deal: CRMDeal;
  lastActivityDate?: string | null;
  children: React.ReactNode;
  className?: string;
}

interface DecayMetrics {
  daysSinceActivity: number;
  opacityMultiplier: number;
  saturationPercent: number;
  contrastPercent: number;
  showRedBorder: boolean;
  showPulsingAlert: boolean;
  decayLevel: "fresh" | "aging" | "stale" | "critical";
  tooltipMessage: string;
}

/**
 * Calculates decay metrics based on days since last activity
 * Physics-based decay curve: exponential degradation with thresholds
 */
function calculateDecayMetrics(daysSinceActivity: number): DecayMetrics {
  // Clamp to max 30 days for calculation purposes
  const cappedDays = Math.min(daysSinceActivity, 30);

  // Exponential decay curve (slower at first, accelerates)
  const decayFactor = 1 - Math.pow(cappedDays / 30, 1.5);

  // Opacity: decreases from 100% to 50% (max 50% reduction)
  const opacityMultiplier = Math.max(0.5, 0.5 + decayFactor * 0.5);

  // Saturation: decreases from 100% to 30%
  const saturationPercent = Math.max(30, 30 + decayFactor * 70);

  // Contrast: decreases from 100% to 60%
  const contrastPercent = Math.max(60, 60 + decayFactor * 40);

  // Red border appears after 7 days
  const showRedBorder = daysSinceActivity >= 7;

  // Pulsing alert appears after 10 days
  const showPulsingAlert = daysSinceActivity >= 10;

  // Decay level categorization
  let decayLevel: DecayMetrics["decayLevel"] = "fresh";
  let tooltipMessage = "Active deal - recent activity detected";

  if (daysSinceActivity >= 15) {
    decayLevel = "critical";
    tooltipMessage = `CRITICAL: No activity for ${daysSinceActivity} days. Deal may be lost.`;
  } else if (daysSinceActivity >= 10) {
    decayLevel = "stale";
    tooltipMessage = `Stale deal: ${daysSinceActivity} days without contact. Urgent action needed.`;
  } else if (daysSinceActivity >= 7) {
    decayLevel = "aging";
    tooltipMessage = `Aging deal: ${daysSinceActivity} days since last activity. Follow up recommended.`;
  } else if (daysSinceActivity >= 3) {
    decayLevel = "fresh";
    tooltipMessage = `${daysSinceActivity} days since last activity. Still warm.`;
  }

  return {
    daysSinceActivity,
    opacityMultiplier,
    saturationPercent,
    contrastPercent,
    showRedBorder,
    showPulsingAlert,
    decayLevel,
    tooltipMessage,
  };
}

/**
 * Calculates days since last activity from a date string
 */
function calculateDaysSinceActivity(lastActivityDate?: string | null): number {
  if (!lastActivityDate) {
    return 0;
  }

  try {
    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

export function DecayingDealCard({
  deal,
  lastActivityDate,
  children,
  className,
}: DecayingDealCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate decay metrics
  const daysSinceActivity = useMemo(
    () => calculateDaysSinceActivity(lastActivityDate || deal.modified),
    [lastActivityDate, deal.modified]
  );

  const decayMetrics = useMemo(
    () => calculateDecayMetrics(daysSinceActivity),
    [daysSinceActivity]
  );

  // Motion values for smooth animations
  const opacity = useMotionValue(decayMetrics.opacityMultiplier);
  const scale = useMotionValue(1);

  // Apply visual decay filters
  const filterStyle = {
    filter: `
      saturate(${decayMetrics.saturationPercent}%)
      contrast(${decayMetrics.contrastPercent}%)
      opacity(${decayMetrics.opacityMultiplier})
    `,
    transition: "filter 0.5s ease-out",
  };

  // Red border glow intensity increases with decay
  const redGlowIntensity = Math.min(
    (decayMetrics.daysSinceActivity - 7) / 10,
    1
  );

  return (
    <motion.div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Decay Visual Wrapper */}
      <div className="relative" style={filterStyle}>
        {/* Red Border Overlay (appears after 7 days) */}
        {decayMetrics.showRedBorder && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              boxShadow: [
                `0 0 10px rgba(239, 68, 68, ${redGlowIntensity * 0.3})`,
                `0 0 20px rgba(239, 68, 68, ${redGlowIntensity * 0.6})`,
                `0 0 10px rgba(239, 68, 68, ${redGlowIntensity * 0.3})`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              border: `2px solid rgba(239, 68, 68, ${redGlowIntensity})`,
              borderRadius: "0.5rem",
            }}
          />
        )}

        {/* Pulsing Alert Icon (appears after 10 days) */}
        <AnimatePresence>
          {decayMetrics.showPulsingAlert && (
            <motion.div
              className="absolute -top-2 -right-2 z-20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: 0,
              }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 0.5,
                },
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50" />

                {/* Icon badge */}
                <div className="relative bg-red-500 rounded-full p-1.5 border-2 border-black">
                  {decayMetrics.decayLevel === "critical" ? (
                    <IconSkull size={16} className="text-white" />
                  ) : (
                    <IconAlertTriangle size={16} className="text-white" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children (original card content) */}
        {children}
      </div>

      {/* Tooltip (appears on hover) */}
      <AnimatePresence>
        {isHovered && decayMetrics.daysSinceActivity >= 3 && (
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              {/* Tooltip arrow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/90" />

              {/* Tooltip content */}
              <div
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border backdrop-blur-sm",
                  decayMetrics.decayLevel === "critical" &&
                  "bg-red-950/90 border-red-500 text-red-100",
                  decayMetrics.decayLevel === "stale" &&
                  "bg-orange-950/90 border-orange-500 text-orange-100",
                  decayMetrics.decayLevel === "aging" &&
                  "bg-yellow-950/90 border-yellow-500 text-yellow-100",
                  decayMetrics.decayLevel === "fresh" &&
                  "bg-black/90 border-white/20 text-white/80"
                )}
              >
                <div className="flex items-center gap-2">
                  <IconClock size={14} />
                  <span>{decayMetrics.tooltipMessage}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decay Level Debug Badge (only shown on hover, for development) */}
      {isHovered && process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-2 left-2 z-20 px-2 py-1 bg-black/80 border border-white/20 rounded text-[10px] font-mono text-white/60">
          Decay: {decayMetrics.daysSinceActivity}d | {decayMetrics.decayLevel}
        </div>
      )}

      {/* Zoho Context Footer (Invoice & Salesperson) */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {deal.zoho_invoice_salesperson && (
            <Tooltip label={`Salesperson: ${deal.zoho_invoice_salesperson}`}>
              <Avatar size="xs" label={deal.zoho_invoice_salesperson} />
            </Tooltip>
          )}
          {deal.zoho_invoice_items_summary && (
            <Badge variant="outline" size="sm" color="gray" className="max-w-[120px] truncate" title={deal.zoho_invoice_items_summary}>
              {deal.zoho_invoice_items_summary}
            </Badge>
          )}
        </div>

        {deal.zoho_invoice_url && (
          <a href={deal.zoho_invoice_url as string} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <Badge variant="solid" size="sm" color="blue" className="gap-1 hover:bg-blue-600 cursor-pointer">
              <IconFileInvoice size={12} />
              Invoice
            </Badge>
          </a>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Utility hook to extract last activity date from deal
 * Checks multiple potential activity date fields
 */
export function useLastActivityDate(deal: CRMDeal): string | null {
  return useMemo(() => {
    // Priority order for activity date detection
    const candidates = [
      deal.last_activity_date,
      deal.last_responded_on,
      deal.modified,
    ];

    for (const date of candidates) {
      if (date) return date;
    }

    return null;
  }, [deal]);
}

/**
 * Export decay calculation for use in other components
 */
export { calculateDecayMetrics, calculateDaysSinceActivity };
