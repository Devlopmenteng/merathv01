/**
 * @deprecated Use formatCurrency from '../currency' for display.
 * This formatter is kept for Input component currency masking.
 */
export const formatCurrencyInput = (value: string | number, currencySymbol: string = '$'): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '';
  return `${currencySymbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** Re-export under old name for backward compatibility */
export const formatCurrency = formatCurrencyInput;

export const parseCurrency = (formatted: string): number => {
  const cleaned = formatted.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
