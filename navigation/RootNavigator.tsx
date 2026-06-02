import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '../lib/i18n';

const EstateSetup = lazy(() =>
  import('../screens/EstateSetup').then((module) => ({ default: module.EstateSetup }))
);
const MadhabSelect = lazy(() =>
  import('../screens/MadhabSelect').then((module) => ({ default: module.MadhabSelect }))
);
const HeirSelection = lazy(() =>
  import('../screens/HeirSelection').then((module) => ({ default: module.HeirSelection }))
);
const Results = lazy(() =>
  import('../screens/Results').then((module) => ({ default: module.Results }))
);
const Comparison = lazy(() =>
  import('../screens/Comparison').then((module) => ({ default: module.Comparison }))
);
const Settings = lazy(() =>
  import('../screens/Settings').then((module) => ({ default: module.Settings }))
);
const History = lazy(() =>
  import('../screens/History').then((module) => ({ default: module.History }))
);
const Glossary = lazy(() =>
  import('../screens/Glossary').then((module) => ({ default: module.Glossary }))
);

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true, // Show header to display titles
  animation: 'slide_from_right' as any,
  animationDuration: 300,
};

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0D7C66" />
  </View>
);

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Suspense fallback={<LoadingView />}>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name="EstateSetup"
            component={EstateSetup}
            options={{ title: t('estate_details') }}
          />
          <Stack.Screen
            name="MadhabSelect"
            component={MadhabSelect}
            options={{ title: t('select_madhab') }}
          />
          <Stack.Screen
            name="HeirSelection"
            component={HeirSelection}
            options={{ title: t('select_heirs') }}
          />
          <Stack.Screen
            name="Results"
            component={Results}
            options={{ title: t('inheritance_report') }}
          />
          <Stack.Screen
            name="Comparison"
            component={Comparison}
            options={{ title: t('compare') }}
          />
          <Stack.Screen name="Settings" component={Settings} options={{ title: t('settings') }} />
          <Stack.Screen
            name="History"
            component={History}
            options={{ title: t('history_screen_title') }}
          />
          <Stack.Screen name="Glossary" component={Glossary} options={{ title: t('glossary') }} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
