// ============================================================
// CursoModuloScreen — Renderiza un módulo del curso (subtemas + bloques)
// ============================================================

import React, {
  useMemo,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useCursoProgress } from '../context/CursoProgressContext';
import { useResponsiveScale, type ResponsiveScale } from '../utils/responsive';
import { getCursoImage } from '../utils/cursoImages';
import { ProgressBar } from '../components/ProgressBar';
import cursoData from '../data/curso.json';
import type { ThemeColors } from '../utils/colors';
import type {
  CursoData,
  CursoBlock,
  CursoCardVariant,
  CursoSub,
} from '../types/curso';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CursoModulo'>;

const data = cursoData as CursoData;

const CARD_STYLES: Record<
  CursoCardVariant,
  {
    bg: string;
    border: string;
    bgDark: string;
    borderDark: string;
    emoji: string;
  }
> = {
  insight: {
    bg: '#E0F2FE',
    border: '#0284C7',
    bgDark: '#0C2A40',
    borderDark: '#38BDF8',
    emoji: '💡',
  },
  tip: {
    bg: '#ECFDF5',
    border: '#059669',
    bgDark: '#0A2E22',
    borderDark: '#10B981',
    emoji: '✨',
  },
  alert: {
    bg: '#FEF2F2',
    border: '#DC2626',
    bgDark: '#3B1212',
    borderDark: '#EF4444',
    emoji: '🚨',
  },
  warn: {
    bg: '#FFFBEB',
    border: '#D97706',
    bgDark: '#3A2A08',
    borderDark: '#F59E0B',
    emoji: '⚠️',
  },
};

// Hook compartido: una sola StyleSheet para todos los componentes del archivo.
function useModuloStyles() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  return useMemo(() => createStyles(colors, rs, isDark), [colors, rs, isDark]);
}

