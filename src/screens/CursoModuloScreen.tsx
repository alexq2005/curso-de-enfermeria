// ============================================================
// CursoModuloScreen — Renderiza un módulo del curso (subtemas + bloques)
// ============================================================

import React, { useMemo, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useCursoProgress } from '../context/CursoProgressContext';
import { useResponsiveScale } from '../utils/responsive';
import { getCursoImage } from '../utils/cursoImages';
import { ProgressBar } from '../components/ProgressBar';
import cursoData from '../data/curso.json';
import type { CursoData, CursoBlock, CursoCardVariant, CursoSub } from '../types/curso';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CursoModulo'>;

const data = cursoData as CursoData;

const CARD_STYLES: Record<CursoCardVariant, { bg: string; border: string; bgDark: string; borderDark: string; emoji: string }> = {
  insight: { bg: '#E0F2FE', border: '#0284C7', bgDark: '#0C2A40', borderDark: '#38BDF8', emoji: '💡' },
  tip:     { bg: '#ECFDF5', border: '#059669', bgDark: '#0A2E22', borderDark: '#10B981', emoji: '✨' },
  alert:   { bg: '#FEF2F2', border: '#DC2626', bgDark: '#3B1212', borderDark: '#EF4444', emoji: '🚨' },
  warn:    { bg: '#FFFBEB', border: '#D97706', bgDark: '#3A2A08', borderDark: '#F59E0B', emoji: '⚠️' },
};

export function CursoModuloScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const { moduloId, subId } = route.params;
  const { isRead, toggleRead, recordOpenModulo, getModuloProgress } = useCursoProgress();

  const modulo = useMemo(() => data.modulos.find(m => m.id === moduloId), [moduloId]);
  const progress = getModuloProgress(moduloId);

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
    scroll.scrollTo({ y: Math.max(0, containerY + subY - 12), animated: false });
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
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textLight, fontSize: rs.font(14) }}>Módulo no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + rs.space(40) }}>
        {/* Hero */}
        <ImageBackground source={getCursoImage(modulo.imageKey)} style={{ height: rs.space(220) }}>
          <LinearGradient
            colors={['transparent', modulo.gradient[0] + 'AA', modulo.gradient[1] + 'F2']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: 'flex-end', padding: rs.space(20), paddingBottom: rs.space(18) }}
          >
            <View
              style={{
                width: rs.space(54),
                height: rs.space(54),
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: rs.space(10),
              }}
            >
              <MaterialCommunityIcons name={modulo.iconName} size={rs.font(28)} color="#fff" />
            </View>
            <Text
              style={{
                fontSize: rs.font(11),
                fontWeight: '700',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: 1.2,
              }}
            >
              MÓDULO {String(modulo.num).padStart(2, '0')}
            </Text>
            <Text
              style={{
                fontSize: rs.font(24),
                fontWeight: '800',
                color: '#fff',
                marginTop: 2,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {modulo.title}
            </Text>
            <Text style={{ fontSize: rs.font(13), color: 'rgba(255,255,255,0.9)', marginTop: 6, fontStyle: 'italic', lineHeight: rs.font(18) }}>
              {modulo.lead}
            </Text>

            <View style={{ marginTop: rs.space(14), flexDirection: 'row', alignItems: 'center', gap: rs.space(10) }}>
              <View style={{ flex: 1 }}>
                <ProgressBar progress={progress.pct} fillColor="#fff" trackColor="rgba(255,255,255,0.3)" height={5} />
              </View>
              <Text style={{ fontSize: rs.font(11), fontWeight: '700', color: '#fff' }}>
                {progress.read}/{progress.total}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Subtemas */}
        <View
          onLayout={(e) => {
            subsContainerYRef.current = e.nativeEvent.layout.y;
            tryScrollToPending();
          }}
          style={{ paddingHorizontal: rs.space(18), paddingTop: rs.space(20) }}
        >
          {modulo.subs.map((sub) => {
            const read = isRead(sub.id);
            return (
              <View
                key={sub.id}
                onLayout={(e) => {
                  subOffsetsRef.current[sub.id] = e.nativeEvent.layout.y;
                  if (pendingSubIdRef.current === sub.id) tryScrollToPending();
                }}
                style={{ marginBottom: rs.space(28) }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: rs.space(12), gap: rs.space(10) }}>
                  <View style={{ width: 6, height: rs.space(24), backgroundColor: modulo.gradient[1], borderRadius: 3 }} />
                  <Text style={{ fontSize: rs.font(17), fontWeight: '800', color: colors.text, flex: 1 }}>
                    {sub.title}
                  </Text>
                  {read && (
                    <MaterialCommunityIcons name="check-circle" size={rs.font(20)} color="#16A34A" />
                  )}
                </View>
                {sub.blocks.map((block, i) => (
                  <BlockRenderer key={i} block={block as CursoBlock} accent={modulo.gradient[1]} />
                ))}
                <ReadToggleButton sub={sub} accent={modulo.gradient[1]} read={read} onToggle={() => toggleRead(sub.id)} />
              </View>
            );
          })}
        </View>
      </ScrollView>
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

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={read ? `Desmarcar ${sub.title}` : `Marcar ${sub.title} como leído`}
      style={{
        marginTop: rs.space(8),
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs.space(8),
        paddingHorizontal: rs.space(14),
        paddingVertical: rs.space(8),
        borderRadius: 999,
        backgroundColor: read ? '#16A34A' : isDark ? colors.surface : '#fff',
        borderWidth: 1,
        borderColor: read ? '#16A34A' : accent + '60',
      }}
    >
      <MaterialCommunityIcons
        name={read ? 'check-circle' : 'checkbox-blank-circle-outline'}
        size={rs.font(16)}
        color={read ? '#fff' : accent}
      />
      <Text
        style={{
          fontSize: rs.font(12),
          fontWeight: '700',
          color: read ? '#fff' : accent,
          letterSpacing: 0.3,
        }}
      >
        {read ? 'Leído' : 'Marcar como leído'}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================
