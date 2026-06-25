# Radical CRM Components

**Core Philosophy**: The interface is the strategy. Game-theoretic UI patterns that guide behavior toward long-term relationship building.

This directory contains two major systems:
1. **Ghost Actions** - AI-powered predictive UI showing the next best move
2. **Trust Battery Auras** - Visual trust indicators based on interaction history

## Overview

The Ghost Actions component implements the "Ghost Moves" pattern from the Radical CRM philosophy - showing users where they *should* go next, powered by AI analysis of lead data.

## Features

- **AI-Powered Recommendations**: Analyzes lead data (temperature, engagement, timeline, etc.) to suggest the best next action
- **Visual Hierarchy**: AI-recommended actions get purple pulsing glow effects
- **Multiple Variants**: Full grid layout and compact horizontal layout
- **Type-Safe**: Full TypeScript support with generated CRM types
- **Accessible**: Keyboard navigation, ARIA labels, and screen reader support
- **Neobrutalism Design**: Consistent with WK CRM's design system

## Components

### `GhostActionButtons`

Full-featured action buttons in a grid layout with AI reasoning display.

```tsx
import { GhostActionButtons } from '@/components/radical/GhostActions'

<GhostActionButtons
  aiRecommendation="call"
  aiReason="Hot lead with activity 1 day(s) ago. Strike while the iron is hot!"
  onAction={(action) => console.log('Action:', action)}
  showReason={true}
  disabled={false}
/>
```

### `GhostActionButtonsCompact`

Compact icon-only variant for space-constrained layouts.

```tsx
import { GhostActionButtonsCompact } from '@/components/radical/GhostActions'

<GhostActionButtonsCompact
  aiRecommendation="email"
  aiReason="Re-engagement recommended"
  onAction={(action) => handleAction(action)}
/>
```

## Hooks

### `useAIRecommendation`

Main hook for getting AI recommendations based on lead data.

```tsx
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import type { CRMLead } from '@/lib/types/crm.generated'

function LeadDetail({ lead }: { lead: CRMLead }) {
  const { action, reason, confidence } = useAIRecommendation(lead)

  return (
    <div>
      <p>AI suggests: {action}</p>
      <p>Reason: {reason}</p>
      <p>Confidence: {confidence}%</p>

      <GhostActionButtons
        aiRecommendation={action}
        aiReason={reason}
        onAction={handleAction}
      />
    </div>
  )
}
```

### `useMultiActionRecommendations`

Get top 3 alternative actions with confidence scores.

```tsx
const recommendations = useMultiActionRecommendations(lead)

recommendations.forEach(rec => {
  console.log(rec.action, rec.confidence, rec.reason)
})
```

### `getLeadPriorityLabel`

Helper to get human-readable priority labels.

```tsx
const { label, color } = getLeadPriorityLabel(lead)
// Returns: { label: 'CRITICAL', color: 'red' }
```

## AI Recommendation Logic

The AI uses a heuristic decision tree based on multiple factors:

### High Priority (95% confidence): Hot leads + recent activity
- **Action**: Call
- **Trigger**: Hot lead with activity < 2 days ago

### Re-engagement (80% confidence): Cold/Warm leads without contact
- **Action**: Email
- **Trigger**: No activity in 7+ days, email available

### Acceleration (85% confidence): Immediate decision timeline
- **Action**: Meeting
- **Trigger**: Decision timeline is "Immediate" or "< 1 Month"

### High Engagement (88% confidence): Active interest
- **Action**: Call
- **Trigger**: Engagement score > 70

### Nurture (70% confidence): Good lead score
- **Action**: Task
- **Trigger**: Status "Open" + lead score > 50

### Targeted Solutions (82% confidence): Pain points documented
- **Action**: Email
- **Trigger**: Pain points field has substantial content

### VIP Treatment (90% confidence): High-budget leads
- **Action**: Call
- **Trigger**: Budget range $10k+ or $5k-$10k

### Recovery Strategy (75% confidence): Negative sentiment
- **Action**: Task
- **Trigger**: Sentiment is "Negative"

### Discovery Meeting (83% confidence): Warm + positive
- **Action**: Meeting
- **Trigger**: Positive sentiment + warm temperature

## Available Actions

