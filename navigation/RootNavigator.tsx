import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalcProvider } from '../lib/context/CalcContext';
import { EstateSetup } from '../screens/EstateSetup';
import { MadhabSelect } from '../screens/MadhabSelect';
import { HeirSelection } from '../screens/HeirSelection';
import { Results } from '../screens/Results';
import { Comparison } from '../screens/Comparison';
import { Settings } from '../screens/Settings';
import { History } from '../screens/History';
import { Glossary } from "../screens/Glossary";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as any,
  animationDuration: 300,
};

export default function RootNavigator() {
  return (
    <CalcProvider>
      <NavigationContainer>
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
      </NavigationContainer>
    </CalcProvider>
  );
}
