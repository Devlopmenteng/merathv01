/**
 * RTL Hook
 * خطاف اتجاه اليمين واليمين
 *
 * This hook provides RTL-aware styling utilities based on the current locale.
 *
 * @module hooks/useRTL
 */

import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import { useLanguage } from '../lib/context/LanguageContext';

export function useRTL() {
  const { isRTL: isRTLContext } = useLanguage();

  // Prefer context, but fallback to I18nManager
  const isRTL = isRTLContext !== undefined ? isRTLContext : I18nManager.isRTL;

  const styles = useMemo(
    () => ({
      rowDirection: isRTL ? 'row-reverse' : 'row',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      textAlign: isRTL ? ('right' as const) : ('left' as const),
      flexStart: isRTL ? ('flex-end' as const) : ('flex-start' as const),
      flexEnd: isRTL ? ('flex-start' as const) : ('flex-end' as const),
      marginLeft: isRTL ? ('marginRight' as const) : ('marginLeft' as const),
      marginRight: isRTL ? ('marginLeft' as const) : ('marginRight' as const),
      paddingLeft: isRTL ? ('paddingRight' as const) : ('paddingLeft' as const),
      paddingRight: isRTL ? ('paddingLeft' as const) : ('paddingRight' as const),
      borderLeftWidth: isRTL ? ('borderRightWidth' as const) : ('borderLeftWidth' as const),
      borderRightWidth: isRTL ? ('borderLeftWidth' as const) : ('borderRightWidth' as const),
    }),
    [isRTL]
  );

  return {
    isRTL,
    ...styles,
  };
}
