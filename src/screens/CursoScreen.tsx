// ============================================================
// CursoScreen — Lista de módulos del Curso de Enfermería
// ============================================================

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
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
import { useResponsiveScale, type ResponsiveScale } from '../utils/responsive';
import { getCursoImage } from '../utils/cursoImages';
import { ProgressBar } from '../components/ProgressBar';
import { PressableScale } from '../components/PressableScale';
import { FadeInView } from '../components/FadeInView';
import cursoData from '../data/curso.json';
import type { ThemeColors } from '../utils/colors';
import type { CursoData, CursoModulo } from '../types/curso';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CursoScreen'
>;

const data = cursoData as CursoData;

function useCursoStyles() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  return useMemo(() => createStyles(colors, rs, isDark), [colors, rs, isDark]);
}

export function CursoScreen() {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const { globalProgress, getModuloProgress, lastModuloId, recentModuloIds } =
    useCursoProgress();
  const rs = useResponsiveScale();
  const styles = useCursoStyles();
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
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const totalSubs = useMemo(
    () => data.modulos.reduce((acc, m) => acc + m.subs.length, 0),
    [],
  );

  const greeting = useMemo(() => {
    if (globalProgress.pct >= 100) return '¡CURSO COMPLETO! 🎉';
    if (globalProgress.pct === 0) return 'EMPECEMOS 👋';
    return 'SEGUÍ APRENDIENDO';
  }, [globalProgress.pct]);

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
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + rs.space(40) }}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + rs.space(20) }]}
        >
          {/* Profundidad decorativa: blobs suaves detrás del contenido */}
          <View
            pointerEvents="none"
            style={[styles.heroBlob, styles.heroBlobTop]}
          />
          <View
            pointerEvents="none"
            style={[styles.heroBlob, styles.heroBlobBottom]}
          />

          <Animated.View style={{ opacity: fade }}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroGreeting}>{greeting}</Text>
                <Text style={styles.heroTitle}>Manual de Enfermería</Text>
                <Text style={styles.heroSubtitle}>
                  Material integral: fundamentos, técnicas y emergencias
                </Text>
              </View>
              <View style={styles.heroActions}>
                <HeaderAction
                  icon="magnify"
                  label="Buscar"
                  onPress={() => navigation.navigate('BuscadorScreen')}
                />
                <HeaderAction
                  icon="book-alphabet"
                  label="Glosario"
                  onPress={() => navigation.navigate('GlosarioScreen')}
                />
                <HeaderAction
                  icon="apps"
                  label="Mi suite de enfermería"
                  onPress={() => navigation.navigate('MiSuite')}
                />
                <HeaderAction
                  icon="cog-outline"
                  label="Configuración"
                  onPress={() => navigation.navigate('SettingsScreen')}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <Stat label="módulos" value={String(data.modulos.length)} />
              <Stat label="subtemas" value={String(totalSubs)} />
              <Stat label="leído" value={`${globalProgress.pct}%`} />
            </View>

            <View style={styles.heroProgressWrap}>
              <ProgressBar
                progress={globalProgress.pct}
                fillColor="#fff"
                height={6}
              />
              <Text style={styles.heroProgressLabel}>
                {globalProgress.read} de {globalProgress.total} subtemas leídos
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Continuar */}
          {lastModulo && (
            <FadeInView delay={0}>
              <PressableScale
                onPress={() => handlePress(lastModulo)}
                accessibilityRole="button"
                accessibilityLabel={`Continuar con ${lastModulo.title}, ${
                  getModuloProgress(lastModulo.id).read
                } de ${lastModulo.subs.length} subtemas leídos`}
                style={[
                  styles.continueCard,
                  { borderColor: lastModulo.gradient[1] + '40' },
                ]}
              >
                <View
                  style={[
                    styles.continueIconWrap,
                    { backgroundColor: lastModulo.gradient[1] + '22' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={rs.font(26)}
                    color={lastModulo.gradient[1]}
                  />
                </View>
                <View style={styles.continueBody}>
                  <Text
                    style={[
                      styles.continueKicker,
                      { color: lastModulo.gradient[1] },
                    ]}
                  >
                    CONTINUAR
                  </Text>
                  <Text style={styles.continueTitle} numberOfLines={1}>
                    {lastModulo.title}
                  </Text>
                  <Text style={styles.continueMeta}>
                    {getModuloProgress(lastModulo.id).read} /{' '}
                    {lastModulo.subs.length} leídos
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={rs.font(22)}
                  color={colors.textLight}
                />
              </PressableScale>
            </FadeInView>
          )}

          {/* Recién visto */}
          {recentModulos.length > 1 && (
            <FadeInView delay={70} style={styles.recentSection}>
              <Text style={styles.recentHeading}>Recién visto</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              >
                {recentModulos.map(m => {
                  const prog = getModuloProgress(m.id);
                  return (
                    <PressableScale
                      key={m.id}
                      onPress={() => handlePress(m)}
                      accessibilityRole="button"
                      accessibilityLabel={`Módulo ${m.num}: ${m.title}, ${prog.pct}% leído`}
                      style={[
                        styles.recentCard,
                        { shadowColor: m.gradient[1] },
                      ]}
                    >
                      <LinearGradient
                        colors={m.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.recentGradient}
                      >
                        <View style={styles.recentTopRow}>
                          <MaterialCommunityIcons
                            name={m.iconName}
                            size={rs.font(20)}
                            color="#fff"
                          />
                          <Text style={styles.recentPct}>{prog.pct}%</Text>
                        </View>
                        <View>
                          <Text style={styles.recentKicker}>
                            MÓDULO {String(m.num).padStart(2, '0')}
                          </Text>
                          <Text style={styles.recentTitle} numberOfLines={2}>
                            {m.title}
                          </Text>
                        </View>
                      </LinearGradient>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </FadeInView>
          )}

          {/* Lista de módulos */}
          {data.modulos.map((m, idx) => {
            const locked = m.isPremium && !isPremium;
            const prog = getModuloProgress(m.id);
            return (
              <FadeInView key={m.id} delay={110 + idx * 55}>
                <PressableScale
                  onPress={() => handlePress(m)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    locked
                      ? `Módulo ${m.num}: ${m.title}. Contenido Premium bloqueado, toca para ver opciones`
                      : `Módulo ${m.num}: ${m.title}, ${prog.read} de ${m.subs.length} subtemas leídos`
                  }
                  style={[styles.moduleCard, { shadowColor: m.gradient[1] }]}
                >
                  <ImageBackground
                    source={getCursoImage(m.imageKey)}
                    style={styles.moduleImage}
                    imageStyle={styles.moduleImageRadius}
                  >
                    {locked && <View style={styles.lockedScrim} />}
                    <LinearGradient
                      colors={[
                        'transparent',
                        m.gradient[0] + '99',
                        m.gradient[1] + 'F0',
                      ]}
                      locations={[0, 0.45, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0.4, y: 1 }}
                      style={styles.moduleGradient}
                    >
                      {/* Top row */}
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleIconWrap}>
                          <MaterialCommunityIcons
                            name={m.iconName}
                            size={rs.font(24)}
                            color="#fff"
                          />
                        </View>

                        {locked ? (
                          <View style={styles.proBadge}>
                            <MaterialCommunityIcons
                              name="lock"
                              size={rs.font(11)}
                              color="#D97706"
                            />
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </View>
                        ) : (
                          <View style={styles.numBadge}>
                            <Text
                              style={[
                                styles.numBadgeText,
                                { color: m.gradient[1] },
                              ]}
                            >
                              {m.num}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Bottom row */}
                      <View>
                        <Text style={styles.moduleKicker}>
                          MÓDULO {String(m.num).padStart(2, '0')}
                        </Text>
                        <Text style={styles.moduleTitle} numberOfLines={2}>
                          {m.title}
                        </Text>
                        {locked ? (
                          <View style={styles.moduleMetaRow}>
                            <MaterialCommunityIcons
                              name="lock-outline"
                              size={rs.font(13)}
                              color="rgba(255,255,255,0.95)"
                            />
                            <Text style={styles.lockedMetaText}>
                              Contenido Premium — desbloquealo con PRO
                            </Text>
                          </View>
                        ) : (
                          <>
                            <View style={styles.moduleMetaRow}>
                              <MaterialCommunityIcons
                                name="book-open-page-variant"
                                size={rs.font(12)}
                                color="rgba(255,255,255,0.85)"
                              />
                              <Text style={styles.moduleMetaText}>
                                {prog.read}/{m.subs.length} subtemas
                              </Text>
                              {prog.pct === 100 && (
                                <MaterialCommunityIcons
                                  name="check-circle"
                                  size={rs.font(13)}
                                  color="#4ADE80"
                                  style={styles.moduleCheckIcon}
                                />
                              )}
                            </View>
                            <View style={styles.moduleProgressWrap}>
                              <ProgressBar
                                progress={prog.pct}
                                fillColor="#fff"
                                trackColor="rgba(255,255,255,0.25)"
                                height={4}
                              />
                            </View>
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </PressableScale>
              </FadeInView>
            );
          })}

          {/* Footer info */}
          <FadeInView delay={110 + data.modulos.length * 55}>
            <View style={styles.footerCard}>
              <Text style={styles.footerText}>
                Material elaborado como guía de estudio. Verificá siempre los
                protocolos vigentes de tu institución y guías 2025-2026.
              </Text>
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Subcomponentes ──────────────────────────────────────────

function HeaderAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const rs = useResponsiveScale();
  const styles = useCursoStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={styles.headerAction}
    >
      <MaterialCommunityIcons name={icon} size={rs.font(20)} color="#fff" />
    </PressableScale>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useCursoStyles();
  return (
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Styles factory ──────────────────────────────────────────

const createStyles = (
  colors: ThemeColors,
  rs: ResponsiveScale,
  isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Hero
    hero: {
      paddingBottom: rs.space(28),
      paddingHorizontal: rs.space(24),
      overflow: 'hidden',
    },
    heroBlob: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 999,
    },
    heroBlobTop: {
      width: rs.space(180),
      height: rs.space(180),
      top: -rs.space(70),
      right: -rs.space(50),
    },
    heroBlobBottom: {
      width: rs.space(130),
      height: rs.space(130),
      bottom: -rs.space(55),
      left: -rs.space(40),
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    heroTitleWrap: {
      flex: 1,
    },
    heroGreeting: {
      fontSize: rs.font(11),
      fontWeight: '800',
      color: 'rgba(255,255,255,0.8)',
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: rs.font(28),
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: rs.font(13),
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
      lineHeight: rs.font(19),
    },
    heroActions: {
      flexDirection: 'row',
      gap: rs.space(6),
      marginLeft: rs.space(8),
    },
    headerAction: {
      width: rs.space(38),
      height: rs.space(38),
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: rs.space(16),
      marginTop: rs.space(16),
    },
    statValue: {
      fontSize: rs.font(20),
      fontWeight: '800',
      color: '#fff',
    },
    statLabel: {
      fontSize: rs.font(10),
      color: 'rgba(255,255,255,0.8)',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroProgressWrap: {
      marginTop: rs.space(14),
    },
    heroProgressLabel: {
      fontSize: rs.font(11),
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
    },
    // Body
    body: {
      paddingHorizontal: rs.space(16),
      paddingTop: rs.space(20),
    },
    // Continuar
    continueCard: {
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      borderRadius: 16,
      padding: rs.space(14),
      marginBottom: rs.space(16),
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(12),
    },
    continueIconWrap: {
      width: rs.space(46),
      height: rs.space(46),
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueBody: {
      flex: 1,
    },
    continueKicker: {
      fontSize: rs.font(10),
      fontWeight: '800',
      letterSpacing: 1,
    },
    continueTitle: {
      fontSize: rs.font(15),
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
    },
    continueMeta: {
      fontSize: rs.font(11),
      color: colors.textLight,
      marginTop: 2,
    },
    // Recién visto
    recentSection: {
      marginBottom: rs.space(20),
    },
    recentHeading: {
      fontSize: rs.font(13),
      fontWeight: '800',
      color: colors.text,
      marginBottom: rs.space(10),
      letterSpacing: 0.3,
    },
    recentList: {
      gap: rs.space(10),
    },
    recentCard: {
      width: rs.space(150),
      borderRadius: 14,
      overflow: 'hidden',
      elevation: 3,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    recentGradient: {
      padding: rs.space(12),
      height: rs.space(110),
      justifyContent: 'space-between',
    },
    recentTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recentPct: {
      fontSize: rs.font(10),
      fontWeight: '800',
      color: 'rgba(255,255,255,0.9)',
    },
    recentKicker: {
      fontSize: rs.font(10),
      fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 0.8,
    },
    recentTitle: {
      fontSize: rs.font(12),
      fontWeight: '800',
      color: '#fff',
      marginTop: 2,
    },
    // Module cards
    moduleCard: {
      height: rs.space(160),
      borderRadius: 22,
      overflow: 'hidden',
      marginBottom: rs.space(14),
      elevation: 6,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
    },
    moduleImage: {
      flex: 1,
    },
    moduleImageRadius: {
      borderRadius: 22,
    },
    lockedScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15,23,42,0.32)',
      zIndex: 1,
    },
    moduleGradient: {
      flex: 1,
      padding: rs.space(18),
      justifyContent: 'space-between',
      borderRadius: 22,
      zIndex: 2,
    },
    moduleTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    moduleIconWrap: {
      width: rs.space(46),
      height: rs.space(46),
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    proBadge: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      paddingHorizontal: rs.space(10),
      paddingVertical: rs.space(4),
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    proBadgeText: {
      fontSize: rs.font(9),
      fontWeight: '900',
      color: '#D97706',
      letterSpacing: 0.5,
    },
    numBadge: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      width: rs.space(28),
      height: rs.space(28),
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numBadgeText: {
      fontSize: rs.font(13),
      fontWeight: '900',
    },
    moduleKicker: {
      fontSize: rs.font(11),
      fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1,
      marginBottom: 2,
    },
    moduleTitle: {
      fontSize: rs.font(20),
      fontWeight: '800',
      color: '#fff',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    moduleMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: 6,
    },
    moduleMetaText: {
      fontSize: rs.font(11),
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
    },
    lockedMetaText: {
      fontSize: rs.font(11),
      color: 'rgba(255,255,255,0.95)',
      fontWeight: '700',
    },
    moduleCheckIcon: {
      marginLeft: 4,
    },
    moduleProgressWrap: {
      marginTop: 8,
    },
    // Footer
    footerCard: {
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      padding: rs.space(16),
      borderRadius: 16,
      marginTop: rs.space(8),
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    footerText: {
      fontSize: rs.font(12),
      color: colors.textLight,
      lineHeight: rs.font(18),
      textAlign: 'center',
    },
  });
