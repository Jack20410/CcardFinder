/**
 * Timezone Utilities for CcardFinder
 * 
 * Database is configured to use America/Chicago (Central Time)
 * - Central Standard Time (CST) = GMT-6 (winter)
 * - Central Daylight Time (CDT) = GMT-5 (summer)
 */

export const TIMEZONE = 'America/Chicago' // GMT-6/GMT-5

/**
 * Format a Date object to Central Time string
 */
export function toCentralTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Get current time in Central Time
 */
export function nowInCentralTime(): Date {
  return new Date()
}

/**
 * Format for display (human-readable)
 */
export function formatCentralTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

/**
 * Check if currently in Daylight Saving Time
 */
export function isDST(date: Date = new Date()): boolean {
  const jan = new Date(date.getFullYear(), 0, 1)
  const jul = new Date(date.getFullYear(), 6, 1)
  
  const stdOffset = Math.max(
    jan.getTimezoneOffset(), 
    jul.getTimezoneOffset()
  )
  
  return date.getTimezoneOffset() < stdOffset
}

/**
 * Get current GMT offset for Central Time
 */
export function getCurrentOffset(): string {
  const date = new Date()
  return isDST(date) ? 'GMT-5' : 'GMT-6'
}

// Example usage:
// import { toCentralTime, formatCentralTime } from '@ccard/db/timezone'
// 
// const card = await prisma.creditCard.findUnique({ where: { id: 'x' } })
// console.log('Created:', formatCentralTime(card.createdAt))

