// ============================================================
// SettingsScreen — Tema, premium, info
// ============================================================

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { useResponsiveScale } from '../utils/responsive';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light',  label: 'Claro',    icon: 'white-balance-sunny' },
  { mode: 'dark',   label: 'Oscuro',   icon: 'weather-night' },
  { mode: 'system', label: 'Sistema',  icon: 'theme-light-dark' },
];

export function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isPremium } = usePremium();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: rs.space(20), paddingBottom: insets.bottom + rs.space(40) }}>
        <Section title="Apariencia" colors={colors} rs={rs} isDark={isDark}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(10), marginBottom: rs.space(10) }}>
            <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={rs.font(20)} color={colors.text} />
            <Text style={{ fontSize: rs.font(14), color: colors.text, fontWeight: '600' }}>Tema de la app</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: rs.space(8) }}>
            {THEME_OPTIONS.map(opt => {
              const active = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    paddingVertical: rs.space(10),
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: active ? colors.primary : (isDark ? colors.surfaceElevated : colors.neuInsetBg),
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.borderLight,
                  }}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={rs.font(20)}
                    color={active ? '#fff' : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: rs.font(11),
                      fontWeight: '700',
                      color: active ? '#fff' : colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {themeMode === 'system' && (
            <Text style={{ fontSize: rs.font(11), color: colors.textLight, marginTop: rs.space(8), lineHeight: rs.font(16) }}>
              Sigue automáticamente el tema del dispositivo (actualmente {isDark ? 'oscuro' : 'claro'}).
            </Text>
          )}
        </Section>

        <Section title="Cuenta" colors={colors} rs={rs} isDark={isDark}>
          <Row
            icon="crown-outline"
            label={isPremium ? 'Premium activo ✓' : 'Activar Premium'}
            onPress={() => navigation.navigate('PremiumScreen')}
            colors={colors}
            rs={rs}
          />
        </Section>

        <Section title="Información" colors={colors} rs={rs} isDark={isDark}>
          <Row icon="information-outline" label="Acerca de" onPress={() => navigation.navigate('AboutScreen')} colors={colors} rs={rs} />
          <Row icon="file-document-outline" label="Términos de uso" onPress={() => navigation.navigate('Terms')} colors={colors} rs={rs} />
          <Row icon="shield-account-outline" label="Política de privacidad" onPress={() => navigation.navigate('PrivacyPolicy')} colors={colors} rs={rs} />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors, rs, isDark }: any) {
  return (
    <View
      style={{
        backgroundColor: isDark ? colors.surface : colors.neuSurface,
        borderRadius: 14,
        padding: rs.space(16),
        marginBottom: rs.space(12),
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: rs.font(11), fontWeight: '800', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: rs.space(8) }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ icon, label, onPress, colors, rs }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rs.space(10) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(10) }}>
        <MaterialCommunityIcons name={icon} size={rs.font(20)} color={colors.text} />
        <Text style={{ fontSize: rs.font(14), color: colors.text }}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={rs.font(20)} color={colors.textLight} />
    </TouchableOpacity>
  );
}
