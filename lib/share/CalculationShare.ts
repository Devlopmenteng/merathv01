/**
 * Calculation Sharing Functionality
 * مشاركة حسابات المواريث
 *
 * This module provides functionality to share calculation results via various
 * methods including deep links, text messages, and other sharing options.
 *
 * @module lib/share/CalculationShare
 */

import type { CalculationResult, EstateInput, HeirEntry } from '../engine/types';
import { MADHAB_NAMES } from '../engine/constants';

/**
 * Share method types
 */
export type ShareMethod = 'link' | 'text' | 'email' | 'whatsapp' | 'telegram';

/**
 * Share configuration
 */
export interface ShareConfig {
  /** Include full details or summary only */
  detailLevel: 'full' | 'summary';
  /** Include calculation steps */
  includeSteps?: boolean;
  /** Language for share content */
  language?: 'en' | 'ar';
  /** Custom message to include */
  customMessage?: string;
  /** Base URL for deep links (if applicable) */
  baseUrl?: string;
}

/**
 * Share content structure
 */
export interface ShareContent {
  /** Title for the share */
  title: string;
  /** Main content/message */
  message: string;
  /** URL for deep linking (if applicable) */
  url?: string;
  /** Subject for email sharing */
  emailSubject?: string;
}

/**
 * Main calculation sharing class
 */
export class CalculationShare {
  /**
   * Generate shareable content for calculation results
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @param config - Share configuration
   * @returns Share content
   */
  public static generateShareContent(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    config: ShareConfig = {}
  ): ShareContent {
    const language = config.language || 'en';
    const isArabic = language === 'ar';
    const currencySymbol = isArabic ? 'ر.س' : '$';

    let message = '';
    let title = '';

    if (isArabic) {
      title = 'حساب المواريث - مراث';
      message = this.generateArabicMessage(estate, heirs, result, config, currencySymbol);
    } else {
      title = 'Inheritance Calculation - Merath';
      message = this.generateEnglishMessage(estate, heirs, result, config, currencySymbol);
    }

    // Add custom message if provided
    if (config.customMessage) {
      message += `\n\n${config.customMessage}`;
    }

    // Add app signature
    const signature = isArabic
      ? '\n\n─────────────────\nصنع بحب للمجتمع المسلم\nحاسبة المواريث مراث'
      : '\n\n─────────────────\nMade with ❤️ for the Muslim community\nMerath Islamic Inheritance Calculator';

    message += signature;

    return {
      title,
      message,
      url: this.generateDeepLink(estate, heirs, result, config.baseUrl),
      emailSubject: isArabic ? 'حساب المواريث' : 'Inheritance Calculation',
    };
  }

