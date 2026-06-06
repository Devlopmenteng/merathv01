export { t } from './i18n';
export { APP_DEFAULTS } from './constants/appDefaults';
export { lightTheme, darkTheme } from './constants/theme';
export { useAppTheme } from '../hooks/useAppTheme';
export { useResponsive } from '../hooks/useResponsive';
export { useCalc } from './context/CalcContext';
export { usePremium } from './context/PremiumContext';
export { useTheme } from './context/ThemeContext';
export { useLanguage } from './context/LanguageContext';
export { formatCurrency } from './utils/currency';
export {
  validateEstateInput,
  validateHeirCount,
  validateHeirsConfig,
  sanitizeInput,
} from './utils/validation';
export { showAlert, showConfirm, showError } from './utils/alerts';
export { saveAuditTrail, getAuditTrail, clearAuditTrail } from './services/AuditTrailService';
export { logger } from './utils/logger';
export {
  calculateInheritance,
  calculateInheritanceWithCache,
} from './inheritance/calculateAdapter';
export {
  InheritanceCalculationError,
  EstateValidationError,
  HeirsValidationError,
} from './engine/errors';
export type {
  EstateData,
  EstateInput,
  HeirsData,
  HeirEntry,
  HeirType,
  HeirShare,
  HeirShareBase,
  EngineHeirShare,
  UIHeirShare,
  ReportHeirShare,
  HeirShareObject,
  Madhab,
  CalculationResult,
  CalculationStep,
  StepType,
  SpecialCases,
} from './engine/types';
