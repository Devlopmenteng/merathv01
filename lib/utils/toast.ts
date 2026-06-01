import { Alert } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  // Simple Alert for now; can be replaced with a proper toast library later
  // For non‑critical warnings, we use Alert.alert with a short title.
  if (type === 'warning') {
    Alert.alert('⚠️ تنبيه', message);
  } else if (type === 'error') {
    Alert.alert('❌ خطأ', message);
  } else if (type === 'success') {
    Alert.alert('✅ نجاح', message);
  } else {
    console.log(`[${type.toUpperCase()}] ${message} (displayed for ${duration}ms)`);
  }
};
