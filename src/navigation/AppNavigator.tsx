import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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

// Componente estable (no se recrea por render) para el fondo del header.
function HeaderGradientBackground({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    />
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const { isComplete, isLoading, completeOnboarding } = useOnboarding();

  const renderHeaderBackground = useCallback(
    () => (
      <HeaderGradientBackground
        start={colors.gradientStart}
        end={colors.gradientEnd}
      />
    ),
    [colors.gradientStart, colors.gradientEnd],
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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
          headerBackground: renderHeaderBackground,
        }}
        initialRouteName={isComplete ? 'CursoScreen' : 'Onboarding'}
      >
        <Stack.Screen
          name="Onboarding"
          options={{ headerShown: false, animation: 'fade' }}
        >
          {props => (
            <OnboardingScreen {...props} onComplete={completeOnboarding} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="CursoScreen"
          component={CursoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CursoModulo"
          component={CursoModuloScreen}
          options={{ title: 'Módulo' }}
        />
        <Stack.Screen
          name="MiSuite"
          component={MiSuiteScreen}
          options={{ title: 'Mi suite' }}
        />
        <Stack.Screen
          name="PremiumScreen"
          component={PremiumScreen}
          options={{ title: 'Premium' }}
        />
        <Stack.Screen
          name="AboutScreen"
          component={AboutScreen}
          options={{ title: 'Acerca de' }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{ title: 'Configuración' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Política de Privacidad' }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ title: 'Términos de Uso' }}
        />
        <Stack.Screen
          name="GlosarioScreen"
          component={GlosarioScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BuscadorScreen"
          component={BuscadorScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
