/**
 * Data Export Service
 * خدمة تصدير البيانات
 *
 * This module provides comprehensive data export functionality for GDPR compliance,
 * including user preferences, calculation history, and other user data.
 *
 * @module lib/services/DataExportService
 */

import { ConsentService } from './ConsentService';
import { getAuditTrail } from './AuditTrailService';
import { SecurityAuditService, SecurityEventType, SecuritySeverity } from './SecurityAuditService';

/**
 * Export format types
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
}

/**
 * Data export result
 */
export interface DataExportResult {
  format: ExportFormat;
  data: string;
  fileName: string;
  exportDate: string;
  dataSize: number;
  recordCount: number;
}

/**
 * User data package for export
 */
export interface UserDataPackage {
  metadata: {
    exportDate: string;
    exportVersion: string;
    userDataRights: string[];
  };
  consent: {
    preferences: unknown;
    consentHistory: unknown[];
  };
  appData: {
    auditTrail: unknown[];
    preferences: unknown;
  };
  security: {
    securityEvents: unknown[];
    lastLogin?: string;
  };
}

/**
 * Data Export Service
 * Provides comprehensive data export for GDPR compliance
 */
class DataExportServiceClass {
  private readonly EXPORT_VERSION = '1.0.0';

  /**
   * Export all user data in JSON format
   */
  async exportAllData(format: ExportFormat = ExportFormat.JSON): Promise<DataExportResult> {
    try {
      // Check if user has consented to data processing
      const processingConsent = await ConsentService.getConsent('data_processing' as any);

      if (processingConsent !== 'granted') {
        throw new Error('User has not consented to data processing');
      }

      // Collect all user data
      const userData = await this.collectUserData();

      // Convert to requested format
      let exportData: string;
      let fileName: string;

      switch (format) {
        case ExportFormat.JSON:
          exportData = JSON.stringify(userData, null, 2);
          fileName = `user_data_export_${Date.now()}.json`;
          break;
        case ExportFormat.CSV:
          exportData = this.convertToCSV(userData);
          fileName = `user_data_export_${Date.now()}.csv`;
          break;
        default:
          exportData = JSON.stringify(userData, null, 2);
          fileName = `user_data_export_${Date.now()}.json`;
      }

      // Log data export
      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_EXPORT,
        'Complete user data export performed',
        SecuritySeverity.INFO,
        { format, recordCount: this.countRecords(userData) }
      );

      return {
        format,
        data: exportData,
        fileName,
        exportDate: new Date().toISOString(),
        dataSize: exportData.length,
        recordCount: this.countRecords(userData),
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Export only calculation history
   */
  async exportCalculationHistory(): Promise<DataExportResult> {
    try {
      const auditTrail = await getAuditTrail();

      const exportData = JSON.stringify(auditTrail, null, 2);
      const fileName = `calculation_history_export_${Date.now()}.json`;

      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_EXPORT,
        'Calculation history export performed',
        SecuritySeverity.INFO,
        { recordCount: auditTrail.length }
      );

      return {
        format: ExportFormat.JSON,
        data: exportData,
        fileName,
        exportDate: new Date().toISOString(),
        dataSize: exportData.length,
        recordCount: auditTrail.length,
      };
    } catch (error) {
      console.error('Error exporting calculation history:', error);
      throw new Error('Failed to export calculation history');
    }
  }

  /**
   * Delete all user data (GDPR right to be forgotten)
   */
  async deleteAllUserData(): Promise<void> {
    try {
      // Verify user consent
      const preferences = await ConsentService.getPreferences();

      // Delete all user data
      await ConsentService.deleteAllUserData();

      // Log the deletion
      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_DELETE,
        'All user data deleted (GDPR right to be forgotten)',
        SecuritySeverity.CRITICAL,
        { consentVersion: preferences.consentVersion }
      );
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  /**
   * Get data deletion summary before deletion
   */
  async getDeletionSummary(): Promise<{
    calculationHistoryCount: number;
    preferencesCount: number;
    securityEventsCount: number;
    totalDataSize: number;
  }> {
    try {
      const auditTrail = await getAuditTrail();
      const preferences = await ConsentService.getPreferences();
      const securityEvents = await SecurityAuditService.getEvents({ limit: 100 });

      const totalDataSize =
        JSON.stringify(auditTrail).length +
        JSON.stringify(preferences).length +
        JSON.stringify(securityEvents).length;

      return {
        calculationHistoryCount: auditTrail.length,
        preferencesCount: 1,
        securityEventsCount: securityEvents.length,
        totalDataSize,
      };
    } catch (error) {
      console.error('Error getting deletion summary:', error);
      throw new Error('Failed to get deletion summary');
    }
  }

  /**
   * Collect all user data into a structured package
   */
  private async collectUserData(): Promise<UserDataPackage> {
    const auditTrail = await getAuditTrail();
    const consentPreferences = await ConsentService.getPreferences();
    const securityEvents = await SecurityAuditService.getEvents({ limit: 50 });

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        exportVersion: this.EXPORT_VERSION,
        userDataRights: [
          'right_to_access',
          'right_to_rectification',
          'right_to_erasure',
          'right_to_restrict_processing',
          'right_to_data_portability',
          'right_to_object',
          'right_withdraw_consent',
        ],
      },
      consent: {
        preferences: consentPreferences,
        consentHistory: [], // Could be extended to track consent changes
      },
      appData: {
        auditTrail,
        preferences: consentPreferences,
      },
      security: {
        securityEvents,
      },
    };
  }

  /**
   * Convert user data to CSV format
   */
  private convertToCSV(data: UserDataPackage): string {
    const lines: string[] = [];

    // Add metadata
    lines.push('METADATA');
    lines.push('Field,Value');
    lines.push(`Export Date,${data.metadata.exportDate}`);
    lines.push(`Export Version,${data.metadata.exportVersion}`);
    lines.push('');

    // Add consent data
    lines.push('CONSENT');
    lines.push('Field,Value');
    const consentPrefs = data.consent.preferences as Record<string, unknown>;
    lines.push(`Analytics Enabled,${consentPrefs.analyticsEnabled}`);
    lines.push(`Personalization Enabled,${consentPrefs.personalizationEnabled}`);
    lines.push(`Marketing Enabled,${consentPrefs.marketingEnabled}`);
    lines.push('');

    // Add calculation history summary
    lines.push('CALCULATION HISTORY');
    lines.push('Total Records,' + data.appData.auditTrail.length);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Count total records in user data package
   */
  private countRecords(data: UserDataPackage): number {
    return (
      data.appData.auditTrail.length + data.security.securityEvents.length + 1 // preferences
    );
  }
}

// Export singleton instance
export const DataExportService = new DataExportServiceClass();