  /**
   * Generate English message for sharing
   */
  private static generateEnglishMessage(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    config: ShareConfig,
    currencySymbol: string
  ): string {
    let message = `🕌 ISLAMIC INHERITANCE CALCULATION\n\n`;

    if (config.detailLevel === 'summary') {
      message += `Madhab: ${MADHAB_NAMES[result.madhab]}\n`;
      message += `Total Estate: ${currencySymbol}${estate.total.toLocaleString()}\n`;
      message += `Net Estate: ${currencySymbol}${(result.netEstate || 0).toLocaleString()}\n`;
      message += `Heirs: ${heirs.length} types\n`;
      message += `Status: ${result.success ? '✅ Calculated' : '❌ Error'}\n\n`;
    } else {
      message += `═══════════════════════════════════════\n\n`;
      message += `📊 ESTATE DETAILS\n`;
      message += `───────────────────────────────────────\n`;
      message += `Total:     ${currencySymbol}${estate.total.toLocaleString()}\n`;
      message += `Funeral:   ${currencySymbol}${estate.funeral.toLocaleString()}\n`;
      message += `Debts:     ${currencySymbol}${estate.debts.toLocaleString()}\n`;
      message += `Will:      ${currencySymbol}${estate.will.toLocaleString()}\n`;
      message += `Net:       ${currencySymbol}${(result.netEstate || 0).toLocaleString()}\n\n`;

      message += `⚖️  CALCULATION DETAILS\n`;
      message += `───────────────────────────────────────\n`;
      message += `Madhab:   ${MADHAB_NAMES[result.madhab]}\n`;
      message += `Success:  ${result.success ? 'Yes' : 'No'}\n`;
      message += `Confidence: ${(result.confidence * 100).toFixed(1)}%\n\n`;

      if (result.specialCases) {
        message += `🔮 SPECIAL CASES\n`;
        message += `───────────────────────────────────────\n`;
        if (result.specialCases.awl) message += `• Awl (عول) applied\n`;
        if (result.specialCases.radd) message += `• Radd (رد) applied\n`;
        if (result.specialCases.hijabTypes?.length > 0) {
          result.specialCases.hijabTypes.forEach((type) => {
            message += `• ${type}\n`;
          });
        }
        message += '\n';
      }

      message += `👥 HEIRS DISTRIBUTION\n`;
      message += `───────────────────────────────────────\n`;

      result.shares.forEach((share) => {
        const fraction = share.fraction
          ? `${share.fraction.numerator}/${share.fraction.denominator}`
          : 'N/A';
        const amount = share.amount ? `${currencySymbol}${share.amount.toFixed(2)}` : 'N/A';

        message += `• ${share.name}: ${amount} (${fraction})\n`;
      });

      if (config.includeSteps && result.steps?.length > 0) {
        message += `\n📝 CALCULATION STEPS\n`;
        message += `───────────────────────────────────────\n`;
        result.steps.slice(0, 5).forEach((step, index) => {
          message += `${index + 1}. ${step.title}\n`;
        });
        if (result.steps.length > 5) {
          message += `... and ${result.steps.length - 5} more steps\n`;
        }
        message += '\n';
      }
    }

    return message;
  }

  /**
   * Generate Arabic message for sharing
   */
  private static generateArabicMessage(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    config: ShareConfig,
    currencySymbol: string
  ): string {
    let message = `🕌 حساب المواريث الشرعية\n\n`;

    if (config.detailLevel === 'summary') {
      message += `المذهب: ${MADHAB_NAMES[result.madhab]}\n`;
      message += `إجمالي التركة: ${currencySymbol}${estate.total.toLocaleString()}\n`;
      message += `صافي التركة: ${currencySymbol}${(result.netEstate || 0).toLocaleString()}\n`;
      message += `عدد الورثة: ${heirs.length} أنواع\n`;
      message += `الحالة: ${result.success ? '✅ تم الحساب' : '❌ خطأ'}\n\n`;
    } else {
      message += `═══════════════════════════════════════\n\n`;
      message += `📊 تفاصيل التركة\n`;
      message += `───────────────────────────────────────\n`;
      message += `الإجمالي:      ${currencySymbol}${estate.total.toLocaleString()}\n`;
      message += `تكاليف التجهيز: ${currencySymbol}${estate.funeral.toLocaleString()}\n`;
      message += `الديون:        ${currencySymbol}${estate.debts.toLocaleString()}\n`;
      message += `الوصية:       ${currencySymbol}${estate.will.toLocaleString()}\n`;
      message += `الصافي:        ${currencySymbol}${(result.netEstate || 0).toLocaleString()}\n\n`;

      message += `⚖️  تفاصيل الحساب\n`;
      message += `───────────────────────────────────────\n`;
      message += `المذهب:       ${MADHAB_NAMES[result.madhab]}\n`;
      message += `الحالة:        ${result.success ? 'نعم' : 'لا'}\n`;
      message += `مستوى الثقة: ${(result.confidence * 100).toFixed(1)}%\n\n`;

      if (result.specialCases) {
        message += `🔮 الحالات الخاصة\n`;
        message += `───────────────────────────────────────\n`;
        if (result.specialCases.awl) message += `• تم تطبيق العول\n`;
        if (result.specialCases.radd) message += `• تم تطبيق الرد\n`;
        if (result.specialCases.hijabTypes?.length > 0) {
          result.specialCases.hijabTypes.forEach((type) => {
            message += `• ${type}\n`;
          });
        }
        message += '\n';
      }

      message += `👥 توزيع الورثة\n`;
      message += `───────────────────────────────────────\n`;

      result.shares.forEach((share) => {
        const fraction = share.fraction
          ? `${share.fraction.numerator}/${share.fraction.denominator}`
          : 'غير متوفر';
        const amount = share.amount ? `${currencySymbol}${share.amount.toFixed(2)}` : 'غير متوفر';

        message += `• ${share.name}: ${amount} (${fraction})\n`;
      });

      if (config.includeSteps && result.steps?.length > 0) {
        message += `\n📝 خطوات الحساب\n`;
        message += `───────────────────────────────────────\n`;
        result.steps.slice(0, 5).forEach((step, index) => {
          message += `${index + 1}. ${step.title}\n`;
        });
        if (result.steps.length > 5) {
          message += `... و ${result.steps.length - 5} خطوات أخرى\n`;
        }
        message += '\n';
      }
    }

    return message;
  }

