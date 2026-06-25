/**
 * Type definitions for Decay Physics System
 */

/**
 * Decay level categorization based on days inactive
 */
export type DecayLevel = "fresh" | "aging" | "stale" | "critical";

/**
 * Complete decay metrics calculated from inactivity time
 */
export interface DecayMetrics {
  /** Number of days since last activity */
  daysSinceActivity: number;

  /** Opacity multiplier (0.5 - 1.0) */
  opacityMultiplier: number;

  /** Saturation percentage (30 - 100) */
  saturationPercent: number;

  /** Contrast percentage (60 - 100) */
  contrastPercent: number;

  /** Whether to show red border overlay (>= 7 days) */
  showRedBorder: boolean;

  /** Whether to show pulsing alert icon (>= 10 days) */
  showPulsingAlert: boolean;

  /** Decay level category */
  decayLevel: DecayLevel;

  /** Human-readable tooltip message */
  tooltipMessage: string;
}

/**
 * Configuration for decay curve behavior
 */
export interface DecayConfig {
  /** Maximum days to calculate decay for (caps extreme values) */
  maxDays?: number;

  /** Exponential curve power (default: 1.5) */
  curvePower?: number;

  /** Minimum opacity threshold (default: 0.5) */
  minOpacity?: number;

  /** Minimum saturation threshold (default: 30) */
  minSaturation?: number;

  /** Minimum contrast threshold (default: 60) */
  minContrast?: number;

  /** Day threshold for red border (default: 7) */
  redBorderThreshold?: number;

  /** Day threshold for pulsing alert (default: 10) */
  alertThreshold?: number;

  /** Day threshold for critical state (default: 15) */
  criticalThreshold?: number;
}

/**
 * Props for DecayingDealCard component
 */
export interface DecayingDealCardProps {
  /** Deal object containing metadata */
  deal: any; // CRMDeal from generated types

  /** Last activity date (ISO string) - auto-detected if omitted */
  lastActivityDate?: string | null;

  /** Card content to wrap with decay effects */
  children: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Custom decay configuration */
  config?: DecayConfig;
}

/**
 * Return type for useLastActivityDate hook
 */
export type LastActivityDate = string | null;

/**
 * Decay animation variants
 */
export interface DecayAnimationVariants {
  /** Red border pulse animation */
  redBorderPulse: {
    duration: number;
    repeat: number;
    ease: string;
  };

  /** Alert icon pulse animation */
  alertPulse: {
    duration: number;
    repeat: number;
    ease: string;
  };

  /** Tooltip enter/exit animation */
  tooltip: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
  };
}

/**
 * Decay stage thresholds (days)
 */
export const DECAY_THRESHOLDS = {
  FRESH: 0,
  WARM: 3,
  AGING: 7,
  STALE: 10,
  CRITICAL: 15,
} as const;

/**
 * Decay color palette
 */
export const DECAY_COLORS = {
  FRESH: "emerald",
  WARM: "yellow",
  AGING: "orange",
  STALE: "red",
  CRITICAL: "red-dark",
} as const;

/**
 * Type guard to check if a value is a valid decay level
 */
export function isDecayLevel(value: string): value is DecayLevel {
  return ["fresh", "aging", "stale", "critical"].includes(value);
}

/**
 * Type guard to check if a deal has valid activity date
 */
export function hasValidActivityDate(deal: any): deal is { modified: string } {
  return (
    typeof deal === "object" &&
    deal !== null &&
    typeof deal.modified === "string" &&
    deal.modified.length > 0
  );
}
