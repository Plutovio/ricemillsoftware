/**
 * Format a date string to DD/MM/YYYY format
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a number as Indian currency (without symbol)
 */
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Check if a date is expired
 */
export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

/**
 * Check if a date is within N days from today
 */
export function isExpiringSoon(dateStr: string, days: number = 30): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);
  return date >= today && date <= future;
}
