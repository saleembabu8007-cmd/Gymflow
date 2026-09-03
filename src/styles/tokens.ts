/**
 * GymFlow Master Design System — Programmatic TypeScript Token Dictionary
 * Single authoritative source of truth matching src/index.css
 */

export const colors = {
  brand: {
    50: '#FAFDED',
    100: '#F3FAD5',
    200: '#E6F6A6',
    300: '#D5F070',
    400: '#C7EC4B',
    500: '#B2E624', // Primary Brand Accent
    600: '#8DBD14',
    700: '#6B900C',
    800: '#516C09',
    900: '#384C07',
    950: '#1D2903',
  },
  neutral: {
    50: '#FAFAF9',  // Page Background
    100: '#F5F5F4', // Subtle Surface
    200: '#E7E5E4', // Default Border
    300: '#D6D3D1', // Strong Border
    400: '#A8A29E', // Subtle / Placeholder Text
    500: '#78716C', // Muted Text
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917', // Primary Foreground Text
    950: '#0C0A09', // Obsidian Core Text
  },
  bg: {
    app: '#FAFAF9',
    surface: '#FFFFFF',
    subtle: '#F5F5F4',
    elevated: '#FFFFFF',
  },
  foreground: {
    main: '#1C1917',
    muted: '#78716C',
    subtle: '#A8A29E',
    disabled: '#D6D3D1',
  },
  border: {
    subtle: '#F5F5F4',
    default: '#E7E5E4',
    strong: '#D6D3D1',
  },
  primary: {
    main: '#B2E624',
    hover: '#8DBD14',
    active: '#6B900C',
    subtle: '#FAFDED',
    foreground: '#0C0A09',
  },
  status: {
    paid: {
      main: '#10B981',
      subtle: '#ECFDF5',
      border: '#A7F3D0',
      foreground: '#047857',
    },
    dueToday: {
      main: '#F59E0B',
      subtle: '#FFFBEB',
      border: '#FDE68A',
      foreground: '#B45309',
    },
    dueSoon: {
      main: '#F59E0B',
      subtle: '#FFFBEB',
      border: '#FDE68A',
      foreground: '#B45309',
    },
    overdue: {
      main: '#EF4444',
      subtle: '#FEF2F2',
      border: '#FECACA',
      foreground: '#B91C1C',
    },
    expired: {
      main: '#78716C',
      subtle: '#F5F5F4',
      border: '#E7E5E4',
      foreground: '#57534E',
    },
    pending: {
      main: '#6366F1',
      subtle: '#EEF2FF',
      border: '#C7D2FE',
      foreground: '#4338CA',
    },
    info: {
      main: '#3B82F6',
      subtle: '#EFF6FF',
      border: '#BFDBFE',
      foreground: '#1D4ED8',
    },
    success: {
      main: '#10B981',
      subtle: '#ECFDF5',
      border: '#A7F3D0',
      foreground: '#047857',
    },
    warning: {
      main: '#F59E0B',
      subtle: '#FFFBEB',
      border: '#FDE68A',
      foreground: '#B45309',
    },
    danger: {
      main: '#EF4444',
      subtle: '#FEF2F2',
      border: '#FECACA',
      foreground: '#B91C1C',
    },
  },
};

export const spacing = {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
};

export const containerWidths = {
  compact: 'max-w-md',   // 448px (Auth / Password Reset)
  step: 'max-w-xl',      // 576px (Step 2 Gym Setup)
  focus: 'max-w-5xl',    // 1024px (Today Dashboard & Detail Modals)
  ledger: 'max-w-7xl',   // 1280px (Members Directory & Payments Ledger)
};

export const responsivePadding = {
  desktop: 'px-8 py-6',   // ≥ 1024px
  tablet: 'px-6 py-5',    // 768px - 1023px
  mobile: 'px-4 py-4 pb-20', // < 768px
};

export const controlHeights = {
  dense: '32px',  // Dense row actions (h-8)
  sm: '36px',     // Small inputs & buttons (h-9)
  md: '40px',     // Standard form inputs & primary buttons (h-10)
  touch: '44px',  // Touch-friendly controls (min-h-[44px])
  lg: '48px',     // Mobile hero actions (h-12)
};

export const densityTiers = {
  high: 'py-2.5 px-4',   // Tables & ledgers
  medium: 'p-5 gap-4',   // Dashboard sections
  low: 'p-6 space-y-5',  // Forms & onboarding
};

