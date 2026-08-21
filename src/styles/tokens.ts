/**
 * GymFlow V2.5 — Complete Visual Design Reset Tokens Catalog
 * Programmatic TypeScript Token Mappings for Human-Centric Operational Design
 */

export const colors = {
  bg: {
    app: '#fafafa',
    surface: '#ffffff',
    subtle: '#f4f4f2',
    elevated: '#ffffff',
  },
  foreground: {
    main: '#0c0c0e',
    muted: '#52525b',
    subtle: '#71717a',
    disabled: '#a1a1aa',
  },
  border: {
    subtle: '#f4f4f2',
    default: '#e4e4e7',
    strong: '#d4d4d8',
  },
  primary: {
    main: '#0c0c0e',
    hover: '#18181b',
    active: '#27272a',
    subtle: '#f4f4f2',
    foreground: '#ffffff',
  },
  status: {
    paid: {
      main: '#059669',
      subtle: '#ecfdf5',
      border: '#a7f3d0',
      foreground: '#047857',
    },
    dueToday: {
      main: '#d97706',
      subtle: '#fffbe6',
      border: '#fde68a',
      foreground: '#b45309',
    },
    dueSoon: {
      main: '#d97706',
      subtle: '#fffbe6',
      border: '#fde68a',
      foreground: '#b45309',
    },
    overdue: {
      main: '#e11d48',
      subtle: '#fff1f2',
      border: '#fecdd3',
      foreground: '#be123c',
    },
    expired: {
      main: '#71717a',
      subtle: '#f4f4f2',
      border: '#e4e4e7',
      foreground: '#52525b',
    },
    pending: {
      main: '#4f46e5',
      subtle: '#eef2ff',
      border: '#c7d2fe',
      foreground: '#3730a3',
    },
    info: {
      main: '#0284c7',
      subtle: '#f0f9ff',
      border: '#bae6fd',
      foreground: '#0369a1',
    },
    success: {
      main: '#059669',
      subtle: '#ecfdf5',
      border: '#a7f3d0',
      foreground: '#047857',
    },
    warning: {
      main: '#d97706',
      subtle: '#fffbe6',
      border: '#fde68a',
      foreground: '#b45309',
    },
    danger: {
      main: '#e11d48',
      subtle: '#fff1f2',
      border: '#fecdd3',
      foreground: '#be123c',
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
  h8: '32px',  // Dense row actions
  h9: '36px',  // Small inputs & buttons
  h10: '40px', // Standard form inputs & primary buttons
  h11: '44px', // Touch-friendly controls
  h12: '48px', // Mobile hero actions
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

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
};

export const sizing = {
  h8: '32px',
  h9: '36px',
  h10: '40px',
  h11: '44px',
  h12: '48px',
};

export const shadows = {
  xs: 'none',
  sm: 'none',
  md: 'none',
  lg: 'none',
};

export const motion = {
  fast: '100ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
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
  colors,
  spacing,
  containerWidths,
  responsivePadding,
  controlHeights,
  densityTiers,
  borderRadius,
  typography,
  sizing,
  shadows,
  motion,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof TOKENS;
