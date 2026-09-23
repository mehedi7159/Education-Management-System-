import { DesignTokens } from './types';
import { RADIUS_SCALES, SPACING_FACTORS, FONT_FACTORS } from './tokens';

/**
 * Injects or updates all CSS variables on document.documentElement
 * based on the active DesignTokens and component archetype configurations.
 */
export function applyThemeTokensToDOM(tokens: DesignTokens): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Set data-theme and dark class
  root.setAttribute('data-theme', tokens.id);
  if (tokens.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 1. Colors
  root.style.setProperty('--color-primary', tokens.colors.primary);
  root.style.setProperty('--color-primary-hover', tokens.colors.primaryHover);
  root.style.setProperty('--color-primary-light', tokens.colors.primaryLight);
  root.style.setProperty('--color-primary-border', tokens.colors.primaryBorder);
  root.style.setProperty('--color-primary-focus', tokens.colors.primaryFocus);
  root.style.setProperty('--color-primary-foreground', tokens.colors.primaryForeground);

  root.style.setProperty('--color-accent', tokens.colors.secondary);
  root.style.setProperty('--color-accent-hover', tokens.colors.secondaryHover);
  root.style.setProperty('--color-accent-light', tokens.colors.secondaryLight);
  root.style.setProperty('--color-accent-border', tokens.colors.secondaryBorder);
  root.style.setProperty('--color-accent-foreground', tokens.colors.secondaryForeground);

  root.style.setProperty('--color-bg', tokens.colors.bg);
  root.style.setProperty('--color-bg-subtle', tokens.colors.bgSubtle);
  root.style.setProperty('--color-surface', tokens.colors.surface);
  root.style.setProperty('--color-surface-muted', tokens.colors.surfaceMuted);
  root.style.setProperty('--color-surface-hover', tokens.colors.surfaceHover);
  root.style.setProperty('--color-surface-elevated', tokens.colors.surfaceElevated);

  root.style.setProperty('--color-text-main', tokens.colors.textMain);
  root.style.setProperty('--color-text-muted', tokens.colors.textMuted);
  root.style.setProperty('--color-text-subtle', tokens.colors.textSubtle);
  root.style.setProperty('--color-text-inverse', tokens.colors.textInverse);

  root.style.setProperty('--color-border', tokens.colors.border);
  root.style.setProperty('--color-border-subtle', tokens.colors.borderSubtle);
  root.style.setProperty('--color-border-strong', tokens.colors.borderStrong);

  root.style.setProperty('--color-success', tokens.colors.success);
  root.style.setProperty('--color-success-light', tokens.colors.successLight);
  root.style.setProperty('--color-warning', tokens.colors.warning);
  root.style.setProperty('--color-warning-light', tokens.colors.warningLight);
  root.style.setProperty('--color-error', tokens.colors.error);
  root.style.setProperty('--color-error-light', tokens.colors.errorLight);
  root.style.setProperty('--color-info', tokens.colors.info);
  root.style.setProperty('--color-info-light', tokens.colors.infoLight);

  // 2. Typography
  root.style.setProperty('--font-sans', tokens.typography.fontSans);
  root.style.setProperty('--font-bangla', tokens.typography.fontBangla);
  root.style.setProperty('--font-arabic', tokens.typography.fontArabic);
  root.style.setProperty('--font-mono', tokens.typography.fontMono);
  root.style.setProperty('--font-display', tokens.typography.fontDisplay);

  const fontMultiplier = FONT_FACTORS[tokens.components.fontScale] || 1.0;
  root.style.setProperty('--font-scale-factor', fontMultiplier.toString());
  root.style.setProperty('--line-height-base', tokens.typography.lineHeight);

  // 3. Border Radii based on component archetype setting
  const activeRadius = RADIUS_SCALES[tokens.components.radiusScale] || tokens.radius;
  root.style.setProperty('--radius-none', activeRadius.none);
  root.style.setProperty('--radius-xs', activeRadius.xs);
  root.style.setProperty('--radius-sm', activeRadius.sm);
  root.style.setProperty('--radius-md', activeRadius.md);
  root.style.setProperty('--radius-lg', activeRadius.lg);
  root.style.setProperty('--radius-xl', activeRadius.xl);
  root.style.setProperty('--radius-2xl', activeRadius['2xl']);
  root.style.setProperty('--radius-3xl', activeRadius['3xl']);
  root.style.setProperty('--radius-full', activeRadius.full);

  // 4. Shadows
  root.style.setProperty('--shadow-none', tokens.shadows.none);
  root.style.setProperty('--shadow-xs', tokens.shadows.xs);
  root.style.setProperty('--shadow-sm', tokens.shadows.sm);
  root.style.setProperty('--shadow-md', tokens.shadows.md);
  root.style.setProperty('--shadow-lg', tokens.shadows.lg);
  root.style.setProperty('--shadow-xl', tokens.shadows.xl);

  // 5. Spacing Factor
  const spacingMultiplier = SPACING_FACTORS[tokens.components.spacingScale] || 1.0;
  root.style.setProperty('--spacing-factor', spacingMultiplier.toString());

  // 6. Component-specific archetype variables
  // Card
  if (tokens.components.cardStyle === 'flat') {
    root.style.setProperty('--card-shadow', 'none');
    root.style.setProperty('--card-border-width', '0px');
    root.style.setProperty('--card-bg', tokens.colors.surfaceMuted);
  } else if (tokens.components.cardStyle === 'outline') {
    root.style.setProperty('--card-shadow', 'none');
    root.style.setProperty('--card-border-width', '1.5px');
    root.style.setProperty('--card-bg', tokens.colors.surface);
  } else if (tokens.components.cardStyle === 'elevated') {
    root.style.setProperty('--card-shadow', tokens.shadows.md);
    root.style.setProperty('--card-border-width', '0px');
    root.style.setProperty('--card-bg', tokens.colors.surface);
  } else {
    // classic
    root.style.setProperty('--card-shadow', tokens.shadows.xs);
    root.style.setProperty('--card-border-width', '1px');
    root.style.setProperty('--card-bg', tokens.colors.surface);
  }

  // Sidebar
  if (tokens.components.sidebarStyle === 'elevated') {
    root.style.setProperty('--sidebar-shadow', tokens.shadows.md);
    root.style.setProperty('--sidebar-border-width', '0px');
  } else if (tokens.components.sidebarStyle === 'bordered') {
    root.style.setProperty('--sidebar-shadow', 'none');
    root.style.setProperty('--sidebar-border-width', '2px');
  } else {
    root.style.setProperty('--sidebar-shadow', 'none');
    root.style.setProperty('--sidebar-border-width', '1px');
  }

  // Topbar
  if (tokens.components.topbarStyle === 'bordered') {
    root.style.setProperty('--topbar-border-width', '2px');
    root.style.setProperty('--topbar-shadow', 'none');
  } else if (tokens.components.topbarStyle === 'floating') {
    root.style.setProperty('--topbar-border-width', '1px');
    root.style.setProperty('--topbar-shadow', tokens.shadows.sm);
  } else {
    root.style.setProperty('--topbar-border-width', '1px');
    root.style.setProperty('--topbar-shadow', 'none');
  }
}
