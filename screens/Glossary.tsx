import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { GLOSSARY } from '../lib/constants/glossary';
import { FiqhRules } from './FiqhRules';
import { INHERITANCE_VERSES, HADITH } from '../lib/constants/quran_hadith';

type Tab = 'glossary' | 'verses' | 'hadith' | 'fiqh';

export const Glossary = () => {
  const theme = useAppTheme();
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
          <Text style={[theme.typography.h3, { color: theme.colors.secondary, marginBottom: 4 }]}>
            {item.surah} {item.verseNumber}
          </Text>
          <Text style={{ fontSize: 18, lineHeight: 28, marginBottom: 8 }}>{item.arabic}</Text>
          <Text style={theme.typography.body}>{item.translation}</Text>
          <Text style={[theme.typography.caption, { marginTop: 8, color: theme.colors.outline }]}>
            الموضوع: {item.topic}
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
          <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 8 }}>{item.text}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.outline }]}>{item.reference}</Text>
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: 'row', padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor: activeTab === 'glossary' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('glossary')}
        >
          <Text style={{ color: activeTab === 'glossary' ? theme.colors.onPrimary : theme.colors.onSurface }}>
            المصطلحات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor: activeTab === 'verses' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('verses')}
        >
          <Text style={{ color: activeTab === 'verses' ? theme.colors.onPrimary : theme.colors.onSurface }}>
            آيات قرآنية
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor: activeTab === 'hadith' ? theme.colors.primary : theme.colors.surfaceVariant,
            alignItems: 'center',
          }}
          onPress={() => setActiveTab('hadith')}
        >
          <Text style={{ color: activeTab === 'hadith' ? theme.colors.onPrimary : theme.colors.onSurface }}>
            أحاديث
          </Text>
        </TouchableOpacity>
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
