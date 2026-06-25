# Decay Physics Integration Guide

**Quick Start:** Add decay effects to existing cards in 2 minutes.

---

## Option 1: Quick Integration (Recommended)

### Update WarRoomBoard to use DecayWarfareDealCard

**File:** `components/radical/war-room/WarRoomBoard.tsx`

**Before:**
```tsx
import { WarfareDealCard } from "./WarfareDealCard";

// In the render
{getDealsByStatus(col.id).map((deal, idx) => (
  <WarfareDealCard key={deal.name} deal={deal} index={idx} />
))}
```

**After:**
```tsx
import { DecayWarfareDealCard } from "./DecayWarfareDealCard";

// In the render
{getDealsByStatus(col.id).map((deal, idx) => (
  <DecayWarfareDealCard key={deal.name} deal={deal} index={idx} />
))}
```

**That's it!** Decay effects now apply automatically. The wrapper detects activity dates from the deal object.

---

## Option 2: Custom Integration

### Wrap your existing card component

**File:** `components/MyCustomDealCard.tsx`

```tsx
import { DecayingDealCard } from "@/components/radical/DecayingDealCard";
import { CRMDeal } from "@/lib/types/crm.generated";

function MyCustomDealCard({ deal }: { deal: CRMDeal }) {
  return (
    <DecayingDealCard deal={deal}>
      {/* Your existing card UI - no changes needed */}
      <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
        <h3>{deal.lead_name}</h3>
        <p>${deal.expected_deal_value}</p>
      </div>
    </DecayingDealCard>
  );
}
```

---

## Option 3: Manual Activity Date Override

### When you have custom activity tracking

```tsx
import { DecayingDealCard } from "@/components/radical/DecayingDealCard";
import { useList } from "@frappe-ui/neobrutalism";

function MyDealList() {
  // Fetch deals with custom activity field
  const { data: deals } = useList<CRMDeal>("CRM Deal", {
    fields: ["name", "lead_name", "expected_deal_value", "custom_last_interaction"],
    auto: true,
  });

  return (
    <div>
      {deals?.map((deal) => (
        <DecayingDealCard
          key={deal.name}
          deal={deal}
          // Override with custom field
          lastActivityDate={deal.custom_last_interaction}
        >
          <MyCard deal={deal} />
        </DecayingDealCard>
      ))}
    </div>
  );
}
```

---

## Option 4: Conditional Decay (Only Certain Stages)

### Apply decay only to specific deal stages

```tsx
function ConditionalDecayCard({ deal }: { deal: CRMDeal }) {
  // Only decay deals in "Proposal" or "Negotiation" stages
  const shouldDecay = ["Proposal", "Negotiation"].includes(deal.status || "");

  if (!shouldDecay) {
    return <MyCard deal={deal} />;
  }

  return (
    <DecayingDealCard deal={deal}>
      <MyCard deal={deal} />
    </DecayingDealCard>
  );
}
```

---

## Option 5: List View Integration

### Apply decay to table/list rows

```tsx
import { DecayingDealCard } from "@/components/radical/DecayingDealCard";
import { ListRow } from "@frappe-ui/neobrutalism";

function DealTableRow({ deal }: { deal: CRMDeal }) {
  return (
    <DecayingDealCard deal={deal} className="mb-2">
      <ListRow className="bg-white/5 hover:bg-white/10">
        <div className="flex items-center justify-between px-4 py-2">
          <span>{deal.lead_name}</span>
          <span>${deal.expected_deal_value}</span>
          <span>{deal.status}</span>
        </div>
      </ListRow>
    </DecayingDealCard>
  );
}
```

---

## Full Example: WarRoomBoard with Decay

**File:** `components/radical/war-room/WarRoomBoard.tsx`

