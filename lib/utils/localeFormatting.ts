/**
 * Locale-aware formatting utilities
 * أدوات التنسيق المدعمة حسب اللغة
 *
 * This module provides utilities for formatting numbers, dates, and currency
 * according to the current locale settings.
 *
 * @module lib/utils/localeFormatting
 */

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    // Locale mapping for React Native
    const localeMap: Record<string, string> = {
      ar: 'ar-SA',
      ur: 'ur-PK',
      ms: 'ms-MY',
      en: 'en-US',
    };

    const targetLocale = localeMap[locale] || locale;
    return new Intl.NumberFormat(targetLocale, options).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
}

/**
 * Format currency according to locale
 */
export function formatCurrency(value: number, locale: string, currency: string = 'USD'): string {
  try {
    // Currency symbol mapping
    const currencyMap: Record<string, string> = {
      ar: 'SAR',
      ur: 'PKR',
      ms: 'MYR',
      en: 'USD',
    };

    // Locale mapping
    const localeMap: Record<string, string> = {
      ar: 'ar-SA',
      ur: 'ur-PK',
      ms: 'ms-MY',
      en: 'en-US',
    };

    const targetLocale = localeMap[locale] || locale;
    const targetCurrency = currencyMap[locale] || currency;

    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: targetCurrency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${value}`;
  }
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number,
  locale: string,
  maximumFractionDigits: number = 2
): string {
  try {
    const localeMap: Record<string, string> = {
      ar: 'ar-SA',
      ur: 'ur-PK',
      ms: 'ms-MY',
      en: 'en-US',
    };

    const targetLocale = localeMap[locale] || locale;
    return new Intl.NumberFormat(targetLocale, {
      style: 'percent',
      maximumFractionDigits,
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value.toFixed(maximumFractionDigits)}%`;
  }
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    const localeMap: Record<string, string> = {
      ar: 'ar-SA',
      ur: 'ur-PK',
      ms: 'ms-MY',
      en: 'en-US',
    };

    const targetLocale = localeMap[locale] || locale;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(targetLocale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format date-time according to locale
 */
export function formatDateTime(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return formatDate(date, locale, defaultOptions);
}

/**
 * Get direction for a locale (ltr or rtl)
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  const RTL_LOCALES = ['ar', 'ur', 'he', 'fa', 'ps'];
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Check if a locale is RTL
 */
export function isLocaleRTL(locale: string): boolean {
  return getDirection(locale) === 'rtl';
}

/**
 * Get text alignment based on locale
 */
export function getTextAlign(locale: string): 'left' | 'right' {
  return isLocaleRTL(locale) ? 'right' : 'left';
}
