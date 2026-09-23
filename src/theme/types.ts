/**
 * Centralized Design System Types & Theme Tokens
 * Enables full global customization of colors, typography, spacing, shadows,
 * border radii, component archetypes, and theme presets without modifying business logic.
 */

export type ThemePresetId = 'islamic-green' | 'professional-blue' | 'dark' | 'custom';

export type BorderRadiusScale = 'none' | 'subtle' | 'smooth' | 'rounded' | 'pill';
export type SpacingScale = 'compact' | 'comfortable' | 'spacious';
export type FontScale = 'compact' | 'normal' | 'large';

export type SidebarStyleVariant = 'classic' | 'bordered' | 'glass' | 'elevated' | 'subtle';
export type TopbarStyleVariant = 'classic' | 'floating' | 'bordered' | 'glass';
export type CardStyleVariant = 'classic' | 'flat' | 'outline' | 'elevated' | 'glass';
export type TableStyleVariant = 'modern' | 'compact' | 'bordered' | 'striped';
export type ButtonStyleVariant = 'solid' | 'subtle' | 'outline' | 'pill' | 'square';
export type FormStyleVariant = 'classic' | 'filled' | 'minimal' | 'rounded';

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorTokens {
  // Brand / Core Colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  primaryFocus: string;
  primaryForeground: string;

  // Secondary / Accent Colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  secondaryBorder: string;
  secondaryForeground: string;

  // Canvas / Surfaces
  bg: string;
  bgSubtle: string;
  surface: string;
  surfaceMuted: string;
  surfaceHover: string;
  surfaceElevated: string;

  // Typography Colors
  textMain: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;

  // Borders & Dividers
  border: string;
  borderSubtle: string;
  borderStrong: string;

  // Functional Status Colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
}

export interface TypographyTokens {
  fontSans: string;
  fontBangla: string;
  fontArabic: string;
  fontMono: string;
  fontDisplay: string;
  baseFontSize: string; // e.g. "14px" | "16px"
  lineHeight: string;   // e.g. "1.5" | "1.6"
  letterSpacing: string;
}

export interface RadiusTokens {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowTokens {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

export interface ComponentArchetypes {
  sidebarStyle: SidebarStyleVariant;
  topbarStyle: TopbarStyleVariant;
  cardStyle: CardStyleVariant;
  tableStyle: TableStyleVariant;
  buttonStyle: ButtonStyleVariant;
  formStyle: FormStyleVariant;
  radiusScale: BorderRadiusScale;
  spacingScale: SpacingScale;
  fontScale: FontScale;
}

export interface DesignTokens {
  id: ThemePresetId;
  name: string;
  nameBangla: string;
  isDark: boolean;
  colors: ColorTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  components: ComponentArchetypes;
}