```tsx
"use client";
import React, { useState } from "react";
import { CRMDeal } from "@/lib/types/crm.generated";
import { DecayWarfareDealCard } from "./DecayWarfareDealCard"; // ← Changed
import { motion, AnimatePresence } from "motion/react";
import { Card, cn, Button } from "@frappe-ui/neobrutalism";
import { IconCpu } from "@tabler/icons-react";

const COLUMNS = [
  { id: "Open", title: "Open", color: "border-white/10" },
  { id: "Qualification", title: "Qualify", color: "border-blue-500/20" },
  { id: "Proposal", title: "Proposal", color: "border-purple-500/20" },
  { id: "Negotiation", title: "Negotiation", color: "border-orange-500/20" },
  { id: "Closed Won", title: "Victory", color: "border-emerald-500/40" },
];

export function WarRoomBoard({ deals }: { deals: CRMDeal[] }) {
  const getDealsByStatus = (status: string) =>
    deals.filter((d) => (d.status || "Open") === status);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505]">
      {/* Header HUD */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-black text-white uppercase">War Room</h2>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((col) => (
            <div key={col.id} className="w-80 flex flex-col h-full">
              <div className="mb-3 px-2">
                <span className="text-xs font-bold text-white uppercase">
                  {col.title}
                </span>
              </div>

              <div className={cn("flex-1 rounded-xl border p-2", col.color)}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {getDealsByStatus(col.id).map((deal, idx) => (
                      <DecayWarfareDealCard // ← Changed from WarfareDealCard
                        key={deal.name}
                        deal={deal}
                        index={idx}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Your Integration

### Visual Checklist

After integrating, verify these behaviors:

1. **Fresh deals (0-2 days):**
   - [ ] No visual decay
   - [ ] Normal colors and opacity
   - [ ] No tooltip on hover

2. **Aging deals (7+ days):**
   - [ ] Red border appears
   - [ ] Border pulses smoothly (2-second cycle)
   - [ ] Tooltip shows "Aging deal" message

3. **Stale deals (10+ days):**
   - [ ] Alert triangle icon appears in top-right
   - [ ] Icon pulses with scale animation
   - [ ] Card is noticeably desaturated

4. **Critical deals (15+ days):**
   - [ ] Skull icon instead of alert triangle
   - [ ] Heavy desaturation (looks almost grayscale)
   - [ ] Opacity reduced to ~50%
   - [ ] Tooltip says "CRITICAL"

5. **Interactions:**
   - [ ] Hover still works on decayed cards
   - [ ] Drag interactions still work (if enabled)
   - [ ] Clicking still works
   - [ ] Decay doesn't cause layout shift

### Browser DevTools Check

```js
// Open browser console on the page
// Find a critical deal card
const card = document.querySelector('[data-deal-name="DEAL-001"]');

// Check applied filters
console.log(getComputedStyle(card).filter);
// Should show: "saturate(30%) contrast(60%) opacity(0.5)"

// Check for red border
const redBorder = card.querySelector('[style*="border"]');
console.log(redBorder); // Should exist for deals 7+ days old
```

---

## Troubleshooting

### "No decay effects visible"

**Check:**
1. Deal has `modified` field with valid ISO date
2. Date is at least 3 days old
3. Component has `'use client'` directive
4. Motion/Framer Motion is installed

**Debug:**
```tsx
import { calculateDaysSinceActivity } from "@/components/radical/DecayingDealCard";

console.log(calculateDaysSinceActivity(deal.modified));
// Should be > 0 for decay to appear
```

### "Decay effects too subtle"

**Increase decay intensity** (custom config):
```tsx
<DecayingDealCard
  deal={deal}
  config={{
    minOpacity: 0.3,        // Default: 0.5
    minSaturation: 10,       // Default: 30
    redBorderThreshold: 5,   // Default: 7
  }}
>
  <MyCard />
</DecayingDealCard>
```

### "Layout shifts when hovering"

**Cause:** Tooltip causes reflow

**Fix:**
```tsx
// Add overflow-visible to parent container
<div className="overflow-visible relative">
  <DecayingDealCard>...</DecayingDealCard>
</div>
```

---

## Performance Considerations

### Large Lists (100+ deals)

For performance with many decayed cards:

```tsx
import { memo } from "react";

const MemoizedDecayCard = memo(DecayingDealCard);

function LargeDealList({ deals }: { deals: CRMDeal[] }) {
  return (
    <div>
      {deals.map((deal) => (
        <MemoizedDecayCard key={deal.name} deal={deal}>
          <MyCard deal={deal} />
        </MemoizedDecayCard>
      ))}
    </div>
  );
}
```

### Virtual Scrolling

For extremely large lists (1000+ deals), use virtual scrolling:

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedDecayList({ deals }: { deals: CRMDeal[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: deals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const deal = deals[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <DecayingDealCard deal={deal}>
                <MyCard deal={deal} />
              </DecayingDealCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Next Steps

1. ✅ Integrate decay into WarRoomBoard (Option 1)
2. ✅ Test with real deals that have various activity dates
3. ✅ Verify tooltips appear correctly
4. ✅ Check performance with production data
5. 🔜 Add to other card views (list, grid, timeline)
6. 🔜 Implement "decay heatmap" global view
7. 🔜 Add sound effects for critical deals (optional)

---

## Questions?

See `DECAY_PHYSICS_README.md` for full documentation.
