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
    SCREEN_TRANSITION: 300,
    SKELETON_PULSE: 1000,
    NUMBER_ANIMATION: 1000,
  },

  // Chart display
  CHART_SIZE: 200,
  MIN_SLICE_ANGLE_FOR_LABEL: 15,

  // UI spacing values (already in theme, but defined here for reference)
  TOOLTIP_DELAY: 500,
  MODAL_ANIMATION: 'fade' as const,

  // Validation constraints
  WILL_MAX_FRACTION: 1 / 3, // Will cannot exceed 1/3 of net estate
  MIN_ESTATE_VALUE: 0,
  MAX_AUDIT_DISPLAY: 3, // Show first 3 heirs in history, then "..."

  // Error handling
  ASYNC_ERROR_THRESHOLD: 5000, // ms before considering operation failed
};

export type MadhhabDefault = typeof APP_DEFAULTS.DEFAULT_MADHAB;
