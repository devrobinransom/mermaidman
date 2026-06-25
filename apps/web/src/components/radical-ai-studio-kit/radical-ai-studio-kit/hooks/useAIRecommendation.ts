'use client'

import { useMemo } from 'react'
import type { CRMLead } from '@/lib/types/crm.generated'
import type { AIAction } from '@/components/radical/GhostActions'

export interface AIRecommendation {
  action: AIAction
  reason: string
  confidence: number // 0-100
}

/**
 * AI Recommendation Hook
 *
 * Analyzes lead data and returns the best next action with reasoning.
 * Uses heuristic-based logic to simulate AI recommendations.
 *
 * @param lead - The CRM Lead to analyze
 * @returns AI recommendation with action, reason, and confidence score
 *
 * @example
 * ```tsx
 * const { action, reason, confidence } = useAIRecommendation(lead)
 * return <GhostActionButtons aiRecommendation={action} aiReason={reason} />
 * ```
 */
export function useAIRecommendation(lead: CRMLead | null | undefined): AIRecommendation {
  return useMemo(() => {
    if (!lead) {
      return {
        action: null,
        reason: 'No lead data available',
        confidence: 0,
      }
    }

    // Decision Tree Logic (Heuristic-based AI)
    const score = calculateLeadScore(lead)

    // High Priority: Hot leads with recent activity
    if (lead.lead_temperature === 'Hot' && lead.days_since_last_activity !== undefined && lead.days_since_last_activity < 2) {
      return {
        action: 'call',
        reason: `Hot lead with activity ${lead.days_since_last_activity} day(s) ago. Strike while the iron is hot!`,
        confidence: 95,
      }
    }

    // Email for Cold/Warm leads without recent contact
    if (
      (lead.lead_temperature === 'Cold' || lead.lead_temperature === 'Warm') &&
      lead.email &&
      (!lead.days_since_last_activity || lead.days_since_last_activity > 7)
    ) {
      return {
        action: 'email',
        reason: `Lead hasn't been contacted in ${lead.days_since_last_activity || 'over 7'} days. Re-engagement email recommended.`,
        confidence: 80,
      }
    }

    // Meeting for high-value leads in decision phase
    if (
      lead.decision_timeline === 'Immediate' ||
      lead.decision_timeline === '< 1 Month'
    ) {
      return {
        action: 'meeting',
        reason: `Decision timeline is ${lead.decision_timeline}. Book a meeting to accelerate the deal.`,
        confidence: 85,
      }
    }

    // Call for high engagement score
    if (lead.engagement_score && lead.engagement_score > 70) {
      return {
        action: 'call',
        reason: `High engagement score (${lead.engagement_score}/100). Lead is actively interested.`,
        confidence: 88,
      }
    }

    // Task for leads that need follow-up but aren't urgent
    if (lead.status === 'Open' && lead.lead_score && lead.lead_score > 50) {
      return {
        action: 'task',
        reason: `Lead score is ${lead.lead_score}. Create a follow-up task to nurture this opportunity.`,
        confidence: 70,
      }
    }

    // Email for leads with pain points documented
    if (lead.pain_points && lead.pain_points.length > 20) {
      return {
        action: 'email',
        reason: 'Pain points identified. Send targeted solution email addressing their needs.',
        confidence: 82,
      }
    }

    // Call for high-budget leads
    if (lead.budget_range === '$10k+' || lead.budget_range === '$5k-$10k') {
      return {
        action: 'call',
        reason: `High budget range (${lead.budget_range}). Direct call recommended for VIP treatment.`,
        confidence: 90,
      }
    }

    // Task for negative sentiment (needs careful handling)
    if (lead.sentiment === 'Negative') {
      return {
        action: 'task',
        reason: 'Negative sentiment detected. Create task to research and strategize recovery approach.',
        confidence: 75,
      }
    }

    // Meeting for positive sentiment + warm leads
    if (lead.sentiment === 'Positive' && lead.lead_temperature === 'Warm') {
      return {
        action: 'meeting',
        reason: 'Positive sentiment with warm temperature. Perfect timing to book a discovery meeting.',
        confidence: 83,
      }
    }

    // Email for new leads without contact info
    if (lead.status === 'Open' && !lead.phone && !lead.mobile_no && lead.email) {
      return {
        action: 'email',
        reason: 'No phone number available. Email is the best first contact method.',
        confidence: 78,
      }
    }

    // Call for leads with phone but no email
    if ((lead.phone || lead.mobile_no) && !lead.email) {
      return {
        action: 'call',
        reason: 'Phone number available but no email. Call is the only viable contact method.',
        confidence: 85,
      }
    }

    // Default: Email for nurture
    return {
      action: 'email',
      reason: 'Standard nurture approach recommended. Send value-driven email to build relationship.',
      confidence: 65,
    }
  }, [lead])
}

