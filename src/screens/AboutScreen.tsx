// ============================================================
// AboutScreen — app info, contact, legal links
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useResponsiveScale } from '../utils/responsive';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = '1.0.0';
const CONTACT_EMAIL = 'alexq2005@gmail.com';

export function AboutScreen() {
  const { colors, isDark } = useTheme();
  const rs = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView
        contentContainerStyle={{
          padding: rs.space(20),
          paddingBottom: insets.bottom + rs.space(40),
        }}
      >
        <View style={{ alignItems: 'center', marginVertical: rs.space(24) }}>
          <View
            style={{
              width: rs.space(80),
              height: rs.space(80),
              borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: rs.space(14),
            }}
          >
            <MaterialCommunityIcons
              name="school"
              size={rs.font(44)}
              color="#fff"
            />
          </View>
          <Text
            style={{
              fontSize: rs.font(22),
              fontWeight: '800',
              color: colors.text,
            }}
          >
            Manual de Enfermería
          </Text>
          <Text
            style={{
              fontSize: rs.font(13),
              color: colors.textLight,
              marginTop: 4,
            }}
          >
            v{APP_VERSION}
          </Text>
        </View>

        <Section title="Descripción" colors={colors} rs={rs} isDark={isDark}>
          <Text
            style={{
              fontSize: rs.font(14),
              color: colors.textSecondary,
              lineHeight: rs.font(22),
            }}
          >
            Manual integral de enfermería con 10 módulos: fundamentos, anatomía,
            signos vitales, bioseguridad, equipamiento, patologías por sistema,
            técnicas, farmacología, emergencias y comunicación clínica.
          </Text>
        </Section>

        <Section title="Contacto" colors={colors} rs={rs} isDark={isDark}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
            accessibilityRole="link"
            accessibilityLabel={`Enviar correo a ${CONTACT_EMAIL}`}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <Text
              style={{
                fontSize: rs.font(14),
                color: colors.primary,
                fontWeight: '600',
              }}
            >
              {CONTACT_EMAIL}
            </Text>
          </TouchableOpacity>
        </Section>

        <Section title="Legal" colors={colors} rs={rs} isDark={isDark}>
          <Row
            label="Términos de uso"
            onPress={() => navigation.navigate('Terms')}
            colors={colors}
            rs={rs}
          />
          <Row
            label="Política de privacidad"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            colors={colors}
            rs={rs}
          />
        </Section>

        <Text
          style={{
            fontSize: rs.font(11),
            color: colors.textLight,
            textAlign: 'center',
            marginTop: rs.space(24),
          }}
        >
          Material elaborado como guía de estudio. Verificá siempre los
          protocolos vigentes de tu institución.
        </Text>
      </ScrollView>
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
      <Text
        style={{
          fontSize: rs.font(11),
          fontWeight: '800',
          color: colors.textLight,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: rs.space(8),
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, onPress, colors, rs }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: rs.space(8),
      }}
    >
      <Text style={{ fontSize: rs.font(14), color: colors.text }}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={rs.font(20)}
        color={colors.textLight}
      />
    </TouchableOpacity>
  );
}
