# GymFlow V2.0 — Design System Strategy & Visual Language Guide
**Phase 00: Design Audit, Visual Strategy & Design Direction**

> **Core Product Purpose**: "Help the gym owner understand what needs attention today and act on it quickly."

---

## 1. Executive Summary & Design Vision

GymFlow is mission-critical operational software used by gym owners, reception managers, and studio operators throughout their working day. It is used at reception desks, on laptops, mobile phones, and tablets while interacting with members and collecting payments.

This design system rebuild establishes a production-grade visual language rooted in **Clarity**, **Scannability**, **High-Contrast Affordance**, and **Operational Speed**. It intentionally avoids superficial fitness clichés (e.g. "gym bro" aggressive red/black styling, neon highlights, muscle stock imagery, or redundant dumbbell icons) in favor of a sleek, trustworthy, and high-performance business UI.

---

## 2. 12 Core Design Principles

1. **Clarity Before Decoration**: Every visual element must serve a functional purpose. If a border, shadow, or icon does not aid scannability or decision-making, it is removed.
2. **One Primary Action Per Context**: Every screen, modal, and drawer features exactly one high-contrast primary CTA (e.g., "Record Payment", "Add Member"). Secondary actions are visually subdued.
3. **Scan-First Information Hierarchy**: Key operational answers ("Who owes money?", "Who is due today?") are visible within 2 seconds of opening a page without requiring manual scrolling or searching.
4. **Instant Status Affordance**: Payment statuses (Overdue, Due Today, Due Soon, Paid) use distinct, accessible color tokens and clear typography badges that convey urgency without panic.
5. **Proportional Feedback**: Small actions trigger subtle in-place state changes; critical mutations (recording payments, adding members) provide clear success notifications and instant cross-hook UI updates.
6. **Zero-Stale UI Guarantee**: Data mutations update all related components (Today cards, member lists, payment ledgers) in real time without stale caches or fake successes.
7. **Task-Driven Density**: Operational lists (table rows, transaction logs) use compact density for maximum data throughput; modal forms use open spacing for error-free data entry.
8. **Mobile as a First-Class Citizen**: Every core action (member search, quick payment, WhatsApp reminder) is executable one-handed on a smartphone at a reception desk.
9. **Form Input & Context Retention**: Errors (validation, network, DB) never erase typed user input. The user can fix errors or retry without re-typing data.
10. **Calm Human Error Translation**: Technical exceptions (PostgreSQL errors, PostgREST codes, HTTP 500s) are stripped and presented in warm, actionable human language with a one-click Retry button.
11. **Predictable Navigation & History**: URL paths (`/app/today`, `/app/members`, `/app/payments`) reflect owner workflows, preserving deep-link targets and browser back/forward history stacks.
12. **Motion Explains, Never Entertains**: Micro-interactions and transition durations (150ms–200ms) serve strictly to indicate state changes, modal entries, or sheet dismissals without slowing down the operator.

---

## 3. Comprehensive Screen Audit

| Screen / Route | Purpose & Primary Question | Primary Action | Hierarchy & Density | Component Usage | Audit Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing (`/`)** | Introduce GymFlow SaaS value; prompt login or signup. | `"Get Started"` / `"Sign In"` | Low density; spacious hero section | Button, Card, Header | **REFINE**: Enhance typographic contrast & modern hero alignment. |
| **Login (`/login`)** | Secure owner authentication & session restoration. | `"Sign In"` | Compact modal-card form | Input, Button, AlertBanner | **REFINE**: Strengthen field focus states & session expiry notice. |
| **Signup (`/signup`)** | Initial account registration. | `"Create Account"` | Compact step-1 form | Input, Button, AlertBanner | **REFINE**: Align visual hierarchy with Gym Setup step. |
| **Gym Setup (`/app/setup`)**| Step 2 mandatory workspace & currency configuration. | `"Complete Setup"` | Step-card container | Input, Select, Button, Card | **REFINE**: Improve step indicator badge and currency selector layout. |
| **Today's Dashboard (`/app/today`)** | **"Who needs my attention today?"** | `"Record Payment"` / `"Add Member"` | High density summary cards + attention table | Card, Avatar, StatusBadge, Button, Skeleton | **REFINE**: Optimize skeleton states and "All Caught Up" positive card. |
| **Members Directory (`/app/members`)** | **"Who is enrolled in my gym?"** | `"Add Member"` | High-throughput data table / mobile cards | Table, Avatar, StatusBadge, Input, Button, Pagination | **REBUILD**: Rebuild table styling with crisp cell borders & inline quick actions. |
| **Member Profile Modal** | **"What is this member's payment & plan history?"** | `"Mark Paid"` / `"Remind"` | Medium density stacked sections | Modal, Avatar, StatusBadge, Button, HistoryList | **REFINE**: Enhance payment timeline list and archive confirmation flow. |
| **Payment Ledger (`/app/payments`)** | **"What payments have been collected and what is pending?"** | `"Record Payment"` | Tabbed ledger view (Pending, Upcoming, Paid) | Tabs, Table, Avatar, StatusBadge, SearchInput | **REBUILD**: Streamline sub-filter pill tabs & CSV export action. |
| **WhatsApp Reminders (`/app/reminders`)**| Dispatch payment reminder messages to overdue members. | `"Send WhatsApp"` | Priority dispatch list | Card, Avatar, Button, Select, SendReminderModal | **REFINE**: Standardize template selector and reminder log badges. |
| **Gym Settings (`/app/settings`)** | Manage gym details, UPI ID, membership plans, dues window. | `"Save Settings"` | Form sections with card containers | Input, Select, Button, Card, Toast | **REFINE**: Group plan settings cleanly with inline add/edit plan controls. |
| **Platform Admin (`/admin`)** | Multi-tenant platform stats and gym account controls. | `"Toggle Gym Status"` | Data grid & tenant cards | AdminLayout, Table, StatusBadge, Button | **REFINE**: Clean up table badge contrast and stats overview cards. |

