import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { GLOSSARY } from '../lib/constants/glossary';
import { FiqhRules } from './FiqhRules';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';
import { t } from '../lib/i18n';
import { backArrow } from '../lib/utils/rtl';

type Tab = 'glossary' | 'verses' | 'hadith' | 'fiqh';

type GlossaryNavigation = {
  navigate: (screen: string) => void;
};

export const Glossary = ({ navigation }: { navigation: GlossaryNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('glossary');

  const renderGlossary = () => (
    <FlatList
      data={GLOSSARY}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>
            {item.term} – {item.termAr}
          </Text>
          <Text style={[theme.typography.body, { marginTop: 4 }]}>{item.definition}</Text>
          <Text style={[theme.typography.caption, { marginTop: 4, color: theme.colors.outline }]}>
            {item.definitionAr}
          </Text>
        </View>
      )}
    />
  );

  const renderVerses = () => (
    <FlatList
      data={INHERITANCE_VERSES}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <Text
            style={[theme.typography.h3, { color: theme.colors.secondary, marginBottom: 4 }]}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {item.surah} {item.verseNumber}
          </Text>
          <Text style={{ fontSize: 18, lineHeight: 28, marginBottom: 8 }} writingDirection={'rtl'}>
            {item.arabic}
          </Text>
          <Text style={theme.typography.body} writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}>
            {item.translation}
          </Text>
          <Text
            style={[theme.typography.caption, { marginTop: 8, color: theme.colors.outline }]}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {t('topic')}: {item.topic}
          </Text>
        </View>
      )}
    />
  );

  const renderHadith = () => (
    <FlatList
      data={HADITH}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <Text
            style={[{ marginBottom: 8 }, theme.typography.body]}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {item.text}
          </Text>
          <Text
            style={[theme.typography.caption, { color: theme.colors.outline }]}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {item.reference}
          </Text>
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ padding: theme.spacing.md, marginBottom: theme.spacing.sm }}
        accessibilityLabel={t('back_to_home')}
        accessibilityRole="button"
      >
        <Text
          style={[{ color: theme.colors.primary }, theme.typography.button]}
          writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
        >
          {backArrow()} {t('back_to_home')}
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor:
              activeTab === 'glossary' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('glossary')}
          accessibilityLabel={t('tab_glossary')}
          accessibilityRole="tab"
        >
          <Text
            style={{
              color: activeTab === 'glossary' ? theme.colors.onPrimary : theme.colors.onSurface,
            }}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {t('tab_glossary')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor:
              activeTab === 'verses' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('verses')}
          accessibilityLabel={t('tab_verses')}
          accessibilityRole="tab"
        >
          <Text
            style={{
              color: activeTab === 'verses' ? theme.colors.onPrimary : theme.colors.onSurface,
            }}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {t('tab_verses')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor:
              activeTab === 'hadith' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('hadith')}
          accessibilityLabel={t('tab_hadith')}
          accessibilityRole="tab"
        >
          <Text
            style={{
              color: activeTab === 'hadith' ? theme.colors.onPrimary : theme.colors.onSurface,
            }}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {t('tab_hadith')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor:
              activeTab === 'fiqh' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('fiqh')}
          accessibilityLabel={t('tab_fiqh')}
          accessibilityRole="tab"
        >
          <Text
            style={{
              color: activeTab === 'fiqh' ? theme.colors.onPrimary : theme.colors.onSurface,
            }}
            writingDirection={I18nManager.isRTL ? 'rtl' : 'ltr'}
          >
            {t('tab_fiqh')}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: insets.bottom,
        }}
      >
        {activeTab === 'glossary' && renderGlossary()}
        {activeTab === 'verses' && renderVerses()}
        {activeTab === 'hadith' && renderHadith()}
        {activeTab === 'fiqh' && <FiqhRules />}
      </ScrollView>
    </View>
  );
};
