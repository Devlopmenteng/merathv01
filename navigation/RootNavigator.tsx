import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const EstateSetup = lazy(() => import('../screens/EstateSetup').then((module) => ({ default: module.EstateSetup })));
const MadhabSelect = lazy(() => import('../screens/MadhabSelect').then((module) => ({ default: module.MadhabSelect })));
const HeirSelection = lazy(() => import('../screens/HeirSelection').then((module) => ({ default: module.HeirSelection })));
const Results = lazy(() => import('../screens/Results').then((module) => ({ default: module.Results })));
const Comparison = lazy(() => import('../screens/Comparison').then((module) => ({ default: module.Comparison })));
const Settings = lazy(() => import('../screens/Settings').then((module) => ({ default: module.Settings })));
const History = lazy(() => import('../screens/History').then((module) => ({ default: module.History })));
const Glossary = lazy(() => import('../screens/Glossary').then((module) => ({ default: module.Glossary })));

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
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
          <Stack.Screen name="EstateSetup" component={EstateSetup} />
          <Stack.Screen name="MadhabSelect" component={MadhabSelect} />
          <Stack.Screen name="HeirSelection" component={HeirSelection} />
          <Stack.Screen name="Results" component={Results} />
          <Stack.Screen name="Comparison" component={Comparison} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Glossary" component={Glossary} />
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
