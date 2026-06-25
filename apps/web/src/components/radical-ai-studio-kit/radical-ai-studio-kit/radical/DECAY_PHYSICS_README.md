# Decay Physics System

**Status:** ✅ Production Ready
**Created:** 2026-01-10
**Philosophy:** Loss Aversion + Game Theory + Physics

---

## Overview

The **Decay Physics System** applies visual degradation to CRM deals based on inactivity time. This creates a sense of urgency and leverages loss aversion psychology to encourage proactive sales behavior.

### Core Principle (Naval Ravikant)

> "People are motivated more by avoiding loss than gaining equivalent value."

By making stalled deals **physically decay**, we transform abstract inactivity metrics into visceral visual feedback that demands action.

---

## Visual Decay Effects

### 1. Opacity Reduction
- **Range:** 100% → 50% (maximum 50% reduction)
- **Curve:** Exponential decay (slower at first, accelerates)
- **Effect:** Cards become ghostly/faded

### 2. Desaturation
- **Range:** 100% → 30%
- **Effect:** Colors drain away, becoming grayscale

### 3. Contrast Reduction
- **Range:** 100% → 60%
- **Effect:** Details become muddy, less defined

### 4. Red Border Overlay
- **Trigger:** 7+ days inactive
- **Effect:** Pulsing red glow with variable intensity
- **Animation:** 2-second breathing cycle

### 5. Pulsing Alert Icon
- **Trigger:** 10+ days inactive
- **Icons:**
  - ⚠️ Alert Triangle (10-14 days)
  - 💀 Skull (15+ days)
- **Animation:** 1.5-second pulse scale

---

## Decay Stages

| Days Inactive | Stage      | Visual Indicators                         | Tooltip Message                              |
|---------------|------------|-------------------------------------------|----------------------------------------------|
| 0-2           | **Fresh**  | No decay, full vibrancy                   | "Active deal - recent activity detected"     |
| 3-6           | **Warm**   | Subtle desaturation begins                | "X days since last activity. Still warm."    |
| 7-9           | **Aging**  | Red border appears, 20% desaturation      | "Aging deal: X days. Follow up recommended." |
| 10-14         | **Stale**  | Alert icon pulsing, 50% desaturation      | "Stale deal: X days. Urgent action needed."  |
| 15+           | **Critical** | Skull icon, maximum decay (70% desat)  | "CRITICAL: No activity for X days. May be lost." |

---

## Installation & Usage

### Basic Usage

Wrap any card component with `<DecayingDealCard>`:

```tsx
import { DecayingDealCard } from "@/components/radical/DecayingDealCard";
import { CRMDeal } from "@/lib/types/crm.generated";

function MyDealCard({ deal }: { deal: CRMDeal }) {
  return (
    <DecayingDealCard deal={deal} lastActivityDate={deal.modified}>
      {/* Your existing card UI */}
      <Card>
        <h3>{deal.lead_name}</h3>
        <p>${deal.expected_deal_value}</p>
      </Card>
    </DecayingDealCard>
  );
}
```

### Integration with WarRoomBoard

Use the pre-built wrapper component:

```tsx
import { DecayWarfareDealCard } from "@/components/radical/war-room/DecayWarfareDealCard";

// In WarRoomBoard.tsx
{getDealsByStatus(col.id).map((deal, idx) => (
  <DecayWarfareDealCard
    key={deal.name}
    deal={deal}
    index={idx}
    lastActivityDate={deal.last_activity_date} // Optional override
  />
))}
```

---

## API Reference

### `<DecayingDealCard>`

**Props:**

| Prop              | Type          | Required | Description                                    |
|-------------------|---------------|----------|------------------------------------------------|
| `deal`            | `CRMDeal`     | ✅       | Deal object containing metadata                |
| `lastActivityDate`| `string?`     | ❌       | ISO date string (auto-detected if omitted)     |
| `children`        | `ReactNode`   | ✅       | The card UI to wrap with decay effects         |
| `className`       | `string?`     | ❌       | Additional Tailwind classes                    |

**Example:**

```tsx
<DecayingDealCard
  deal={myDeal}
  lastActivityDate="2025-12-25T10:00:00Z"
  className="mb-4"
>
  <MyCustomCard deal={myDeal} />
</DecayingDealCard>
```

---

### `useLastActivityDate(deal: CRMDeal)`

**Hook to auto-detect last activity date from a deal object.**

Checks fields in priority order:
1. `deal.last_activity_date`
2. `deal.last_responded_on`
3. `deal.modified`

**Returns:** `string | null`

**Example:**

```tsx
const activityDate = useLastActivityDate(deal);

<DecayingDealCard deal={deal} lastActivityDate={activityDate}>
  <Card>...</Card>
</DecayingDealCard>
```

---

### `calculateDecayMetrics(daysSinceActivity: number)`

**Utility function to calculate decay values for custom implementations.**

**Returns:**

```ts
interface DecayMetrics {
  daysSinceActivity: number;
  opacityMultiplier: number;        // 0.5 - 1.0
  saturationPercent: number;        // 30 - 100
  contrastPercent: number;          // 60 - 100
  showRedBorder: boolean;           // true after 7 days
  showPulsingAlert: boolean;        // true after 10 days
  decayLevel: "fresh" | "aging" | "stale" | "critical";
  tooltipMessage: string;
}
```

**Example:**

```tsx
import { calculateDecayMetrics } from "@/components/radical/DecayingDealCard";

const metrics = calculateDecayMetrics(12); // 12 days inactive
console.log(metrics.decayLevel); // "stale"
console.log(metrics.showPulsingAlert); // true
```

---

## Demo Page

View all decay stages in action:

```tsx
import { DecayPhysicsDemo } from "@/components/radical/DecayPhysicsDemo";

export default function DemoPage() {
  return <DecayPhysicsDemo />;
}
```

