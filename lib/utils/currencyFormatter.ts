export const formatCurrency = (value: string | number, currencySymbol: string = '$'): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '';
  return `${currencySymbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const parseCurrency = (formatted: string): number => {
  const cleaned = formatted.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
