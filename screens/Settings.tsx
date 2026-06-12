import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
  Alert,
  I18nManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
import { useLanguage } from '../lib/context/LanguageContext';
import { t } from '../lib/i18n';
import { backArrow, forwardArrow } from '../lib/utils/rtl';
import { showAlert } from '../lib/utils/alerts';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'ur', label: 'اردو' },
];

const getLanguageLabel = (lang: { code: string; label: string }) => {
  if (lang.code === 'en') return t('language_english');
  if (lang.code === 'ms') return t('language_malay');
  return lang.label;
};

type SettingsNavigation = {
  navigate: (screen: string) => void;
};

export const Settings = ({ navigation }: { navigation: SettingsNavigation }) => {
  const { isDark, toggleTheme } = useTheme();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { locale, changeLocale } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const appVersion = '1.0.0';

  const changeLanguage = useCallback(
    async (langCode: string) => {
      if (langCode === locale) {
        setLanguageModalVisible(false);
        return;
      }
      await changeLocale(langCode);
      setLanguageModalVisible(false);
    },
    [changeLocale, locale]
  );

  const handleEmailFeedback = () => {
    Linking.openURL('mailto:smartengineer3000@gmail.com?subject=Merath App Feedback');
  };

  const handleRateUs = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=your.app.id');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://your-privacy-policy-url.com');
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clear_cache'),
      t('clear_cache_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              showAlert(t('success'), t('cache_cleared_restart'));
            } catch {
              showAlert(t('error'), t('clear_cache_failed'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLegalNotices = () => {
    Alert.alert(t('legal_notices'), t('legal_notices_text'), [{ text: t('close') }], {
      cancelable: true,
    });
  };

  const LanguageDropdown = () => (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={() => setLanguageModalVisible(true)}
        accessibilityLabel={t('language__')}
        accessibilityHint={t('a11y_current_language', {
          language: getLanguageLabel(LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0]),
        })}
        accessibilityRole="button"
      >
        <Text
          style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
        >
          {t('language__')}
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.primary, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {LANGUAGES.find((l) => l.code === locale)?.label || locale}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.backdrop,
          }}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.borderRadius.xl,
              borderTopRightRadius: theme.borderRadius.xl,
              padding: theme.spacing.lg,
              ...theme.elevation.large,
            }}
          >
            <Text
              style={[
                theme.typography.h3,
                {
                  marginBottom: theme.spacing.md,
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('select_language')}
            </Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outline,
                }}
                onPress={() => changeLanguage(lang.code)}
                accessibilityLabel={getLanguageLabel(lang)}
                accessibilityHint={t('a11y_select_language', { language: getLanguageLabel(lang) })}
                accessibilityRole="button"
                accessibilityState={{ selected: locale === lang.code }}
              >
                <Text
                  style={[
                    theme.typography.body,
                    { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                  ]}
                >
                  {getLanguageLabel(lang)}
                </Text>
                {locale === lang.code && (
                  <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                marginTop: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                alignItems: 'center',
                ...theme.elevation.small,
              }}
              onPress={() => setLanguageModalVisible(false)}
              accessibilityLabel={t('cancel')}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '600' }}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl + insets.bottom,
        paddingTop: insets.top + theme.spacing.lg,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ marginBottom: theme.spacing.md }}
        accessibilityLabel={t('back_to_home')}
        accessibilityRole="button"
      >
        <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
          {backArrow()} {t('back_to_home')}
        </Text>
      </TouchableOpacity>
      <Text style={theme.typography.h1}>{t('settings')}</Text>

      <Card variant="outlined">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t('dark_mode')}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            accessibilityLabel={t('dark_mode')}
            accessibilityHint={isDark ? t('a11y_dark_mode_enabled') : t('a11y_dark_mode_disabled')}
            accessibilityRole="switch"
            accessibilityState={{ selected: isDark }}
          />
        </View>
      </Card>

      <Card variant="outlined">
        <Text style={[theme.typography.body, { marginBottom: theme.spacing.sm }]}>
          {t('language__')}
        </Text>
        {LanguageDropdown()}
      </Card>

      <Card
        variant="outlined"
        onPress={() => navigation.navigate('Glossary')}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text style={theme.typography.body}>{t('glossary_and_education')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>{forwardArrow()}</Text>
      </Card>

      <Card variant="outlined">
        <Text style={[theme.typography.h3, { marginBottom: theme.spacing.sm }]}>{t('about')}</Text>
        <Text style={theme.typography.body}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
        <Text style={[theme.typography.caption, { marginTop: theme.spacing.xs }]}>
          {t('built_with_expo__typescript')}
        </Text>
        <Text style={[theme.typography.caption, { marginTop: theme.spacing.xs }]}>
          {t('version')} {appVersion}
        </Text>
      </Card>

      <Card variant="outlined">
        <TouchableOpacity
          style={{
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}
          onPress={handleRateUs}
          accessibilityLabel={t('rate_us_send_feedback')}
          accessibilityHint={t('a11y_rate_us')}
          accessibilityRole="button"
        >
          <Text style={theme.typography.body}>{t('rate_us_send_feedback')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingVertical: theme.spacing.sm }}
          onPress={handleEmailFeedback}
          accessibilityLabel={t('feedback_title')}
          accessibilityHint={t('a11y_send_feedback')}
          accessibilityRole="button"
        >
          <Text style={theme.typography.body}>{t('feedback_title')}</Text>
        </TouchableOpacity>
      </Card>

      <Card
        variant="outlined"
        onPress={handlePrivacyPolicy}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text style={theme.typography.body}>{t('privacy_policy')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>{forwardArrow()}</Text>
      </Card>

      <Card
        variant="outlined"
        onPress={handleClearCache}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {t('clear_cache_reset')}
        </Text>
        <Text style={{ fontSize: 18, color: theme.colors.error }}>🗑️</Text>
      </Card>

      <Card
        variant="outlined"
        onPress={handleLegalNotices}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text style={theme.typography.body}>{t('legal_notices')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>⚖️</Text>
      </Card>
    </ScrollView>
  );
};
