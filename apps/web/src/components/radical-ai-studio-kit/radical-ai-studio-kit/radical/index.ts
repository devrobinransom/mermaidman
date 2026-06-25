/**
 * Radical CRM Components
 *
 * Collection of experimental, game-theoretic, and AI-powered UI components
 * following the "Master UX" philosophy.
 */

export { DealStatusScratchCard } from './DealStatusScratchCard'
export { CrystalBallBriefing } from './CrystalBallBriefing'
export { LiveTerritory } from './LiveTerritory'
export { LiquidDashboard } from './LiquidDashboard'

// Ghost Moves (AI Predictive UI)
export { GhostActionButtons, GhostActionButtonsCompact } from './GhostActions'
export type { AIAction, GhostActionButtonsProps } from './GhostActions'
export { GhostActionsDemo } from './GhostActionsDemo'

// ========== Decay Physics System ==========
export {
  DecayingDealCard,
  useLastActivityDate,
  calculateDecayMetrics,
  calculateDaysSinceActivity,
} from "./DecayingDealCard";

export type {
  DecayLevel,
  DecayMetrics,
  DecayConfig,
  DecayingDealCardProps,
  LastActivityDate,
  DecayAnimationVariants,
} from "./types/decay-physics.types";

export {
  DECAY_THRESHOLDS,
  DECAY_COLORS,
  isDecayLevel,
  hasValidActivityDate,
} from "./types/decay-physics.types";

// Demo component
export { DecayPhysicsDemo } from "./DecayPhysicsDemo";

// ========== War Room Board ==========
export { WarRoomBoard } from "./war-room/WarRoomBoard";
export { WarfareDealCard } from "./war-room/WarfareDealCard";
export { DecayWarfareDealCard } from "./war-room/DecayWarfareDealCard";
