import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: colors.background,
      }}
    >
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
        Algo salió mal
      </Text>
      <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
        La aplicación encontró un error inesperado.
      </Text>
      {error && (
        <ScrollView style={{ maxHeight: 200, width: '100%', marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 11,
              color: colors.error,
              fontFamily: 'monospace',
              backgroundColor: isDark ? colors.surface : '#FEF2F2',
              padding: 12,
              borderRadius: 8,
            }}
          >
            {error.toString()}
            {'\n\n'}
            {error.stack}
          </Text>
        </ScrollView>
      )}
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}
