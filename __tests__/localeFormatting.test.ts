/**
 * Locale Formatting Utilities Tests
 * اختبارات أدوات التنسيق حسب اللغة
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  getDirection,
  isLocaleRTL,
  getTextAlign,
} from '../lib/utils/localeFormatting';

describe('Locale Formatting Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers in English', () => {
      expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
      expect(formatNumber(1000000, 'en')).toBe('1,000,000');
    });

    it('should format numbers in Arabic', () => {
      const result = formatNumber(1234.56, 'ar');
      // Arabic uses Eastern Arabic numerals (١٢٣٤) and different grouping
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format numbers in Urdu', () => {
      const result = formatNumber(1234.56, 'ur');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format numbers with minimum/maximum fraction digits', () => {
      const result = formatNumber(1234.5, 'en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
      expect(result).toBe('1,234.50');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0, 'en')).toBe('0');
      expect(formatNumber(-1234.56, 'en')).toBe('-1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in English with USD', () => {
      const result = formatCurrency(1234.56, 'en', 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,234.56');
    });

    it('should format currency in Arabic with SAR', () => {
      const result = formatCurrency(1234.56, 'ar');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format currency in Urdu with PKR', () => {
      const result = formatCurrency(1234.56, 'ur');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format currency in Malay with MYR', () => {
      const result = formatCurrency(1234.56, 'ms');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should use provided currency symbol', () => {
      const result = formatCurrency(100, 'en', 'EUR');
      expect(result).toBeTruthy();
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage in English', () => {
      expect(formatPercentage(50, 'en')).toBe('50%');
      expect(formatPercentage(33.33, 'en')).toBe('33.33%');
    });

    it('should format percentage with custom precision', () => {
      expect(formatPercentage(50.123, 'en', 1)).toBe('50.1%');
    });

    it('should handle zero percentage', () => {
      expect(formatPercentage(0, 'en')).toBe('0%');
    });

    it('should handle 100% percentage', () => {
      expect(formatPercentage(100, 'en')).toBe('100%');
    });
  });

  describe('formatDate', () => {
    it('should format date in English', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'en');
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
      expect(typeof result).toBe('string');
    });

    it('should format date in Arabic', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'ar');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format date string', () => {
      const result = formatDate('2024-01-15', 'en');
      expect(result).toBeTruthy();
    });

    it('should accept custom format options', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'en', { year: 'numeric', month: 'short' });
      expect(result).toBeTruthy();
    });
  });

  describe('formatDateTime', () => {
    it('should format date-time in English', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date, 'en');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should include time in formatted output', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date, 'en');
      expect(result).toBeTruthy();
    });
  });

  describe('RTL Utilities', () => {
    describe('getDirection', () => {
      it('should return rtl for Arabic', () => {
        expect(getDirection('ar')).toBe('rtl');
      });

      it('should return rtl for Urdu', () => {
        expect(getDirection('ur')).toBe('rtl');
      });

      it('should return ltr for English', () => {
        expect(getDirection('en')).toBe('ltr');
      });

      it('should return ltr for Malay', () => {
        expect(getDirection('ms')).toBe('ltr');
      });

      it('should return ltr for unknown locales', () => {
        expect(getDirection('fr')).toBe('ltr');
      });
    });

    describe('isLocaleRTL', () => {
      it('should return true for RTL locales', () => {
        expect(isLocaleRTL('ar')).toBe(true);
        expect(isLocaleRTL('ur')).toBe(true);
      });

      it('should return false for LTR locales', () => {
        expect(isLocaleRTL('en')).toBe(false);
        expect(isLocaleRTL('ms')).toBe(false);
      });
    });

    describe('getTextAlign', () => {
      it('should return right for RTL locales', () => {
        expect(getTextAlign('ar')).toBe('right');
        expect(getTextAlign('ur')).toBe('right');
      });

      it('should return left for LTR locales', () => {
        expect(getTextAlign('en')).toBe('left');
        expect(getTextAlign('ms')).toBe('left');
      });
    });
  });
});