| Action | Icon | Description |
|--------|------|-------------|
| `call` | Phone | Schedule a phone call |
| `email` | Mail | Draft and send email |
| `task` | Checklist | Create follow-up task |
| `meeting` | Calendar | Book a meeting |

## Integration Example

### Lead Detail Page

```tsx
'use client'

import { useDoc } from '@frappe-ui/neobrutalism'
import { GhostActionButtons } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import type { CRMLead } from '@/lib/types/crm.generated'

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { doc: lead } = useDoc<CRMLead>({
    doctype: 'CRM Lead',
    name: params.id,
    auto: true,
  })

  const { action, reason } = useAIRecommendation(lead)

  const handleAction = async (actionType: string) => {
    switch (actionType) {
      case 'call':
        // Open dialer or schedule call
        break
      case 'email':
        // Open email composer
        break
      case 'task':
        // Create task modal
        break
      case 'meeting':
        // Open calendar booking
        break
    }
  }

  if (!lead) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1>{lead.lead_name}</h1>

      <GhostActionButtons
        aiRecommendation={action}
        aiReason={reason}
        onAction={handleAction}
      />
    </div>
  )
}
```

### Lead List (Compact Actions)

```tsx
'use client'

import { useList } from '@frappe-ui/neobrutalism'
import { GhostActionButtonsCompact } from '@/components/radical/GhostActions'
import { useAIRecommendation } from '@/lib/hooks/useAIRecommendation'
import type { CRMLead } from '@/lib/types/crm.generated'

export default function LeadsListPage() {
  const { data: leads } = useList<CRMLead>('CRM Lead', {
    fields: ['name', 'lead_name', 'status', 'lead_temperature'],
    auto: true,
  })

  return (
    <div className="space-y-4">
      {leads?.map((lead) => (
        <LeadRow key={lead.name} lead={lead} />
      ))}
    </div>
  )
}

function LeadRow({ lead }: { lead: CRMLead }) {
  const { action, reason } = useAIRecommendation(lead)

  return (
    <div className="flex items-center justify-between p-4 border rounded">
      <div>
        <h3>{lead.lead_name}</h3>
        <p className="text-sm text-gray-600">{lead.status}</p>
      </div>

      <GhostActionButtonsCompact
        aiRecommendation={action}
        aiReason={reason}
        onAction={(action) => console.log('Action:', action)}
      />
    </div>
  )
}
```

## Demo

Visit `/demo/ghost-actions` to see interactive demos with different lead scenarios:

- **Hot Lead**: High engagement, immediate timeline
- **Warm Lead**: Moderate engagement, nurture needed
- **Cold Lead**: Low engagement, re-engagement campaign
- **Urgent Lead**: Critical timeline, immediate action required
- **Negative Sentiment**: Recovery strategy needed

## Styling

The component uses Tailwind CSS with the Neobrutalism preset. Key styles:

- **Purple Glow**: AI-recommended actions get `box-shadow: 0 0 20px 4px rgba(168, 85, 247, 0.6)`
- **Pulse Animation**: 2-second infinite ease-in-out animation
- **Opacity Animation**: 1.5-second fade between 0.3 and 0.6
- **AI Badge**: Small sparkles icon in purple circle

## Customization

### Custom Colors

Override the default purple glow:

```tsx
<GhostActionButtons
  aiRecommendation={action}
  aiReason={reason}
  onAction={handleAction}
  className="[&_.ghost-recommended]:shadow-blue-500"
/>
```

### Custom Actions

Extend the action types by modifying `ACTION_CONFIGS` in `GhostActions.tsx`.

## Performance

- **Memoization**: `useAIRecommendation` hook uses `useMemo` to prevent unnecessary recalculations
- **Lazy Animations**: Framer Motion animations only run on recommended action
- **Optimized Rendering**: Components use React.memo where applicable

## Accessibility

- Full keyboard navigation support
- ARIA labels on all buttons
- Screen reader descriptions for AI reasoning
- Focus visible states
- Semantic HTML

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Modern mobile browsers

## Dependencies

- `framer-motion` (motion/react): Animations
- `@tabler/icons-react`: Icons
- `@frappe-ui/neobrutalism`: UI components and utilities
- `react`: 19+
- `typescript`: 5+

## Future Enhancements

- [ ] Real AI/ML model integration (OpenAI, Anthropic)
- [ ] Historical action success tracking
- [ ] Personalized recommendations per user
- [ ] A/B testing framework
- [ ] Real-time recommendation updates via WebSocket
- [ ] Action confirmation modals
- [ ] Undo/redo action history

