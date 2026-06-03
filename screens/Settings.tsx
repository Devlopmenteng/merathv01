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
            } catch (_error) {
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
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 12,
          marginBottom: 16,
        }}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Text style={theme.typography.body}>{t('language')}</Text>
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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text style={[theme.typography.h2, { marginBottom: 16 }]}>{t('select_language')}</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outline,
                }}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={theme.typography.body}>{lang.label}</Text>
                {locale === lang.code && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                marginTop: 20,
                paddingVertical: 12,
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
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
      <Text style={theme.typography.h1}>{t('settings')}</Text>

      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
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
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
        }}
      >
        <Text style={[theme.typography.body, { marginBottom: 12 }]}>{t('language')}</Text>
        {LanguageDropdown()}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('Glossary')}
      >
        <Text style={theme.typography.body}>{t('glossary_and_education')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>→</Text>
      </TouchableOpacity>

      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
        }}
      >
        <Text style={[theme.typography.h2, { marginBottom: 8 }]}>{t('about')}</Text>
        <Text style={theme.typography.body}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
        <Text style={[theme.typography.caption, { marginTop: 8 }]}>
          {t('built_with_expo__typescript')}
        </Text>
        <Text style={[theme.typography.caption, { marginTop: 4 }]}>
          {t('version')} {appVersion}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
        }}
      >
        <TouchableOpacity
          style={{
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}
          onPress={handleRateUs}
        >
          <Text style={theme.typography.body}>{t('rate_us')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12 }} onPress={handleEmailFeedback}>
          <Text style={theme.typography.body}>{t('send_feedback')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={handlePrivacyPolicy}
      >
        <Text style={theme.typography.body}>{t('privacy_policy')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={handleLegalNotices}
      >
        <Text style={theme.typography.body}>{t('legal_notices')}</Text>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>⚖️</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
