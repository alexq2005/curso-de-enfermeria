// ============================================================
// BuscadorScreen — Búsqueda full-text del curso + glosario
// ============================================================

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StatusBar, TouchableOpacity, type TextStyle, type StyleProp } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useResponsiveScale } from '../utils/responsive';
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
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// \u2500\u2500 Tokenization + ranking \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Queries multi-palabra ("presion arterial", "tecnicas de medicion") fallaban
// con un substring-exacto porque la data usa otras formas exactas ("Tensi\u00f3n
// arterial", "T\u00e9cnica" sin "de medici\u00f3n"). Tokenizamos, descartamos stopwords
// y rankeamos por n\u00famero de tokens hallados + bonus por title/sigla match.
const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'y', 'o', 'u', 'en', 'a', 'un', 'una', 'unos', 'unas',
  'con', 'por', 'para', 'del', 'al', 'es', 'son', 'que', 'se', 'su', 'lo',
]);

function tokenizeQuery(normalizedQuery: string): string[] {
  return normalizedQuery
    .split(/\s+/)
    .filter(t => t.length >= 2 && !SPANISH_STOPWORDS.has(t));
}

// Crude plural stripping: "tecnicas" \u2192 tambi\u00e9n probar "tecnica".
function tokenForms(token: string): string[] {
  if (token.length > 3 && token.endsWith('s')) return [token, token.slice(0, -1)];
  return [token];
}

function hasToken(haystack: string, token: string): boolean {
  for (const form of tokenForms(token)) {
    if (haystack.includes(form)) return true;
  }
  return false;
}

