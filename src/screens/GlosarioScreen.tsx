// ============================================================
// GlosarioScreen — Glosario de siglas y abreviaturas del curso
// Lista alfabética con búsqueda por sigla o definición
// ============================================================

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useResponsiveScale, type ResponsiveScale } from '../utils/responsive';
import type { ThemeColors } from '../utils/colors';
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

  const styles = useMemo(() => createStyles(colors, rs, isDark), [colors, rs, isDark]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return ALL_ENTRIES;
    return ALL_ENTRIES.filter(
      e => normalize(e.sigla).includes(q) || normalize(e.definicion).includes(q),
    );
  }, [query]);

  const isFiltering = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + rs.space(16) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={rs.font(20)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons name="book-alphabet" size={rs.font(22)} color="#fff" />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Glosario</Text>
            <Text style={styles.headerSubtitle}>
              {isFiltering
                ? `${filtered.length} de ${ALL_ENTRIES.length} términos`
                : `${ALL_ENTRIES.length} términos y siglas clínicas`}
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={rs.font(18)} color="rgba(255,255,255,0.85)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar sigla o palabra..."
            placeholderTextColor="rgba(255,255,255,0.65)"
            accessibilityLabel="Buscar en el glosario"
            returnKeyType="search"
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="characters"
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
        data={filtered}
        keyExtractor={item => item.sigla}
        contentContainerStyle={{
          paddingHorizontal: rs.space(16),
          paddingTop: rs.space(14),
          paddingBottom: insets.bottom + rs.space(20),
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="text-search" size={rs.font(36)} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Sin resultados para "{query}"</Text>
            <Text style={styles.emptyHint}>
              Probá con la sigla exacta (ej: "TA", "RCP") o una palabra de la definición.
            </Text>
            <TouchableOpacity
              onPress={() => setQuery('')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.emptyButton}
            >
              <MaterialCommunityIcons name="backspace-outline" size={rs.font(15)} color={colors.primary} />
              <Text style={styles.emptyButtonText}>Limpiar búsqueda</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryChipRow}>
              <View style={styles.entryChip}>
                <Text style={styles.entryChipText}>{item.sigla}</Text>
              </View>
            </View>
            <Text style={styles.entryDefinition}>{item.definicion}</Text>
            {item.tipos && item.tipos.length > 0 && (
              <View style={styles.entrySection}>
                <Text style={[styles.entrySectionTitle, { color: colors.primary }]}>Tipos</Text>
                {item.tipos.map((t, i) => (
                  <View key={i} style={styles.entryItemRow}>
                    <Text style={[styles.entryBullet, { color: colors.primary }]}>•</Text>
                    <Text style={styles.entryItemText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.ejemplos && item.ejemplos.length > 0 && (
              <View style={styles.entrySection}>
                <Text style={[styles.entrySectionTitle, { color: colors.secondary }]}>
                  Ejemplos clínicos
                </Text>
                {item.ejemplos.map((e, i) => (
                  <View key={i} style={styles.entryItemRow}>
                    <Text style={[styles.entryBullet, { color: colors.secondary }]}>•</Text>
                    <Text style={styles.entryItemText}>{e}</Text>
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

// ── Styles factory ──────────────────────────────────────────

const createStyles = (colors: ThemeColors, rs: ResponsiveScale, isDark: boolean) =>
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
    // Empty state
    emptyState: {
      alignItems: 'center',
      marginTop: rs.space(40),
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
    // Entry card
    entryCard: {
      backgroundColor: isDark ? colors.surface : colors.neuSurface,
      borderRadius: 14,
      padding: rs.space(14),
      marginBottom: rs.space(10),
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    entryChipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs.space(8),
      marginBottom: rs.space(7),
    },
    entryChip: {
      backgroundColor: colors.primary + '22',
      paddingHorizontal: rs.space(10),
      paddingVertical: rs.space(4),
      borderRadius: 8,
    },
    entryChipText: {
      fontSize: rs.font(13),
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    entryDefinition: {
      fontSize: rs.font(14),
      color: colors.textSecondary,
      lineHeight: rs.font(21),
    },
    entrySection: {
      marginTop: rs.space(9),
    },
    entrySectionTitle: {
      fontSize: rs.font(11),
      fontWeight: '800',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: rs.space(4),
    },
    entryItemRow: {
      flexDirection: 'row',
      marginBottom: rs.space(3),
    },
    entryBullet: {
      marginRight: rs.space(7),
      fontSize: rs.font(13),
      fontWeight: '700',
      lineHeight: rs.font(20),
    },
    entryItemText: {
      flex: 1,
      fontSize: rs.font(13),
      color: colors.textSecondary,
      lineHeight: rs.font(20),
    },
  });
