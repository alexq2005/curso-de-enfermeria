// ============================================================
// BuscadorScreen — Búsqueda full-text del curso + glosario
// ============================================================

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StatusBar, TouchableOpacity } from 'react-native';
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
  haystack: string;
  preview: string;
}

interface GlosarioEntry {
  kind: 'glosario';
  sigla: string;
  definicion: string;
  haystack: string;
}

type IdxEntry = IndexEntry | GlosarioEntry;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
      haystack: normalize(fullText),
      preview: blockTexts.replace(/\s+/g, ' ').slice(0, 140).trim(),
    };
  }),
);

const GLOSARIO_INDEX: GlosarioEntry[] = (glosarioData.entries as { sigla: string; definicion: string }[]).map(
  e => ({
    kind: 'glosario' as const,
    sigla: e.sigla,
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

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [] as IdxEntry[];
    const subMatches = SUB_INDEX.filter(e => e.haystack.includes(q));
    const glosMatches = GLOSARIO_INDEX.filter(e => e.haystack.includes(q));
    return [...glosMatches, ...subMatches].slice(0, 50);
  }, [query]);

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
                  <Text style={{ fontSize: rs.font(15), fontWeight: '900', color: colors.text, marginLeft: 4 }}>
                    {item.sigla}
                  </Text>
                </View>
                <Text style={{ fontSize: rs.font(13), color: colors.textSecondary, lineHeight: rs.font(19) }}>
                  {item.definicion}
                </Text>
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
              <Text style={{ fontSize: rs.font(15), fontWeight: '700', color: colors.text, marginBottom: rs.space(4) }}>
                {item.subTitle}
              </Text>
              <Text
                style={{ fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(18) }}
                numberOfLines={2}
              >
                {item.preview}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