---

## 4. Comprehensive Component Audit & Classification

| Component | Current File | Category | Audit Findings & Action Plan |
| :--- | :--- | :--- | :--- |
| `Button` | `src/components/ui/Button.tsx` | **REFINE** | Excellent variant support (`primary`, `secondary`, `outline`, `ghost`, `destructive`). Refine focus rings, height tokens (h-9, h-10, h-11), and loading spinner alignment. |
| `Input` | `src/components/ui/Input.tsx` | **REFINE** | Has light/dark variant support. Refine label font-weights, prefix/suffix text spacing, and error helper text styling. |
| `Select` | `src/components/ui/Select.tsx` | **REFINE** | Native select container. Add custom dropdown chevron icon, crisp border tokens, and focus states. |
| `Textarea` | *Inline in modals* | **REBUILD** | Extract standard `Textarea` component into `src/components/ui/Textarea.tsx` with character counters and error bounds. |
| `Card` | `src/components/ui/Card.tsx` | **REFINE** | Simple container. Standardize padding variants (`sm`, `md`, `lg`), subtle border tokens (`border-neutral-200/80`), and shadow tokens. |
| `Modal` | `src/components/ui/Modal.tsx` | **REFINE** | Includes backdrop blur & escape key listener. Refine header spacing, sticky action footers, and max-width classes. |
| `Dialog` / Confirm | `src/components/common/ConfirmDialog.tsx` | **REBUILD** | Unify confirmation dialogs into a standardized `ConfirmDialog` component for destructive actions (e.g., archiving members). |
| `Drawer` / BottomSheet | `src/components/ui/BottomSheet.tsx` | **REFINE** | Touch-friendly mobile bottom sheet. Refine drag handle indicator, backdrop click dismissal, and mobile padding. |
| `Badge` | `src/components/ui/Badge.tsx` | **REBUILD** | Extract generic `Badge` component for count indicators, plan tags, and system labels. |
| `StatusBadge` | `src/components/ui/StatusBadge.tsx` | **REFINE** | Excellent semantic status mapping (OVERDUE, DUE_TODAY, DUE_SOON, PAID). Refine dot indicators, font sizes, and contrast. |
| `Avatar` | `src/components/ui/Avatar.tsx` | **REFINE** | Initials avatar generator. Add subtle background tint variations based on member name hashes for visual distinction. |
| `Table` | *Inline in pages* | **REBUILD** | Extract reusable `Table`, `TableHeader`, `TableRow`, `TableCell` components with sorted column headers and hover states. |
| `Tabs` | *Inline in PaymentsPage* | **REBUILD** | Extract standardized `Tabs` component for tab navigation with high-contrast active indicator pills. |
| `Toast` | `src/components/ui/Toast.tsx` | **KEEP** | Well-designed toast notification provider with auto-dismiss and action feedback. |
| `Tooltip` | *Missing* | **REBUILD** | Create lightweight accessible `Tooltip` component for icon-only action buttons. |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | **REFINE** | Subtle pulse loader. Create structured preset skeletons for table rows, summary cards, and detail modals. |
| `Dropdown` | *Missing* | **REBUILD** | Create accessible action dropdown menu component for member table row quick actions. |
| `Navigation` | `src/components/layout/Header.tsx` | **REFINE** | Refine page title typography, global search bar trigger (`⌘K`), and quick action buttons. |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | **REFINE** | Refine navigation item active states (`bg-neutral-900 text-white`), pending count badges, and tenant footer layout. |
| `Mobile Nav` | `src/components/layout/BottomNav.tsx` | **REFINE** | Refine bottom navigation bar touch targets, active icon stroke weights, and "More" drawer trigger. |
| `Pagination` | *Inline in MembersPage* | **REBUILD** | Extract `Pagination` component with page count summaries ("Showing 1 to 25 of 120 members") and prev/next buttons. |
| `Date Controls` | *Native date inputs* | **REFINE** | Format date input wrappers with calendar icons and quick date picker shortcuts ("Today", "+30 Days", "+60 Days"). |

