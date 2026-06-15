// ============================================================
// BuscadorScreen — Búsqueda full-text del curso + glosario
// ============================================================

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useResponsiveScale, type ResponsiveScale } from '../utils/responsive';
import { PressableScale } from '../components/PressableScale';
import type { ThemeColors } from '../utils/colors';
import cursoData from '../data/curso.json';
import glosarioData from '../data/glosario.json';
import type { CursoData, CursoBlock } from '../types/curso';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BuscadorScreen'>;

interface IndexEntry {
  kind: 'sub';
  moduloId: string;
  moduloNum: number;
  moduloTitle: string;
  subId: string;
  subTitle: string;
  subTitleNorm: string;
  haystack: string;
  preview: string;
}

interface GlosarioEntry {
  kind: 'glosario';
  sigla: string;
  siglaNorm: string;
  definicion: string;
  haystack: string;
}

type IdxEntry = IndexEntry | GlosarioEntry;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ── Tokenization + ranking ─────────────────────────────────────────────
// Queries multi-palabra ("presion arterial", "tecnicas de medicion") fallaban
// con un substring-exacto porque la data usa otras formas exactas ("Tensión
// arterial", "Técnica" sin "de medición"). Tokenizamos, descartamos stopwords
// y rankeamos por número de tokens hallados + bonus por title/sigla match.
const SPANISH_STOPWORDS = new Set([
  'de',
  'la',
  'el',
  'los',
  'las',
  'y',
  'o',
  'u',
  'en',
  'a',
  'un',
  'una',
  'unos',
  'unas',
  'con',
  'por',
  'para',
  'del',
  'al',
  'es',
  'son',
  'que',
  'se',
  'su',
  'lo',
]);

function tokenizeQuery(normalizedQuery: string): string[] {
  return normalizedQuery
    .split(/\s+/)
    .filter(t => t.length >= 2 && !SPANISH_STOPWORDS.has(t));
}

// Crude plural stripping: "tecnicas" → también probar "tecnica".
function tokenForms(token: string): string[] {
  if (token.length > 3 && token.endsWith('s'))
    return [token, token.slice(0, -1)];
  return [token];
}

function hasToken(haystack: string, token: string): boolean {
  for (const form of tokenForms(token)) {
    if (haystack.includes(form)) return true;
  }
  return false;
}

// ── Highlight helpers ──────────────────────────────────────────────────
// The search is accent-insensitive (via normalize), so a literal indexOf on the
// original text would miss "úlcera" when the user typed "ulcera". We build a
// per-char map normalizedIndex → originalIndex, search the normalized form, and
// then slice the *original* string at the mapped positions to preserve casing
// and diacritics in the highlighted snippet.
function findMatchRanges(
  text: string,
  normalizedQuery: string,
): Array<{ start: number; end: number }> {
  if (!normalizedQuery) return [];
  let normText = '';
  const origForNormIdx: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const norm = text[i]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    for (let j = 0; j < norm.length; j++) {
      normText += norm[j];
      origForNormIdx.push(i);
    }
  }
  const ranges: Array<{ start: number; end: number }> = [];
  let from = 0;
  while (from <= normText.length) {
    const idx = normText.indexOf(normalizedQuery, from);
    if (idx === -1) break;
    const startOrig = origForNormIdx[idx];
    const lastOrig = origForNormIdx[idx + normalizedQuery.length - 1];
    ranges.push({ start: startOrig, end: lastOrig + 1 });
    from = idx + normalizedQuery.length;
  }
  return ranges;
}

interface HighlightedTextProps {
  text: string;
  tokens: string[]; // already normalized
  baseStyle: StyleProp<TextStyle>;
  highlightStyle: StyleProp<TextStyle>;
  numberOfLines?: number;
}

