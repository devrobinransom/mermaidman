'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Button, cn } from '@frappe-ui/neobrutalism'
import { IconPhone, IconMail, IconChecklist, IconCalendar, IconSparkles } from '@tabler/icons-react'

export type AIAction = 'call' | 'email' | 'task' | 'meeting' | null

export interface GhostActionButtonsProps {
  /** AI-recommended action */
  aiRecommendation: AIAction
  /** Explanation for the AI recommendation */
  aiReason?: string
  /** Callback when an action button is clicked */
  onAction: (action: string) => void
  /** Optional: Disable all buttons */
  disabled?: boolean
  /** Optional: Show/hide AI reasoning */
  showReason?: boolean
}

interface ActionConfig {
  id: AIAction
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: 'purple' | 'blue' | 'yellow' | 'black'
  description: string
}

const ACTION_CONFIGS: ActionConfig[] = [
  {
    id: 'call',
    label: 'Call Lead',
    icon: IconPhone,
    color: 'purple',
    description: 'Schedule a phone call',
  },
  {
    id: 'email',
    label: 'Send Email',
    icon: IconMail,
    color: 'blue',
    description: 'Draft and send email',
  },
  {
    id: 'task',
    label: 'Create Task',
    icon: IconChecklist,
    color: 'yellow',
    description: 'Add follow-up task',
  },
  {
    id: 'meeting',
    label: 'Book Meeting',
    icon: IconCalendar,
    color: 'black',
    description: 'Schedule a meeting',
  },
]

/**
 * Ghost Actions Component
 *
 * Displays action buttons with AI predictive highlighting.
 * The AI-recommended action gets a pulsing purple glow effect.
 *
 * @example
 * ```tsx
 * <GhostActionButtons
 *   aiRecommendation="call"
 *   aiReason="Lead has high engagement score and recent activity"
 *   onAction={(action) => console.log('Action:', action)}
 * />
 * ```
 */
export function GhostActionButtons({
  aiRecommendation,
  aiReason,
  onAction,
  disabled = false,
  showReason = true,
}: GhostActionButtonsProps) {
  return (
    <div className="space-y-4">
      {/* AI Reasoning Section */}
      {showReason && aiRecommendation && aiReason && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-2 rounded-lg border-2 border-purple-500 bg-purple-50 p-3"
        >
          <IconSparkles size={18} className="mt-0.5 flex-shrink-0 text-purple-600" />
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-900">AI RECOMMENDATION</p>
            <p className="mt-1 text-sm text-purple-700">{aiReason}</p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTION_CONFIGS.map((config) => {
          const isRecommended = config.id === aiRecommendation
          const Icon = config.icon

          return (
            <div key={config.id} className="relative">
              {/* Pulsing Glow Ring for AI Recommendation */}
              {isRecommended && (
                <>
                  {/* Outer Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-4 border-purple-500"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      boxShadow: '0 0 20px 4px rgba(168, 85, 247, 0.6)',
                    }}
                  />

                  {/* Inner Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                    }}
                  />
                </>
              )}

              {/* Action Button */}
              <motion.div
                className="relative"
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
              >
                <Button
                  variant={isRecommended ? 'solid' : 'outline'}
                  color={isRecommended ? 'purple' : config.color}
                  size="md"
                  onClick={() => onAction(config.id!)}
                  disabled={disabled}
                  className={cn(
                    'relative w-full flex-col gap-1 h-auto py-4',
                    isRecommended && 'z-10 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                  )}
                  aria-label={config.description}
                  title={config.description}
                >
                  {/* AI Badge */}
                  {isRecommended && (
                    <motion.span
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-purple-500"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    >
                      <IconSparkles size={14} className="text-purple-600" />
                    </motion.span>
                  )}

                  <Icon size={24} className={isRecommended ? 'text-white' : ''} />
                  <span className="text-xs font-bold">{config.label}</span>
                </Button>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact variant of Ghost Actions
 * Shows only icons in a horizontal row
 */
export function GhostActionButtonsCompact({
  aiRecommendation,
  aiReason,
  onAction,
  disabled = false,
}: Omit<GhostActionButtonsProps, 'showReason'>) {
  return (
    <div className="flex items-center gap-2">
      {aiRecommendation && aiReason && (
        <div className="flex items-center gap-1 rounded-full border border-purple-500 bg-purple-50 px-2 py-1 mr-1">
          <IconSparkles size={14} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-900">AI</span>
        </div>
      )}

      {ACTION_CONFIGS.map((config) => {
        const isRecommended = config.id === aiRecommendation
        const Icon = config.icon

        return (
          <motion.div key={config.id} className="relative">
            {isRecommended && (
              <motion.div
                className="absolute -inset-1 rounded-lg border-2 border-purple-500"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  boxShadow: '0 0 15px 2px rgba(168, 85, 247, 0.5)',
                }}
              />
            )}

            <Button
              variant="ghost"
              color={isRecommended ? 'purple' : config.color}
              size="icon"
              onClick={() => onAction(config.id!)}
              disabled={disabled}
              className={cn('relative z-10', isRecommended && 'bg-purple-50')}
              aria-label={config.description}
              title={config.description}
            >
              <Icon size={20} />
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
