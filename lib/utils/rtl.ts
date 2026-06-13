import { I18nManager } from 'react-native';

export const backArrow = (): string => (I18nManager.isRTL ? '→' : '←');
export const forwardArrow = (): string => (I18nManager.isRTL ? '←' : '→');

/**
 * Get row direction based on RTL setting
 * Returns 'row-reverse' in RTL, 'row' in LTR
 */
export const getRowDirection = (): 'row' | 'row-reverse' =>
  I18nManager.isRTL ? 'row-reverse' : 'row';

/**
 * Get flex direction based on RTL setting
 */
export const getFlexStart = (): 'flex-start' | 'flex-end' =>
  I18nManager.isRTL ? 'flex-end' : 'flex-start';

/**
 * Get flex end based on RTL setting
 */
export const getFlexEnd = (): 'flex-start' | 'flex-end' =>
  I18nManager.isRTL ? 'flex-start' : 'flex-end';

/**
 * Get text align based on RTL setting
 */
export const getTextAlign = (): 'left' | 'right' => (I18nManager.isRTL ? 'right' : 'left');

/**
 * Check if current layout is RTL
 */
export const isRTL = (): boolean => I18nManager.isRTL;