export function CursoModuloScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const rs = useResponsiveScale();
  const styles = useModuloStyles();
  const insets = useSafeAreaInsets();
  const { moduloId, subId } = route.params;
  const { isRead, toggleRead, recordOpenModulo, getModuloProgress } =
    useCursoProgress();

  const modulo = useMemo(
    () => data.modulos.find(m => m.id === moduloId),
    [moduloId],
  );
  const progress = getModuloProgress(moduloId);

  // ── Indicador de progreso de lectura (scroll) ──────────────────
  // Barra fina pegada bajo el header que se llena a medida que el
  // usuario avanza por el contenido. scaleX + native driver para no
  // bloquear el hilo JS durante el scroll.
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollRange, setScrollRange] = useState(0);
  const viewportHRef = useRef(0);
  const contentHRef = useRef(0);

  const updateScrollRange = useCallback(() => {
    setScrollRange(Math.max(0, contentHRef.current - viewportHRef.current));
  }, []);

  const readingProgressScaleX = useMemo(
    () =>
      scrollRange > 0
        ? scrollY.interpolate({
            inputRange: [0, scrollRange],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        : 0,
    [scrollY, scrollRange],
  );

  // ── Scroll-to-sub (deep link desde BuscadorScreen) ─────────────
  // Trackeamos posiciones via onLayout puro en JS (más confiable que
  // measureLayout durante el primer layout pass, que puede devolver
  // coordenadas relativas a un sistema de referencia aún no settled).
  const scrollRef = useRef<ScrollView | null>(null);
  const subOffsetsRef = useRef<Record<string, number>>({}); // y relativa al subs container
  const subsContainerYRef = useRef<number | null>(null); // y del subs container dentro del scroll content
  // Pending target; se vacía tras el primer scroll para que un re-layout
  // posterior (ej. marcar como leído) no vuelva a yankear la viewport.
  const pendingSubIdRef = useRef<string | null>(subId ?? null);

  const tryScrollToPending = useCallback(() => {
    const target = pendingSubIdRef.current;
    if (!target) return;
    const subY = subOffsetsRef.current[target];
    const containerY = subsContainerYRef.current;
    const scroll = scrollRef.current;
    if (subY == null || containerY == null || !scroll) return;
    scroll.scrollTo({
      y: Math.max(0, containerY + subY - 12),
      animated: false,
    });
    pendingSubIdRef.current = null;
  }, []);

  useEffect(() => {
    recordOpenModulo(moduloId);
  }, [moduloId, recordOpenModulo]);

  useLayoutEffect(() => {
    if (modulo) {
      navigation.setOptions({ title: `Módulo ${modulo.num}` });
    }
  }, [navigation, modulo]);

  if (!modulo) {
    return (
      <View style={styles.notFoundContainer}>
        <View style={styles.notFoundIconWrap}>
          <MaterialCommunityIcons
            name="book-remove-outline"
            size={rs.font(36)}
            color={colors.textLight}
          />
        </View>
        <Text style={styles.notFoundTitle}>Módulo no encontrado</Text>
        <Text style={styles.notFoundText}>
          El contenido que buscás no está disponible. Volvé a la lista de
          módulos e intentá de nuevo.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Volver a la lista de módulos"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.notFoundButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={rs.font(16)}
            color="#fff"
          />
          <Text style={styles.notFoundButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Indicador de progreso de lectura */}
      <View
        style={styles.readingTrack}
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View
          style={[
            styles.readingFill,
            {
              backgroundColor: modulo.gradient[1],
              transform: [{ scaleX: readingProgressScaleX }],
            },
          ]}
        />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + rs.space(40) }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          },
        )}
        scrollEventThrottle={16}
        onLayout={e => {
          viewportHRef.current = e.nativeEvent.layout.height;
          updateScrollRange();
        }}
        onContentSizeChange={(_w, h) => {
          contentHRef.current = h;
          updateScrollRange();
        }}
      >
        {/* Hero */}
        <ImageBackground
          source={getCursoImage(modulo.imageKey)}
          style={styles.hero}
        >
          <LinearGradient
            colors={[
              'transparent',
              modulo.gradient[0] + 'AA',
              modulo.gradient[1] + 'F2',
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons
                name={modulo.iconName}
                size={rs.font(28)}
                color="#fff"
              />
            </View>
            <Text style={styles.heroKicker}>
              MÓDULO {String(modulo.num).padStart(2, '0')}
            </Text>
            <Text style={styles.heroTitle}>{modulo.title}</Text>
            <Text style={styles.heroLead}>{modulo.lead}</Text>

            <View style={styles.heroProgressRow}>
              <View style={styles.heroProgressBar}>
                <ProgressBar
                  progress={progress.pct}
                  fillColor="#fff"
                  trackColor="rgba(255,255,255,0.3)"
                  height={5}
                />
              </View>
              <Text style={styles.heroProgressText}>
                {progress.read}/{progress.total}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Subtemas */}
        <View
          onLayout={e => {
            subsContainerYRef.current = e.nativeEvent.layout.y;
            tryScrollToPending();
          }}
          style={styles.subsContainer}
        >
          {modulo.subs.map(sub => {
            const read = isRead(sub.id);
            return (
              <View
                key={sub.id}
                onLayout={e => {
                  subOffsetsRef.current[sub.id] = e.nativeEvent.layout.y;
                  if (pendingSubIdRef.current === sub.id) tryScrollToPending();
                }}
                style={styles.subBlock}
              >
                <View style={styles.subTitleRow}>
                  <View
                    style={[
                      styles.subAccentBar,
                      { backgroundColor: modulo.gradient[1] },
                    ]}
                  />
                  <Text style={styles.subTitle}>{sub.title}</Text>
                  {read && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={rs.font(20)}
                      color="#16A34A"
                    />
                  )}
                </View>
                {sub.blocks.map((block, i) => (
                  <BlockRenderer
                    key={i}
                    block={block as CursoBlock}
                    accent={modulo.gradient[1]}
                  />
                ))}
                <ReadToggleButton
                  sub={sub}
                  accent={modulo.gradient[1]}
                  read={read}
                  onToggle={() => toggleRead(sub.id)}
                />
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ============================================================
// ReadToggleButton — marca subtema como leído / no leído
// ============================================================

function ReadToggleButton({
  sub,
  accent,
  read,
  onToggle,
}: {
  sub: CursoSub;
  accent: string;
  read: boolean;
  onToggle: () => void;
}) {
  const rs = useResponsiveScale();
  const { isDark, colors } = useTheme();
  const styles = useModuloStyles();

  const readDone = '#16A34A';
  const offBg = isDark ? colors.surface : '#FFFFFF';
  const bg = read ? readDone : offBg;
  const border = read ? readDone : accent + '60';
  const fg = read ? '#FFFFFF' : accent;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: read }}
      accessibilityLabel={
        read ? `Desmarcar ${sub.title}` : `Marcar ${sub.title} como leído`
      }
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[styles.readToggle, { backgroundColor: bg, borderColor: border }]}
    >
      <MaterialCommunityIcons
        name={read ? 'check-circle' : 'checkbox-blank-circle-outline'}
        size={rs.font(16)}
        color={fg}
      />
      <Text style={[styles.readToggleText, { color: fg }]}>
        {read ? 'Leído' : 'Marcar como leído'}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================
// BlockRenderer — renderiza cada tipo de bloque
// ============================================================

function BlockRenderer({
  block,
  accent,
}: {
  block: CursoBlock;
  accent: string;
}) {
  const { isDark } = useTheme();
  const styles = useModuloStyles();

  switch (block.type) {
    case 'p':
      return <Text style={styles.paragraph}>{block.text}</Text>;

    case 'h4':
      return <Text style={styles.h4}>{block.text}</Text>;

    case 'list':
      return (
        <View style={styles.listBlock}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.listBullet, { color: accent }]}>•</Text>
              <Text style={styles.listText}>{it}</Text>
            </View>
          ))}
        </View>
      );

    case 'ol':
      return (
        <View style={styles.listBlock}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.olRow}>
              <View
                style={[styles.olBadge, { backgroundColor: accent + '22' }]}
              >
                <Text style={[styles.olBadgeText, { color: accent }]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={styles.listText}>{it}</Text>
            </View>
          ))}
        </View>
      );

    case 'card': {
      const sty = CARD_STYLES[block.variant];
      const bg = isDark ? sty.bgDark : sty.bg;
      const border = isDark ? sty.borderDark : sty.border;
      return (
        <View
          style={[
            styles.calloutCard,
            { backgroundColor: bg, borderLeftColor: border },
          ]}
        >
          <View style={styles.calloutTitleRow}>
            <Text style={styles.calloutEmoji}>{sty.emoji}</Text>
            <Text style={[styles.calloutTitle, { color: border }]}>
              {block.title}
            </Text>
          </View>
          {block.text && <Text style={styles.calloutText}>{block.text}</Text>}
          {block.items && (
            <View style={block.text ? styles.calloutItemsSpaced : null}>
              {block.items.map((it, i) => (
                <View key={i} style={styles.calloutItemRow}>
                  <Text style={[styles.calloutBullet, { color: border }]}>
                    •
                  </Text>
                  <Text style={styles.calloutItemText}>{it}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    case 'table':
      return (
        <TableBlock headers={block.headers} rows={block.rows} accent={accent} />
      );

    case 'grid':
      return (
        <View style={styles.gridBlock}>
          {block.cards.map((c, i) => (
            <View key={i} style={styles.gridCard}>
              <Text style={[styles.gridCardTitle, { color: accent }]}>
                {c.title}
              </Text>
              <Text style={styles.gridCardText}>{c.text}</Text>
            </View>
          ))}
        </View>
      );

    case 'image':
      return null; // Reservado para futura expansión

    case 'crosslink':
      return (
        <CrosslinkBlock
          target={block.target}
          title={block.title}
          description={block.description}
          path={block.path}
        />
      );

    default:
      return null;
  }
}

// ============================================================
// CrosslinkBlock — botón que abre otra app del ecosistema
// ============================================================

const APP_CONFIG: Record<
  'patologias' | 'farmacologia',
  {
    scheme: string;
    pkg: string;
    name: string;
    icon: string;
    gradient: [string, string];
  }
> = {
  patologias: {
    scheme: 'patologias://',
    pkg: 'com.patologiasenfermeria.free',
    name: 'app Patologías',
    icon: 'stethoscope',
    gradient: ['#7C3AED', '#5B21B6'],
  },
  farmacologia: {
    scheme: 'farmacologia://',
    pkg: 'com.guiafarmacologica.free',
    name: 'app Farmacológica',
    icon: 'pill',
    gradient: ['#EC4899', '#BE185D'],
  },
};

function CrosslinkBlock({
  target,
  title,
  description,
  path,
}: {
  target: 'patologias' | 'farmacologia';
  title: string;
  description: string;
  path?: string;
}) {
  const rs = useResponsiveScale();
  const styles = useModuloStyles();
  const cfg = APP_CONFIG[target];

  const handlePress = useCallback(async () => {
    const url = path ? `${cfg.scheme}${path}` : cfg.scheme;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen) {
      Linking.openURL(url);
      return;
    }
    Alert.alert(
      `Necesitás la ${cfg.name}`,
      `Para acceder a esta sección instalá ${cfg.name} desde Google Play.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir Play Store',
          onPress: () => {
            const playUrl = `market://details?id=${cfg.pkg}`;
            const webFallback = `https://play.google.com/store/apps/details?id=${cfg.pkg}`;
            Linking.openURL(playUrl).catch(() => Linking.openURL(webFallback));
          },
        },
      ],
    );
  }, [cfg, path]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${title} en la ${cfg.name}`}
      style={[styles.crosslink, { shadowColor: cfg.gradient[1] }]}
    >
      <LinearGradient
        colors={cfg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.crosslinkGradient}
      >
        <View style={styles.crosslinkIconWrap}>
          <MaterialCommunityIcons
            name={cfg.icon}
            size={rs.font(26)}
            color="#fff"
          />
        </View>
        <View style={styles.crosslinkBody}>
          <View style={styles.crosslinkKickerRow}>
            <Text style={styles.crosslinkKicker}>
              {target === 'patologias' ? 'APP PATOLOGÍAS' : 'APP FARMACOLÓGICA'}
            </Text>
            <MaterialCommunityIcons
              name="open-in-new"
              size={rs.font(11)}
              color="rgba(255,255,255,0.7)"
            />
          </View>
          <Text style={styles.crosslinkTitle}>{title}</Text>
          <Text style={styles.crosslinkDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={rs.font(24)}
          color="#fff"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================================
// TableBlock — tabla con scroll horizontal y filas zebra
// ============================================================

function TableBlock({
  headers,
  rows,
  accent,
}: {
  headers: string[];
  rows: string[][];
  accent: string;
}) {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  const styles = useModuloStyles();

  const colWidth = Math.max(rs.space(110), 100);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tableWrap}
    >
      <View>
        {/* Header */}
        <View
          style={[
            styles.tableHeaderRow,
            { backgroundColor: accent + (isDark ? '33' : '15') },
          ]}
        >
          {headers.map((h, i) => (
            <View
              key={i}
              style={[
                styles.tableCell,
                { width: colWidth },
                i < headers.length - 1 && styles.tableCellDivider,
              ]}
            >
              <Text style={[styles.tableHeaderText, { color: accent }]}>
                {h}
              </Text>
            </View>
          ))}
        </View>
        {/* Body */}
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={[
              styles.tableBodyRow,
              {
                backgroundColor:
                  ri % 2 === 0
                    ? isDark
                      ? colors.surface
                      : colors.neuSurface
                    : isDark
                    ? colors.background
                    : '#F8FAFC',
              },
            ]}
          >
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={[
                  styles.tableCell,
                  { width: colWidth },
                  ci < row.length - 1 && styles.tableCellDivider,
                ]}
              >
                <Text style={styles.tableCellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ============================================================
// Styles factory — tipografía de lectura: cuerpo 15/24 (1.6×),
// jerarquía clara título de sub (17) > h4 (16) > cuerpo (15) > tablas (12.5)
// ============================================================

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
    // ── Reading progress ──
    readingTrack: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: colors.borderLight,
      zIndex: 10,
    },
    readingFill: {
      height: '100%',
      width: '100%',
      transformOrigin: 'left',
    },
    // ── Not found ──
    notFoundContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: rs.space(32),
    },
    notFoundIconWrap: {
      width: rs.space(72),
      height: rs.space(72),
      borderRadius: rs.space(36),
      backgroundColor: isDark ? colors.surface : colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs.space(16),
    },
    notFoundTitle: {
      fontSize: rs.font(17),
      fontWeight: '800',
      color: colors.text,
      marginBottom: rs.space(6),
    },
    notFoundText: {
      fontSize: rs.font(14),
      color: colors.textSecondary,
      lineHeight: rs.font(21),
      textAlign: 'center',
      marginBottom: rs.space(20),
    },
    notFoundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(8),
      backgroundColor: colors.primary,
      paddingHorizontal: rs.space(20),
      paddingVertical: rs.space(12),
      borderRadius: 999,
    },
    notFoundButtonText: {
      fontSize: rs.font(14),
      fontWeight: '700',
      color: '#fff',
    },
    // ── Hero ──
    hero: {
      height: rs.space(220),
    },
    heroGradient: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: rs.space(20),
      paddingBottom: rs.space(18),
    },
    heroIconWrap: {
      width: rs.space(54),
      height: rs.space(54),
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs.space(10),
    },
    heroKicker: {
      fontSize: rs.font(11),
      fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1.2,
    },
    heroTitle: {
      fontSize: rs.font(24),
      fontWeight: '800',
      color: '#fff',
      marginTop: 2,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroLead: {
      fontSize: rs.font(13),
      color: 'rgba(255,255,255,0.9)',
      marginTop: 6,
      fontStyle: 'italic',
      lineHeight: rs.font(19),
    },
    heroProgressRow: {
      marginTop: rs.space(14),
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(10),
    },
    heroProgressBar: {
      flex: 1,
    },
    heroProgressText: {
      fontSize: rs.font(11),
      fontWeight: '700',
      color: '#fff',
    },
    // ── Subtemas ──
    subsContainer: {
      paddingHorizontal: rs.space(18),
      paddingTop: rs.space(20),
    },
    subBlock: {
      marginBottom: rs.space(32),
    },
    subTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: rs.space(14),
      gap: rs.space(10),
    },
    subAccentBar: {
      width: 6,
      height: rs.space(24),
      borderRadius: 3,
    },
    subTitle: {
      fontSize: rs.font(18),
      fontWeight: '800',
      color: colors.text,
      flex: 1,
      lineHeight: rs.font(25),
    },
    // ── Bloques de texto ──
    paragraph: {
      fontSize: rs.font(15),
      color: colors.textSecondary,
      lineHeight: rs.font(24),
      marginBottom: rs.space(12),
    },
    h4: {
      fontSize: rs.font(16),
      fontWeight: '800',
      color: colors.text,
      lineHeight: rs.font(23),
      marginTop: rs.space(10),
      marginBottom: rs.space(8),
    },
    listBlock: {
      marginBottom: rs.space(12),
      paddingLeft: rs.space(4),
    },
    listRow: {
      flexDirection: 'row',
      marginBottom: rs.space(7),
    },
    listBullet: {
      marginRight: rs.space(10),
      fontSize: rs.font(15),
      fontWeight: '700',
      lineHeight: rs.font(24),
    },
    listText: {
      flex: 1,
      fontSize: rs.font(15),
      color: colors.textSecondary,
      lineHeight: rs.font(24),
    },
    olRow: {
      flexDirection: 'row',
      marginBottom: rs.space(8),
    },
    olBadge: {
      width: rs.space(24),
      height: rs.space(24),
      borderRadius: rs.space(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: rs.space(10),
      marginTop: 1,
    },
    olBadgeText: {
      fontSize: rs.font(11),
      fontWeight: '800',
    },
    // ── Callout card (insight / tip / alert / warn) ──
    calloutCard: {
      borderLeftWidth: 4,
      borderRadius: 12,
      padding: rs.space(14),
      marginVertical: rs.space(12),
    },
    calloutTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: rs.space(7),
      marginBottom: rs.space(7),
    },
    calloutEmoji: {
      fontSize: rs.font(14),
      lineHeight: rs.font(20),
    },
    calloutTitle: {
      flex: 1,
      fontSize: rs.font(14),
      fontWeight: '800',
      lineHeight: rs.font(20),
    },
    calloutText: {
      fontSize: rs.font(14),
      color: isDark ? '#E6ECF5' : '#1F2937',
      lineHeight: rs.font(22),
    },
    calloutItemsSpaced: {
      marginTop: rs.space(7),
    },
    calloutItemRow: {
      flexDirection: 'row',
      marginBottom: rs.space(5),
    },
    calloutBullet: {
      marginRight: rs.space(8),
      fontWeight: '700',
      fontSize: rs.font(14),
      lineHeight: rs.font(22),
    },
    calloutItemText: {
      flex: 1,
      fontSize: rs.font(14),
      color: isDark ? '#E6ECF5' : '#1F2937',
      lineHeight: rs.font(22),
    },
    // ── Grid ──
    gridBlock: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs.space(8),
      marginVertical: rs.space(12),
    },
    gridCard: {
      flexBasis: '48%',
      flexGrow: 1,
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      borderRadius: 12,
      padding: rs.space(12),
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    gridCardTitle: {
      fontSize: rs.font(13),
      fontWeight: '800',
      marginBottom: 4,
      lineHeight: rs.font(19),
    },
    gridCardText: {
      fontSize: rs.font(12.5),
      color: colors.textSecondary,
      lineHeight: rs.font(19),
    },
    // ── Read toggle ──
    readToggle: {
      marginTop: rs.space(8),
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(8),
      paddingHorizontal: rs.space(14),
      paddingVertical: rs.space(9),
      borderRadius: 999,
      borderWidth: 1,
      minHeight: rs.space(38),
    },
    readToggleText: {
      fontSize: rs.font(12),
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    // ── Crosslink ──
    crosslink: {
      marginVertical: rs.space(12),
      borderRadius: 14,
      overflow: 'hidden',
      elevation: 4,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    crosslinkGradient: {
      padding: rs.space(16),
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(14),
    },
    crosslinkIconWrap: {
      width: rs.space(48),
      height: rs.space(48),
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    crosslinkBody: {
      flex: 1,
    },
    crosslinkKickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    crosslinkKicker: {
      fontSize: rs.font(10),
      fontWeight: '800',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1,
    },
    crosslinkTitle: {
      fontSize: rs.font(15),
      fontWeight: '800',
      color: '#fff',
      marginBottom: 3,
    },
    crosslinkDescription: {
      fontSize: rs.font(12),
      color: 'rgba(255,255,255,0.85)',
      lineHeight: rs.font(18),
    },
    // ── Tabla ──
    tableWrap: {
      marginVertical: rs.space(12),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    tableHeaderRow: {
      flexDirection: 'row',
    },
    tableBodyRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    tableCell: {
      padding: rs.space(10),
    },
    tableCellDivider: {
      borderRightWidth: 1,
      borderRightColor: colors.borderLight,
    },
    tableHeaderText: {
      fontSize: rs.font(11),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    tableCellText: {
      fontSize: rs.font(12.5),
      color: colors.textSecondary,
      lineHeight: rs.font(19),
    },
  });