---

# Trust Battery Auras

**Trust Batteries**: Visual indicators showing relationship health through colored auras (green/amber/red) that encourage iterated games and compound relationship value.

## Philosophy

Based on Naval Ravikant's "Trust Battery" concept - every interaction charges or drains trust. Visual auras provide immediate feedback on relationship health:

- **Iterated Games**: Long-term cooperation over short-term transactions
- **Compound Interest**: Relationships that build value over time
- **Loss Aversion**: Visual decay motivates action on cold leads

## Core Logic

Trust level is calculated from two factors:
1. **interaction_count**: Number of touchpoints with the lead
2. **sentiment**: Overall sentiment (Positive/Neutral/Negative)

**Aura Levels:**
- **Warm (Green)**: 10+ interactions + Positive sentiment
- **Cold (Red)**: <3 interactions OR Negative sentiment
- **Neutral (Amber)**: Everything else

## Components

### `getTrustAura()`

Returns trust aura level and Tailwind className string.

```typescript
import { getTrustAura } from '@/components/radical/TrustBattery'

const { auraLevel, className, color, description } = getTrustAura({
  interaction_count: 15,
  sentiment: 'Positive'
})
// Returns: {
//   auraLevel: 'warm',
//   className: 'ring-4 ring-green-400/60 shadow-[0_0_30px_rgba(34,197,94,0.4)] ...',
//   color: '#22c55e',
//   description: 'High Trust - Active & Positive'
// }
```

### `TrustBatteryIndicator`

Visual battery bar with percentage fill (0-100%).

```tsx
import { TrustBatteryIndicator } from '@/components/radical/TrustBattery'

<TrustBatteryIndicator
  interaction_count={12}
  sentiment="Positive"
  showLabel={true}
  showMetrics={true}
  size="md"
  animated={true}
/>
```

**Features:**
- Battery fill animation (0% at 0 interactions, 100% at 20+)
- Color-coded by trust level
- Pulsing animation for warm leads
- Optional metrics display (touchpoints + sentiment)
- Accessibility: ARIA labels and role="meter"

### `TrustBatteryBadge`

Compact badge with emoji and interaction count.

```tsx
import { TrustBatteryBadge } from '@/components/radical/TrustBattery'

<TrustBatteryBadge
  interaction_count={15}
  sentiment="Positive"
  variant="default"
/>
// Renders: 🔥 HOT LEAD (15)

<TrustBatteryBadge
  interaction_count={2}
  sentiment="Negative"
  variant="minimal"
/>
// Renders: ❄️ 2
```

**Emoji Legend:**
- 🔥 Warm leads (10+ positive interactions)
- ⚡ Neutral leads
- ❄️ Cold leads (<3 interactions or negative)

### `TrustBatteryCard`

Card with automatic aura glow effects.

```tsx
import { TrustBatteryCard } from '@/components/radical/TrustBatteryCard'

<TrustBatteryCard
  interaction_count={15}
  sentiment="Positive"
  showIndicator={true}
  showBadge={true}
  badgePosition="top-right"
  animated={true}
>
  <h3>John Doe</h3>
  <p>TechCorp Inc</p>
  <p>$50,000</p>
</TrustBatteryCard>
```

**Features:**
- Automatic green/amber/red ring glow
- Pulsing aura animation on hover
- Optional battery indicator at bottom
- Optional trust badge overlay
- Hover tooltip showing metrics
- Corner glow effects for warm leads

### `TrustBatteryGrid`

Responsive grid layout with automatic auras.

```tsx
import { TrustBatteryGrid } from '@/components/radical/TrustBatteryCard'

<TrustBatteryGrid
  cards={[
    {
      id: 1,
      interaction_count: 15,
      sentiment: 'Positive',
      content: <LeadCard lead={lead1} />
    },
    {
      id: 2,
      interaction_count: 2,
      sentiment: 'Negative',
      content: <LeadCard lead={lead2} />
    }
  ]}
  columns={3}
  gap="md"
  showBadges={true}
  onCardClick={(id) => console.log('Clicked:', id)}
/>
```

### `TrustBatteryListItem`

Compact list item with aura and side accent line.

