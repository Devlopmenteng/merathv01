import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTheme } from '../lib/context/ThemeContext';
import { GLOSSARY } from '../lib/constants/glossary';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';
import { Divider } from '../components/ui/Divider';
import { t } from '../lib/i18n';
import { useLocalizedTitle } from '../hooks/useLocalizedTitle';

const TABS = ['terms', 'verses', 'hadith', 'fiqh'];

export const Glossary = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { responsive } = useTheme();
  const isTablet = responsive.isTablet || responsive.isLargeTablet;
  useLocalizedTitle('glossary');
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={{
          padding: isTablet ? theme.spacing.xxl : theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg,
        }}
      >
        <Text style={theme.typography.h1}>{t('glossary')}</Text>
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && {
                  borderBottomColor: theme.colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text style={activeTab === tab ? { color: theme.colors.primary } : {}}>{t(tab)}</Text>
            </Pressable>
          ))}
        </View>
        <Divider />
        <ScrollView>
          <View style={isTablet ? styles.tabletGrid : undefined}>
            {activeTab === 'terms' &&
              GLOSSARY.map((item, i) => (
                <View key={i} style={[styles.listItem, isTablet && { width: '48%' }]}>
                  <View style={[styles.leftBorder, { borderLeftColor: theme.colors.primary }]} />
                  <View style={styles.content}>
                    <Text style={theme.typography.h3}>
                      {item.term} – {item.termAr}
                    </Text>
                    <Text>{item.definition}</Text>
                  </View>
                </View>
              ))}
          </View>
          {activeTab === 'verses' &&
            INHERITANCE_VERSES.map((v, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.leftBorder, { borderLeftColor: theme.colors.success }]} />
                <View style={styles.content}>
                  <Text style={theme.typography.h4}>
                    {v.surah} {v.verseNumber}
                  </Text>
                  <Text>{v.arabic}</Text>
                  <Text>{v.translation}</Text>
                </View>
              </View>
            ))}
          {activeTab === 'hadith' &&
            HADITH.map((h, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.leftBorder, { borderLeftColor: theme.colors.warning }]} />
                <View style={styles.content}>
                  <Text>{h.text}</Text>
                  <Text style={theme.typography.caption}>{h.reference}</Text>
                </View>
              </View>
            ))}
          {activeTab === 'fiqh' && <Text>Fiqh rules content (from FiqhRules screen merged)</Text>}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', marginVertical: 16 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  listItem: { flexDirection: 'row', marginBottom: 12, paddingVertical: 8 },
  leftBorder: { borderLeftWidth: 4, marginRight: 12 },
  content: { flex: 1 },
  tabletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
