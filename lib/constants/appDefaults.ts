/**
 * Application-wide default constants
 * Centralized configuration for app behavior, limits, and storage keys
 */

export const APP_DEFAULTS = {
  // Heir validation limits
  MAX_WIVES: 4,
  MAX_HUSBANDS: 1,
  MAX_SINGLE_HEIRS: 1, // father, mother, grandfather
  MAX_HEIR_COUNT: 20,

  // Audit trail
  MAX_AUDIT_ENTRIES: 50,

  // Storage keys
  STORAGE_KEYS: {
    AUDIT_TRAIL: 'merath_audit_trail',
    PREMIUM: 'merath_premium',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE_PREFERENCE: 'language_preference',
    TUTORIAL_SEEN: 'merath_tutorial_seen',
    TOOLTIP_SEEN: 'merath_tooltip_seen',
    HISTORY: 'merath_history',
    CALC_COUNT: 'merath_calc_count',
  },

  // Default values
  DEFAULT_MADHAB: 'hanafi' as const,
  DEFAULT_LOCALE: 'en',

  // Animation durations (ms)
  ANIMATION_DURATION: {
    FAST: 150, // Button presses, micro-interactions
    NORMAL: 300, // Screen transitions
    SLOW: 500, // Complex animations
    SCREEN_TRANSITION: 300,
    SKELETON_PULSE: 1000,
    SKELETON_SHIMMER: 800,
    NUMBER_ANIMATION: 1000,
  },
  TOAST_DURATION: 3000,

  // Chart display
  CHART_SIZE: 250,
  MIN_SLICE_ANGLE_FOR_LABEL: 15,

  // UI spacing values (already in theme, but defined here for reference)
  TOOLTIP_DELAY: 500,
  MODAL_ANIMATION: 'fade' as const,

  // Validation constraints
  WILL_MAX_FRACTION: 1 / 3, // Will cannot exceed 1/3 of net estate
  MIN_ESTATE_VALUE: 0,
  MAX_AUDIT_DISPLAY: 3, // Show first 3 heirs in history, then "..."

  // Validation limits
  MAX_ESTATE_VALUE: 999999999999, // Maximum estate value (1 trillion)
  MAX_DECIMAL_PLACES: 2, // For monetary values
  MAX_TEXT_LENGTH: 100, // For name fields
  ALLOWED_NUMBER_REGEX: /^[0-9]*\.?[0-9]*$/, // Only numbers and decimal point

  // Error handling
  ASYNC_ERROR_THRESHOLD: 5000, // ms before considering operation failed
};

export type MadhhabDefault = typeof APP_DEFAULTS.DEFAULT_MADHAB;
