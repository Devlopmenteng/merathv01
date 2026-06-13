/**
 * User Consent Management Service
 * خدمة إدارة موافقة المستخدم
 *
 * This module provides user consent management for GDPR compliance,
 * including analytics consent, privacy consent, and data processing preferences.
 *
 * @module lib/services/ConsentService
 */

import { SecureStorageService, SECURE_STORAGE_KEYS } from './SecureStorageService';
import { SecurityAuditService, SecurityEventType, SecuritySeverity } from './SecurityAuditService';

/**
 * Consent types
 */
export enum ConsentType {
  ANALYTICS = 'analytics',
  PERSONALIZATION = 'personalization',
  MARKETING = 'marketing',
  DATA_PROCESSING = 'data_processing',
  BIOMETRIC_AUTH = 'biometric_auth',
}

/**
 * Consent status
 */
export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
}

/**
 * Consent record
 */
export interface ConsentRecord {
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt?: string;
  deniedAt?: string;
  version: string;
  metadata?: Record<string, unknown>;
}

/**
 * User consent preferences
 */
export interface UserConsentPreferences {
  analyticsEnabled: boolean;
  personalizationEnabled: boolean;
  marketingEnabled: boolean;
  dataProcessingEnabled: boolean;
  biometricAuthEnabled: boolean;
  consentVersion: string;
  lastUpdated: string;
}

/**
 * Default consent configuration
 */
const DEFAULT_CONSENT_VERSION = '1.0.0';
const PRIVACY_POLICY_VERSION = '1.0.0';

/**
 * User Consent Management Service
 * Manages user consent for GDPR compliance
 */
class ConsentServiceClass {
  private readonly STORAGE_KEY = SECURE_STORAGE_KEYS.PRIVACY_CONSENT;
  private currentVersion = DEFAULT_CONSENT_VERSION;

  /**
   * Get current consent status for a specific consent type
   */
  async getConsent(consentType: ConsentType): Promise<ConsentStatus> {
    try {
      const preferences = await this.getPreferences();
      
      switch (consentType) {
        case ConsentType.ANALYTICS:
          return preferences.analyticsEnabled ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
        case ConsentType.PERSONALIZATION:
          return preferences.personalizationEnabled ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
        case ConsentType.MARKETING:
          return preferences.marketingEnabled ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
        case ConsentType.DATA_PROCESSING:
          return preferences.dataProcessingEnabled ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
        case ConsentType.BIOMETRIC_AUTH:
          return preferences.biometricAuthEnabled ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
        default:
          return ConsentStatus.DENIED;
      }
    } catch (error) {
      console.error('Error getting consent status:', error);
      return ConsentStatus.DENIED;
    }
  }

