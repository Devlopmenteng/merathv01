import { getLocales } from 'expo-localization';
import { i18n } from '../i18n';

export const formatCurrency = (
  amount: number,
  locale?: string,
  currency: string = 'SAR'
): string => {
  const userLocale = locale || i18n.locale || getLocales()[0]?.languageCode || 'en-US';
  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};
