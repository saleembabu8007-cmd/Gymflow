/**
 * Currency and Number Formatting Utilities
 */

export interface FormatCurrencyOptions {
  includeSymbol?: boolean;
  decimals?: number;
  compact?: boolean;
}

/**
 * Format numeric value as human-friendly currency string
 * e.g. formatCurrency(1500, '₹') => "₹1,500"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencySymbol: string = '₹',
  options: FormatCurrencyOptions = {}
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount ?? 0);
  
  if (isNaN(num)) {
    return `${options.includeSymbol !== false ? currencySymbol : ''}0`;
  }

  const { includeSymbol = true, decimals = 0, compact = false } = options;

  if (compact && Math.abs(num) >= 100000) {
    // Compact formatting for lakhs/millions if requested
    const formattedCompact = (num / 100000).toFixed(1).replace(/\.0$/, '');
    return `${includeSymbol ? currencySymbol : ''}${formattedCompact}L`;
  }

  const formattedNum = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  return includeSymbol ? `${currencySymbol}${formattedNum}` : formattedNum;
}

/**
 * Parses numeric input from string (removing currency symbols and commas)
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
