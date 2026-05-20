import { getLocales } from 'expo-localization';

export const formatCurrency = (amount: number, locale?: string, currency: string = 'USD'): string => {
  const userLocale = locale || getLocales()[0]?.languageCode || 'en-US';
  return new Intl.NumberFormat(userLocale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
};
