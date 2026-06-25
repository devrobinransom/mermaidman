# Ghost Actions - Quick Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import { GhostActionButtons } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
```

### 2. Use with a Lead

```tsx
'use client'

export function LeadDetail({ leadId }: { leadId: string }) {
  const { doc: lead } = useDoc<CRMLead>({
    doctype: 'CRM Lead',
    name: leadId,
    auto: true,
  })

  const { action, reason } = useAIRecommendation(lead)

  const handleAction = (actionType: string) => {
    console.log('User clicked:', actionType)
    // Implement your action handlers here
  }

  return (
    <div>
      <GhostActionButtons
        aiRecommendation={action}
        aiReason={reason}
        onAction={handleAction}
      />
    </div>
  )
}
```

## Real-World Integration Examples

### Example 1: Lead Detail Page with Actions

```tsx
// app/leads/[id]/page.tsx
'use client'

import { useDoc } from '@frappe-ui/neobrutalism'
import { GhostActionButtons } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import { useState } from 'react'
import type { CRMLead } from '@/lib/types/crm.generated'

export default function LeadPage({ params }: { params: { id: string } }) {
  const [showCallModal, setShowCallModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  const { doc: lead, loading } = useDoc<CRMLead>({
    doctype: 'CRM Lead',
    name: params.id,
    auto: true,
  })

  const { action, reason } = useAIRecommendation(lead)

  const handleAction = async (actionType: string) => {
    switch (actionType) {
      case 'call':
        setShowCallModal(true)
        // Or: window.location.href = `tel:${lead?.phone}`
        break

      case 'email':
        setShowEmailModal(true)
        // Or: navigate to email composer
        break

      case 'task':
        // Create task
        await createTask(lead?.name)
        break

      case 'meeting':
        // Open calendar
        window.open('/calendar', '_blank')
        break
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Lead Header */}
      <div>
        <h1 className="text-3xl font-black">{lead?.lead_name}</h1>
        <p className="text-gray-600">{lead?.organization}</p>
      </div>

      {/* AI Actions */}
      <GhostActionButtons
        aiRecommendation={action}
        aiReason={reason}
        onAction={handleAction}
      />

      {/* Lead Details */}
      <LeadDetailsCard lead={lead} />

      {/* Modals */}
      {showCallModal && <CallModal lead={lead} onClose={() => setShowCallModal(false)} />}
      {showEmailModal && <EmailModal lead={lead} onClose={() => setShowEmailModal(false)} />}
    </div>
  )
}
```

### Example 2: Lead List with Compact Actions

```tsx
// app/leads/page.tsx
'use client'

import { useList } from '@frappe-ui/neobrutalism'
import { GhostActionButtonsCompact } from '@/components/radical/GhostActions'
import { useAIRecommendation, getLeadPriorityLabel } from '@/lib/hooks/useAIRecommendation'
import { Badge } from '@frappe-ui/neobrutalism'
import type { CRMLead } from '@/lib/types/crm.generated'

export default function LeadsPage() {
  const { data: leads, loading } = useList<CRMLead>('CRM Lead', {
    fields: [
      'name',
      'lead_name',
      'organization',
      'status',
      'lead_temperature',
      'lead_score',
      'engagement_score',
      'days_since_last_activity',
      'decision_timeline',
    ],
    orderBy: 'modified desc',
    auto: true,
  })

  if (loading) return <div>Loading leads...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-black mb-6">Leads</h1>

      <div className="space-y-3">
        {leads?.map((lead) => (
          <LeadRow key={lead.name} lead={lead} />
        ))}
      </div>
    </div>
  )
}

