import { Button } from "../components/ui/Button";
import { usePremium } from '../lib/context/PremiumContext';
import { getCalculationCount } from '../lib/services/UsageStats';
import { useState, useEffect } from 'react';
import { SupportButton } from '../components/SupportButton';
import { FeedbackButton } from '../components/FeedbackButton';
import { t } from '../lib/i18n';
import React from 'react';
import { View, Text, Switch, ScrollView, Alert } from 'react-native';
import { useTheme } from '../lib/context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { initI18n, i18n } from '../lib/i18n';
import { TabBar } from '../components/ui/TabBar';

export const Settings = ({ navigation }: any) => {
  const { isPremium, togglePremium } = usePremium();
  const [calcCount, setCalcCount] = useState(0);
  const [locale, setLocale] = useState(i18n.locale);
  
  useEffect(() => { getCalculationCount().then(setCalcCount); }, []);
  const { isDark, toggleTheme } = useTheme();
  const theme = useAppTheme();

  const changeLanguage = (lang: string) => {
    const needsReload = initI18n(lang);
    setLocale(lang);
    if (needsReload) {
      Alert.alert('Language changed', 'Please restart the app for full RTL support.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
      <Text style={theme.typography.h1}>Settings</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 }}>
        <Text style={theme.typography.body}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
        <Text style={theme.typography.body}>Language / اللغة</Text>
        <View style={{ flex: 1, marginStart: 12 }}>
          <TabBar
            tabs={[
              { key: 'en', label: 'English' },
              { key: 'ar', label: 'العربية' },
            ]}
            activeTab={locale}
            onTabChange={changeLanguage}
          />
        </View>
      </View>

      <Text style={theme.typography.h2}>About</Text>
      <Text style={theme.typography.body}>Merath v1.0 – Islamic Inheritance Calculator</Text>
      <Text style={theme.typography.caption}>Built with Expo & TypeScript</Text>
      <FeedbackButton />
      <SupportButton />
      <Button title="المصطلحات والآيات" onPress={() => navigation.navigate("Glossary")} mode="outlined" style={{ marginTop: theme.spacing.sm }} />
      <Text style={{fontSize:12, marginTop:8}}>Calculations performed: {calcCount}</Text>
      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12}}>
        <Text>Premium (Unlock legal reports & fiqh notes)</Text>
        <Switch value={isPremium} onValueChange={togglePremium} />
      </View>
    </ScrollView>
  );
};
