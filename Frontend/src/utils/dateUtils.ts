/**
 * Date Utilities - Single Source of Truth for date formatting
 * Eliminates duplicate date formatting logic across Dashboard and other pages
 */

/**
 * Format date options
 */
export interface FormatDateOptions {
  includeTime?: boolean;
  includeWeekday?: boolean;
  shortMonth?: boolean;
  relative?: boolean;
}

/**
 * Format a date string or Date object to a readable string
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const {
    includeTime = false,
    includeWeekday = false,
    shortMonth = false,
    relative = false
  } = options;

  // Relative time (e.g., "2 hours ago")
  if (relative) {
    return getRelativeTime(dateObj);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: shortMonth ? 'short' : 'long',
    day: 'numeric'
  };

  if (includeWeekday) {
    formatOptions.weekday = 'long';
  }

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format date for display in dashboards with full weekday
 * Replaces duplicate formatDate in admin/Dashboard, student/Dashboard
 */
export function formatDashboardDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for table display (short format)
 */
export function formatTableDate(date: string | Date | null | undefined): string {
  return formatDate(date, { shortMonth: true });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, { includeTime: true, shortMonth: true });
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Get greeting based on time of day
 * Replaces duplicate getGreeting in admin/Dashboard, student/Dashboard
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  const start = formatDate(startDate, { shortMonth: true });
  const end = formatDate(endDate, { shortMonth: true });

  if (start === end) return start;
  return `${start} - ${end}`;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return dateObj > today;
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number | string, short = false): string {
  const monthNum = typeof month === 'string' ? parseInt(month) : month;
  const date = new Date(2000, monthNum - 1, 1);
  return date.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
}

/**
 * Format month and year for display
 */
export function formatMonthYear(month: number | string, year: number | string): string {
  return `${getMonthName(month)} ${year}`;
}

/**
 * Get days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default {
  formatDate,
  formatDashboardDate,
  formatTableDate,
  formatDateTime,
  getRelativeTime,
  getTimeBasedGreeting,
  formatDateRange,
  isToday,
  isPastDate,
  isFutureDate,
  getMonthName,
  formatMonthYear,
  getDaysInMonth
};