function HighlightedText({
  text,
  tokens,
  baseStyle,
  highlightStyle,
  numberOfLines,
}: HighlightedTextProps) {
  const ranges = useMemo(() => {
    if (tokens.length === 0) return [];
    const all: Array<{ start: number; end: number }> = [];
    for (const t of tokens) {
      for (const form of tokenForms(t)) {
        all.push(...findMatchRanges(text, form));
      }
    }
    // Sort by start, merge overlapping/adjacent ranges so two tokens that
    // match consecutive characters render as a single highlight pill.
    all.sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number }> = [];
    for (const r of all) {
      const last = merged[merged.length - 1];
      if (last && r.start <= last.end) {
        last.end = Math.max(last.end, r.end);
      } else {
        merged.push({ start: r.start, end: r.end });
      }
    }
    return merged;
  }, [text, tokens]);
  if (ranges.length === 0) {
    return (
      <Text style={baseStyle} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start));
    parts.push(
      <Text key={i} style={highlightStyle}>
        {text.slice(r.start, r.end)}
      </Text>,
    );
    cursor = r.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return (
    <Text style={baseStyle} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}

function blockToText(block: CursoBlock): string {
  switch (block.type) {
    case 'p':
    case 'h4':
      return block.text;
    case 'list':
    case 'ol':
      return block.items.join(' ');
    case 'card':
      return [block.title, block.text ?? '', (block.items ?? []).join(' ')]
        .filter(Boolean)
        .join(' ');
    case 'table':
      return [
        block.headers.join(' '),
        ...block.rows.map(r => r.join(' ')),
      ].join(' ');
    case 'grid':
      return block.cards.map(c => `${c.title} ${c.text}`).join(' ');
    case 'crosslink':
      return `${block.title} ${block.description}`;
    default:
      return '';
  }
}

const data = cursoData as CursoData;

const SUB_INDEX: IndexEntry[] = data.modulos.flatMap(m =>
  m.subs.map(sub => {
    const blockTexts = sub.blocks
      .map(b => blockToText(b as CursoBlock))
      .join(' ');
    const fullText = `${sub.title} ${blockTexts}`;
    return {
      kind: 'sub' as const,
      moduloId: m.id,
      moduloNum: m.num,
      moduloTitle: m.title,
      subId: sub.id,
      subTitle: sub.title,
      subTitleNorm: normalize(sub.title),
      haystack: normalize(fullText),
      preview: blockTexts.replace(/\s+/g, ' ').slice(0, 140).trim(),
    };
  }),
);

const GLOSARIO_INDEX: GlosarioEntry[] = (
  glosarioData.entries as { sigla: string; definicion: string }[]
).map(e => ({
  kind: 'glosario' as const,
  sigla: e.sigla,
  siglaNorm: normalize(e.sigla),
  definicion: e.definicion,
  haystack: normalize(`${e.sigla} ${e.definicion}`),
}));

