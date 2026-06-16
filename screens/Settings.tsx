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
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useLanguage } from '../lib/context/LanguageContext';
import { t } from '../lib/i18n';
import { forwardArrow } from '../lib/utils/rtl';
import { showAlert } from '../lib/utils/alerts';
import { Button } from '../components/ui/Button';
import { AppText } from '../components/ui/AppText';
import { useLocalizedTitle } from '../hooks/useLocalizedTitle';

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
  useLocalizedTitle('settings');
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
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: 'transparent',
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
                activeOpacity={0.7}
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
            <Button
              title={t('cancel')}
              onPress={() => setLanguageModalVisible(false)}
              mode="outlined"
              style={{ marginTop: theme.spacing.lg }}
            />
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
      <Button
        title={t('back_to_home')}
        onPress={() => navigation.navigate('Home')}
        mode="outlined"
        style={{ marginBottom: theme.spacing.md }}
      />
      <AppText variant="h1" style={{ writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }}>
        {t('settings')}
      </AppText>

      <View style={styles.section}>
        <AppText
          variant="label"
          color={theme.colors.text.secondary}
          style={[
            styles.sectionHeader,
            {
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('appearance')}
        </AppText>
        <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
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
        <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[
              theme.typography.body,
              {
                marginBottom: theme.spacing.sm,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('language__')}
          </Text>
          {LanguageDropdown()}
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="label"
          color={theme.colors.text.secondary}
          style={[
            styles.sectionHeader,
            {
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('resources')}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Glossary')}
          accessibilityLabel={t('glossary_and_education')}
          accessibilityHint={t('a11y_view_glossary')}
          accessibilityRole="button"
        >
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t('glossary_and_education')}
          </Text>
          <Text style={{ fontSize: 18, color: theme.colors.primary }}>{forwardArrow()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <AppText
          variant="label"
          color={theme.colors.text.secondary}
          style={[
            styles.sectionHeader,
            {
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('about')}
        </AppText>
        <View style={[styles.aboutCard, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[
              theme.typography.h3,
              {
                marginBottom: theme.spacing.sm,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t('about')}
          </Text>
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t('merath_v10__islamic_inheritance_calculator')}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { marginTop: theme.spacing.xs, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            ]}
          >
            {t('built_with_expo__typescript')}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { marginTop: theme.spacing.xs, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            ]}
          >
            {t('version')} {appVersion}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="label"
          color={theme.colors.text.secondary}
          style={[
            styles.sectionHeader,
            {
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('support')}
        </AppText>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardItem}
            onPress={handleRateUs}
            accessibilityLabel={t('rate_us_send_feedback')}
            accessibilityHint={t('a11y_rate_us')}
            accessibilityRole="button"
          >
            <Text
              style={[
                theme.typography.body,
                { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              ]}
            >
              {t('rate_us_send_feedback')}
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardItem}
            onPress={handleEmailFeedback}
            accessibilityLabel={t('feedback_title')}
            accessibilityHint={t('a11y_send_feedback')}
            accessibilityRole="button"
          >
            <Text
              style={[
                theme.typography.body,
                { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              ]}
            >
              {t('feedback_title')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <AppText
          variant="label"
          color={theme.colors.text.secondary}
          style={[
            styles.sectionHeader,
            {
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('legal')}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
          onPress={handlePrivacyPolicy}
          accessibilityLabel={t('privacy_policy')}
          accessibilityHint={t('a11y_privacy_policy')}
          accessibilityRole="button"
        >
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t('privacy_policy')}
          </Text>
          <Text style={{ fontSize: 18, color: theme.colors.primary }}>{forwardArrow()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.settingItem, styles.dangerItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleClearCache}
          accessibilityLabel={t('clear_cache_reset')}
          accessibilityHint={t('a11y_clear_cache')}
          accessibilityRole="button"
        >
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.error, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            ]}
          >
            {t('clear_cache_reset')}
          </Text>
          <Text style={{ fontSize: 18, color: theme.colors.error }}>🗑️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleLegalNotices}
          accessibilityLabel={t('legal_notices')}
          accessibilityHint={t('a11y_legal_notices')}
          accessibilityRole="button"
        >
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t('legal_notices')}
          </Text>
          <Text style={{ fontSize: 18, color: theme.colors.primary }}>⚖️</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  aboutCard: {
    padding: 16,
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
  },
  cardItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 16,
  },
  dangerItem: {
    borderLeftWidth: I18nManager.isRTL ? 0 : 3,
    borderRightWidth: I18nManager.isRTL ? 3 : 0,
    borderLeftColor: I18nManager.isRTL ? 'transparent' : '#EF4444',
    borderRightColor: I18nManager.isRTL ? '#EF4444' : 'transparent',
  },
});