/**
 * Calculate a simple lead score based on multiple factors
 * @internal
 */
function calculateLeadScore(lead: CRMLead): number {
  let score = lead.lead_score || 0

  // Boost for hot leads
  if (lead.lead_temperature === 'Hot') score += 20
  else if (lead.lead_temperature === 'Warm') score += 10

  // Boost for recent activity
  if (lead.days_since_last_activity !== undefined) {
    if (lead.days_since_last_activity < 2) score += 15
    else if (lead.days_since_last_activity < 7) score += 10
    else if (lead.days_since_last_activity < 30) score += 5
  }

  // Boost for engagement
  if (lead.engagement_score) {
    score += lead.engagement_score * 0.2
  }

  // Boost for decision timeline
  if (lead.decision_timeline === 'Immediate') score += 25
  else if (lead.decision_timeline === '< 1 Month') score += 15

  // Boost for budget
  if (lead.budget_range === '$10k+') score += 20
  else if (lead.budget_range === '$5k-$10k') score += 10

  // Boost for positive sentiment
  if (lead.sentiment === 'Positive') score += 10
  else if (lead.sentiment === 'Negative') score -= 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Get a human-readable explanation of lead priority
 */
export function getLeadPriorityLabel(lead: CRMLead | null | undefined): {
  label: string
  color: 'red' | 'yellow' | 'blue' | 'purple' | 'black'
} {
  if (!lead) {
    return { label: 'Unknown', color: 'black' }
  }

  const score = calculateLeadScore(lead)

  if (score >= 80) {
    return { label: 'CRITICAL', color: 'red' }
  } else if (score >= 60) {
    return { label: 'HIGH', color: 'purple' }
  } else if (score >= 40) {
    return { label: 'MEDIUM', color: 'yellow' }
  } else if (score >= 20) {
    return { label: 'LOW', color: 'blue' }
  } else {
    return { label: 'NURTURE', color: 'black' }
  }
}

/**
 * Advanced hook: Multi-action recommendations
 * Returns top 3 recommended actions with reasons
 */
export function useMultiActionRecommendations(
  lead: CRMLead | null | undefined
): AIRecommendation[] {
  return useMemo(() => {
    if (!lead) return []

    const recommendations: AIRecommendation[] = []

    // Evaluate all possible actions
    const evaluations = [
      evaluateCallAction(lead),
      evaluateEmailAction(lead),
      evaluateTaskAction(lead),
      evaluateMeetingAction(lead),
    ]

    // Sort by confidence and return top 3
    return evaluations
      .filter((rec) => rec.confidence > 50)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
  }, [lead])
}

// Action Evaluation Functions
function evaluateCallAction(lead: CRMLead): AIRecommendation {
  let confidence = 50

  if (lead.phone || lead.mobile_no) confidence += 15
  if (lead.lead_temperature === 'Hot') confidence += 25
  if (lead.days_since_last_activity && lead.days_since_last_activity < 2) confidence += 20
  if (lead.engagement_score && lead.engagement_score > 70) confidence += 15
  if (lead.budget_range === '$10k+') confidence += 10

  return {
    action: 'call',
    reason: 'Direct phone call recommended based on lead heat and engagement.',
    confidence: Math.min(100, confidence),
  }
}

function evaluateEmailAction(lead: CRMLead): AIRecommendation {
  let confidence = 50

  if (lead.email) confidence += 15
  if (lead.lead_temperature === 'Cold' || lead.lead_temperature === 'Warm') confidence += 15
  if (lead.days_since_last_activity && lead.days_since_last_activity > 7) confidence += 20
  if (lead.pain_points && lead.pain_points.length > 20) confidence += 10

  return {
    action: 'email',
    reason: 'Email nurture campaign recommended for re-engagement.',
    confidence: Math.min(100, confidence),
  }
}

function evaluateTaskAction(lead: CRMLead): AIRecommendation {
  let confidence = 40

  if (lead.status === 'Open') confidence += 10
  if (lead.sentiment === 'Negative') confidence += 20
  if (lead.lead_score && lead.lead_score > 50) confidence += 15

  return {
    action: 'task',
    reason: 'Follow-up task recommended for systematic nurturing.',
    confidence: Math.min(100, confidence),
  }
}

function evaluateMeetingAction(lead: CRMLead): AIRecommendation {
  let confidence = 40

  if (lead.decision_timeline === 'Immediate') confidence += 30
  if (lead.decision_timeline === '< 1 Month') confidence += 20
  if (lead.sentiment === 'Positive') confidence += 15
  if (lead.lead_temperature === 'Hot') confidence += 20

  return {
    action: 'meeting',
    reason: 'Discovery meeting recommended to accelerate deal velocity.',
    confidence: Math.min(100, confidence),
  }
}
