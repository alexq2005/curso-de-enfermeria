import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../hooks/useOnboarding';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { CursoScreen } from '../screens/CursoScreen';
import { CursoModuloScreen } from '../screens/CursoModuloScreen';
import { MiSuiteScreen } from '../screens/MiSuiteScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { GlosarioScreen } from '../screens/GlosarioScreen';
import { BuscadorScreen } from '../screens/BuscadorScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { colors } = useTheme();
  const { isComplete, isLoading, completeOnboarding } = useOnboarding();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.neuBackground }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          animation: 'slide_from_right',
          animationDuration: 250,
          headerBackground: () => (
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
        }}
        initialRouteName={isComplete ? 'CursoScreen' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" options={{ headerShown: false, animation: 'fade' }}>
          {(props) => <OnboardingScreen {...props} onComplete={completeOnboarding} />}
        </Stack.Screen>
        <Stack.Screen name="CursoScreen" component={CursoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CursoModulo" component={CursoModuloScreen} options={{ title: 'Módulo' }} />
        <Stack.Screen name="MiSuite" component={MiSuiteScreen} options={{ title: 'Mi suite' }} />
        <Stack.Screen name="PremiumScreen" component={PremiumScreen} options={{ title: 'Premium' }} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'Acerca de' }} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Configuración' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Política de Privacidad' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Términos de Uso' }} />
        <Stack.Screen name="GlosarioScreen" component={GlosarioScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BuscadorScreen" component={BuscadorScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
