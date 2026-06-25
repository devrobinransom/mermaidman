'use client'

import React from 'react'
import {
  TrustBatteryIndicator,
  TrustBatteryBadge,
  type TrustSentiment,
} from './TrustBattery'
import {
  TrustBatteryCard,
  TrustBatteryGrid,
  TrustBatteryListItem,
} from './TrustBatteryCard'

/**
 * Example usage of Trust Battery components
 *
 * This file demonstrates all the Trust Battery Aura components:
 * - getTrustAura() function for className generation
 * - TrustBatteryIndicator for visual battery bars
 * - TrustBatteryBadge for compact badges
 * - TrustBatteryCard for card wrappers with auras
 * - TrustBatteryGrid for grid layouts
 * - TrustBatteryListItem for list views
 */

// Sample lead data
const sampleLeads = [
  {
    id: 1,
    name: 'John Doe',
    company: 'TechCorp Inc',
    interaction_count: 15,
    sentiment: 'Positive' as TrustSentiment,
    value: '$50,000',
  },
  {
    id: 2,
    name: 'Jane Smith',
    company: 'StartupXYZ',
    interaction_count: 2,
    sentiment: 'Negative' as TrustSentiment,
    value: '$10,000',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    company: 'MidSizeCo',
    interaction_count: 7,
    sentiment: 'Neutral' as TrustSentiment,
    value: '$25,000',
  },
  {
    id: 4,
    name: 'Alice Williams',
    company: 'Enterprise Global',
    interaction_count: 22,
    sentiment: 'Positive' as TrustSentiment,
    value: '$100,000',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    company: 'Local Business',
    interaction_count: 1,
    sentiment: 'Neutral' as TrustSentiment,
    value: '$5,000',
  },
  {
    id: 6,
    name: 'Diana Prince',
    company: 'Fortune 500 Corp',
    interaction_count: 18,
    sentiment: 'Positive' as TrustSentiment,
    value: '$75,000',
  },
]