export function BuscadorScreen() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const styles = useMemo(
    () => createStyles(colors, rs, isDark),
    [colors, rs, isDark],
  );

  const tokens = useMemo(() => tokenizeQuery(normalize(query.trim())), [query]);

  const results = useMemo(() => {
    if (tokens.length === 0) return [] as IdxEntry[];
    // Score formula: primary = tokens hallados en haystack (×10).
    // Bonus por hits en title/sigla — empuja resultados con coincidencia
    // exacta de sigla o título por encima de matches enterrados en el body.
    const scoredSubs = SUB_INDEX.map(e => {
      let primary = 0,
        bonus = 0;
      for (const t of tokens) {
        if (hasToken(e.haystack, t)) primary++;
        if (hasToken(e.subTitleNorm, t)) bonus += 2;
      }
      return { entry: e as IdxEntry, score: primary * 10 + bonus };
    }).filter(x => x.score > 0);
    const scoredGlos = GLOSARIO_INDEX.map(e => {
      let primary = 0,
        bonus = 0;
      for (const t of tokens) {
        if (hasToken(e.haystack, t)) primary++;
        if (e.siglaNorm === t) bonus += 10;
        else if (e.siglaNorm.startsWith(t)) bonus += 5;
        else if (hasToken(e.siglaNorm, t)) bonus += 2;
      }
      return { entry: e as IdxEntry, score: primary * 10 + bonus };
    }).filter(x => x.score > 0);
    return [...scoredGlos, ...scoredSubs]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(x => x.entry);
  }, [tokens]);

  const handleSubPress = useCallback(
    (entry: IndexEntry) => {
      navigation.navigate('CursoModulo', {
        moduloId: entry.moduloId,
        subId: entry.subId,
      });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + rs.space(16) }]}
      >
        <View style={styles.headerRow}>
          <PressableScale
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={rs.font(20)}
              color="#fff"
            />
          </PressableScale>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons
              name="magnify"
              size={rs.font(22)}
              color="#fff"
            />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Buscar</Text>
            <Text style={styles.headerSubtitle}>
              {SUB_INDEX.length} subtemas + {GLOSARIO_INDEX.length} términos
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={rs.font(18)}
            color="rgba(255,255,255,0.85)"
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar tema, sigla, palabra clave..."
            placeholderTextColor="rgba(255,255,255,0.65)"
            accessibilityLabel="Buscar en el curso y el glosario"
            returnKeyType="search"
            style={styles.searchInput}
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={rs.font(18)}
                color="rgba(255,255,255,0.85)"
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={results}
        keyExtractor={item =>
          item.kind === 'sub' ? `s_${item.subId}` : `g_${item.sigla}`
        }
        contentContainerStyle={{
          paddingHorizontal: rs.space(16),
          paddingTop: rs.space(14),
          paddingBottom: insets.bottom + rs.space(20),
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          results.length > 0 ? (
            <Text style={styles.resultCount}>
              {results.length === 1
                ? '1 resultado'
                : `${results.length} resultados`}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          query.trim().length < 2 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons
                  name="text-search-variant"
                  size={rs.font(40)}
                  color={colors.textLight}
                />
              </View>
              <Text style={styles.emptyHint}>
                Escribí al menos 2 caracteres para buscar.{'\n'}Probá: "disnea",
                "RCP", "EPP", "úlcera", "taquipnea", "TA"...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons
                  name="emoticon-sad-outline"
                  size={rs.font(36)}
                  color={colors.textLight}
                />
              </View>
              <Text style={styles.emptyTitle}>
                Sin resultados para "{query}"
              </Text>
              <Text style={styles.emptyHint}>
                Revisá la ortografía o probá con un sinónimo o una sigla.
              </Text>
              <PressableScale
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Limpiar búsqueda"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.emptyButton}
              >
                <MaterialCommunityIcons
                  name="backspace-outline"
                  size={rs.font(15)}
                  color={colors.primary}
                />
                <Text style={styles.emptyButtonText}>Limpiar búsqueda</Text>
              </PressableScale>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (item.kind === 'glosario') {
            return (
              <View style={styles.glosarioCard}>
                <View style={styles.cardKickerRow}>
                  <MaterialCommunityIcons
                    name="book-alphabet"
                    size={rs.font(15)}
                    color="#0EA5E9"
                  />
                  <Text style={styles.glosarioKicker}>GLOSARIO</Text>
                  <HighlightedText
                    text={item.sigla}
                    tokens={tokens}
                    baseStyle={styles.glosarioSigla}
                    highlightStyle={styles.highlight}
                  />
                </View>
                <HighlightedText
                  text={item.definicion}
                  tokens={tokens}
                  baseStyle={styles.glosarioDefinicion}
                  highlightStyle={styles.highlight}
                />
              </View>
            );
          }
          return (
            <PressableScale
              onPress={() => handleSubPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.subTitle} en módulo ${item.moduloNum}, ${item.moduloTitle}`}
              style={styles.subCard}
            >
              <View style={styles.cardKickerRow}>
                <View style={styles.moduloChip}>
                  <Text style={styles.moduloChipText}>
                    M{String(item.moduloNum).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.moduloTitle} numberOfLines={1}>
                  {item.moduloTitle}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={rs.font(18)}
                  color={colors.textLight}
                />
              </View>
              <HighlightedText
                text={item.subTitle}
                tokens={tokens}
                baseStyle={styles.subTitle}
                highlightStyle={styles.highlight}
              />
              <HighlightedText
                text={item.preview}
                tokens={tokens}
                baseStyle={styles.subPreview}
                highlightStyle={styles.highlight}
                numberOfLines={2}
              />
            </PressableScale>
          );
        }}
      />
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
    header: {
      paddingBottom: rs.space(20),
      paddingHorizontal: rs.space(20),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(10),
      marginBottom: rs.space(8),
    },
    backButton: {
      width: rs.space(36),
      height: rs.space(36),
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconWrap: {
      width: rs.space(40),
      height: rs.space(40),
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: rs.font(22),
      fontWeight: '800',
      color: '#fff',
    },
    headerSubtitle: {
      fontSize: rs.font(11),
      color: 'rgba(255,255,255,0.85)',
    },
    searchBox: {
      marginTop: rs.space(8),
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: 12,
      paddingHorizontal: rs.space(12),
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(8),
    },
    searchInput: {
      flex: 1,
      color: '#fff',
      fontSize: rs.font(14),
      paddingVertical: rs.space(10),
    },
    // Resultados
    resultCount: {
      fontSize: rs.font(11),
      fontWeight: '800',
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: rs.space(8),
    },
    highlight: {
      backgroundColor: colors.searchHighlight,
      color: colors.text,
      fontWeight: '700',
    },
    cardKickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(8),
      marginBottom: rs.space(4),
    },
    glosarioCard: {
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      borderRadius: 14,
      padding: rs.space(14),
      marginBottom: rs.space(10),
      borderLeftWidth: 4,
      borderLeftColor: '#0EA5E9',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    glosarioKicker: {
      fontSize: rs.font(10),
      fontWeight: '800',
      color: '#0EA5E9',
      letterSpacing: 1,
    },
    glosarioSigla: {
      fontSize: rs.font(15),
      fontWeight: '900',
      color: colors.text,
      marginLeft: 4,
    },
    glosarioDefinicion: {
      fontSize: rs.font(13),
      color: colors.textSecondary,
      lineHeight: rs.font(20),
    },
    subCard: {
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      borderRadius: 14,
      padding: rs.space(14),
      marginBottom: rs.space(10),
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    moduloChip: {
      backgroundColor: colors.primary + '22',
      paddingHorizontal: rs.space(8),
      paddingVertical: 2,
      borderRadius: 6,
    },
    moduloChipText: {
      fontSize: rs.font(10),
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.4,
    },
    moduloTitle: {
      fontSize: rs.font(11),
      color: colors.textLight,
      flex: 1,
    },
    subTitle: {
      fontSize: rs.font(15),
      fontWeight: '700',
      color: colors.text,
      marginBottom: rs.space(4),
      lineHeight: rs.font(21),
    },
    subPreview: {
      fontSize: rs.font(12.5),
      color: colors.textSecondary,
      lineHeight: rs.font(19),
    },
    // Empty states
    emptyState: {
      alignItems: 'center',
      marginTop: rs.space(48),
      paddingHorizontal: rs.space(24),
    },
    emptyIconWrap: {
      width: rs.space(72),
      height: rs.space(72),
      borderRadius: rs.space(36),
      backgroundColor: isDark ? colors.surface : colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs.space(14),
    },
    emptyTitle: {
      fontSize: rs.font(15),
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    emptyHint: {
      fontSize: rs.font(13),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rs.font(20),
      marginTop: rs.space(6),
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(7),
      marginTop: rs.space(16),
      paddingHorizontal: rs.space(16),
      paddingVertical: rs.space(10),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    emptyButtonText: {
      fontSize: rs.font(13),
      fontWeight: '700',
      color: colors.primary,
    },
  });
