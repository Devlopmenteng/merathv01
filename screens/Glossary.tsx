import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { GLOSSARY } from '../lib/constants/glossary';
import { FiqhRules } from './FiqhRules';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';
import { ThemedListCard } from '../components/ui/ThemedListCard';
import { TabBar } from '../components/ui/TabBar';

type Tab = 'glossary' | 'verses' | 'hadith' | 'fiqh';

const TABS: { key: Tab; label: string }[] = [
  { key: 'glossary', label: 'المصطلحات' },
  { key: 'verses', label: 'آيات قرآنية' },
  { key: 'hadith', label: 'أحاديث' },
];

export const Glossary = ({ navigation }: any) => {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<Tab>('glossary');

  const renderGlossary = () => (
    <FlatList
      data={GLOSSARY}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={({ item }) => (
        <ThemedListCard accentColor={theme.colors.primary}>
          <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>
            {item.term} – {item.termAr}
          </Text>
          <Text style={[theme.typography.body, { marginTop: 4 }]}>{item.definition}</Text>
          <Text style={[theme.typography.caption, { marginTop: 4, color: theme.colors.outline }]}>
            {item.definitionAr}
          </Text>
        </ThemedListCard>
      )}
    />
  );

  const renderVerses = () => (
    <FlatList
      data={INHERITANCE_VERSES}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={({ item }) => (
        <ThemedListCard>
          <Text style={[theme.typography.h3, { color: theme.colors.secondary, marginBottom: 4 }]}>
            {item.surah} {item.verseNumber}
          </Text>
          <Text style={{ fontSize: 18, lineHeight: 28, marginBottom: 8 }}>{item.arabic}</Text>
          <Text style={theme.typography.body}>{item.translation}</Text>
          <Text style={[theme.typography.caption, { marginTop: 8, color: theme.colors.outline }]}>
            الموضوع: {item.topic}
          </Text>
        </ThemedListCard>
      )}
    />
  );

  const renderHadith = () => (
    <FlatList
      data={HADITH}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={({ item }) => (
        <ThemedListCard>
          <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 8 }}>{item.text}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.outline }]}>{item.reference}</Text>
        </ThemedListCard>
      )}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.md }}>
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        {activeTab === 'glossary' && renderGlossary()}
        {activeTab === 'verses' && renderVerses()}
        {activeTab === 'hadith' && renderHadith()}
        {activeTab === 'fiqh' && <FiqhRules />}
      </ScrollView>
    </View>
  );
};
