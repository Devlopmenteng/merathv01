import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, I18nManager, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { GLOSSARY } from '../lib/constants/glossary';
import { FiqhRules } from './FiqhRules';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';
import { t, i18n } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { elevation } from '../lib/constants/theme';

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
      <Button
        title={t('back_to_home')}
        onPress={() => navigation.navigate('Home')}
        mode="outlined"
        style={{ margin: theme.spacing.md, marginBottom: theme.spacing.sm }}
      />
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
              <TouchableOpacity
                style={[styles.glossaryItem, { backgroundColor: theme.colors.surface }]}
                activeOpacity={0.7}
                accessibilityLabel={`${item.term} – ${item.termAr}. ${item.definition}`}
                accessibilityRole="button"
              >
                <View style={[styles.leftBorder, { backgroundColor: theme.colors.primary }]} />
                <View style={styles.content}>
                  <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>
                    {item.term} – {item.termAr}
                  </Text>
                  <Text style={[theme.typography.body, { marginTop: 4 }]}>{item.definition}</Text>
                  <Text
                    style={[
                      theme.typography.caption,
                      { marginTop: 4, color: theme.colors.outline },
                    ]}
                  >
                    {item.definitionAr}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={8}
          />
        )}
        {activeTab === 'verses' && (
          <FlatList
            data={INHERITANCE_VERSES}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={[styles.verseItem, { backgroundColor: theme.colors.surface }]}>
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
                <Text
                  style={{ fontSize: 18, lineHeight: 28, marginBottom: 8, writingDirection: 'rtl' }}
                >
                  {item.arabic}
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
                  ]}
                >
                  {item.translations[i18n.locale as keyof typeof item.translations] ||
                    item.translation}
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
              </View>
            )}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={8}
          />
        )}
        {activeTab === 'hadith' && (
          <FlatList
            data={HADITH}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={[styles.hadithItem, { backgroundColor: theme.colors.surface }]}>
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
                    {
                      color: theme.colors.outline,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {item.reference}
                </Text>
              </View>
            )}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={8}
          />
        )}
        {activeTab === 'fiqh' && <FiqhRules />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glossaryItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...elevation.small,
  },
  leftBorder: {
    position: 'absolute',
    left: I18nManager.isRTL ? undefined : 0,
    right: I18nManager.isRTL ? 0 : undefined,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: I18nManager.isRTL ? 12 : 0,
    borderBottomRightRadius: I18nManager.isRTL ? 12 : 0,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
  },
  verseItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...elevation.small,
  },
  hadithItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...elevation.small,
  },
});