  /**
   * Generate deep link for calculation
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @param baseUrl - Base URL for deep links
   * @returns Deep link URL
   */
  private static generateDeepLink(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    baseUrl?: string
  ): string {
    const base = baseUrl || 'https://merath.app/calculation';

    // Encode calculation parameters
    const params = new URLSearchParams({
      madhab: result.madhab,
      total: estate.total.toString(),
      funeral: estate.funeral.toString(),
      debts: estate.debts.toString(),
      will: estate.will.toString(),
      heirs: JSON.stringify(heirs),
    });

    return `${base}?${params.toString()}`;
  }

  /**
   * Generate shareable text for specific platform
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @param method - Share method
   * @param config - Share configuration
   * @returns Platform-specific share content
   */
  public static generatePlatformShare(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    method: ShareMethod,
    config: ShareConfig = {}
  ): ShareContent {
    const baseContent = this.generateShareContent(estate, heirs, result, config);

    switch (method) {
      case 'email':
        return {
          title: baseContent.emailSubject || baseContent.title,
          message: baseContent.message,
          emailSubject: baseContent.emailSubject,
        };

      case 'whatsapp':
      case 'telegram':
        // These platforms prefer shorter messages
        const shortConfig = { ...config, detailLevel: 'summary' as const };
        const shortContent = this.generateShareContent(estate, heirs, result, shortConfig);
        return {
          title: shortContent.title,
          message: shortContent.message,
          url: shortContent.url,
        };

      case 'link':
        return {
          title: baseContent.title,
          message: baseContent.url || baseContent.message,
          url: baseContent.url,
        };

      default:
        return baseContent;
    }
  }

  /**
   * Generate QR code data for calculation (URL format)
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @param baseUrl - Base URL for deep links
   * @returns QR code data URL
   */
  public static generateQRCodeData(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    baseUrl?: string
  ): string {
    return this.generateDeepLink(estate, heirs, result, baseUrl);
  }

  /**
   * Validate share configuration
   *
   * @param config - Share configuration to validate
   * @returns Validated configuration
   */
  public static validateConfig(config: ShareConfig = {}): ShareConfig {
    const defaults: ShareConfig = {
      detailLevel: 'summary',
      includeSteps: false,
      language: 'en',
    };

    return {
      ...defaults,
      ...config,
      detailLevel: config.detailLevel || defaults.detailLevel,
    };
  }

  /**
   * Generate share preview (short summary)
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @param language - Language for preview
   * @returns Short preview string
   */
  public static generatePreview(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult,
    language: 'en' | 'ar' = 'en'
  ): string {
    const isArabic = language === 'ar';
    const currencySymbol = isArabic ? 'ر.س' : '$';

    if (isArabic) {
      return `حساب مواريث (${MADHAB_NAMES[result.madhab]}) - ${currencySymbol}${estate.total.toLocaleString()}`;
    }

    return `Inheritance Calculation (${MADHAB_NAMES[result.madhab]}) - ${currencySymbol}${estate.total.toLocaleString()}`;
  }
}

/**
 * Convenience function to share calculation
 *
 * @param estate - Estate input
 * @param heirs - Heirs array
 * @param result - Calculation result
 * @param method - Share method
 * @param config - Share configuration
 * @returns Share content
 */
export function shareCalculation(
  estate: EstateInput,
  heirs: HeirEntry[],
  result: CalculationResult,
  method: ShareMethod = 'text',
  config: ShareConfig = {}
): ShareContent {
  const validatedConfig = CalculationShare.validateConfig(config);
  return CalculationShare.generatePlatformShare(estate, heirs, result, method, validatedConfig);
}