  /**
   * Grant consent for a specific type
   */
  async grantConsent(consentType: ConsentType, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      const now = new Date().toISOString();

      switch (consentType) {
        case ConsentType.ANALYTICS:
          preferences.analyticsEnabled = true;
          break;
        case ConsentType.PERSONALIZATION:
          preferences.personalizationEnabled = true;
          break;
        case ConsentType.MARKETING:
          preferences.marketingEnabled = true;
          break;
        case ConsentType.DATA_PROCESSING:
          preferences.dataProcessingEnabled = true;
          break;
        case ConsentType.BIOMETRIC_AUTH:
          preferences.biometricAuthEnabled = true;
          break;
      }

      preferences.lastUpdated = now;
      
      await this.savePreferences(preferences);

      // Log consent grant
      await SecurityAuditService.logEvent(
        SecurityEventType.PRIVACY_CONSENT_CHANGE,
        `Consent granted for ${consentType}`,
        SecuritySeverity.INFO,
        { consentType, metadata }
      );
    } catch (error) {
      console.error('Error granting consent:', error);
      throw new Error('Failed to grant consent');
    }
  }

  /**
   * Revoke consent for a specific type
   */
  async revokeConsent(consentType: ConsentType, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      const now = new Date().toISOString();

      switch (consentType) {
        case ConsentType.ANALYTICS:
          preferences.analyticsEnabled = false;
          break;
        case ConsentType.PERSONALIZATION:
          preferences.personalizationEnabled = false;
          break;
        case ConsentType.MARKETING:
          preferences.marketingEnabled = false;
          break;
        case ConsentType.DATA_PROCESSING:
          preferences.dataProcessingEnabled = false;
          break;
        case ConsentType.BIOMETRIC_AUTH:
          preferences.biometricAuthEnabled = false;
          break;
      }

      preferences.lastUpdated = now;
      
      await this.savePreferences(preferences);

      // Log consent revocation
      await SecurityAuditService.logEvent(
        SecurityEventType.PRIVACY_CONSENT_CHANGE,
        `Consent revoked for ${consentType}`,
        SecuritySeverity.INFO,
        { consentType, metadata }
      );
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw new Error('Failed to revoke consent');
    }
  }

  /**
   * Get all user consent preferences
   */
  async getPreferences(): Promise<UserConsentPreferences> {
    try {
      const stored = await SecureStorageService.getItem<UserConsentPreferences>(this.STORAGE_KEY);
      
      if (stored) {
        // Check if consent version is up to date
        if (stored.consentVersion !== this.currentVersion) {
          // Version changed, require re-consent
          return this.getDefaultPreferences();
        }
        return stored;
      }

      return this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting consent preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update all consent preferences at once
   */
  async updatePreferences(preferences: Partial<UserConsentPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = {
        ...current,
        ...preferences,
        lastUpdated: new Date().toISOString(),
        consentVersion: this.currentVersion,
      };

      await this.savePreferences(updated);

      // Log preference update
      await SecurityAuditService.logEvent(
        SecurityEventType.PRIVACY_CONSENT_CHANGE,
        'Consent preferences updated',
        SecuritySeverity.INFO,
        { changes: preferences }
      );
    } catch (error) {
      console.error('Error updating consent preferences:', error);
      throw new Error('Failed to update consent preferences');
    }
  }

  /**
   * Check if consent is required (version changed or first time)
   */
  async isConsentRequired(): Promise<boolean> {
    try {
      const stored = await SecureStorageService.getItem<UserConsentPreferences>(this.STORAGE_KEY);
      return !stored || stored.consentVersion !== this.currentVersion;
    } catch {
      return true;
    }
  }

  /**
   * Reset all consent to default
   */
  async resetConsent(): Promise<void> {
    try {
      const defaultPreferences = this.getDefaultPreferences();
      await this.savePreferences(defaultPreferences);

      // Log consent reset
      await SecurityAuditService.logEvent(
        SecurityEventType.PRIVACY_CONSENT_CHANGE,
        'All consent reset to default',
        SecuritySeverity.WARNING
      );
    } catch (error) {
      console.error('Error resetting consent:', error);
      throw new Error('Failed to reset consent');
    }
  }

  /**
   * Get privacy policy information
   */
  getPrivacyPolicyInfo(): {
    version: string;
    effectiveDate: string;
    lastUpdated: string;
  } {
    return {
      version: PRIVACY_POLICY_VERSION,
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-01',
    };
  }

  /**
   * Export all user data (for GDPR data portability)
   */
  async exportUserData(): Promise<{
    consentPreferences: UserConsentPreferences;
    exportDate: string;
    dataVersion: string;
  }> {
    try {
      const preferences = await this.getPreferences();

      const exportData = {
        consentPreferences: preferences,
        exportDate: new Date().toISOString(),
        dataVersion: this.currentVersion,
      };

      // Log data export
      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_EXPORT,
        'User data exported for GDPR compliance',
        SecuritySeverity.INFO
      );

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Delete all user data (for GDPR right to be forgotten)
   */
  async deleteAllUserData(): Promise<void> {
    try {
      // Delete consent preferences
      await SecureStorageService.removeItem(this.STORAGE_KEY);

      // Log data deletion
      await SecurityAuditService.logEvent(
        SecurityEventType.DATA_DELETE,
        'All user data deleted per GDPR right to be forgotten',
        SecuritySeverity.CRITICAL
      );
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  /**
   * Get default consent preferences
   */
  private getDefaultPreferences(): UserConsentPreferences {
    return {
      analyticsEnabled: false,
      personalizationEnabled: false,
      marketingEnabled: false,
      dataProcessingEnabled: false,
      biometricAuthEnabled: false,
      consentVersion: this.currentVersion,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Save consent preferences to secure storage
   */
  private async savePreferences(preferences: UserConsentPreferences): Promise<void> {
    await SecureStorageService.setItem(this.STORAGE_KEY, preferences);
  }
}

// Export singleton instance
export const ConsentService = new ConsentServiceClass();