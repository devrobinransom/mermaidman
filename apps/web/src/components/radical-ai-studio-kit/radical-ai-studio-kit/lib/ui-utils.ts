import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get color variant classes for neobrutalism components
 */
export function getColorClasses(color: 'red' | 'purple' | 'blue' | 'yellow' | 'black') {
  const colorMap = {
    red: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-500',
      shadow: 'shadow-brutal-red',
      hover: 'hover:bg-red-600',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-white',
      border: 'border-purple-500',
      shadow: 'shadow-brutal-purple',
      hover: 'hover:bg-purple-600',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-500',
      shadow: 'shadow-brutal-blue',
      hover: 'hover:bg-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-black',
      border: 'border-yellow-500',
      shadow: 'shadow-brutal-yellow',
      hover: 'hover:bg-yellow-600',
    },
    black: {
      bg: 'bg-primary',
      text: 'text-primary-foreground',
      border: 'border-border',
      shadow: 'shadow-brutal',
      hover: 'hover:opacity-90',
    },
  }

  return colorMap[color] || colorMap.black
}