**Demonstrates:**
- 6 decay stages side-by-side (0d, 3d, 7d, 10d, 15d, 30d)
- Interactive hover tooltips
- Visual legend explaining effects
- Real-time decay calculations

---

## Technical Details

### Decay Curve Formula

```ts
const decayFactor = 1 - Math.pow(cappedDays / 30, 1.5);
```

- **Exponential curve** (power of 1.5) creates accelerating decay
- **Capped at 30 days** to prevent extreme values
- **Inverted** so factor decreases over time

### Performance Optimizations

1. **useMemo** for expensive calculations
2. **Motion values** for smooth animations
3. **AnimatePresence** for enter/exit transitions
4. **Pointer-events-none** on overlays to preserve drag interactions
5. **CSS filters** instead of heavy canvas rendering

### Accessibility

- ✅ Tooltip provides text alternative for visual decay
- ✅ High-contrast red borders for low-vision users
- ✅ Icon badges are semantically labeled
- ✅ Keyboard navigation preserved (wraps existing elements)
- ⚠️ Consider prefers-reduced-motion for pulsing animations

---

## Integration Checklist

### WarRoomBoard Integration

- [ ] Import `DecayWarfareDealCard`
- [ ] Replace `<WarfareDealCard>` with `<DecayWarfareDealCard>`
- [ ] Verify `lastActivityDate` prop is passed correctly
- [ ] Test hover tooltips appear on aged deals
- [ ] Confirm red borders pulse smoothly
- [ ] Check alert icons animate properly

### Custom Card Integration

- [ ] Wrap custom card with `<DecayingDealCard>`
- [ ] Pass `deal` object with `modified` field
- [ ] Optionally provide explicit `lastActivityDate`
- [ ] Test decay effects don't break existing interactions
- [ ] Verify tooltips display correct messages

### Data Requirements

Ensure `CRMDeal` objects have:
- ✅ `deal.modified` (ISO date string)
- ✅ `deal.last_activity_date` (optional, recommended)
- ✅ `deal.last_responded_on` (optional fallback)

---

## Philosophy Alignment

### Loss Aversion (Kahneman)
> Decaying visuals create a sense of **impending loss** stronger than the promise of gain from closing the deal.

### Proprioception (Game Theory)
> Users develop **physical intuition** for deal health. A faded, red-glowing card "feels wrong" at a glance.

### Flow State (Csikszentmihalyi)
> By making inactivity painful, we encourage frequent small actions (comments, calls) that maintain **psychological momentum**.

---

## Future Enhancements

### Planned Features
- [ ] **Crack/Shatter Effect:** Visual cracking texture after 20 days
- [ ] **Sound Effects:** Subtle warning beep on hover for critical deals
- [ ] **Heatmap View:** Global dashboard showing decay distribution
- [ ] **AI Rescue Mode:** Auto-suggest next action for critical deals
- [ ] **Decay Reversal Animation:** "Healing" effect when activity is logged

### Advanced Physics
- [ ] **Gravitational Sink:** Stale deals "fall" to bottom of column
- [ ] **Frost Effect:** Literal ice/snow texture for cold leads
- [ ] **Vibration/Shake:** Haptic feedback on mobile when viewing critical deal

---

## Testing

### Manual Test Cases

1. **Fresh Deal (0 days):**
   - Create deal with today's date
   - Verify no decay effects
   - Tooltip should not appear

2. **Aging Deal (7 days):**
   - Backdate `modified` by 7 days
   - Verify red border appears
   - Tooltip shows "Aging deal" message

3. **Critical Deal (15 days):**
   - Backdate `modified` by 15 days
   - Verify skull icon appears
   - Opacity reduced to ~50%
   - Card is heavily desaturated

### Automated Tests (Playwright)

```ts
test('decay physics renders correctly', async ({ page }) => {
  await page.goto('/demo/decay-physics');

  // Check fresh deal has no alert icon
  await expect(page.locator('[data-decay-level="fresh"] [data-testid="alert-icon"]')).toBeHidden();

  // Check critical deal has skull icon
  await expect(page.locator('[data-decay-level="critical"] [data-testid="skull-icon"]')).toBeVisible();

  // Check red border on aging deal
  const agingCard = page.locator('[data-decay-level="aging"]').first();
  await expect(agingCard).toHaveCSS('border-color', /rgb\(239, 68, 68/);
});
```

---

## Troubleshooting

### Issue: Decay not appearing

**Causes:**
1. `deal.modified` is missing or null
2. `lastActivityDate` prop is undefined
3. Deal was created/modified today (0 days = no decay)

**Solution:**
```tsx
// Verify data
console.log(deal.modified); // Should be ISO string
console.log(calculateDaysSinceActivity(deal.modified)); // Should be > 0
```

### Issue: Red border not pulsing

**Causes:**
1. Framer Motion not installed
2. `motion` import path incorrect
3. Parent container has `overflow: hidden`

**Solution:**
```bash
pnpm add motion framer-motion
```

```tsx
// Correct import
import { motion } from "motion/react";
```

### Issue: Tooltip obscured/cut off

**Causes:**
1. Parent has `overflow: hidden`
2. Z-index conflict
3. Absolute positioning constraint

**Solution:**
```tsx
// Ensure parent allows overflow
<div className="overflow-visible relative">
  <DecayingDealCard>...</DecayingDealCard>
</div>
```

---

## Credits

**Design Philosophy:** Naval Ravikant (Wealth Creation), Daniel Kahneman (Loss Aversion)
**Implementation:** WK CRM Radical UX Team
**Inspired By:** Civilization VI "aging units", Slay the Spire card decay

---

## License

Part of WK CRM Neobrutalism UI System. Internal use only.