export function TrustBatteryExamples() {
  return (
    <div className="space-y-12 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Trust Battery Auras
          </h1>
          <p className="text-lg text-gray-600">
            Visual trust indicators based on interaction count and sentiment
          </p>
        </div>

        {/* Section 1: Battery Indicators */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            1. Battery Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-4">Warm Lead (15 interactions)</h3>
              <TrustBatteryIndicator
                interaction_count={15}
                sentiment="Positive"
                showLabel={true}
                showMetrics={true}
                size="lg"
              />
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-4">Neutral Lead (7 interactions)</h3>
              <TrustBatteryIndicator
                interaction_count={7}
                sentiment="Neutral"
                showLabel={true}
                showMetrics={true}
                size="lg"
              />
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-4">Cold Lead (2 interactions)</h3>
              <TrustBatteryIndicator
                interaction_count={2}
                sentiment="Negative"
                showLabel={true}
                showMetrics={true}
                size="lg"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">2. Badges</h2>
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex flex-wrap gap-4">
              <TrustBatteryBadge
                interaction_count={15}
                sentiment="Positive"
                variant="default"
              />
              <TrustBatteryBadge
                interaction_count={7}
                sentiment="Neutral"
                variant="default"
              />
              <TrustBatteryBadge
                interaction_count={2}
                sentiment="Negative"
                variant="default"
              />
              <TrustBatteryBadge
                interaction_count={22}
                sentiment="Positive"
                variant="minimal"
              />
              <TrustBatteryBadge
                interaction_count={1}
                sentiment="Neutral"
                variant="minimal"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Trust Battery Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            3. Trust Battery Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warm Lead Card */}
            <TrustBatteryCard
              interaction_count={15}
              sentiment="Positive"
              showIndicator={true}
              animated={true}
            >
              <h3 className="text-xl font-black text-gray-900">John Doe</h3>
              <p className="text-sm text-gray-600 mb-2">TechCorp Inc</p>
              <p className="text-2xl font-bold text-purple-600">$50,000</p>
            </TrustBatteryCard>

            {/* Cold Lead Card */}
            <TrustBatteryCard
              interaction_count={2}
              sentiment="Negative"
              showBadge={true}
              badgePosition="top-right"
              animated={true}
            >
              <h3 className="text-xl font-black text-gray-900">Jane Smith</h3>
              <p className="text-sm text-gray-600 mb-2">StartupXYZ</p>
              <p className="text-2xl font-bold text-purple-600">$10,000</p>
              <p className="text-xs text-red-600 mt-2 font-bold">
                ⚠️ Needs immediate attention
              </p>
            </TrustBatteryCard>
          </div>
        </section>

        {/* Section 4: Trust Battery Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            4. Trust Battery Grid (Auto Layout)
          </h2>
          <TrustBatteryGrid
            cards={sampleLeads.map((lead) => ({
              id: lead.id,
              interaction_count: lead.interaction_count,
              sentiment: lead.sentiment,
              content: (
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {lead.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
                  <p className="text-xl font-bold text-purple-600">
                    {lead.value}
                  </p>
                </div>
              ),
            }))}
            columns={3}
            gap="md"
            showBadges={true}
            animated={true}
            onCardClick={(id) => console.log('Clicked card:', id)}
          />
        </section>

        {/* Section 5: List Items */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            5. Trust Battery List Items
          </h2>
          <div className="space-y-3">
            {sampleLeads.map((lead) => (
              <TrustBatteryListItem
                key={lead.id}
                interaction_count={lead.interaction_count}
                sentiment={lead.sentiment}
                showBadge={true}
                animated={true}
                onClick={() => console.log('Clicked:', lead.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{lead.name}</h4>
                    <p className="text-sm text-gray-600">{lead.company}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-black text-purple-600">{lead.value}</p>
                    <p className="text-xs text-gray-500">
                      {lead.interaction_count} touchpoints
                    </p>
                  </div>
                </div>
              </TrustBatteryListItem>
            ))}
          </div>
        </section>

        {/* Section 6: All Indicator Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            6. Indicator Sizes
          </h2>
          <div className="bg-white p-6 rounded-lg border-2 border-black space-y-6">
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-600">Small</h3>
              <TrustBatteryIndicator
                interaction_count={12}
                sentiment="Positive"
                size="sm"
                showLabel={true}
              />
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-600">Medium</h3>
              <TrustBatteryIndicator
                interaction_count={12}
                sentiment="Positive"
                size="md"
                showLabel={true}
              />
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-600">Large</h3>
              <TrustBatteryIndicator
                interaction_count={12}
                sentiment="Positive"
                size="lg"
                showLabel={true}
              />
            </div>
          </div>
        </section>

        {/* Integration Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            7. Integration Example (with CRM Lead)
          </h2>
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <pre className="text-sm overflow-x-auto bg-gray-100 p-4 rounded">
              {`import { getTrustAura, TrustBatteryCard } from '@/components/radical/TrustBattery'
import { useFrappeList } from '@/lib/hooks/useFrappeList'
import { CRMLead } from '@/lib/types/crm.generated'

function LeadsPage() {
  const { data: leads } = useFrappeList<CRMLead>({
    doctype: 'CRM Lead',
    fields: ['name', 'lead_name', 'sentiment', 'engagement_score'],
    auto: true,
  })

  return (
    <div className="grid grid-cols-3 gap-6">
      {leads?.map((lead) => {
        // Calculate interaction count from engagement_score or activities
        const interaction_count = lead.engagement_score || 0

        return (
          <TrustBatteryCard
            key={lead.name}
            interaction_count={interaction_count}
            sentiment={lead.sentiment || 'Neutral'}
            showBadge={true}
            showIndicator={true}
          >
            <h3>{lead.lead_name}</h3>
            <p>{lead.organization}</p>
          </TrustBatteryCard>
        )
      })}
    </div>
  )
}`}
            </pre>
          </div>
        </section>

        {/* API Documentation */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            8. API Reference
          </h2>
          <div className="bg-white p-6 rounded-lg border-2 border-black space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">getTrustAura()</h3>
              <p className="text-sm text-gray-600 mb-2">
                Returns aura level and Tailwind className based on interaction
                count and sentiment.
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                getTrustAura(&#123; interaction_count: 15, sentiment: 'Positive'
                &#125;)
              </code>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">
                TrustBatteryIndicator
              </h3>
              <p className="text-sm text-gray-600">
                Visual battery bars showing trust level with percentage fill.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">TrustBatteryCard</h3>
              <p className="text-sm text-gray-600">
                Card wrapper with automatic aura glow effects (green/amber/red).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">TrustBatteryGrid</h3>
              <p className="text-sm text-gray-600">
                Responsive grid layout with automatic Trust Battery auras.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TrustBatteryExamples
