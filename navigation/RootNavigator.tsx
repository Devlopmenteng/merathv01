import React, { Suspense, lazy, useRef, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StackAnimationTypes } from 'react-native-screens';
import { t } from '../lib/i18n';
import { lightTheme } from '../lib/constants/theme';

// Preload critical screens
const Home = lazy(() => import('../screens/Home').then((module) => ({ default: module.Home })));
const EstateSetup = lazy(() =>
  import('../screens/EstateSetup').then((module) => ({ default: module.EstateSetup }))
);
const HeirSelection = lazy(() =>
  import('../screens/HeirSelection').then((module) => ({ default: module.HeirSelection }))
);
const Results = lazy(() =>
  import('../screens/Results').then((module) => ({ default: module.Results }))
);

// Other screens
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

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['merath://', 'https://merath.app'],
  config: {
    screens: {
      Home: '',
      EstateSetup: 'estate',
      HeirSelection: 'heirs',
      Results: 'results',
      Settings: 'settings',
      History: 'history',
      Glossary: 'glossary',
      CalculationSteps: 'steps',
    },
  },
};

const screenOptions = {
  headerShown: true,
  animation: (I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right') as StackAnimationTypes,
};

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={lightTheme.colors.primary} />
  </View>
);

export default function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([
        import('../screens/Home'),
        import('../screens/EstateSetup'),
        import('../screens/HeirSelection'),
        import('../screens/Results'),
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking} fallback={<LoadingView />}>
      <Suspense fallback={<LoadingView />}>
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen
            name="EstateSetup"
            component={EstateSetup}
            options={() => ({ title: t('estate_details') })}
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