function LeadRow({ lead }: { lead: CRMLead }) {
  const { action, reason } = useAIRecommendation(lead)
  const priority = getLeadPriorityLabel(lead)

  const handleAction = (actionType: string) => {
    // Navigate to action page with lead context
    window.location.href = `/leads/${lead.name}?action=${actionType}`
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg">{lead.lead_name}</h3>
          <Badge color={priority.color as any}>{priority.label}</Badge>
          {lead.lead_temperature && (
            <Badge
              color={
                lead.lead_temperature === 'Hot'
                  ? 'red'
                  : lead.lead_temperature === 'Warm'
                  ? 'yellow'
                  : 'blue'
              }
            >
              {lead.lead_temperature}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{lead.organization}</p>
      </div>

      <GhostActionButtonsCompact
        aiRecommendation={action}
        aiReason={reason}
        onAction={handleAction}
      />
    </div>
  )
}
```

### Example 3: Dashboard Widget

```tsx
// app/dashboard/components/TopLeadsWidget.tsx
'use client'

import { useList } from '@frappe-ui/neobrutalism'
import { GhostActionButtonsCompact } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import { Card } from '@frappe-ui/neobrutalism'
import type { CRMLead } from '@/lib/types/crm.generated'

export function TopLeadsWidget() {
  const { data: leads } = useList<CRMLead>('CRM Lead', {
    fields: ['name', 'lead_name', 'lead_temperature', 'lead_score', 'engagement_score'],
    filters: {
      status: 'Open',
    },
    orderBy: 'lead_score desc',
    pageLength: 5,
    auto: true,
  })

  return (
    <Card className="p-6">
      <h2 className="text-xl font-black mb-4">Top Priority Leads</h2>

      <div className="space-y-3">
        {leads?.map((lead) => (
          <PriorityLeadRow key={lead.name} lead={lead} />
        ))}
      </div>
    </Card>
  )
}

function PriorityLeadRow({ lead }: { lead: CRMLead }) {
  const { action, reason } = useAIRecommendation(lead)

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-bold">{lead.lead_name}</p>
        <p className="text-xs text-gray-600">Score: {lead.lead_score || 'N/A'}</p>
      </div>

      <GhostActionButtonsCompact
        aiRecommendation={action}
        aiReason={reason}
        onAction={(action) => {
          window.location.href = `/leads/${lead.name}?action=${action}`
        }}
      />
    </div>
  )
}
```

### Example 4: Custom Action Handlers

```tsx
'use client'

import { GhostActionButtons } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import { useRouter } from 'next/navigation'
import { useCall, useNewDoc } from '@frappe-ui/neobrutalism'

export function LeadActionsPanel({ lead }: { lead: CRMLead }) {
  const router = useRouter()
  const { action, reason } = useAIRecommendation(lead)
  const { create: createTask } = useNewDoc('CRM Task')
  const { call: sendEmail } = useCall('frappe.core.doctype.communication.email.make')

  const handleAction = async (actionType: string) => {
    try {
      switch (actionType) {
        case 'call':
          // Log call activity
          await createTask({
            title: `Call ${lead.lead_name}`,
            reference_doctype: 'CRM Lead',
            reference_name: lead.name,
            due_date: new Date().toISOString().split('T')[0],
            task_type: 'Call',
          })

          // Open phone dialer (if mobile)
          if (lead.phone || lead.mobile_no) {
            window.location.href = `tel:${lead.phone || lead.mobile_no}`
          }
          break

        case 'email':
          // Navigate to email composer
          router.push(`/leads/${lead.name}/email`)
          break

        case 'task':
          // Create follow-up task
          const task = await createTask({
            title: `Follow up with ${lead.lead_name}`,
            reference_doctype: 'CRM Lead',
            reference_name: lead.name,
            due_date: getNextWeekday(),
            task_type: 'Follow Up',
          })

          // Show success toast
          alert(`Task created: ${task.name}`)
          break

        case 'meeting':
          // Open calendar with pre-filled data
          const calendarUrl = buildCalendarUrl({
            title: `Meeting with ${lead.lead_name}`,
            description: lead.pain_points || '',
            attendees: [lead.email],
          })
          window.open(calendarUrl, '_blank')
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
      alert('Action failed. Please try again.')
    }
  }

  return (
    <GhostActionButtons
      aiRecommendation={action}
      aiReason={reason}
      onAction={handleAction}
    />
  )
}

// Helper function
function getNextWeekday(): string {
  const date = new Date()
  const day = date.getDay()

  // If Friday (5), Saturday (6), or Sunday (0), move to Monday
  if (day >= 5) {
    date.setDate(date.getDate() + (8 - day))
  } else {
    date.setDate(date.getDate() + 1)
  }

  return date.toISOString().split('T')[0]
}

function buildCalendarUrl(params: {
  title: string
  description: string
  attendees: string[]
}): string {
  const baseUrl = 'https://calendar.google.com/calendar/render'
  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    details: params.description,
    add: params.attendees.join(','),
  })
  return `${baseUrl}?${queryParams.toString()}`
}
```

## Advanced: Custom AI Logic

If you want to customize the AI recommendation logic:

```tsx
// lib/hooks/useCustomAIRecommendation.ts
import { useMemo } from 'react'
import type { CRMLead } from '@/lib/types/crm.generated'
import type { AIAction } from '@/components/radical/GhostActions'

export function useCustomAIRecommendation(lead: CRMLead | null) {
  return useMemo(() => {
    if (!lead) return { action: null, reason: '', confidence: 0 }

    // Your custom logic here
    if (lead.custom_lead_type === 'Influencer' && lead.custom_follower_range === '1 M+') {
      return {
        action: 'meeting' as AIAction,
        reason: 'High-value influencer. Book discovery call immediately.',
        confidence: 95,
      }
    }

    // Fallback to default logic
    return {
      action: 'email' as AIAction,
      reason: 'Standard outreach recommended.',
      confidence: 60,
    }
  }, [lead])
}
```

## Testing

Visit the demo page to test all scenarios:

```
http://localhost:3000/demo/ghost-actions
```

## Troubleshooting

### Actions not showing
- Ensure lead data is loaded (`lead` is not null/undefined)
- Check console for errors
- Verify imports are correct

### AI recommendations not working
- Ensure lead has required fields (temperature, score, etc.)
- Check that `useAIRecommendation` is being called with valid lead data
- Verify lead data matches CRMLead interface

### Styling issues
- Run `pnpm --filter @frappe-ui/neobrutalism build` to rebuild UI package
- Check Tailwind config includes neobrutalism preset
- Verify `cn` utility is imported from `@frappe-ui/neobrutalism`

## Next Steps

1. **Integrate into lead detail pages** - Add Ghost Actions to existing lead views
2. **Add action handlers** - Implement actual functionality for each action type
3. **Track metrics** - Log which actions users take vs AI recommendations
4. **A/B test** - Compare conversion rates with/without Ghost Actions
5. **Refine AI logic** - Use real data to improve recommendation accuracy

## Support

See `components/radical/README.md` for full documentation.
