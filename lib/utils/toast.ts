import { showAlert } from './alerts';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { t } from '../i18n';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = APP_DEFAULTS.TOAST_DURATION
) => {
  // Simple Alert for now; can be replaced with a proper toast library later
  // For non‑critical warnings, we use the centralized alert helper.
  if (type === 'warning') {
    showAlert(t('warning'), message);
  } else if (type === 'error') {
    showAlert(t('error'), message);
  } else if (type === 'success') {
    showAlert(t('success'), message);
  }
};