// BlockRenderer — renderiza cada tipo de bloque
// ============================================================

function BlockRenderer({ block, accent }: { block: CursoBlock; accent: string }) {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();

  const baseTextStyle = {
    fontSize: rs.font(14),
    color: colors.textSecondary,
    lineHeight: rs.font(22),
  };

  switch (block.type) {
    case 'p':
      return <Text style={[baseTextStyle, { marginBottom: rs.space(10) }]}>{block.text}</Text>;

    case 'h4':
      return (
        <Text
          style={{
            fontSize: rs.font(15),
            fontWeight: '800',
            color: colors.text,
            marginTop: rs.space(8),
            marginBottom: rs.space(6),
          }}
        >
          {block.text}
        </Text>
      );

    case 'list':
      return (
        <View style={{ marginBottom: rs.space(10), paddingLeft: rs.space(4) }}>
          {block.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: rs.space(5) }}>
              <Text style={{ color: accent, marginRight: rs.space(8), fontSize: rs.font(14), fontWeight: '700', lineHeight: rs.font(22) }}>•</Text>
              <Text style={[baseTextStyle, { flex: 1 }]}>{it}</Text>
            </View>
          ))}
        </View>
      );

    case 'ol':
      return (
        <View style={{ marginBottom: rs.space(10), paddingLeft: rs.space(4) }}>
          {block.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: rs.space(6) }}>
              <View
                style={{
                  width: rs.space(22),
                  height: rs.space(22),
                  borderRadius: 11,
                  backgroundColor: accent + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: rs.space(10),
                  marginTop: 2,
                }}
              >
                <Text style={{ color: accent, fontSize: rs.font(11), fontWeight: '800' }}>{i + 1}</Text>
              </View>
              <Text style={[baseTextStyle, { flex: 1 }]}>{it}</Text>
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
          style={{
            backgroundColor: bg,
            borderLeftWidth: 4,
            borderLeftColor: border,
            borderRadius: 12,
            padding: rs.space(14),
            marginVertical: rs.space(10),
          }}
        >
          <Text
            style={{
              fontSize: rs.font(13),
              fontWeight: '800',
              color: border,
              marginBottom: rs.space(6),
            }}
          >
            {block.title}
          </Text>
          {block.text && (
            <Text style={{ fontSize: rs.font(13), color: isDark ? '#E6ECF5' : '#1F2937', lineHeight: rs.font(20) }}>
              {block.text}
            </Text>
          )}
          {block.items && (
            <View style={{ marginTop: block.text ? rs.space(6) : 0 }}>
              {block.items.map((it, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: rs.space(4) }}>
                  <Text style={{ color: border, marginRight: rs.space(8), fontWeight: '700' }}>•</Text>
                  <Text style={{ flex: 1, fontSize: rs.font(13), color: isDark ? '#E6ECF5' : '#1F2937', lineHeight: rs.font(20) }}>{it}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    case 'table':
      return <TableBlock headers={block.headers} rows={block.rows} accent={accent} />;

    case 'grid':
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs.space(8), marginVertical: rs.space(10) }}>
          {block.cards.map((c, i) => (
            <View
              key={i}
              style={{
                flexBasis: '48%',
                flexGrow: 1,
                backgroundColor: isDark ? colors.surface : colors.neuSurface,
                borderRadius: 12,
                padding: rs.space(12),
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text style={{ fontSize: rs.font(13), fontWeight: '800', color: accent, marginBottom: 4 }}>{c.title}</Text>
              <Text style={{ fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(18) }}>{c.text}</Text>
            </View>
          ))}
        </View>
      );

    case 'image':
      return null; // Reservado para futura expansión

    case 'crosslink':
      return <CrosslinkBlock target={block.target} title={block.title} description={block.description} path={block.path} />;

    default:
      return null;
  }
}

