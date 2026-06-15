import React, { useRef, useCallback } from 'react';
import { View, Text, ScrollView, I18nManager, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useResponsive } from '../hooks/useResponsive';
import { t } from '../lib/i18n';
import { Chip } from '../components/ui/Chip';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Divider } from '../components/ui/Divider';
import { SCENARIO_TEMPLATES } from '../lib/templates/ScenarioTemplates';

type HomeNavigation = { navigate: (screen: string, params?: any) => void };

export const Home = ({ navigation }: { navigation: HomeNavigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { } = useResponsive();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openTemplates = useCallback(() => { bottomSheetRef.current?.present(); }, []);

  const menuItems = [
    { title: t('calculate_inheritance'), icon: '📊', screen: 'EstateSetup', primary: true },
    { title: t('history'), icon: '📜', screen: 'History' },
    { title: t('glossary'), icon: '📖', screen: 'Glossary' },
    { title: t('settings'), icon: '⚙️', screen: 'Settings' },
  ];

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: insets.bottom + theme.spacing.xxl, paddingTop: insets.top + theme.spacing.lg }}>
          <View style={styles.header}>
            <Text style={[theme.typography.h1, styles.title]}>{t('merath_v10__islamic_inheritance_calculator')}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.text.secondary }]}>{t('app_description')}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {['four_schools', 'blood_relatives', 'awl_radd'].map(key => <Chip key={key} label={t(key)} selected={false} />)}
            <Chip label={t('quick_templates')} onPress={openTemplates} selected={false} />
          </ScrollView>

          <Divider />

          <View>
            {menuItems.map(item => (
              <Pressable
                key={item.screen}
                onPress={() => navigation.navigate(item.screen)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
                  item.primary && { backgroundColor: 'rgba(79,70,229,0.05)' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.iconContainer, { borderLeftColor: theme.colors.primary }]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.menuText}>
                  <Text style={[theme.typography.h3, { color: theme.colors.onSurface }]}>{item.title}</Text>
                </View>
                <Text style={[styles.chevron, { color: theme.colors.outline }]}>{I18nManager.isRTL ? '←' : '→'}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <BottomSheetModal ref={bottomSheetRef} snapPoints={['60%']} backgroundStyle={{ backgroundColor: theme.colors.surface }}>
          <View style={{ padding: theme.spacing.lg }}>
            <Text style={[theme.typography.h2, { marginBottom: theme.spacing.md }]}>{t('quick_templates')}</Text>
            {SCENARIO_TEMPLATES.slice(0, 10).map(template => (
              <Pressable
                key={template.id}
                onPress={() => { bottomSheetRef.current?.dismiss(); navigation.navigate('HeirSelection', { template }); }}
                style={({ pressed }) => [styles.templateItem, pressed && { opacity: 0.7 }]}
              >
                <Text style={theme.typography.body}>{template.name}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.text.secondary }]}>{template.description}</Text>
              </Pressable>
            ))}
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 24 },
  title: { marginBottom: 8 },
  chipsScroll: { flexDirection: 'row', marginBottom: 16 },
  menuItem: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  iconContainer: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 4, marginRight: I18nManager.isRTL ? 0 : 16, marginLeft: I18nManager.isRTL ? 16 : 0 },
  icon: { fontSize: 24 },
  menuText: { flex: 1 },
  chevron: { fontSize: 20 },
  templateItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
});
