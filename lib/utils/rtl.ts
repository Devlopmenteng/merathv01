import { I18nManager } from 'react-native';

export const backArrow = (): string => (I18nManager.isRTL ? '→' : '←');
export const forwardArrow = (): string => (I18nManager.isRTL ? '←' : '→');
