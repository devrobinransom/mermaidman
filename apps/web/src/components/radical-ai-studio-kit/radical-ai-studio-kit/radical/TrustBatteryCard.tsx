'use client'

import React, { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Card, cn } from '@frappe-ui/neobrutalism'
import {
  getTrustAura,
  TrustBatteryIndicator,
  TrustBatteryBadge,
  type TrustBatteryData,
  type TrustSentiment,
} from './TrustBattery'

/**
 * Props for TrustBatteryCard component
 */
export interface TrustBatteryCardProps {
  /** Card content */
  children: ReactNode
  /** Number of interactions/touchpoints with the lead */
  interaction_count: number
  /** Sentiment of the interactions */
  sentiment: TrustSentiment
  /** Show battery indicator inside the card */
  showIndicator?: boolean
  /** Show trust badge inside the card */
  showBadge?: boolean
  /** Position of the badge (if showBadge is true) */
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Enable pulsing animation for the aura */
  animated?: boolean
  /** Additional className for the card wrapper */
  className?: string
  /** Additional className for the card itself */
  cardClassName?: string
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Card variant */
  variant?: 'default' | 'ghost' | 'outline'
  /** Click handler */
  onClick?: () => void
  /** Role for accessibility */
  role?: string
  /** ARIA label */
  ariaLabel?: string
}

/**
 * Card component wrapped with Trust Battery aura effect
 *
 * Automatically applies green/amber/red glow based on interaction_count and sentiment.
 * Supports animated pulsing, badges, and battery indicators.
 *
 * @example
 * // Warm lead with indicator
 * <TrustBatteryCard
 *   interaction_count={15}
 *   sentiment="Positive"
 *   showIndicator={true}
 * >
 *   <h3>John Doe</h3>
 *   <p>CEO at TechCorp</p>
 * </TrustBatteryCard>
 *
 * @example
 * // Cold lead with badge
 * <TrustBatteryCard
 *   interaction_count={2}
 *   sentiment="Negative"
 *   showBadge={true}
 *   badgePosition="top-right"
 * >
 *   <h3>Jane Smith</h3>
 *   <p>Unresponsive</p>
 * </TrustBatteryCard>
 */
export function TrustBatteryCard({
  children,
  interaction_count,
  sentiment,
  showIndicator = false,
  showBadge = false,
  badgePosition = 'top-right',
  animated = true,
  className,
  cardClassName,
  padding = 'md',
  variant = 'default',
  onClick,
  role,
  ariaLabel,
}: TrustBatteryCardProps) {
  const { auraLevel, className: auraClassName } = getTrustAura({
    interaction_count,
    sentiment,
  })

  // Padding variants
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }

  // Badge position variants
  const badgePositionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
  }

  return (
    <motion.div
      className={cn('relative group', className)}
      initial={animated ? { scale: 0.95, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      whileHover={
        animated
          ? {
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      onClick={onClick}
      role={role || (onClick ? 'button' : undefined)}
      aria-label={ariaLabel}
    >
      {/* Animated Aura Background Layer */}
      {animated && (
        <motion.div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${
              auraLevel === 'warm'
                ? 'rgba(34, 197, 94, 0.15)'
                : auraLevel === 'cold'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(251, 191, 36, 0.15)'
            } 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Card with Aura Ring */}
      <Card
        variant={variant}
        className={cn(
          'relative z-10 transition-all duration-500',
          auraClassName,
          paddingClasses[padding],
          cardClassName
        )}
      >
        {/* Trust Badge */}
        {showBadge && (
          <div
            className={cn(
              'absolute z-20',
              badgePositionClasses[badgePosition]
            )}
          >
            <TrustBatteryBadge
              interaction_count={interaction_count}
              sentiment={sentiment}
              variant="minimal"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10">
          {children}

          {/* Trust Battery Indicator (bottom of card) */}
          {showIndicator && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <TrustBatteryIndicator
                interaction_count={interaction_count}
                sentiment={sentiment}
                showLabel={true}
                showMetrics={true}
                size="md"
                animated={animated}
              />
            </div>
          )}
        </div>

        {/* Animated Corner Glow Effect */}
        {animated && auraLevel === 'warm' && (
          <>
            <motion.div
              className="absolute top-0 left-0 w-20 h-20 rounded-full bg-green-400/20 blur-2xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-green-400/20 blur-2xl"
              animate={{
                opacity: [0.6, 0.3, 0.6],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </>
        )}
      </Card>

      {/* Hover Tooltip (appears on hover) */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-30"
        initial={{ y: 10 }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {interaction_count} touchpoints • {sentiment}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"
            aria-hidden="true"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Grid of Trust Battery Cards with automatic layout
 */
export interface TrustBatteryGridProps {
  /** Array of card data */
  cards: Array<{
    id: string | number
    interaction_count: number
    sentiment: TrustSentiment
    content: ReactNode
  }>
  /** Show indicators on all cards */
  showIndicators?: boolean
  /** Show badges on all cards */
  showBadges?: boolean
  /** Grid columns */
  columns?: 1 | 2 | 3 | 4
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg'
  /** Animated entrance */
  animated?: boolean
  /** Click handler for cards */
  onCardClick?: (id: string | number) => void
  /** Additional className */
  className?: string
}

export function TrustBatteryGrid({
  cards,
  showIndicators = false,
  showBadges = true,
  columns = 3,
  gap = 'md',
  animated = true,
  onCardClick,
  className,
}: TrustBatteryGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={animated ? { opacity: 0, y: 20 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={
            animated
              ? {
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }
              : undefined
          }
        >
          <TrustBatteryCard
            interaction_count={card.interaction_count}
            sentiment={card.sentiment}
            showIndicator={showIndicators}
            showBadge={showBadges}
            animated={animated}
            onClick={onCardClick ? () => onCardClick(card.id) : undefined}
          >
            {card.content}
          </TrustBatteryCard>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Compact list item with trust battery aura
 */
export interface TrustBatteryListItemProps {
  children: ReactNode
  interaction_count: number
  sentiment: TrustSentiment
  showBadge?: boolean
  animated?: boolean
  className?: string
  onClick?: () => void
}

export function TrustBatteryListItem({
  children,
  interaction_count,
  sentiment,
  showBadge = true,
  animated = true,
  className,
  onClick,
}: TrustBatteryListItemProps) {
  const { auraLevel, className: auraClassName } = getTrustAura({
    interaction_count,
    sentiment,
  })

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-between p-4 rounded-lg border-2 border-black bg-white transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        auraClassName,
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={animated ? { x: 4, y: -4 } : undefined}
      onClick={onClick}
    >
      <div className="flex-1">{children}</div>

      {showBadge && (
        <TrustBatteryBadge
          interaction_count={interaction_count}
          sentiment={sentiment}
          variant="minimal"
        />
      )}

      {/* Side Accent Line */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          auraLevel === 'warm' && 'bg-green-500',
          auraLevel === 'cold' && 'bg-red-500',
          auraLevel === 'neutral' && 'bg-amber-500'
        )}
      />
    </motion.div>
  )
}
