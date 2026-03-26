import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addDays, isValid, parse } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Birthday helpers (MM-DD format, no year)
// ============================================================

/**
 * Given "MM-DD", return the next occurrence as a Date.
 * If the birthday already passed this year, returns next year's date.
 */
export function nextBirthdayDate(birthday: string): Date {
  const [monthStr, dayStr] = birthday.split("-")
  const month = parseInt(monthStr, 10) - 1 // 0-indexed
  const day = parseInt(dayStr, 10)
  const now = new Date()
  const thisYear = new Date(now.getFullYear(), month, day)
  if (thisYear >= now) return thisYear
  return new Date(now.getFullYear() + 1, month, day)
}

/**
 * Returns true if employee's birthday falls within the next `days` days.
 */
export function isBirthdayWithinDays(birthday: string, days: number): boolean {
  const next = nextBirthdayDate(birthday)
  const cutoff = addDays(new Date(), days)
  return next <= cutoff
}

/**
 * Format "MM-DD" to a human-readable string like "March 25".
 */
export function formatBirthday(birthday: string): string {
  const [month, day] = birthday.split("-").map(Number)
  const d = new Date(2000, month - 1, day)
  return format(d, "MMMM d")
}

/**
 * Format "MM-DD" to show with this year's context, e.g. "Mar 25, 2025".
 */
export function formatBirthdayWithYear(birthday: string): string {
  const next = nextBirthdayDate(birthday)
  return format(next, "MMM d, yyyy")
}

/**
 * Validate a birthday string is MM-DD format.
 */
export function isValidBirthday(birthday: string): boolean {
  if (!/^\d{2}-\d{2}$/.test(birthday)) return false
  const [month, day] = birthday.split("-").map(Number)
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  return true
}

/**
 * Format a delivery date (ISO string or Date) for display.
 */
export function formatDeliveryDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (!isValid(d)) return String(date)
  return format(d, "EEE, d MMM yyyy")
}

/**
 * Sort employees by upcoming birthday date.
 */
export function sortByUpcomingBirthday<T extends { birthday: string }>(employees: T[]): T[] {
  return [...employees].sort(
    (a, b) => nextBirthdayDate(a.birthday).getTime() - nextBirthdayDate(b.birthday).getTime()
  )
}

// ============================================================
// Currency
// ============================================================
export function formatCurrency(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100)
}

// ============================================================
// Misc
// ============================================================
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s")
}
