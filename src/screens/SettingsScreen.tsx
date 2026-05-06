// ============================================================
// SettingsScreen — Tema, premium, info, easter egg de activación
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
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

// Mantener en sync con package.json + android/app/build.gradle versionName.
// Curso no tiene src/config/appInfo.ts (solo Patologías).
const APP_VERSION = '1.0.0';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light',  label: 'Claro',    icon: 'white-balance-sunny' },
  { mode: 'dark',   label: 'Oscuro',   icon: 'weather-night' },
  { mode: 'system', label: 'Sistema',  icon: 'theme-light-dark' },
];

export function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isPremium, isCodeActivated, activateWithCode } = usePremium();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // ── Easter egg: tap version 5 times in 2s window ──
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  const handleVersionTap = useCallback(() => {
    if (isCodeActivated) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      setUnlockCode('');
      setUnlockError(false);
      setShowUnlockModal(true);
    }
  }, [isCodeActivated]);

  const handleUnlockSubmit = useCallback(async () => {
    const success = await activateWithCode(unlockCode);
    if (success) {
      setShowUnlockModal(false);
      setUnlockCode('');
      Alert.alert('Premium activado', 'Todo el contenido del Curso ha sido desbloqueado.');
    } else {
      setUnlockError(true);
    }
  }, [unlockCode, activateWithCode]);

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
          <Row
            icon="tag-outline"
            label="Versión"
            subtitle={isCodeActivated ? `${APP_VERSION} · Premium` : APP_VERSION}
            onPress={handleVersionTap}
            colors={colors}
            rs={rs}
            trailingIcon={isCodeActivated ? 'check-decagram' : undefined}
            trailingColor={isCodeActivated ? '#10B981' : undefined}
          />
        </Section>
      </ScrollView>

      {/* ── Unlock Modal (easter egg de código de activación) ── */}
      <Modal
        visible={showUnlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: rs.space(32),
        }}>
          <View style={{
            width: '100%',
            backgroundColor: isDark ? colors.surface : colors.neuSurface,
            borderRadius: 24,
            padding: rs.space(24),
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}>
            <View style={{ alignItems: 'center', marginBottom: rs.space(20) }}>
              <View style={{
                width: 56, height: 56, borderRadius: 18,
                backgroundColor: colors.primary + '15',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: rs.space(12),
              }}>
                <MaterialCommunityIcons name="lock-open-variant-outline" size={28} color={colors.primary} />
              </View>
              <Text style={{ fontSize: rs.font(18), fontWeight: '800', color: colors.text }}>
                Desbloquear Premium
              </Text>
              <Text style={{ fontSize: rs.font(13), color: colors.textSecondary, textAlign: 'center', marginTop: rs.space(4) }}>
                Ingresa el código de activación
              </Text>
            </View>

            <TextInput
              value={unlockCode}
              onChangeText={(t) => { setUnlockCode(t); setUnlockError(false); }}
              placeholder="Código de activación"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              autoFocus
              style={{
                backgroundColor: colors.background,
                borderRadius: 14,
                paddingHorizontal: rs.space(16),
                paddingVertical: rs.space(14),
                fontSize: rs.font(15),
                color: colors.text,
                borderWidth: 1.5,
                borderColor: unlockError ? colors.error : colors.border,
                marginBottom: unlockError ? rs.space(4) : rs.space(16),
              }}
            />
            {unlockError && (
              <Text style={{ fontSize: rs.font(12), color: colors.error, marginBottom: rs.space(12), marginLeft: rs.space(4) }}>
                Código incorrecto. Intenta de nuevo.
              </Text>
            )}

            <TouchableOpacity
              onPress={handleUnlockSubmit}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: rs.space(14),
                alignItems: 'center',
                marginBottom: rs.space(10),
              }}
            >
              <Text style={{ fontSize: rs.font(15), fontWeight: '700', color: '#fff' }}>
                Activar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowUnlockModal(false)}
              activeOpacity={0.7}
              style={{ alignItems: 'center', paddingVertical: rs.space(8) }}
            >
              <Text style={{ fontSize: rs.font(14), color: colors.textSecondary, fontWeight: '600' }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

function Row({ icon, label, subtitle, onPress, colors, rs, trailingIcon, trailingColor }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rs.space(10) }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(10), flex: 1 }}>
        <MaterialCommunityIcons name={icon} size={rs.font(20)} color={trailingColor || colors.text} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: rs.font(14), color: trailingColor || colors.text }}>{label}</Text>
          {subtitle && (
            <Text style={{ fontSize: rs.font(12), color: colors.textLight, marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
      </View>
      {trailingIcon
        ? <MaterialCommunityIcons name={trailingIcon} size={rs.font(20)} color={trailingColor || colors.textLight} />
        : (onPress && <MaterialCommunityIcons name="chevron-right" size={rs.font(20)} color={colors.textLight} />)
      }
    </TouchableOpacity>
  );
}
