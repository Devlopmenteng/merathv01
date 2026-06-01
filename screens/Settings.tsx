import { Button } from "../components/ui/Button";
import { usePremium } from '../lib/context/PremiumContext';
import { getCalculationCount } from '../lib/services/UsageStats';
import { useState, useEffect, useCallback } from 'react';
import { SupportButton } from '../components/SupportButton';
import { FeedbackButton } from '../components/FeedbackButton';
import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../lib/context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useLanguage } from '../lib/context/LanguageContext';
import { t } from '../lib/i18n';
import { showAlert } from '../lib/utils/alerts';

type SettingsNavigation = {
  navigate: (screen: string) => void;
};

export const Settings = ({ navigation }: { navigation: SettingsNavigation }) => {
  const { isPremium, togglePremium } = usePremium();
  const [calcCount, setCalcCount] = useState(0);
  const { locale, changeLocale } = useLanguage();
  
  useEffect(() => { getCalculationCount().then(setCalcCount); }, []);
  const { isDark, toggleTheme } = useTheme();
  const theme = useAppTheme();

  const changeLanguage = useCallback(async (lang: string) => {
    if (lang === locale) return;
    const needsReload = await changeLocale(lang);
    if (needsReload) {
      showAlert(t('language_changed'), t('restart_required'));
    }
  }, [changeLocale, locale]);

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
      <Text style={theme.typography.h1}>{t('settings')}</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 }}>
        <Text style={theme.typography.body}>{t('dark_mode')}</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
        <Text style={theme.typography.body}>{t('language__')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={{
              padding: 8,
              backgroundColor: locale === 'en' ? theme.colors.primary : theme.colors.surfaceVariant,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: locale === 'en' ? theme.colors.onPrimary : theme.colors.onSurface }}>
              {t('english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('ar')}
            style={{
              padding: 8,
              backgroundColor: locale === 'ar' ? theme.colors.primary : theme.colors.surfaceVariant,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: locale === 'ar' ? theme.colors.onPrimary : theme.colors.onSurface }}>
              {t('arabic')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={theme.typography.h2}>{t('about')}</Text>
      <Text style={theme.typography.body}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
      <Text style={theme.typography.caption}>{t('built_with_expo__typescript')}</Text>
      
      <FeedbackButton />
      <SupportButton />
      
      <Button
        title={t('glossary')}
        onPress={() => navigation.navigate("Glossary")}
        mode="outlined"
        style={{ marginTop: theme.spacing.sm }}
      />
      
      <Text style={{ fontSize: 12, marginTop: 8 }}>
        {t('calculations_performed')}: {calcCount}
      </Text>
      
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 }}>
        <Text>{t('premium_unlock_legal_reports__fiqh_notes')}</Text>
        <Switch value={isPremium} onValueChange={togglePremium} />
      </View>
    </ScrollView>
  );
};