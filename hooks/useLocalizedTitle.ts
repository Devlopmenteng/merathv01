import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../lib/context/LanguageContext';
import { t } from '../lib/i18n';

export function useLocalizedTitle(translationKey: string) {
  const { locale } = useLanguage();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t(translationKey) });
  }, [navigation, translationKey, locale]);
}
