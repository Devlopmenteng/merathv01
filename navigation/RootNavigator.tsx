import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StackAnimationTypes } from 'react-native-screens';
import { t } from '../lib/i18n';
import { lightTheme } from '../lib/constants/theme';

const Home = lazy(() => import('../screens/Home').then((module) => ({ default: module.Home })));
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
const CalculationSteps = lazy(() =>
  import('../screens/CalculationSteps').then((module) => ({ default: module.CalculationSteps }))
);
const TestCases = lazy(() =>
  import('../screens/TestCases').then((module) => ({ default: module.TestCases }))
);

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true,
  animation: (I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right') as StackAnimationTypes,
  animationDuration: 300,
};

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={lightTheme.colors.primary} />
  </View>
);

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Suspense fallback={<LoadingView />}>
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen
            name="EstateSetup"
            component={EstateSetup}
            options={() => ({ title: t('estate_details') })}
          />
          <Stack.Screen
            name="MadhabSelect"
            component={MadhabSelect}
            options={() => ({ title: t('select_madhab') })}
          />
          <Stack.Screen
            name="HeirSelection"
            component={HeirSelection}
            options={() => ({ title: t('select_heirs') })}
          />
          <Stack.Screen
            name="Results"
            component={Results}
            options={() => ({ title: t('inheritance_report') })}
          />
          <Stack.Screen
            name="Comparison"
            component={Comparison}
            options={() => ({ title: t('compare') })}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={() => ({ title: t('settings') })}
          />
          <Stack.Screen
            name="History"
            component={History}
            options={() => ({ title: t('history_screen_title') })}
          />
          <Stack.Screen
            name="Glossary"
            component={Glossary}
            options={() => ({ title: t('glossary') })}
          />
          <Stack.Screen
            name="CalculationSteps"
            component={CalculationSteps as React.ComponentType<unknown>}
            options={() => ({ title: t('calculation_steps') })}
          />
          <Stack.Screen
            name="TestCases"
            component={TestCases}
            options={() => ({ title: t('test_cases') })}
          />
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
