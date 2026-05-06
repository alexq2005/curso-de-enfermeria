// ============================================================
// CursoScreen — Lista de módulos del Curso de Enfermería
// ============================================================

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { useCursoProgress } from '../context/CursoProgressContext';
import { useResponsiveScale } from '../utils/responsive';
import { getCursoImage } from '../utils/cursoImages';
import { ProgressBar } from '../components/ProgressBar';
import cursoData from '../data/curso.json';
import type { CursoData, CursoModulo } from '../types/curso';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CursoScreen'>;

const data = cursoData as CursoData;

export function CursoScreen() {
  const { colors, isDark } = useTheme();
  const { isPremium } = usePremium();
  const { globalProgress, getModuloProgress, lastModuloId, recentModuloIds } = useCursoProgress();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const lastModulo = useMemo(
    () => (lastModuloId ? data.modulos.find(m => m.id === lastModuloId) : null),
    [lastModuloId],
  );

  const recentModulos = useMemo(
    () =>
      recentModuloIds
        .map(id => data.modulos.find(m => m.id === id))
        .filter((m): m is CursoModulo => Boolean(m))
        .slice(0, 5),
    [recentModuloIds],
  );

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [fade]);

  const totalSubs = useMemo(
    () => data.modulos.reduce((acc, m) => acc + m.subs.length, 0),
    [],
  );

  const handlePress = useCallback(
    (m: CursoModulo) => {
      if (m.isPremium && !isPremium) {
        navigation.navigate('PremiumScreen');
        return;
      }
      navigation.navigate('CursoModulo', { moduloId: m.id });
    },
    [navigation, isPremium],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + rs.space(40) }}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + rs.space(20),
            paddingBottom: rs.space(28),
            paddingHorizontal: rs.space(24),
          }}
        >
          <Animated.View style={{ opacity: fade }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: rs.font(28), fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>
                  Manual de Enfermería
                </Text>
                <Text style={{ fontSize: rs.font(13), color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
                  Material integral: fundamentos, técnicas y emergencias
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: rs.space(6), marginLeft: rs.space(8) }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('BuscadorScreen')}
                  activeOpacity={0.8}
                  style={{
                    width: rs.space(38),
                    height: rs.space(38),
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Buscar"
                >
                  <MaterialCommunityIcons name="magnify" size={rs.font(20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('GlosarioScreen')}
                  activeOpacity={0.8}
                  style={{
                    width: rs.space(38),
                    height: rs.space(38),
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Glosario"
                >
                  <MaterialCommunityIcons name="book-alphabet" size={rs.font(20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MiSuite')}
                  activeOpacity={0.8}
                  style={{
                    width: rs.space(38),
                    height: rs.space(38),
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Mi suite de enfermería"
                >
                  <MaterialCommunityIcons name="apps" size={rs.font(20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SettingsScreen')}
                  activeOpacity={0.8}
                  style={{
                    width: rs.space(38),
                    height: rs.space(38),
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Configuración"
                >
                  <MaterialCommunityIcons name="cog-outline" size={rs.font(20)} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: rs.space(16), marginTop: rs.space(16) }}>
              <Stat label="módulos" value={String(data.modulos.length)} rs={rs} />
              <Stat label="subtemas" value={String(totalSubs)} rs={rs} />
              <Stat label="leído" value={`${globalProgress.pct}%`} rs={rs} />
            </View>

            <View style={{ marginTop: rs.space(14) }}>
              <ProgressBar progress={globalProgress.pct} fillColor="#fff" height={6} />
              <Text style={{ fontSize: rs.font(11), color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
                {globalProgress.read} de {globalProgress.total} subtemas leídos
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ opacity: fade, paddingHorizontal: rs.space(16), paddingTop: rs.space(20) }}>
          {/* Continuar */}
          {lastModulo && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePress(lastModulo)}
              style={{
                backgroundColor: isDark ? colors.surface : colors.neuSurface,
                borderRadius: 16,
                padding: rs.space(14),
                marginBottom: rs.space(16),
                borderWidth: 1,
                borderColor: lastModulo.gradient[1] + '40',
                flexDirection: 'row',
                alignItems: 'center',
                gap: rs.space(12),
              }}
            >
              <View
                style={{
                  width: rs.space(46),
                  height: rs.space(46),
                  borderRadius: 12,
                  backgroundColor: lastModulo.gradient[1] + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="play-circle" size={rs.font(26)} color={lastModulo.gradient[1]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: rs.font(10), fontWeight: '800', color: lastModulo.gradient[1], letterSpacing: 1 }}>
                  CONTINUAR
                </Text>
                <Text style={{ fontSize: rs.font(15), fontWeight: '800', color: colors.text, marginTop: 2 }} numberOfLines={1}>
                  {lastModulo.title}
                </Text>
                <Text style={{ fontSize: rs.font(11), color: colors.textLight, marginTop: 2 }}>
                  {getModuloProgress(lastModulo.id).read} / {lastModulo.subs.length} leídos
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={rs.font(22)} color={colors.textLight} />
            </TouchableOpacity>
          )}

          {/* Recién visto */}
          {recentModulos.length > 1 && (
            <View style={{ marginBottom: rs.space(20) }}>
              <Text style={{ fontSize: rs.font(13), fontWeight: '800', color: colors.text, marginBottom: rs.space(10), letterSpacing: 0.3 }}>
                Recién visto
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: rs.space(10) }}>
                {recentModulos.map(m => {
                  const prog = getModuloProgress(m.id);
                  return (
                    <TouchableOpacity
                      key={m.id}
                      activeOpacity={0.85}
                      onPress={() => handlePress(m)}
                      style={{
                        width: rs.space(150),
                        borderRadius: 14,
                        overflow: 'hidden',
                        elevation: 3,
                        shadowColor: m.gradient[1],
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                      }}
                    >
                      <LinearGradient
                        colors={m.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ padding: rs.space(12), height: rs.space(110), justifyContent: 'space-between' }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MaterialCommunityIcons name={m.iconName} size={rs.font(20)} color="#fff" />
                          <Text style={{ fontSize: rs.font(10), fontWeight: '800', color: 'rgba(255,255,255,0.9)' }}>
                            {prog.pct}%
                          </Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: rs.font(10), fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.8 }}>
                            MÓDULO {String(m.num).padStart(2, '0')}
                          </Text>
                          <Text style={{ fontSize: rs.font(12), fontWeight: '800', color: '#fff', marginTop: 2 }} numberOfLines={2}>
                            {m.title}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Lista de módulos */}
          {data.modulos.map((m, idx) => {
            const locked = m.isPremium && !isPremium;
            const prog = getModuloProgress(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                onPress={() => handlePress(m)}
                style={{
                  height: rs.space(160),
                  borderRadius: 22,
                  overflow: 'hidden',
                  marginBottom: rs.space(14),
                  elevation: 6,
                  shadowColor: m.gradient[1],
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.28,
                  shadowRadius: 14,
                }}
              >
                <ImageBackground
                  source={getCursoImage(m.imageKey)}
                  style={{ flex: 1 }}
                  imageStyle={{ borderRadius: 22 }}
                >
                  <LinearGradient
                    colors={['transparent', m.gradient[0] + '99', m.gradient[1] + 'F0']}
                    locations={[0, 0.45, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.4, y: 1 }}
                    style={{ flex: 1, padding: rs.space(18), justifyContent: 'space-between', borderRadius: 22 }}
                  >
                    {/* Top row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View
                        style={{
                          width: rs.space(46),
                          height: rs.space(46),
                          borderRadius: 14,
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name={m.iconName} size={rs.font(24)} color="#fff" />
                      </View>

                      {locked ? (
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            paddingHorizontal: rs.space(10),
                            paddingVertical: rs.space(4),
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <MaterialCommunityIcons name="lock" size={rs.font(11)} color="#D97706" />
                          <Text style={{ fontSize: rs.font(9), fontWeight: '900', color: '#D97706', letterSpacing: 0.5 }}>
                            PRO
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            width: rs.space(28),
                            height: rs.space(28),
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: rs.font(13), fontWeight: '900', color: m.gradient[1] }}>
                            {m.num}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom row */}
                    <View>
                      <Text
                        style={{
                          fontSize: rs.font(11),
                          fontWeight: '700',
                          color: 'rgba(255,255,255,0.85)',
                          letterSpacing: 1,
                          marginBottom: 2,
                        }}
                      >
                        MÓDULO {String(m.num).padStart(2, '0')}
                      </Text>
                      <Text
                        style={{
                          fontSize: rs.font(20),
                          fontWeight: '800',
                          color: '#fff',
                          textShadowColor: 'rgba(0,0,0,0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 4,
                        }}
                        numberOfLines={2}
                      >
                        {m.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={rs.font(12)} color="rgba(255,255,255,0.85)" />
                        <Text style={{ fontSize: rs.font(11), color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                          {prog.read}/{m.subs.length} subtemas
                        </Text>
                        {prog.pct === 100 && (
                          <MaterialCommunityIcons name="check-circle" size={rs.font(13)} color="#4ADE80" style={{ marginLeft: 4 }} />
                        )}
                      </View>
                      <View style={{ marginTop: 8 }}>
                        <ProgressBar progress={prog.pct} fillColor="#fff" trackColor="rgba(255,255,255,0.25)" height={4} />
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}

          {/* Footer info */}
          <View
            style={{
              backgroundColor: isDark ? colors.surface : colors.neuSurface,
              padding: rs.space(16),
              borderRadius: 16,
              marginTop: rs.space(8),
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <Text style={{ fontSize: rs.font(12), color: colors.textLight, lineHeight: rs.font(18), textAlign: 'center' }}>
              Material elaborado como guía de estudio. Verificá siempre los protocolos vigentes de tu institución y guías 2025-2026.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, rs }: { value: string; label: string; rs: ReturnType<typeof useResponsiveScale> }) {
  return (
    <View>
      <Text style={{ fontSize: rs.font(20), fontWeight: '800', color: '#fff' }}>{value}</Text>
      <Text style={{ fontSize: rs.font(10), color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}
