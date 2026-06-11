// ============================================================
// Color system — Manual de Enfermería
// ============================================================

export type ThemeColors = typeof LIGHT_COLORS;

export const LIGHT_COLORS = {
  primary: '#0EA5E9', // Azul médico — diferenciado de Patologias (violeta)
  primaryLight: '#7DD3FC',
  primaryDark: '#0369A1',
  secondary: '#00B894', // Verde menta — calido y profesional
  accent: '#FD79A8', // Rosa suave
  background: '#F8F9FC', // Gris calido con toque violeta
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#2D3047', // Azul oscuro calido (no negro puro)
  textSecondary: '#636E83', // Gris calido medio (4.9:1 sobre background)
  textLight: '#67738C', // Gris calido claro (4.5:1 sobre background — antes #9BA4B5 daba 2.4:1)
  border: '#E8ECF2', // Borde calido
  borderLight: '#F2F4F8',
  error: '#E55050', // Rojo mas suave
  warning: '#FDAD5A', // Amarillo ambar calido
  success: '#2ECC71', // Verde esmeralda vibrante
  info: '#54A0FF', // Azul cielo amigable
  emergency: '#E55050',
  nursing: '#6C5CE7', // Mismo que primary para coherencia
  cardBackground: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
  tabBarActive: '#6C5CE7',
  tabBarInactive: '#9BA4B5',
  searchHighlight: '#FFF3CD',
  quiz: '#A29BFE',
  quizCorrect: '#2ECC71',
  quizWrong: '#E55050',
  noteBackground: '#FFF8E7',
  noteBorder: '#FFE0A3',
  // Neumorphic tokens
  neuBackground: '#F2F4F8',
  neuSurface: '#FFFFFF',
  neuSurfacePressed: '#ECEEF3',
  neuBorderLight: 'rgba(255,255,255,0.9)',
  neuBorderDark: 'rgba(0,0,0,0.05)',
  neuInsetBg: '#ECEEF3',
  neuInsetBorderTop: 'rgba(0,0,0,0.06)',
  neuInsetBorderBottom: 'rgba(255,255,255,0.8)',
  gradientStart: '#0EA5E9',
  gradientEnd: '#0369A1',
  gradientText: '#FFFFFF',
};

export const DARK_COLORS: ThemeColors = {
  primary: '#38BDF8', // Azul claro — legible sobre oscuro
  primaryLight: '#7DD3FC',
  primaryDark: '#6C5CE7',
  secondary: '#55EFC4', // Verde menta brillante
  accent: '#FD79A8',
  background: '#161B2E', // Azul noche calido (no negro muerto)
  surface: '#1E2640', // Superficie elevada calida
  surfaceElevated: '#2A3250', // Aun mas elevada
  text: '#F0F1F5', // Blanco calido (no blanco puro)
  textSecondary: '#9BA4B8', // Gris medio legible (6:1 sobre surface)
  textLight: '#8C96AD', // Gris sutil (5:1 sobre surface — antes #636E83 daba 2.9:1)
  border: '#2A3250', // Borde coherente con superficie
  borderLight: '#1E2640',
  error: '#FF6B6B', // Rojo coral — suave para dark mode
  warning: '#FECA57', // Amarillo calido
  success: '#55EFC4', // Verde menta
  info: '#74B9FF', // Azul cielo suave
  emergency: '#FF6B6B',
  nursing: '#A29BFE',
  cardBackground: '#1E2640',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  tabBarActive: '#A29BFE',
  tabBarInactive: '#4A5568',
  searchHighlight: '#5A4017',
  quiz: '#A29BFE',
  quizCorrect: '#55EFC4',
  quizWrong: '#FF6B6B',
  noteBackground: '#1E2640',
  noteBorder: '#5A4017',
  // Neumorphic tokens
  neuBackground: '#161B2E',
  neuSurface: '#1E2640',
  neuSurfacePressed: '#171D30',
  neuBorderLight: 'rgba(255,255,255,0.07)',
  neuBorderDark: 'rgba(0,0,0,0.2)',
  neuInsetBg: '#171D30',
  neuInsetBorderTop: 'rgba(0,0,0,0.25)',
  neuInsetBorderBottom: 'rgba(255,255,255,0.05)',
  gradientStart: '#0369A1',
  gradientEnd: '#0EA5E9',
  gradientText: '#FFFFFF',
};

export const COLORS = LIGHT_COLORS;
