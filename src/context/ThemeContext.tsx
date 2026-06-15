import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, type ThemeColors } from '../utils/colors';

const STORAGE_KEY = '@manual_theme';
// Legacy key inherited from Patologías app — migrate transparently on first boot.
const LEGACY_STORAGE_KEY = '@patologias_theme';

type ThemeMode = 'light' | 'dark' | 'system';

const isValidMode = (v: string | null): v is ThemeMode =>
  v === 'light' || v === 'dark' || v === 'system';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (isValidMode(saved)) {
          setThemeModeState(saved);
        } else {
          const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
          if (isValidMode(legacy)) {
            setThemeModeState(legacy);
            await AsyncStorage.setItem(STORAGE_KEY, legacy);
          }
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(
      themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'dark' : 'light',
    );
  }, [themeMode, setThemeMode]);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(
    () => ({ colors, isDark, themeMode, setThemeMode, toggleTheme }),
    [colors, isDark, themeMode, setThemeMode, toggleTheme],
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
