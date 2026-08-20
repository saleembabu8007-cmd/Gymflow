/**
 * GymFlow V2.0 — Iconography System Tokens
 * Standardized Lucide React icon size scales, stroke weights, and semantic icon mappings
 */

export const ICON_SIZES = {
  xs: 'w-3 h-3',           // 12px × 12px (Table metadata, inline status dots)
  sm: 'w-3.5 h-3.5',       // 14px × 14px (Button prefix icons, search prefixes)
  base: 'w-4 h-4',         // 16px × 16px (Standard buttons, list item icons)
  md: 'w-5 h-5',           // 20px × 20px (Desktop & mobile navigation items)
  lg: 'w-6 h-6',           // 24px × 24px (Section card headers, feature icons)
  xl: 'w-8 h-8',           // 32px × 32px (Modal header graphics)
  '2xl': 'w-12 h-12',      // 48px × 48px (Empty state context graphics)
} as const;

export const ICON_STROKES = {
  subtle: 'stroke-[1.5]',
  normal: 'stroke-[1.75]',
  medium: 'stroke-2',
  bold: 'stroke-[2.5]',
} as const;

export const ICON_SEMANTICS = {
  today: 'Calendar',
  members: 'Users',
  payments: 'CreditCard',
  reminders: 'Bell',
  settings: 'Settings',
  search: 'Search',
  add: 'Plus',
  edit: 'Pencil',
  archive: 'Archive',
  delete: 'Trash2',
  back: 'ChevronLeft',
  close: 'X',
  success: 'CheckCircle2',
  warning: 'Clock',
  error: 'AlertCircle',
  whatsapp: 'MessageSquare',
} as const;

export type IconSize = keyof typeof ICON_SIZES;
export type IconStroke = keyof typeof ICON_STROKES;