---

## 5. Atomic Token System & Visual Foundations

### 5.1 Color Palette Architecture
GymFlow uses a curated, neutral-slate color palette accented with semantic status colors (Emerald for Paid/Active, Rose for Overdue/Destructive, Amber for Due Today/Warning).

```css
/* Design Tokens (CSS Variables & Tailwind Config) */
:root {
  /* Neutral Slate Surface Tokens */
  --bg-app: #fafafa;
  --bg-surface: #ffffff;
  --bg-subtle: #f4f4f5;
  --bg-muted: #e4e4e7;
  
  /* Text & Content Tokens */
  --text-primary: #09090b;
  --text-secondary: #52525b;
  --text-tertiary: #71717a;
  --text-disabled: #a1a1aa;
  
  /* Border & Divider Tokens */
  --border-light: #f4f4f5;
  --border-default: #e4e4e7;
  --border-strong: #d4d4d8;
  
  /* Brand Primary (Dark Charcoal / Obsidian) */
  --brand-primary: #09090b;
  --brand-primary-hover: #18181b;
  --brand-on-primary: #ffffff;
  
  /* Semantic Status Tokens */
  /* Paid / Active / Success */
  --status-emerald-bg: #ecfdf5;
  --status-emerald-border: #a7f3d0;
  --status-emerald-text: #047857;
  
  /* Overdue / Error / Destructive */
  --status-rose-bg: #fff1f2;
  --status-rose-border: #fecdd3;
  --status-rose-text: #be123c;
  
  /* Due Today / Warning / Pending */
  --status-amber-bg: #fffbebf;
  --status-amber-border: #fde68a;
  --status-amber-text: #b45309;
}
```

### 5.2 Typography System
- **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
- **Monospace Font Family**: `JetBrains Mono`, `ui-monospace`, `monospace` (for phone numbers, currency figures, and dates).
- **Scale Hierarchy**:
  - `Display / H1`: 24px (1.5rem), `font-extrabold`, tracking `-0.025em`, line-height `1.2`
  - `Section / H2`: 18px (1.125rem), `font-bold`, tracking `-0.015em`, line-height `1.3`
  - `Card Title / H3`: 15px (0.9375rem), `font-bold`, tracking `-0.01em`, line-height `1.4`
  - `Body Regular`: 14px (0.875rem), `font-normal`, line-height `1.5`
  - `Body Dense`: 13px (0.8125rem), `font-medium`, line-height `1.4`
  - `Caption / Meta`: 12px (0.75rem), `font-medium`, line-height `1.4`
  - `Badge / Micro`: 11px (0.6875rem), `font-bold`, tracking `0.02em`

### 5.3 Spacing & Density Philosophy
- **Base Grid Unit**: 4px / 8px grid.
- **Operational Density**: Table cells use `py-3 px-4` (compact row height) for maximum scannable rows per viewport.
- **Modal Density**: Forms use `space-y-4` and `p-6` to ensure input touch targets (`h-10` / `h-11`) remain easy to tap on tablets and smartphones.

### 5.4 Border Radius & Border System
- **Rounded Tokens**:
  - Small elements (Badges, Pills, Buttons): `rounded-xl` (12px)
  - Cards, Containers, Modals: `rounded-2xl` (16px)
  - Full Rounded: `rounded-full` (9999px) for Avatars and Status Pills
- **Borders**: 1px subtle borders (`border-neutral-200/80`) to define containers crisp without visual noise.

### 5.5 Elevation & Shadow Philosophy
- **Flat Surface Focus**: GymFlow prioritizes flat, crisp borders over deep drop shadows.
- **Shadow Tokens**:
  - Micro Elevation (`shadow-2xs`): `0 1px 2px 0 rgba(0, 0, 0, 0.04)` for buttons and cards.
  - Floating Elevation (`shadow-lg`): `0 10px 25px -5px rgba(0, 0, 0, 0.08)` for modals, search dialogs, and mobile drawers.

### 5.6 Motion Philosophy
- **Durations**:
  - Fast Transitions (Hover, Focus, Buttons): 150ms `cubic-bezier(0.4, 0, 0.2, 1)`
  - Modal Entry / Drawer Slide: 200ms `cubic-bezier(0, 0, 0.2, 1)`
- **Rule**: Motion exists strictly to clarify UI entry/exit or state transition. No decorative bounce animations.

---

## 6. Verification & Implementation Roadmap

Phase 00 defines the architectural rules and token Foundations. In subsequent phases, components and screens will be refined/rebuilt according to these tokens while preserving 100% of application business logic.
