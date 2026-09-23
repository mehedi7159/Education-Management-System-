import { RadiusTokens, ShadowTokens, TypographyTokens, BorderRadiusScale, SpacingScale, FontScale } from './types';

export const DEFAULT_TYPOGRAPHY: TypographyTokens = {
  fontSans: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontBangla: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif",
  fontArabic: "'Amiri', 'Scheherazade New', serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  fontDisplay: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
  baseFontSize: '15px',
  lineHeight: '1.55',
  letterSpacing: '-0.01em',
};

export const RADIUS_SCALES: Record<BorderRadiusScale, RadiusTokens> = {
  none: {
    none: '0px',
    xs: '0px',
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
    '2xl': '0px',
    '3xl': '0px',
    full: '0px',
  },
  subtle: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '10px',
    '2xl': '12px',
    '3xl': '14px',
    full: '9999px',
  },
  smooth: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '26px',
    full: '9999px',
  },
  rounded: {
    none: '0px',
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '26px',
    '2xl': '32px',
    '3xl': '40px',
    full: '9999px',
  },
  pill: {
    none: '0px',
    xs: '8px',
    sm: '14px',
    md: '20px',
    lg: '28px',
    xl: '36px',
    '2xl': '48px',
    '3xl': '60px',
    full: '9999px',
  },
};

export const DEFAULT_SHADOWS: ShadowTokens = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const DARK_SHADOWS: ShadowTokens = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
};

export const SPACING_FACTORS: Record<SpacingScale, number> = {
  compact: 0.85,
  comfortable: 1.0,
  spacious: 1.2,
};

export const FONT_FACTORS: Record<FontScale, number> = {
  compact: 0.9,
  normal: 1.0,
  large: 1.12,
};