export const borderRadius = {
  none: '0px',
  xs: '3px',
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  full: '9999px',
};

// =========================================================================
// GYMFLOW V3 CANONICAL SEMANTIC DESIGN TOKENS
// =========================================================================

export const semanticColors = {
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F4',
  surfaceSubtle: '#FAFAF9',
  border: '#E7E5E4',
  borderStrong: '#D6D3D1',
  textPrimary: '#0C0A09',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',
  textDisabled: '#D6D3D1',
  brand: '#B2E624',
  brandHover: '#8DBD14',
  brandActive: '#6B900C',
  brandSubtle: '#FAFDED',
  success: '#10B981',
  successSubtle: '#ECFDF5',
  warning: '#F59E0B',
  warningSubtle: '#FFFBEB',
  danger: '#EF4444',
  dangerSubtle: '#FEF2F2',
  info: '#3B82F6',
  focus: '#0C0A09',
};

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  scale: {
    display: { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.03em' },
    pageTitle: { fontSize: '22px', lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.02em' },
    sectionTitle: { fontSize: '17px', lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.01em' },
    cardTitle: { fontSize: '15px', lineHeight: '1.40', fontWeight: '600', letterSpacing: '0em' },
    bodyLarge: { fontSize: '16px', lineHeight: '1.50', fontWeight: '500', letterSpacing: '0em' },
    body: { fontSize: '15px', lineHeight: '1.50', fontWeight: '400', letterSpacing: '0em' },
    bodySmall: { fontSize: '14px', lineHeight: '1.50', fontWeight: '400', letterSpacing: '0em' },
    label: { fontSize: '13px', lineHeight: '1.40', fontWeight: '600', letterSpacing: '0.01em' },
    caption: { fontSize: '12px', lineHeight: '1.40', fontWeight: '500', letterSpacing: '0.01em' },
    metadata: { fontSize: '11px', lineHeight: '1.20', fontWeight: '700', letterSpacing: '0.05em' },
    numericEmphasis: { fontSize: '24px', lineHeight: '1.20', fontWeight: '700', letterSpacing: '-0.01em' },
  },
  fontSize: {
    micro: '11px',
    caption: '12px',
    bodySm: '14px',
    body: '15px',
    bodyLg: '16px',
    h3: '18px',
    h2: '20px',
    h1: '24px',
    display: '32px',
  },
};

export const sizes = {
  controlHeights: {
    dense: '32px',
    sm: '36px',
    md: '40px',
    lg: '48px',
  },
  iconSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },
  avatarSizes: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '56px',
  },
  contentWidths: {
    compact: '448px',
    step: '576px',
    focus: '1024px',
    ledger: '1280px',
  },
  sidebarWidth: '240px',
  mobileBottomNavHeight: '64px',
  dialogWidths: {
    sm: '400px',
    md: '512px',
    lg: '640px',
    xl: '768px',
  },
  touchTarget: '44px',
};

export const radius = {
  small: '4px',
  medium: '6px',
  large: '10px',
  surface: '10px',
  dialog: '12px',
  pill: '9999px',
};

export const elevation = {
  none: 'none',
  surface: '0 1px 2px rgba(12, 10, 9, 0.04)',
  hover: '0 1px 3px rgba(12, 10, 9, 0.06)',
  dialog: '0 10px 24px rgba(12, 10, 9, 0.08)',
};

export const shadows = {
  none: 'none',
  '2xs': '0 1px 2px rgba(12, 10, 9, 0.04)',
  xs: '0 1px 3px rgba(12, 10, 9, 0.06)',
  sm: '0 4px 12px rgba(12, 10, 9, 0.05)',
  md: '0 10px 24px rgba(12, 10, 9, 0.08)',
  lg: '0 20px 40px rgba(12, 10, 9, 0.12)',
};

export const motion = {
  micro: '100ms cubic-bezier(0.16, 1, 0.3, 1)',
  fast: '100ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '180ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

export const breakpoints = {
  mobileSm: '375px',
  mobileMd: '390px',
  mobileLg: '430px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
};

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 30,
  backdrop: 40,
  modal: 50,
  toast: 60,
};

export const TOKENS = {
  semanticColors,
  colors,
  spacing,
  sizes,
  radius,
  borderRadius,
  elevation,
  shadows,
  typography,
  motion,
  containerWidths,
  responsivePadding,
  controlHeights,
  densityTiers,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof TOKENS;