// ============================================================
// CrosslinkBlock — botón que abre otra app del ecosistema
// ============================================================

const APP_CONFIG: Record<'patologias' | 'farmacologia', { scheme: string; pkg: string; name: string; icon: string; gradient: [string, string] }> = {
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

function CrosslinkBlock({ target, title, description, path }: { target: 'patologias' | 'farmacologia'; title: string; description: string; path?: string }) {
  const rs = useResponsiveScale();
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
      style={{
        marginVertical: rs.space(12),
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: cfg.gradient[1],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <LinearGradient
        colors={cfg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: rs.space(16), flexDirection: 'row', alignItems: 'center', gap: rs.space(14) }}
      >
        <View
          style={{
            width: rs.space(48),
            height: rs.space(48),
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.22)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name={cfg.icon} size={rs.font(26)} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={{ fontSize: rs.font(10), fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>
              {target === 'patologias' ? 'APP PATOLOGÍAS' : 'APP FARMACOLÓGICA'}
            </Text>
            <MaterialCommunityIcons name="open-in-new" size={rs.font(11)} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={{ fontSize: rs.font(15), fontWeight: '800', color: '#fff', marginBottom: 3 }}>
            {title}
          </Text>
          <Text style={{ fontSize: rs.font(12), color: 'rgba(255,255,255,0.85)', lineHeight: rs.font(17) }}>
            {description}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={rs.font(24)} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================================
// TableBlock — tabla con scroll horizontal y filas zebra
// ============================================================

function TableBlock({ headers, rows, accent }: { headers: string[]; rows: string[][]; accent: string }) {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();

  const colWidth = Math.max(rs.space(110), 100);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        marginVertical: rs.space(10),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      <View>
        {/* Header */}
        <View style={{ flexDirection: 'row', backgroundColor: accent + (isDark ? '33' : '15') }}>
          {headers.map((h, i) => (
            <View
              key={i}
              style={{
                width: colWidth,
                padding: rs.space(10),
                borderRightWidth: i < headers.length - 1 ? 1 : 0,
                borderRightColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: rs.font(11),
                  fontWeight: '800',
                  color: accent,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}
              >
                {h}
              </Text>
            </View>
          ))}
        </View>
        {/* Body */}
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={{
              flexDirection: 'row',
              backgroundColor: ri % 2 === 0 ? (isDark ? colors.surface : colors.neuSurface) : (isDark ? colors.background : '#F8FAFC'),
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={{
                  width: colWidth,
                  padding: rs.space(10),
                  borderRightWidth: ci < row.length - 1 ? 1 : 0,
                  borderRightColor: colors.borderLight,
                }}
              >
                <Text style={{ fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(17) }}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
