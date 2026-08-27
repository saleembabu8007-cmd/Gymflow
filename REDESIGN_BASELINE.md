# Redesign Baseline Verification

## 1. Git Status
- **Branch:** `redesign/foundation`
- **Working Tree:** Clean

## 2. Verification Scripts
- **Typecheck** (`npm run lint` / `tsc --noEmit`): **PASS**
- **Build** (`npm run build` / `vite build`): **PASS**

## 3. Inventory vs Audit Discrepancies
The previous forensic audit was found to be incomplete when cross-checked against the actual repository structure.

### Screens / Pages Mismatch
The audit listed only 6 screens, but the actual repository contains 17 page components.
**Missing from the previous audit:**
- `src/pages/DesignSystemPage.tsx`
- `src/pages/ExpiredSubscriptionPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/SubscriptionPage.tsx`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminGymsPage.tsx`
- `src/pages/admin/AdminLoginPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminSubscriptionsPage.tsx`

### UI Components Mismatch
The audit's Component Inventory listed 7 UI components, but `src/components/ui` actually contains 39 components.
**Missing from the previous audit:**
`AppPreloader.tsx`, `BottomSheet.tsx`, `Card.tsx`, `Checkbox.tsx`, `Divider.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `FilterChips.tsx`, `IconButton.tsx`, `Input.tsx`, `LoadMore.tsx`, `LoadingState.tsx`, `Logo.tsx`, `PageContainer.tsx`, `PageHeader.tsx`, `ProgressBar.tsx`, `ProgressRing.tsx`, `Radio.tsx`, `SearchInput.tsx`, `SegmentedControl.tsx`, `Select.tsx`, `Skeleton.tsx`, `Spinner.tsx`, `StatusBadge.tsx`, `StepProgress.tsx`, `Switch.tsx`, `Table.tsx`, `Textarea.tsx`, `Toast.tsx`, `Tooltip.tsx`, `Typography.tsx`.

## 4. Confirmed Bugs

### Mobile Functionality Regression Check (Remind Action)
- **Finding**: (a) The "Remind" action is present inside the "•••" overflow menu.
- **Evidence**: `src/components/ui/MemberRow.tsx` (Lines 157-217). The component uses `isDesktop = useMediaQuery('(min-width: 640px)')`. On mobile widths, it conditionally renders one primary action button (defaulting to "Mark Paid") and a `MoreHorizontal` icon button. Clicking the "•••" button toggles `showMobileActions`, which renders a floating dropdown containing the secondary action (e.g., "Send Reminder"). The action is fully reachable on mobile; it was just concealed inside the interaction state.

### Phosphor Icons Dependency Check
- **Finding**: The `@phosphor-icons/react` package is NOT a dead dependency. It is actively used in rendered UI.
- **Evidence**: `src/components/ui/Select.tsx` (Line 3: `CaretDown`, `Check`) and `src/components/ui/Input.tsx` (Line 3: `Check`, `WarningCircle`). This indicates mixed-icon usage (Lucide + Phosphor). Flagged for mandatory consolidation onto Lucide in Phase 06.
