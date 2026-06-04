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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useLanguage } from '../lib/context/LanguageContext';
import { t } from '../lib/i18n';
import { showAlert } from '../lib/utils/alerts';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'ur', label: 'اردو' },
];

type SettingsNavigation = {
  navigate: (screen: string) => void;
};

export const Settings = ({ navigation }: { navigation: SettingsNavigation }) => {
  const { isDark, toggleTheme } = useTheme();
  const theme = useAppTheme();
  const { locale, changeLocale } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const appVersion = '1.0.0';

  const changeLanguage = useCallback(
    async (langCode: string) => {
      if (langCode === locale) {
        setLanguageModalVisible(false);
        return;
      }
      const needsReload = await changeLocale(langCode);
      if (needsReload) {
        showAlert(t('language_changed'), t('restart_required'));
      }
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
      >
        <Text style={theme.typography.body}>{t('language__')}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.primary }]}>
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
            backgroundColor: 'rgba(0,0,0,0.5)',
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
            <Text style={[theme.typography.h3, { marginBottom: theme.spacing.md }]}>{t('select_language')}</Text>
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
              >
                <Text style={theme.typography.body}>{lang.label}</Text>
                {locale === lang.code && <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>✓</Text>}
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
        paddingBottom: theme.spacing.xxl,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ marginBottom: theme.spacing.md }}
      >
        <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('back_to_home')}</Text>
      </TouchableOpacity>
      <Text style={theme.typography.h1}>{t('settings')}</Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={theme.typography.body}>{t('dark_mode')}</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <Text style={[theme.typography.body, { marginBottom: theme.spacing.sm }]}>{t('language__')}</Text>
        {LanguageDropdown()}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={() => navigation.navigate('Glossary')}
      >
        <Text style={theme.typography.body}>{t('glossary_and_education')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>→</Text>
      </TouchableOpacity>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <Text style={[theme.typography.h3, { marginBottom: theme.spacing.sm }]}>{t('about')}</Text>
        <Text style={theme.typography.body}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
        <Text style={[theme.typography.caption, { marginTop: theme.spacing.xs }]}>
          {t('built_with_expo__typescript')}
        </Text>
        <Text style={[theme.typography.caption, { marginTop: theme.spacing.xs }]}>
          {t('version')} {appVersion}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <TouchableOpacity
          style={{
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}
          onPress={handleRateUs}
        >
          <Text style={theme.typography.body}>{t('rate_us_send_feedback')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: theme.spacing.sm }} onPress={handleEmailFeedback}>
          <Text style={theme.typography.body}>{t('feedback_title')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={handlePrivacyPolicy}
      >
        <Text style={theme.typography.body}>{t('privacy_policy')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={handleClearCache}
      >
        <Text style={[theme.typography.body, { color: theme.colors.error }]}>
          {t('clear_cache_reset')}
        </Text>
        <Text style={{ fontSize: 18, color: theme.colors.error }}>🗑️</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...theme.elevation.small,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={handleLegalNotices}
      >
        <Text style={theme.typography.body}>{t('legal_notices')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>⚖️</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
