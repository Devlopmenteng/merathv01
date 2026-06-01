import { showAlert } from './alerts';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  // Simple Alert for now; can be replaced with a proper toast library later
  // For non‑critical warnings, we use the centralized alert helper.
  if (type === 'warning') {
    showAlert('⚠️ تنبيه', message);
  } else if (type === 'error') {
    showAlert('❌ خطأ', message);
  } else if (type === 'success') {
    showAlert('✅ نجاح', message);
  } else {
    console.log(`[${type.toUpperCase()}] ${message} (displayed for ${duration}ms)`);
  }
};
