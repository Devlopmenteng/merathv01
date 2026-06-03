/**
 * Centralized alert utilities for consistent UI notifications
 * Supports i18n for alert titles and messages
 */

import { Alert, AlertButton } from 'react-native';
import { t } from '../i18n';

interface AlertOptions {
  buttons?: AlertButton[];
  cancelable?: boolean;
}

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  CALCULATION = 'calculation',
  NETWORK = 'network',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

/**
 * Enhanced error information with suggestions
 */
interface ErrorInfo {
  message: string;
  category: ErrorCategory;
  suggestion?: string;
  details?: string;
}

/**
 * Get user-friendly error message with suggestion
 */
function getErrorInfo(error: Error | string): ErrorInfo {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Common error patterns
  if (errorMessage.toLowerCase().includes('cannot have both')) {
    return {
      message: t('heirs_conflict_error'),
      category: ErrorCategory.VALIDATION,
      suggestion: t('remove_one_spouse_suggestion'),
    };
  }
  
  if (errorMessage.toLowerCase().includes('exceeds')) {
    return {
      message: t('limit_exceeded_error'),
      category: ErrorCategory.VALIDATION,
      suggestion: t('reduce_count_suggestion'),
    };
  }
  
  if (errorMessage.toLowerCase().includes('calculation failed')) {
    return {
      message: t('calculation_error'),
      category: ErrorCategory.CALCULATION,
      suggestion: t('check_inputs_suggestion'),
    };
  }
  
  if (errorMessage.toLowerCase().includes('storage') || errorMessage.toLowerCase().includes('async')) {
    return {
      message: t('storage_error'),
      category: ErrorCategory.STORAGE,
      suggestion: t('check_storage_suggestion'),
    };
  }
  
  return {
    message: errorMessage,
    category: ErrorCategory.UNKNOWN,
    suggestion: t('contact_support_suggestion'),
  };
}

/**
 * Show alert with i18n support
 * @param titleKey - i18n key for title
 * @param messageKey - i18n key for message
 * @param options - Alert options (buttons, cancelable, etc)
 */
export const showAlert = (titleKey: string, messageKey: string, options?: AlertOptions): void => {
  Alert.alert(t(titleKey), t(messageKey), options?.buttons, {
    cancelable: options?.cancelable ?? false,
  });
};

/**
 * Show confirmation dialog
 * @param titleKey - i18n key for title
 * @param messageKey - i18n key for message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Optional callback when cancelled
 */
export const showConfirm = (
  titleKey: string,
  messageKey: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(t(titleKey), t(messageKey), [
    {
      text: t('cancel'),
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: t('confirm'),
      onPress: onConfirm,
      style: 'default',
    },
  ]);
};

/**
 * Show error alert with enhanced context and suggestions
 * @param error - Error object or message
 * @param details - Optional error details
 */
export const showError = (error: Error | string, details?: string): void => {
  const errorInfo = getErrorInfo(error);
  const message = errorInfo.suggestion 
    ? `${errorInfo.message}\n\n${errorInfo.suggestion}`
    : errorInfo.message;
    
  const fullMessage = details ? `${message}\n\n${details}` : message;
  
  Alert.alert(t('error'), fullMessage, [{ text: t('ok'), style: 'default' }]);
};

/**
 * Show calculation-specific error
 * @param error - Calculation error
 * @param context - Context about what was being calculated
 */
export const showCalculationError = (error: Error | string, context?: string): void => {
  const errorInfo = getErrorInfo(error);
  const contextText = context ? `${context}\n\n` : '';
  
  Alert.alert(
    t('calculation_error'),
    `${contextText}${errorInfo.message}${errorInfo.suggestion ? `\n\n${errorInfo.suggestion}` : ''}`,
    [
      { text: t('ok'), style: 'default' },
      { text: t('retry'), onPress: () => {/* Retry logic can be added here */ } },
    ]
  );
};

/**
 * Show success alert
 * @param titleKey - i18n key for title
 * @param messageKey - i18n key for message
 */
export const showSuccess = (titleKey: string, messageKey: string): void => {
  Alert.alert(t(titleKey), t(messageKey), [{ text: t('ok'), style: 'default' }]);
};

/**
 * Show validation error
 * @param fieldName - Name of field with validation error
 * @param errorMessageKey - i18n key for error message
 * @param suggestion - Optional suggestion for fixing the error
 */
export const showValidationError = (
  fieldName: string, 
  errorMessageKey: string,
  suggestion?: string
): void => {
  const message = suggestion 
    ? `${fieldName}: ${t(errorMessageKey)}\n\n${t(suggestion)}`
    : `${fieldName}: ${t(errorMessageKey)}`;
    
  Alert.alert(t('validation_error'), message);
};
