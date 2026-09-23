import { DesignTokens, ComponentArchetypes } from './types';
import { DEFAULT_TYPOGRAPHY, RADIUS_SCALES, DEFAULT_SHADOWS, DARK_SHADOWS } from './tokens';

export const DEFAULT_COMPONENTS: ComponentArchetypes = {
  sidebarStyle: 'classic',
  topbarStyle: 'classic',
  cardStyle: 'classic',
  tableStyle: 'modern',
  buttonStyle: 'solid',
  formStyle: 'classic',
  radiusScale: 'smooth',
  spacingScale: 'comfortable',
  fontScale: 'normal',
};

export const ISLAMIC_GREEN_THEME: DesignTokens = {
  id: 'islamic-green',
  name: 'Islamic Green (Default)',
  nameBangla: 'ইসলামিক সবুজ থিম',
  isDark: false,
  colors: {
    // Primary / Emerald
    primary: '#047857', // emerald-700
    primaryHover: '#065f46',
    primaryLight: '#ecfdf5',
    primaryBorder: '#a7f3d0',
    primaryFocus: '#10b981',
    primaryForeground: '#ffffff',

    // Secondary / Amber & Gold
    secondary: '#b45309', // amber-700
    secondaryHover: '#92400e',
    secondaryLight: '#fffbeb',
    secondaryBorder: '#fde68a',
    secondaryForeground: '#ffffff',

    // Surfaces & Canvas
    bg: '#f8fafc',
    bgSubtle: '#f1f5f9',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    surfaceHover: '#f1f5f9',
    surfaceElevated: '#ffffff',

    // Text & Typography
    textMain: '#0f172a',
    textMuted: '#64748b',
    textSubtle: '#94a3b8',
    textInverse: '#ffffff',

    // Borders
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    borderStrong: '#cbd5e1',

    // Status
    success: '#059669',
    successLight: '#d1fae5',
    warning: '#d97706',
    warningLight: '#fef3c7',
    error: '#e11d48',
    errorLight: '#ffe4e6',
    info: '#0284c7',
    infoLight: '#e0f2fe',
  },
  typography: DEFAULT_TYPOGRAPHY,
  radius: RADIUS_SCALES.smooth,
  shadows: DEFAULT_SHADOWS,
  components: DEFAULT_COMPONENTS,
};

export const PROFESSIONAL_BLUE_THEME: DesignTokens = {
  id: 'professional-blue',
  name: 'Professional Blue',
  nameBangla: 'প্রফেশনাল নীল থিম',
  isDark: false,
  colors: {
    // Primary / Royal Blue
    primary: '#1d4ed8', // blue-700
    primaryHover: '#1e40af',
    primaryLight: '#eff6ff',
    primaryBorder: '#bfdbfe',
    primaryFocus: '#3b82f6',
    primaryForeground: '#ffffff',

    // Secondary / Teal Accent
    secondary: '#0f766e', // teal-700
    secondaryHover: '#115e59',
    secondaryLight: '#f0fdfa',
    secondaryBorder: '#99f6e4',
    secondaryForeground: '#ffffff',

    // Surfaces & Canvas
    bg: '#f8fafc',
    bgSubtle: '#f1f5f9',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    surfaceHover: '#f1f5f9',
    surfaceElevated: '#ffffff',

    // Text & Typography
    textMain: '#0f172a',
    textMuted: '#64748b',
    textSubtle: '#94a3b8',
    textInverse: '#ffffff',

    // Borders
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    borderStrong: '#cbd5e1',

    // Status
    success: '#059669',
    successLight: '#d1fae5',
    warning: '#d97706',
    warningLight: '#fef3c7',
    error: '#e11d48',
    errorLight: '#ffe4e6',
    info: '#2563eb',
    infoLight: '#dbeafe',
  },
  typography: DEFAULT_TYPOGRAPHY,
  radius: RADIUS_SCALES.smooth,
  shadows: DEFAULT_SHADOWS,
  components: DEFAULT_COMPONENTS,
};

export const CLASSIC_DARK_THEME: DesignTokens = {
  id: 'dark',
  name: 'Midnight Dark',
  nameBangla: 'ডার্ক / অন্ধকার মোড',
  isDark: true,
  colors: {
    // Primary / Emerald Neon
    primary: '#10b981', // emerald-500
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',
    primaryBorder: 'rgba(16, 185, 129, 0.35)',
    primaryFocus: '#34d399',
    primaryForeground: '#022c22',

    // Secondary / Amber Glow
    secondary: '#f59e0b',
    secondaryHover: '#d97706',
    secondaryLight: 'rgba(245, 158, 11, 0.15)',
    secondaryBorder: 'rgba(245, 158, 11, 0.35)',
    secondaryForeground: '#451a03',

    // Surfaces & Canvas
    bg: '#0b0f19',
    bgSubtle: '#111827',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    surfaceHover: '#2d3748',
    surfaceElevated: '#1a2234',

    // Text & Typography
    textMain: '#f9fafb',
    textMuted: '#9ca3af',
    textSubtle: '#6b7280',
    textInverse: '#0b0f19',

    // Borders
    border: '#374151',
    borderSubtle: '#1f2937',
    borderStrong: '#4b5563',

    // Status
    success: '#10b981',
    successLight: 'rgba(16, 185, 129, 0.2)',
    warning: '#f59e0b',
    warningLight: 'rgba(245, 158, 11, 0.2)',
    error: '#f43f5e',
    errorLight: 'rgba(244, 63, 94, 0.2)',
    info: '#38bdf8',
    infoLight: 'rgba(56, 189, 248, 0.2)',
  },
  typography: DEFAULT_TYPOGRAPHY,
  radius: RADIUS_SCALES.smooth,
  shadows: DARK_SHADOWS,
  components: DEFAULT_COMPONENTS,
};

export const THEME_PRESETS: Record<string, DesignTokens> = {
  'islamic-green': ISLAMIC_GREEN_THEME,
  'professional-blue': PROFESSIONAL_BLUE_THEME,
  dark: CLASSIC_DARK_THEME,
};
