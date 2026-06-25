/**
 * Design Tokens for Frappe CRM
 *
 * Based on research from:
 * - Gumroad (radical whitespace, functional brutalism)
 * - Shopify Polaris (comprehensive guidelines)
 * - Material Design (accessibility standards)
 */

// ========================================
// SPACING SYSTEM (8pt Grid)
// ========================================
export const space = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const

// Semantic spacing names (Gumroad pattern)
export const Spacing = {
  content: 'space-y-4',    // 16px - Within cards, tightly related items
  section: 'space-y-8',    // 32px - Between sections on a page
  page: 'space-y-12',      // 48px - Major page divisions
  hero: 'space-y-16',      // 64px - Landing sections, hero spacing
} as const

// ========================================
// TYPOGRAPHY SYSTEM
// ========================================
// Based on Gumroad's scale-and-weight-only approach
export const Typography = {
  // Headings (font-black for brutalist aesthetic)
  hero: 'text-6xl font-black leading-none tracking-tight',       // 60px - Hero headlines only
  h1: 'text-4xl font-black leading-tight tracking-tight',       // 36px - Page titles
  h2: 'text-2xl font-black leading-tight',                      // 24px - Section headers
  h3: 'text-xl font-bold leading-snug',                         // 20px - Subsections
  h4: 'text-lg font-bold leading-snug',                         // 18px - Card titles

  // Body text
  bodyLg: 'text-lg font-normal leading-relaxed',                // 18px - Lead paragraphs
  body: 'text-base font-normal leading-relaxed',                // 16px - Default body
  bodySm: 'text-sm font-normal leading-normal',                 // 14px - Secondary info
  caption: 'text-xs font-normal leading-normal',                // 12px - Metadata, labels

  // Special
  code: 'font-mono text-sm',                                    // Code blocks
  link: 'underline hover:no-underline transition-all',          // Links
} as const

// ========================================
// COLOR SYSTEM (Semantic Tokens)
// ========================================
export const Colors = {
  // Primary brand colors
  primary: {
    DEFAULT: '#A020F0',    // Purple - Primary actions
    light: '#B84BF5',
    dark: '#8B1ACF',
    50: '#FAF5FF',
    100: '#F3E8FF',
    600: '#A020F0',
  },

  // Semantic colors
  secondary: '#0066FF',     // Blue - Info states
  success: '#10B981',       // Green - Success states
  warning: '#F59E0B',       // Yellow/Amber - Warning states
  danger: '#EF4444',        // Red - Error/danger states

  // Text colors (ensuring WCAG AA compliance)
  text: {
    primary: '#000000',     // Black - Primary text
    secondary: '#374151',   // Gray-700 - Secondary text (7.87:1 contrast)
    muted: '#6B7280',       // Gray-500 - Muted text (4.61:1 contrast)
    disabled: '#9CA3AF',    // Gray-400 - Disabled text
    inverse: '#FFFFFF',     // White - Text on dark backgrounds
  },

  // Background colors
  bg: {
    primary: '#FFFFFF',     // White - Primary background
    subtle: '#F9FAFB',      // Gray-50 - Subtle backgrounds
    muted: '#F3F4F6',       // Gray-100 - Muted backgrounds
    hover: '#F3F4F6',       // Gray-100 - Hover states
    active: '#E5E7EB',      // Gray-200 - Active/pressed states
  },

  // Border colors
  border: {
    primary: '#000000',     // Black - Primary borders (brutalist)
    light: '#D1D5DB',       // Gray-300 - Light borders
    muted: '#E5E7EB',       // Gray-200 - Very light borders
  },

  // Gradient backgrounds (for cards, sections)
  gradients: {
    purpleBlue: 'from-purple-50 via-white to-blue-50',
    purpleBlueStrong: 'from-purple-100 to-blue-100',
  },
} as const

// ========================================
// SHADOWS (Brutalist Neobrutalism)
// ========================================
// Only use shadows for interactive feedback, not decoration
export const Shadows = {
  none: 'shadow-none',
  sm: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',      // Subtle elevation
  md: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',      // Default hover state
  lg: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',      // Active/selected state
  brutal: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',  // Alias for md
} as const

// ========================================
// BORDERS (Core Brutalist Element)
// ========================================
export const Borders = {
  none: 'border-0',
  thin: 'border',           // 1px
  medium: 'border-2',       // 2px
  thick: 'border-3',        // 3px (brutalist standard)
  heavy: 'border-4',        // 4px
} as const

// ========================================
// BUTTON SIZES (WCAG 2.5.5 Compliant)
// ========================================
// Minimum touch target: 44x44px
export const ButtonSizes = {
  sm: 'h-10 px-4',         // 40px height (acceptable for desktop)
  md: 'h-11 px-6',         // 44px height (WCAG compliant)
  lg: 'h-12 px-8',         // 48px height (comfortable)
  xl: 'h-14 px-10',        // 56px height (hero CTAs)
} as const

// ========================================
// TRANSITIONS (Subtle, Fast)
// ========================================
export const Transitions = {
  fast: 'transition-all duration-150 ease-out',
  normal: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  shadow: 'transition-shadow duration-200',
} as const

// ========================================
// BREAKPOINTS
// ========================================
export const Breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px', // Extra large
} as const

// ========================================
// Z-INDEX SCALE
// ========================================
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const

// ========================================
// FOCUS RING (Accessibility)
// ========================================
export const FocusRing = {
  default: 'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-purple-600 focus-visible:ring-offset-2',
  brutal: 'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-purple-600 focus-visible:ring-offset-3',
  danger: 'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-red-600 focus-visible:ring-offset-2',
} as const

// ========================================
// CONTAINER WIDTHS
// ========================================
export const Container = {
  sm: 'max-w-2xl',      // 672px - Forms, articles
  md: 'max-w-4xl',      // 896px - Content pages
  lg: 'max-w-6xl',      // 1152px - Dashboards
  xl: 'max-w-7xl',      // 1280px - Full-width layouts
  full: 'max-w-full',   // 100% - Edge-to-edge
} as const

// ========================================
// HELPER UTILITIES
// ========================================

/**
 * Get a consistent spacing value
 */
export function getSpacing(size: keyof typeof space): string {
  return space[size]
}

/**
 * Get a semantic spacing class
 */
export function getSemanticSpacing(semantic: keyof typeof Spacing): string {
  return Spacing[semantic]
}

/**
 * Compose multiple class strings (simple utility)
 */
export function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Apply brutalist shadow on hover
 */
export function withHoverShadow(baseClasses: string = ''): string {
  return cx(
    baseClasses,
    'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    Transitions.shadow
  )
}

/**
 * Apply focus ring
 */
export function withFocusRing(baseClasses: string = '', type: keyof typeof FocusRing = 'default'): string {
  return cx(baseClasses, FocusRing[type])
}
