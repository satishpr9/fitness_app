export const Colors = {
  // Dark Fitness Theme Palette
  background: '#0B0F19',
  surface: '#151D2F',
  surfaceLight: '#1E293B',
  surfaceHighlight: '#2A374F',
  border: '#243048',
  borderLight: '#334155',

  // Brand Accents
  primary: '#10B981',        // Emerald Green (Energy / Fitness)
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryMuted: 'rgba(16, 185, 129, 0.15)',

  // Secondary Accents
  accent: '#38BDF8',         // Sky Blue (Water / Hydration)
  accentMuted: 'rgba(56, 189, 248, 0.15)',
  purple: '#A855F7',         // Strength / Workouts
  purpleMuted: 'rgba(168, 85, 247, 0.15)',

  // Macros
  protein: '#38BDF8',        // Blue
  carbs: '#F59E0B',          // Amber
  fat: '#EC4899',            // Pink / Rose
  fiber: '#10B981',          // Emerald

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',

  // Typography
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F19',

  // Special
  cardGradientStart: '#1E293B',
  cardGradientEnd: '#0F172A',
  gold: '#FBBF24',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  title1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  title3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};
