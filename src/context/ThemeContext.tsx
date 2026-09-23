import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DesignTokens,
  ThemePresetId,
  ComponentArchetypes,
  ColorTokens,
  THEME_PRESETS,
  ISLAMIC_GREEN_THEME,
  PROFESSIONAL_BLUE_THEME,
  CLASSIC_DARK_THEME,
  applyThemeTokensToDOM,
} from '../theme';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  themePreset: ThemePresetId;
  isDark: boolean;
  tokens: DesignTokens;
  setTheme: (theme: ThemeMode) => void;
  setThemePreset: (presetId: ThemePresetId) => void;
  toggleDarkMode: () => void;
  updateColorToken: (key: keyof ColorTokens, value: string) => void;
  updateComponentArchetype: <K extends keyof ComponentArchetypes>(
    key: K,
    value: ComponentArchetypes[K]
  ) => void;
  resetTheme: () => void;
  exportThemeJson: () => string;
  importThemeJson: (json: string) => boolean;
}

const STORAGE_KEY = 'madrasah_theme_tokens';
const STORAGE_PRESET_KEY = 'madrasah_theme_preset';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial preset
  const [themePreset, setThemePresetState] = useState<ThemePresetId>(() => {
    const saved = localStorage.getItem(STORAGE_PRESET_KEY) as ThemePresetId;
    if (saved && (saved === 'islamic-green' || saved === 'professional-blue' || saved === 'dark' || saved === 'custom')) {
      return saved;
    }
    const legacy = localStorage.getItem('madrasah_theme');
    if (legacy === 'professional-blue' || legacy === 'dark') {
      return legacy as ThemePresetId;
    }
    return 'islamic-green';
  });

  // Load active tokens
  const [tokens, setTokens] = useState<DesignTokens>(() => {
    const base = THEME_PRESETS[themePreset] || ISLAMIC_GREEN_THEME;
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        return {
          ...base,
          ...parsed,
          colors: { ...base.colors, ...(parsed.colors || {}) },
          components: { ...base.components, ...(parsed.components || {}) },
          typography: { ...base.typography, ...(parsed.typography || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved theme tokens', e);
    }
    return base;
  });

  // Keep DOM CSS variables synchronized
  useEffect(() => {
    applyThemeTokensToDOM(tokens);
  }, [tokens]);

  // Set Theme Preset (Islamic Green, Professional Blue, Dark)
  const setThemePreset = (presetId: ThemePresetId) => {
    setThemePresetState(presetId);
    localStorage.setItem(STORAGE_PRESET_KEY, presetId);
    localStorage.setItem('madrasah_theme', presetId);

    if (presetId === 'custom') {
      return;
    }

    const newTokens = THEME_PRESETS[presetId] || ISLAMIC_GREEN_THEME;
    setTokens(newTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
  };

  const setTheme = (themeMode: ThemeMode) => {
    if (themeMode === 'islamic-green' || themeMode === 'professional-blue' || themeMode === 'dark') {
      setThemePreset(themeMode);
    }
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setTokens((prev) => {
      const isNowDark = !prev.isDark;
      let nextBase: DesignTokens;
      if (isNowDark) {
        nextBase = CLASSIC_DARK_THEME;
      } else {
        nextBase = themePreset === 'professional-blue' ? PROFESSIONAL_BLUE_THEME : ISLAMIC_GREEN_THEME;
      }

      const updated: DesignTokens = {
        ...nextBase,
        isDark: isNowDark,
        components: prev.components,
      };

      setThemePresetState(isNowDark ? 'dark' : (updated.id as ThemePresetId));
      localStorage.setItem(STORAGE_PRESET_KEY, isNowDark ? 'dark' : updated.id);
      localStorage.setItem('madrasah_theme', isNowDark ? 'dark' : updated.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Update Individual Color Token
  const updateColorToken = (key: keyof ColorTokens, value: string) => {
    setTokens((prev) => {
      const updated: DesignTokens = {
        ...prev,
        id: 'custom',
        colors: {
          ...prev.colors,
          [key]: value,
        },
      };
      setThemePresetState('custom');
      localStorage.setItem(STORAGE_PRESET_KEY, 'custom');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Update Component Archetype / Style Variant
  const updateComponentArchetype = <K extends keyof ComponentArchetypes>(
    key: K,
    value: ComponentArchetypes[K]
  ) => {
    setTokens((prev) => {
      const updated: DesignTokens = {
        ...prev,
        components: {
          ...prev.components,
          [key]: value,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Reset to default
  const resetTheme = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_PRESET_KEY);
    localStorage.setItem('madrasah_theme', 'islamic-green');
    setThemePresetState('islamic-green');
    setTokens(ISLAMIC_GREEN_THEME);
  };

  // Export JSON configuration
  const exportThemeJson = () => {
    return JSON.stringify(tokens, null, 2);
  };

  // Import JSON configuration
  const importThemeJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && parsed.colors) {
        const merged: DesignTokens = {
          ...ISLAMIC_GREEN_THEME,
          ...parsed,
          colors: { ...ISLAMIC_GREEN_THEME.colors, ...(parsed.colors || {}) },
          components: { ...ISLAMIC_GREEN_THEME.components, ...(parsed.components || {}) },
          typography: { ...ISLAMIC_GREEN_THEME.typography, ...(parsed.typography || {}) },
          id: 'custom',
        };
        setTokens(merged);
        setThemePresetState('custom');
        localStorage.setItem(STORAGE_PRESET_KEY, 'custom');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme: (themePreset === 'custom' ? (tokens.isDark ? 'dark' : 'islamic-green') : themePreset) as ThemeMode,
      themePreset,
      isDark: tokens.isDark,
      tokens,
      setTheme,
      setThemePreset,
      toggleDarkMode,
      updateColorToken,
      updateComponentArchetype,
      resetTheme,
      exportThemeJson,
      importThemeJson,
    }),
    [themePreset, tokens]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