// \u2500\u2500 Highlight helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// The search is accent-insensitive (via normalize), so a literal indexOf on the
// original text would miss "\u00falcera" when the user typed "ulcera". We build a
// per-char map normalizedIndex \u2192 originalIndex, search the normalized form, and
// then slice the *original* string at the mapped positions to preserve casing
// and diacritics in the highlighted snippet.
function findMatchRanges(text: string, normalizedQuery: string): Array<{ start: number; end: number }> {
  if (!normalizedQuery) return [];
  let normText = '';
  const origForNormIdx: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const norm = text[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

function HighlightedText({ text, tokens, baseStyle, highlightStyle, numberOfLines }: HighlightedTextProps) {
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
    return <Text style={baseStyle} numberOfLines={numberOfLines}>{text}</Text>;
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
      return [block.title, block.text ?? '', (block.items ?? []).join(' ')].filter(Boolean).join(' ');
    case 'table':
      return [block.headers.join(' '), ...block.rows.map(r => r.join(' '))].join(' ');
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
    const blockTexts = sub.blocks.map(b => blockToText(b as CursoBlock)).join(' ');
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

const GLOSARIO_INDEX: GlosarioEntry[] = (glosarioData.entries as { sigla: string; definicion: string }[]).map(
  e => ({
    kind: 'glosario' as const,
    sigla: e.sigla,
    siglaNorm: normalize(e.sigla),
    definicion: e.definicion,
    haystack: normalize(`${e.sigla} ${e.definicion}`),
  }),
);

export function BuscadorScreen() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const tokens = useMemo(() => tokenizeQuery(normalize(query.trim())), [query]);

  const results = useMemo(() => {
    if (tokens.length === 0) return [] as IdxEntry[];
    // Score formula: primary = tokens hallados en haystack (×10).
    // Bonus por hits en title/sigla — empuja resultados con coincidencia
    // exacta de sigla o título por encima de matches enterrados en el body.
    const scoredSubs = SUB_INDEX
      .map(e => {
        let primary = 0, bonus = 0;
        for (const t of tokens) {
          if (hasToken(e.haystack, t)) primary++;
          if (hasToken(e.subTitleNorm, t)) bonus += 2;
        }
        return { entry: e as IdxEntry, score: primary * 10 + bonus };
      })
      .filter(x => x.score > 0);
    const scoredGlos = GLOSARIO_INDEX
      .map(e => {
        let primary = 0, bonus = 0;
        for (const t of tokens) {
          if (hasToken(e.haystack, t)) primary++;
          if (e.siglaNorm === t) bonus += 10;
          else if (e.siglaNorm.startsWith(t)) bonus += 5;
          else if (hasToken(e.siglaNorm, t)) bonus += 2;
        }
        return { entry: e as IdxEntry, score: primary * 10 + bonus };
      })
      .filter(x => x.score > 0);
    return [...scoredGlos, ...scoredSubs]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(x => x.entry);
  }, [tokens]);

  const highlightStyle: StyleProp<TextStyle> = {
    backgroundColor: colors.searchHighlight,
    color: colors.text,
    fontWeight: '700',
  };

  const handleSubPress = useCallback(
    (entry: IndexEntry) => {
      navigation.navigate('CursoModulo', { moduloId: entry.moduloId, subId: entry.subId });
    },
    [navigation],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + rs.space(16),
          paddingBottom: rs.space(20),
          paddingHorizontal: rs.space(20),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(10), marginBottom: rs.space(8) }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: rs.space(36),
              height: rs.space(36),
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={rs.font(20)} color="#fff" />
          </TouchableOpacity>
          <View
            style={{
              width: rs.space(40),
              height: rs.space(40),
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="magnify" size={rs.font(22)} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: rs.font(22), fontWeight: '800', color: '#fff' }}>Buscar</Text>
            <Text style={{ fontSize: rs.font(11), color: 'rgba(255,255,255,0.85)' }}>
              {SUB_INDEX.length} subtemas + {GLOSARIO_INDEX.length} siglas
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: rs.space(8),
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 12,
            paddingHorizontal: rs.space(12),
            paddingVertical: 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: rs.space(8),
          }}
        >
          <MaterialCommunityIcons name="magnify" size={rs.font(18)} color="rgba(255,255,255,0.85)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar tema, sigla, palabra clave..."
            placeholderTextColor="rgba(255,255,255,0.65)"
            style={{
              flex: 1,
              color: '#fff',
              fontSize: rs.font(14),
              paddingVertical: rs.space(10),
            }}
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <MaterialCommunityIcons
              name="close-circle"
              size={rs.font(18)}
              color="rgba(255,255,255,0.85)"
              onPress={() => setQuery('')}
            />
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={results}
        keyExtractor={item => (item.kind === 'sub' ? `s_${item.subId}` : `g_${item.sigla}`)}
        contentContainerStyle={{
          paddingHorizontal: rs.space(16),
          paddingTop: rs.space(14),
          paddingBottom: insets.bottom + rs.space(20),
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.trim().length < 2 ? (
            <View style={{ alignItems: 'center', marginTop: rs.space(60) }}>
              <MaterialCommunityIcons name="text-search-variant" size={rs.font(46)} color={colors.textLight} />
              <Text style={{ fontSize: rs.font(13), color: colors.textLight, marginTop: 12, textAlign: 'center', paddingHorizontal: rs.space(20), lineHeight: rs.font(20) }}>
                Escribí al menos 2 caracteres para buscar.{'\n'}Probá: "sondaje", "RCP", "EPP", "dosis", "úlcera", "FAV"...
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: rs.space(40) }}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={rs.font(40)} color={colors.textLight} />
              <Text style={{ fontSize: rs.font(14), color: colors.textLight, marginTop: 10 }}>
                Sin resultados para "{query}"
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (item.kind === 'glosario') {
            return (
              <View
                style={{
                  backgroundColor: isDark ? colors.surface : colors.neuSurface,
                  borderRadius: 14,
                  padding: rs.space(14),
                  marginBottom: rs.space(10),
                  borderLeftWidth: 4,
                  borderLeftColor: '#0EA5E9',
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(8), marginBottom: rs.space(4) }}>
                  <MaterialCommunityIcons name="book-alphabet" size={rs.font(15)} color="#0EA5E9" />
                  <Text style={{ fontSize: rs.font(10), fontWeight: '800', color: '#0EA5E9', letterSpacing: 1 }}>
                    GLOSARIO
                  </Text>
                  <HighlightedText
                    text={item.sigla}
                    tokens={tokens}
                    baseStyle={{ fontSize: rs.font(15), fontWeight: '900', color: colors.text, marginLeft: 4 }}
                    highlightStyle={highlightStyle}
                  />
                </View>
                <HighlightedText
                  text={item.definicion}
                  tokens={tokens}
                  baseStyle={{ fontSize: rs.font(13), color: colors.textSecondary, lineHeight: rs.font(19) }}
                  highlightStyle={highlightStyle}
                />
              </View>
            );
          }
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSubPress(item)}
              style={{
                backgroundColor: isDark ? colors.surface : colors.neuSurface,
                borderRadius: 14,
                padding: rs.space(14),
                marginBottom: rs.space(10),
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(8), marginBottom: rs.space(4) }}>
                <View
                  style={{
                    backgroundColor: colors.primary + '22',
                    paddingHorizontal: rs.space(8),
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: rs.font(10), fontWeight: '800', color: colors.primary, letterSpacing: 0.4 }}>
                    M{String(item.moduloNum).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={{ fontSize: rs.font(11), color: colors.textLight, flex: 1 }} numberOfLines={1}>
                  {item.moduloTitle}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={rs.font(18)} color={colors.textLight} />
              </View>
              <HighlightedText
                text={item.subTitle}
                tokens={tokens}
                baseStyle={{ fontSize: rs.font(15), fontWeight: '700', color: colors.text, marginBottom: rs.space(4) }}
                highlightStyle={highlightStyle}
              />
              <HighlightedText
                text={item.preview}
                tokens={tokens}
                baseStyle={{ fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(18) }}
                highlightStyle={highlightStyle}
                numberOfLines={2}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
