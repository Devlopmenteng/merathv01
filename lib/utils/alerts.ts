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
 * Show error alert
 * @param errorMessage - Error message or key
 * @param details - Optional error details
 */
export const showError = (errorMessage: string, details?: string): void => {
  const message = details ? `${errorMessage}\n\n${details}` : errorMessage;
  Alert.alert(t('error'), message, [{ text: t('ok'), style: 'destructive' }]);
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
 */
export const showValidationError = (fieldName: string, errorMessageKey: string): void => {
  Alert.alert(t('validation_error'), `${fieldName}: ${t(errorMessageKey)}`);
};
