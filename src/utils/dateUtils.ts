/**
 * Date and Time Utilities for GymFlow
 */

/**
 * Parses date string (YYYY-MM-DD or ISO) into local midnight Date object
 */
export function parseLocalDate(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());

  const clean = dateInput.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Format a Date to YYYY-MM-DD standard format
 */
export function formatToISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return formatToISODate(new Date());
}

/**
 * Formats date into readable string, e.g. "15 Aug 2026", "Today", "Yesterday"
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  options: {
    format?: 'short' | 'medium' | 'full' | 'relative';
    includeDayOfWeek?: boolean;
  } = {}
): string {
  if (!dateInput) return '—';

  const date = parseLocalDate(dateInput);
  const { format = 'medium', includeDayOfWeek = false } = options;

  if (format === 'relative') {
    const today = parseLocalDate(new Date());
    const diffDays = getDifferenceInDays(date, today);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  }

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const day = date.getDate();
  const monthShort = monthNamesShort[date.getMonth()];
  const monthFull = monthNamesFull[date.getMonth()];
  const year = date.getFullYear();
  const dayName = dayNames[date.getDay()];

  let formatted = '';
  if (format === 'short') {
    formatted = `${day} ${monthShort}`;
  } else if (format === 'full') {
    formatted = `${monthFull} ${day}, ${year}`;
  } else {
    formatted = `${day} ${monthShort} ${year}`;
  }

  return includeDayOfWeek ? `${dayName}, ${formatted}` : formatted;
}

/**
 * Readable date formatter alias
 */
export function formatReadableDate(dateInput: string | Date | null | undefined): string {
  return formatDate(dateInput, { format: 'medium' });
}

/**
 * Formats Month Year, e.g. "August 2026"
 */
export function formatMonthYear(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const date = parseLocalDate(dateInput);
  const monthNamesFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNamesFull[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Calculates difference in calendar days between targetDate and baseDate (target - base)
 */
export function getDifferenceInDays(
  targetDate: string | Date,
  baseDate: string | Date = new Date()
): number {
  const target = parseLocalDate(targetDate);
  const base = parseLocalDate(baseDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - base.getTime()) / msPerDay);
}

/**
 * Calculate next billing / payment date given current payment date and duration in months
 */
export function calculateNextPaymentDate(
  currentDateInput: string | Date = new Date(),
  durationMonths: number = 1
): string {
  const current = parseLocalDate(currentDateInput);
  const next = new Date(current.getFullYear(), current.getMonth() + durationMonths, current.getDate());
  return formatToISODate(next);
}

/**
 * Adds months to a date string (alias for calculateNextPaymentDate)
 */
export function addMonths(dateString: string, months: number = 1): string {
  return calculateNextPaymentDate(dateString, months);
}

/**
 * Formats relative due date badge label
 */
export function getRelativeDueDateLabel(dueDateInput: string | Date): {
  text: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean;
  diffDays: number;
} {
  const diffDays = getDifferenceInDays(dueDateInput);

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      text: `${days} ${days === 1 ? 'day' : 'days'} overdue`,
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Due Today',
      isOverdue: false,
      isDueToday: true,
      isDueSoon: false,
      diffDays: 0,
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Due tomorrow',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      diffDays: 1,
    };
  }

  return {
    text: `Due in ${diffDays} days`,
    isOverdue: false,
    isDueToday: false,
    isDueSoon: diffDays <= 3,
    diffDays,
  };
}
