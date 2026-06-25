'use client'

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@frappe-ui/neobrutalism'
import { Battery, BatteryFull, BatteryLow, BatteryMedium, Zap } from 'lucide-react'

/**
 * Trust Battery Sentiment Types
 */
export type TrustSentiment = 'Positive' | 'Neutral' | 'Negative'

/**
 * Trust Aura Levels
 */
export type TrustAuraLevel = 'warm' | 'neutral' | 'cold'

/**
 * Props for getTrustAura function
 */
export interface TrustBatteryData {
  interaction_count: number
  sentiment: TrustSentiment
}

/**
 * Returns the trust aura level and corresponding Tailwind className string
 *
 * @param data - Object containing interaction_count and sentiment
 * @returns Object with aura level and className string for ring glow effects
 *
 * @example
 * const { auraLevel, className } = getTrustAura({
 *   interaction_count: 15,
 *   sentiment: 'Positive'
 * })
 * // Returns: { auraLevel: 'warm', className: 'ring-4 ring-green-400/60 ...' }
 */
export function getTrustAura(data: TrustBatteryData): {
  auraLevel: TrustAuraLevel
  className: string
  color: string
  description: string
} {
  const { interaction_count, sentiment } = data

  // Warm leads: 10+ interactions + Positive sentiment
  if (interaction_count >= 10 && sentiment === 'Positive') {
    return {
      auraLevel: 'warm',
      className: cn(
        'ring-4 ring-green-400/60 shadow-[0_0_30px_rgba(34,197,94,0.4)]',
        'hover:ring-green-500/80 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]',
        'transition-all duration-500'
      ),
      color: '#22c55e',
      description: 'High Trust - Active & Positive',
    }
  }

  // Cold leads: <3 interactions OR Negative sentiment
  if (interaction_count < 3 || sentiment === 'Negative') {
    return {
      auraLevel: 'cold',
      className: cn(
        'ring-4 ring-red-400/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]',
        'hover:ring-red-500/80 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]',
        'transition-all duration-500'
      ),
      color: '#ef4444',
      description: 'Low Trust - Needs Attention',
    }
  }

  // Neutral/Amber: Everything else
  return {
    auraLevel: 'neutral',
    className: cn(
      'ring-4 ring-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.4)]',
      'hover:ring-amber-500/80 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)]',
      'transition-all duration-500'
    ),
    color: '#fbbf24',
    description: 'Medium Trust - Nurture Needed',
  }
}

/**
 * Props for TrustBatteryIndicator component
 */
export interface TrustBatteryIndicatorProps {
  interaction_count: number
  sentiment: TrustSentiment
  showLabel?: boolean
  showMetrics?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

/**
 * Visual battery bar indicator showing trust level
 *
 * @example
 * <TrustBatteryIndicator
 *   interaction_count={12}
 *   sentiment="Positive"
 *   showLabel={true}
 *   showMetrics={true}
 * />
 */
export function TrustBatteryIndicator({
  interaction_count,
  sentiment,
  showLabel = true,
  showMetrics = false,
  size = 'md',
  animated = true,
  className,
}: TrustBatteryIndicatorProps) {
  const { auraLevel, color, description } = getTrustAura({
    interaction_count,
    sentiment,
  })

  // Calculate battery fill percentage (0-100%)
  // 0 interactions = 0%, 20+ interactions = 100%
  const fillPercentage = Math.min((interaction_count / 20) * 100, 100)

  // Size variants
  const sizeClasses = {
    sm: 'h-6 w-16',
    md: 'h-8 w-24',
    lg: 'h-10 w-32',
  }

  // Icon size variants
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  // Get battery icon based on fill percentage
  const BatteryIcon =
    fillPercentage < 30
      ? BatteryLow
      : fillPercentage < 70
        ? BatteryMedium
        : BatteryFull

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Battery Visual */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative rounded-md border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden',
            sizeClasses[size]
          )}
          role="meter"
          aria-valuenow={fillPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Trust battery at ${Math.round(fillPercentage)}%`}
        >
          {/* Battery Fill */}
          <motion.div
            className="absolute inset-0 h-full"
            style={{ backgroundColor: color }}
            initial={animated ? { width: 0 } : { width: `${fillPercentage}%` }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{
              duration: 1.2,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          />

          {/* Animated Pulse Effect */}
          {animated && auraLevel === 'warm' && (
            <motion.div
              className="absolute inset-0 h-full bg-white/30"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 1,
              }}
              style={{ width: `${fillPercentage}%` }}
            />
          )}

          {/* Battery Terminal (Right Side) */}
          <div
            className="absolute -right-1 top-1/2 h-2/5 w-1 -translate-y-1/2 rounded-r border-r-3 border-black bg-black"
            aria-hidden="true"
          />

          {/* Percentage Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-black/80 mix-blend-overlay">
              {Math.round(fillPercentage)}%
            </span>
          </div>
        </div>

        {/* Battery Icon with Color */}
        <BatteryIcon
          size={iconSizes[size]}
          style={{ color }}
          className="flex-shrink-0"
          aria-hidden="true"
        />

        {/* Zap icon for high trust */}
        {auraLevel === 'warm' && animated && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            <Zap
              size={iconSizes[size]}
              className="text-yellow-400 fill-yellow-400"
              aria-label="High energy indicator"
            />
          </motion.div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              auraLevel === 'warm' && 'bg-green-500',
              auraLevel === 'cold' && 'bg-red-500',
              auraLevel === 'neutral' && 'bg-amber-500'
            )}
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-gray-700">{description}</span>
        </div>
      )}

      {/* Detailed Metrics */}
      {showMetrics && (
        <div className="flex gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-black text-gray-900">{interaction_count}</span>
            <span>touchpoints</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'font-black',
                sentiment === 'Positive' && 'text-green-600',
                sentiment === 'Negative' && 'text-red-600',
                sentiment === 'Neutral' && 'text-gray-600'
              )}
            >
              {sentiment}
            </span>
            <span>sentiment</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact badge showing trust level
 */
export interface TrustBatteryBadgeProps {
  interaction_count: number
  sentiment: TrustSentiment
  variant?: 'default' | 'minimal'
  className?: string
}

export function TrustBatteryBadge({
  interaction_count,
  sentiment,
  variant = 'default',
  className,
}: TrustBatteryBadgeProps) {
  const { auraLevel, color } = getTrustAura({ interaction_count, sentiment })

  const labels = {
    warm: 'HOT LEAD',
    neutral: 'WARM',
    cold: 'COLD',
  }

  const icons = {
    warm: '🔥',
    neutral: '⚡',
    cold: '❄️',
  }

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black border-2 border-black',
          className
        )}
        style={{ backgroundColor: color, color: '#000' }}
      >
        <span>{icons[auraLevel]}</span>
        <span>{interaction_count}</span>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border-3 border-black px-3 py-1.5 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
      style={{ backgroundColor: color, color: '#000' }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="text-base">{icons[auraLevel]}</span>
      <span>{labels[auraLevel]}</span>
      <span className="text-xs opacity-80">({interaction_count})</span>
    </motion.div>
  )
}
