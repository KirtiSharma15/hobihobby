// Design System for HobiHobby App
// Extracted from Figma AI designs with CSS variables

// Light Theme Colors (matching your CSS variables)
export const LightColors = {
  // Core Colors
  background: '#ffffff',
  foreground: '#030213', // oklch(0.145 0 0)
  card: '#ffffff',
  cardForeground: '#030213',
  popover: '#ffffff', // oklch(1 0 0)
  popoverForeground: '#030213',
  
  // Primary Colors
  primary: '#030213',
  primaryForeground: '#ffffff', // oklch(1 0 0)
  
  // Secondary Colors
  secondary: '#f3f3f5', // oklch(0.95 0.0058 264.53)
  secondaryForeground: '#030213',
  
  // Muted Colors
  muted: '#ececf0',
  mutedForeground: '#717182',
  
  // Accent Colors
  accent: '#e9ebef',
  accentForeground: '#030213',
  
  // Status Colors
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',
  
  // Border & Input Colors
  border: 'rgba(0, 0, 0, 0.1)',
  input: 'transparent',
  inputBackground: '#f3f3f5',
  switchBackground: '#cbced4',
  ring: '#b5b5b5', // oklch(0.708 0 0)
  
  // Chart Colors
  chart1: '#a85a1a', // oklch(0.646 0.222 41.116)
  chart2: '#4a8b9c', // oklch(0.6 0.118 184.704)
  chart3: '#2d5a7a', // oklch(0.398 0.07 227.392)
  chart4: '#d4a574', // oklch(0.828 0.189 84.429)
  chart5: '#c49a6b', // oklch(0.769 0.188 70.08)
  
  // Sidebar Colors
  sidebar: '#fbfbfb', // oklch(0.985 0 0)
  sidebarForeground: '#030213',
  sidebarPrimary: '#030213',
  sidebarPrimaryForeground: '#fbfbfb',
  sidebarAccent: '#f7f7f7', // oklch(0.97 0 0)
  sidebarAccentForeground: '#343434', // oklch(0.205 0 0)
  sidebarBorder: '#ebebeb', // oklch(0.922 0 0)
  sidebarRing: '#b5b5b5', // oklch(0.708 0 0)
};

// Dark Theme Colors (matching your CSS variables)
export const DarkColors = {
  // Core Colors
  background: '#030213', // oklch(0.145 0 0)
  foreground: '#fbfbfb', // oklch(0.985 0 0)
  card: '#030213',
  cardForeground: '#fbfbfb',
  popover: '#030213',
  popoverForeground: '#fbfbfb',
  
  // Primary Colors
  primary: '#fbfbfb',
  primaryForeground: '#343434', // oklch(0.205 0 0)
  
  // Secondary Colors
  secondary: '#444444', // oklch(0.269 0 0)
  secondaryForeground: '#fbfbfb',
  
  // Muted Colors
  muted: '#444444',
  mutedForeground: '#b5b5b5', // oklch(0.708 0 0)
  
  // Accent Colors
  accent: '#444444',
  accentForeground: '#fbfbfb',
  
  // Status Colors
  destructive: '#8b2a2a', // oklch(0.396 0.141 25.723)
  destructiveForeground: '#a85a1a', // oklch(0.637 0.237 25.331)
  
  // Border & Input Colors
  border: '#444444',
  input: '#444444',
  inputBackground: '#444444',
  switchBackground: '#444444',
  ring: '#707070', // oklch(0.439 0 0)
  
  // Chart Colors
  chart1: '#7a5aa8', // oklch(0.488 0.243 264.376)
  chart2: '#8bb2a8', // oklch(0.696 0.17 162.48)
  chart3: '#c49a6b', // oklch(0.769 0.188 70.08)
  chart4: '#a174c4', // oklch(0.627 0.265 303.9)
  chart5: '#a85a1a', // oklch(0.645 0.246 16.439)
  
  // Sidebar Colors
  sidebar: '#343434', // oklch(0.205 0 0)
  sidebarForeground: '#fbfbfb',
  sidebarPrimary: '#7a5aa8', // oklch(0.488 0.243 264.376)
  sidebarPrimaryForeground: '#fbfbfb',
  sidebarAccent: '#444444',
  sidebarAccentForeground: '#fbfbfb',
  sidebarBorder: '#444444',
  sidebarRing: '#707070',
};

// Default to light theme
export const Colors = LightColors;

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes (matching CSS variables)
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14, // var(--font-size)
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  
  // Line Heights (matching CSS)
  lineHeight: {
    tight: 1.25,
    normal: 1.5, // matches CSS line-height: 1.5
    relaxed: 1.75,
  },
  
  // Font Weights (matching CSS variables)
  fontWeight: {
    normal: '400', // var(--font-weight-normal)
    medium: '500', // var(--font-weight-medium)
    semibold: '600',
    bold: '700',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export const BorderRadius = {
  none: 0,
  sm: 6, // calc(var(--radius) - 4px) = 10 - 4 = 6
  md: 8, // calc(var(--radius) - 2px) = 10 - 2 = 8
  lg: 10, // var(--radius) = 0.625rem = 10px
  xl: 14, // calc(var(--radius) + 4px) = 10 + 4 = 14
  '2xl': 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const Layout = {
  // Screen padding
  screenPadding: Spacing.md,
  
  // Card padding
  cardPadding: Spacing.md,
  
  // Button heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Input heights
  inputHeight: 48,
  
  // Border widths
  borderWidth: {
    thin: 1,
    normal: 2,
    thick: 3,
  },
};

// Common component styles
export const ComponentStyles = {
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    ...Shadows.md,
  },
  
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },
  },
  
  input: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.border,
    borderWidth: Layout.borderWidth.thin,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  ComponentStyles,
};
