// ============================================================
// GlosarioScreen — Glosario de siglas y abreviaturas del curso
// Lista alfabética con búsqueda por sigla o definición
// ============================================================

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useResponsiveScale } from '../utils/responsive';
import glosarioData from '../data/glosario.json';

interface Entry {
  sigla: string;
  definicion: string;
  tipos?: string[];
  ejemplos?: string[];
}

const ALL_ENTRIES: Entry[] = (glosarioData.entries as Entry[])
  .slice()
  .sort((a, b) => a.sigla.localeCompare(b.sigla, 'es'));

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function GlosarioScreen() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return ALL_ENTRIES;
    return ALL_ENTRIES.filter(
      e => normalize(e.sigla).includes(q) || normalize(e.definicion).includes(q),
    );
  }, [query]);

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
            <MaterialCommunityIcons name="book-alphabet" size={rs.font(22)} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: rs.font(22), fontWeight: '800', color: '#fff' }}>Glosario</Text>
            <Text style={{ fontSize: rs.font(11), color: 'rgba(255,255,255,0.85)' }}>
              {ALL_ENTRIES.length} términos y siglas clínicas
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
            placeholder="Buscar sigla o palabra..."
            placeholderTextColor="rgba(255,255,255,0.65)"
            style={{
              flex: 1,
              color: '#fff',
              fontSize: rs.font(14),
              paddingVertical: rs.space(10),
            }}
            autoCorrect={false}
            autoCapitalize="characters"
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
        data={filtered}
        keyExtractor={item => item.sigla}
        contentContainerStyle={{
          paddingHorizontal: rs.space(16),
          paddingTop: rs.space(14),
          paddingBottom: insets.bottom + rs.space(20),
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: rs.space(40) }}>
            <MaterialCommunityIcons name="text-search" size={rs.font(40)} color={colors.textLight} />
            <Text style={{ fontSize: rs.font(14), color: colors.textLight, marginTop: 10 }}>
              Sin resultados para "{query}"
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: isDark ? colors.surface : colors.neuSurface,
              borderRadius: 14,
              padding: rs.space(14),
              marginBottom: rs.space(10),
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs.space(8), marginBottom: rs.space(6) }}>
              <View
                style={{
                  backgroundColor: colors.primary + '22',
                  paddingHorizontal: rs.space(10),
                  paddingVertical: rs.space(4),
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: rs.font(13), fontWeight: '900', color: colors.primary, letterSpacing: 0.5 }}>
                  {item.sigla}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: rs.font(13), color: colors.textSecondary, lineHeight: rs.font(20) }}>
              {item.definicion}
            </Text>
            {item.tipos && item.tipos.length > 0 && (
              <View style={{ marginTop: rs.space(8) }}>
                <Text style={{ fontSize: rs.font(11), fontWeight: '800', color: colors.primary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: rs.space(3) }}>
                  Tipos
                </Text>
                {item.tipos.map((t, i) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: rs.space(2) }}>
                    <Text style={{ color: colors.primary, marginRight: rs.space(6), fontSize: rs.font(12), fontWeight: '700' }}>•</Text>
                    <Text style={{ flex: 1, fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(18) }}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.ejemplos && item.ejemplos.length > 0 && (
              <View style={{ marginTop: rs.space(8) }}>
                <Text style={{ fontSize: rs.font(11), fontWeight: '800', color: colors.secondary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: rs.space(3) }}>
                  Ejemplos clínicos
                </Text>
                {item.ejemplos.map((e, i) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: rs.space(2) }}>
                    <Text style={{ color: colors.secondary, marginRight: rs.space(6), fontSize: rs.font(12), fontWeight: '700' }}>•</Text>
                    <Text style={{ flex: 1, fontSize: rs.font(12), color: colors.textSecondary, lineHeight: rs.font(18) }}>{e}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
