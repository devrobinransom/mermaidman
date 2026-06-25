'use client'

import React, { useState } from 'react'
import { Card, Badge, Button } from '@frappe-ui/neobrutalism'
import { GhostActionButtons, GhostActionButtonsCompact } from './GhostActions'
import { useAIRecommendation, getLeadPriorityLabel, useMultiActionRecommendations } from '@/lib/hooks/useAIRecommendation'
import type { CRMLead } from '@/lib/types/crm.generated'
import { IconSparkles, IconRefresh } from '@tabler/icons-react'

/**
 * Demo component showcasing Ghost Actions with different lead scenarios
 */
export function GhostActionsDemo() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof DEMO_LEADS>('hot')
  const [lastAction, setLastAction] = useState<string | null>(null)

  const currentLead = DEMO_LEADS[selectedScenario]
  const recommendation = useAIRecommendation(currentLead)
  const multiRecommendations = useMultiActionRecommendations(currentLead)
  const priorityLabel = getLeadPriorityLabel(currentLead)

  const handleAction = (action: string) => {
    setLastAction(action)
    console.log('Action triggered:', action)

    // Auto-clear after 3 seconds
    setTimeout(() => setLastAction(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Ghost Moves Demo</h2>
          <p className="mt-1 text-sm text-gray-600">
            AI-powered predictive action recommendations
          </p>
        </div>
        <IconSparkles size={32} className="text-purple-600" />
      </div>

      {/* Scenario Selector */}
      <Card className="p-4">
        <h3 className="mb-3 text-lg font-bold">Select Lead Scenario</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DEMO_LEADS) as Array<keyof typeof DEMO_LEADS>).map((key) => (
            <Button
              key={key}
              variant={selectedScenario === key ? 'solid' : 'outline'}
              color="purple"
              size="sm"
              onClick={() => setSelectedScenario(key)}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </Card>

      {/* Lead Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{currentLead.lead_name}</h3>
            <p className="text-sm text-gray-600">{currentLead.organization}</p>
          </div>
          <div className="flex gap-2">
            <Badge color={priorityLabel.color as any}>{priorityLabel.label}</Badge>
            {currentLead.lead_temperature && (
              <Badge
                color={
                  currentLead.lead_temperature === 'Hot'
                    ? 'red'
                    : currentLead.lead_temperature === 'Warm'
                    ? 'yellow'
                    : 'blue'
                }
              >
                {currentLead.lead_temperature}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <p className="font-bold text-gray-500">Lead Score</p>
            <p className="text-lg font-bold">{currentLead.lead_score || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-500">Engagement</p>
            <p className="text-lg font-bold">{currentLead.engagement_score || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-gray-500">Last Activity</p>
            <p className="text-lg font-bold">
              {currentLead.days_since_last_activity
                ? `${currentLead.days_since_last_activity}d ago`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-bold text-gray-500">Timeline</p>
            <p className="text-lg font-bold">{currentLead.decision_timeline || 'N/A'}</p>
          </div>
        </div>

        {currentLead.pain_points && (
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-500">Pain Points</p>
            <p className="text-sm">{currentLead.pain_points}</p>
          </div>
        )}
      </Card>

      {/* AI Recommendation Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <IconSparkles size={20} className="text-purple-600" />
          <h3 className="text-lg font-bold">AI Analysis</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Recommended Action:</span>
            <Badge color="purple">{recommendation.action?.toUpperCase() || 'NONE'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Confidence:</span>
            <span className="text-lg font-bold text-purple-600">{recommendation.confidence}%</span>
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold">Reasoning:</span>
            <p className="text-sm text-gray-700">{recommendation.reason}</p>
          </div>
        </div>
      </Card>

      {/* Ghost Actions Component - Full */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Ghost Actions - Full</h3>
          {lastAction && (
            <Badge color="purple">Action: {lastAction.toUpperCase()}</Badge>
          )}
        </div>
        <GhostActionButtons
          aiRecommendation={recommendation.action}
          aiReason={recommendation.reason}
          onAction={handleAction}
        />
      </Card>

      {/* Ghost Actions Component - Compact */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Ghost Actions - Compact</h3>
        <GhostActionButtonsCompact
          aiRecommendation={recommendation.action}
          aiReason={recommendation.reason}
          onAction={handleAction}
        />
      </Card>

      {/* Multi-Action Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Alternative Recommendations</h3>
        <div className="space-y-3">
          {multiRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge color="black">{rec.action?.toUpperCase()}</Badge>
                  <span className="text-xs font-bold text-gray-500">
                    {rec.confidence}% confidence
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          color="black"
          onClick={() => {
            setSelectedScenario('hot')
            setLastAction(null)
          }}
        >
          <IconRefresh size={18} />
          Reset Demo
        </Button>
      </div>
    </div>
  )
}

// Demo Lead Scenarios
const DEMO_LEADS: Record<string, CRMLead> = {
  hot: {
    name: 'LEAD-00001',
    doctype: 'CRM Lead',
    owner: 'admin@example.com',
    creation: '2026-01-10',
    modified: '2026-01-10',
    modified_by: 'admin@example.com',
    docstatus: 0,
    idx: 1,
    lead_name: 'Sarah Johnson',
    first_name: 'Sarah',
    last_name: 'Johnson',
    organization: 'TechCorp Inc.',
    email: 'sarah@techcorp.com',
    phone: '+1-555-0123',
    status: 'Open',
    lead_temperature: 'Hot',
    lead_score: 85,
    engagement_score: 92,
    days_since_last_activity: 1,
    decision_timeline: 'Immediate',
    budget_range: '$10k+',
    sentiment: 'Positive',
    pain_points: 'Need to scale marketing operations quickly for Q1 launch',
    industry: 'Technology',
    territory: 'North America',
    source: 'Website',
  },
  warm: {
    name: 'LEAD-00002',
    doctype: 'CRM Lead',
    owner: 'admin@example.com',
    creation: '2026-01-05',
    modified: '2026-01-08',
    modified_by: 'admin@example.com',
    docstatus: 0,
    idx: 2,
    lead_name: 'Michael Chen',
    first_name: 'Michael',
    last_name: 'Chen',
    organization: 'GrowthHub',
    email: 'michael@growthhub.com',
    status: 'Open',
    lead_temperature: 'Warm',
    lead_score: 65,
    engagement_score: 58,
    days_since_last_activity: 5,
    decision_timeline: '1-3 Months',
    budget_range: '$5k-$10k',
    sentiment: 'Positive',
    pain_points: 'Looking to improve lead generation efficiency',
    industry: 'Marketing',
    territory: 'Asia Pacific',
    source: 'LinkedIn',
  },
  cold: {
    name: 'LEAD-00003',
    doctype: 'CRM Lead',
    owner: 'admin@example.com',
    creation: '2025-12-20',
    modified: '2025-12-20',
    modified_by: 'admin@example.com',
    docstatus: 0,
    idx: 3,
    lead_name: 'Emily Rodriguez',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    organization: 'Startup Labs',
    email: 'emily@startuplabs.io',
    status: 'Open',
    lead_temperature: 'Cold',
    lead_score: 35,
    engagement_score: 22,
    days_since_last_activity: 21,
    decision_timeline: '3+ Months',
    budget_range: '$1k-$5k',
    sentiment: 'Neutral',
    industry: 'Software',
    territory: 'Europe',
    source: 'Referral',
  },
  urgent: {
    name: 'LEAD-00004',
    doctype: 'CRM Lead',
    owner: 'admin@example.com',
    creation: '2026-01-09',
    modified: '2026-01-10',
    modified_by: 'admin@example.com',
    docstatus: 0,
    idx: 4,
    lead_name: 'David Park',
    first_name: 'David',
    last_name: 'Park',
    organization: 'Enterprise Solutions Co.',
    phone: '+1-555-9999',
    status: 'Open',
    lead_temperature: 'Hot',
    lead_score: 90,
    engagement_score: 95,
    days_since_last_activity: 0,
    decision_timeline: 'Immediate',
    budget_range: '$10k+',
    sentiment: 'Positive',
    pain_points: 'Critical need to replace existing CRM before quarter end',
    industry: 'Enterprise',
    territory: 'North America',
    source: 'Direct',
  },
  negative: {
    name: 'LEAD-00005',
    doctype: 'CRM Lead',
    owner: 'admin@example.com',
    creation: '2026-01-01',
    modified: '2026-01-08',
    modified_by: 'admin@example.com',
    docstatus: 0,
    idx: 5,
    lead_name: 'Jennifer Smith',
    first_name: 'Jennifer',
    last_name: 'Smith',
    organization: 'RetailCo',
    email: 'jennifer@retailco.com',
    status: 'Open',
    lead_temperature: 'Warm',
    lead_score: 45,
    engagement_score: 40,
    days_since_last_activity: 10,
    decision_timeline: '1-3 Months',
    budget_range: '$1k-$5k',
    sentiment: 'Negative',
    pain_points: 'Had bad experience with previous CRM vendor',
    industry: 'Retail',
    territory: 'Europe',
    source: 'Trade Show',
  },
}
