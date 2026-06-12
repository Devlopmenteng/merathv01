import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
import { GLOSSARY } from '../lib/constants/glossary';
import { FiqhRules } from './FiqhRules';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';
import { t, i18n } from '../lib/i18n';
import { backArrow } from '../lib/utils/rtl';

type Tab = 'glossary' | 'verses' | 'hadith' | 'fiqh';

type GlossaryNavigation = {
  navigate: (screen: string) => void;
};

export const Glossary = ({ navigation }: { navigation: GlossaryNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('glossary');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ padding: theme.spacing.md, marginBottom: theme.spacing.sm }}
        accessibilityLabel={t('back_to_home')}
        accessibilityRole="button"
      >
        <Text
          style={[
            { color: theme.colors.primary, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            theme.typography.button,
          ]}
        >
          {backArrow()} {t('back_to_home')}
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor:
              activeTab === 'glossary' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
            minHeight: 44,
          }}
          onPress={() => setActiveTab('glossary')}
          accessibilityLabel={t('tab_glossary')}
          accessibilityHint={
            activeTab === 'glossary' ? t('a11y_tab_active') : t('a11y_view_glossary')
          }
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'glossary' }}
        >
          <Text
            style={{
              color: activeTab === 'glossary' ? theme.colors.onPrimary : theme.colors.onSurface,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            {t('tab_glossary')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor:
              activeTab === 'verses' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
            minHeight: 44,
          }}
          onPress={() => setActiveTab('verses')}
          accessibilityLabel={t('tab_verses')}
          accessibilityHint={activeTab === 'verses' ? t('a11y_tab_active') : t('a11y_view_verses')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'verses' }}
        >
          <Text
            style={{
              color: activeTab === 'verses' ? theme.colors.onPrimary : theme.colors.onSurface,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            {t('tab_verses')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor:
              activeTab === 'hadith' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
            minHeight: 44,
          }}
          onPress={() => setActiveTab('hadith')}
          accessibilityLabel={t('tab_hadith')}
          accessibilityHint={activeTab === 'hadith' ? t('a11y_tab_active') : t('a11y_view_hadith')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'hadith' }}
        >
          <Text
            style={{
              color: activeTab === 'hadith' ? theme.colors.onPrimary : theme.colors.onSurface,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            {t('tab_hadith')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor:
              activeTab === 'fiqh' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
            minHeight: 44,
          }}
          onPress={() => setActiveTab('fiqh')}
          accessibilityLabel={t('tab_fiqh')}
          accessibilityHint={activeTab === 'fiqh' ? t('a11y_tab_active') : t('a11y_view_fiqh')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'fiqh' }}
        >
          <Text
            style={{
              color: activeTab === 'fiqh' ? theme.colors.onPrimary : theme.colors.onSurface,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}
          >
            {t('tab_fiqh')}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: insets.bottom,
        }}
      >
        {activeTab === 'glossary' && (
          <FlatList
            data={GLOSSARY}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Card variant="outlined" leftBorder={theme.colors.primary} style={{ marginBottom: theme.spacing.md }}>
                <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>
                  {item.term} – {item.termAr}
                </Text>
                <Text style={[theme.typography.body, { marginTop: 4 }]}>{item.definition}</Text>
                <Text style={[theme.typography.caption, { marginTop: 4, color: theme.colors.outline }]}>
                  {item.definitionAr}
                </Text>
              </Card>
            )}
            contentContainerStyle={{ gap: theme.spacing.md }}
          />
        )}
        {activeTab === 'verses' && (
          <FlatList
            data={INHERITANCE_VERSES}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
                <Text
                  style={[
                    theme.typography.h3,
                    {
                      color: theme.colors.secondary,
                      marginBottom: 4,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {item.surah} {item.verseNumber}
                </Text>
                <Text style={{ fontSize: 18, lineHeight: 28, marginBottom: 8, writingDirection: 'rtl' }}>
                  {item.arabic}
                </Text>
                <Text
                  style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
                >
                  {item.translations[i18n.locale as keyof typeof item.translations] || item.translation}
                </Text>
                <Text
                  style={[
                    theme.typography.caption,
                    {
                      marginTop: 8,
                      color: theme.colors.outline,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {t('topic')}: {item.topic}
                </Text>
              </Card>
            )}
            contentContainerStyle={{ gap: theme.spacing.md }}
          />
        )}
        {activeTab === 'hadith' && (
          <FlatList
            data={HADITH}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
                <Text
                  style={[
                    { marginBottom: 8, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                    theme.typography.body,
                  ]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.outline, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                  ]}
                >
                  {item.reference}
                </Text>
              </Card>
            )}
            contentContainerStyle={{ gap: theme.spacing.md }}
          />
        )}
        {activeTab === 'fiqh' && <FiqhRules />}
      </View>
    </View>
  );
};
