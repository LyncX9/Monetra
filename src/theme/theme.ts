export const lightTheme = {
  mode: 'light' as const,
  colors: {
    primary: '#0047AB', // Cobalt Blue (High Contrast)
    primaryLight: '#4FC3F7',
    background: '#F0F9FF',
    backgroundSecondary: '#E1F5FE',
    surface: '#E1F5FE', // Sky Blue Card
    textPrimary: '#1A1A2E',
    textSecondary: '#4A5568',
    textMuted: '#64748B',
    success: '#00C853',
    danger: '#D50000',
    warning: '#FFD600',
    border: 'rgba(0, 71, 171, 0.1)',
    cardBackground: 'rgba(225, 245, 254, 0.95)', // Sky Blue Tint
  },
  gradients: {
    primary: ['#0047AB', '#1976D2'],
    background: ['#F0F9FF', '#E1F5FE'],
    card: ['rgba(225, 245, 254, 0.95)', 'rgba(179, 229, 252, 0.9)'], // Sky Blue Gradient
  },
  glassmorphism: {
    blur: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  borderRadius: {
    s: 12,
    m: 16,
    l: 20,
    xl: 24,
    full: 9999,
  },
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    primary: '#0066FF',
    primaryLight: '#00C6FF',
    background: '#050B14', // Very deep blue/black
    backgroundSecondary: '#0F172A',
    surface: '#152033', // Darker surface
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#FBBF24',
    border: 'rgba(255,255,255,0.06)',
    cardBackground: 'rgba(15, 23, 42, 0.8)',
  },
  gradients: {
    primary: ['#0066FF', '#00C6FF'],
    background: ['#020617', '#0F172A'], // Much darker background
    card: ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.9)'], // Darker card
  },
  glassmorphism: {
    blur: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderRadius: {
    s: 12,
    m: 16,
    l: 20,
    xl: 24,
    full: 9999,
  },
};

export type ThemeType = typeof lightTheme;

export const theme = darkTheme;