```tsx
import { TrustBatteryListItem } from '@/components/radical/TrustBatteryCard'

<TrustBatteryListItem
  interaction_count={12}
  sentiment="Positive"
  showBadge={true}
  onClick={() => console.log('Clicked')}
>
  <div>
    <h4>John Doe</h4>
    <p>TechCorp Inc</p>
  </div>
</TrustBatteryListItem>
```

## Integration with CRM

### Using with Frappe Hooks

```tsx
'use client'

import { useList } from '@frappe-ui/neobrutalism'
import { CRMLead } from '@/lib/types/crm.generated'
import { TrustBatteryCard } from '@/components/radical/TrustBatteryCard'

export function LeadsPage() {
  const { data: leads, loading } = useList<CRMLead>('CRM Lead', {
    fields: ['name', 'lead_name', 'organization', 'sentiment', 'engagement_score'],
    orderBy: 'modified desc',
    auto: true,
  })

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-3 gap-6">
      {leads?.map((lead) => {
        // Map engagement_score to interaction_count
        const interaction_count = lead.engagement_score || 0

        return (
          <TrustBatteryCard
            key={lead.name}
            interaction_count={interaction_count}
            sentiment={lead.sentiment || 'Neutral'}
            showBadge={true}
            showIndicator={true}
          >
            <h3 className="text-xl font-bold">{lead.lead_name}</h3>
            <p className="text-sm text-gray-600">{lead.organization}</p>
          </TrustBatteryCard>
        )
      })}
    </div>
  )
}
```

### Calculating interaction_count

If `interaction_count` is not directly available, calculate from:
1. **engagement_score** (existing CRMLead field)
2. **Activity count** (emails, calls, notes)
3. **Timeline events**

```tsx
import { useCall } from '@frappe-ui/neobrutalism'

function LeadCard({ leadName }: { leadName: string }) {
  const { call } = useCall('frappe.client.get_count')
  const [interactionCount, setInteractionCount] = useState(0)

  useEffect(() => {
    async function fetchActivityCount() {
      const result = await call({
        doctype: 'CRM Activity',
        filters: { lead: leadName }
      })
      setInteractionCount(result?.message || 0)
    }
    fetchActivityCount()
  }, [leadName])

  return (
    <TrustBatteryCard
      interaction_count={interactionCount}
      sentiment="Positive"
    >
      {/* Card content */}
    </TrustBatteryCard>
  )
}
```

## Design System

### Colors
- **Warm (Green)**: `#22c55e` (green-500)
- **Neutral (Amber)**: `#fbbf24` (amber-400)
- **Cold (Red)**: `#ef4444` (red-500)

### Ring Glow Effects

```css
/* Warm Lead */
ring-4 ring-green-400/60 shadow-[0_0_30px_rgba(34,197,94,0.4)]

/* Cold Lead */
ring-4 ring-red-400/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]

/* Neutral Lead */
ring-4 ring-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.4)]
```

### Animations (via motion/react)
- **Entrance**: Scale from 0.95 to 1.0 with spring physics
- **Hover**: Scale to 1.02, lift with shadow
- **Pulse**: Warm leads pulse glow on loop
- **Battery Fill**: 1.2s ease animation

## Accessibility

- ✅ All indicators have `role="meter"` with `aria-valuenow/min/max`
- ✅ All cards support keyboard navigation
- ✅ Hover tooltips provide context
- ✅ Color is not the only indicator (emojis, text, percentage)
- ✅ High contrast borders for visibility

## Performance

- 🚀 Lightweight: Only motion/react + lucide-react icons
- 🚀 No expensive calculations (trust computed once)
- 🚀 CSS-based animations (GPU accelerated)
- 🚀 Conditional animations (disable with `animated={false}`)

## Example Usage

See `TrustBatteryExample.tsx` for comprehensive demos including:
- All indicator sizes
- Badge variants
- Card layouts with full indicators
- Grid layouts (1, 2, 3, 4 columns)
- List item layouts
- Integration examples with Frappe hooks

## Future Enhancements

- [ ] Trust Battery trend chart
- [ ] Custom thresholds (configurable 10/3 defaults)
- [ ] Sound effects for warm lead achievements
- [ ] Real-time updates via SocketIO
- [ ] Trust Battery history timeline
- [ ] Predictive aura (ghost state for potential future)

---

## License

Part of WK CRM - see root LICENSE file.
