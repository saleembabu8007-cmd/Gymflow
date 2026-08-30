# GymFlow — Complete Product Redesign Rules & Master Contract

We are executing a complete visual, UX, and presentation redesign of GymFlow.
This is NOT a visual polish pass, a reskin, or slight spacing changes. Treat this as if GymFlow has engaged a dedicated senior product design team (Principal Product Designer, Senior UX Designer, Senior Visual/UI Designer, Design Systems Designer, Senior UI Engineer, Senior Frontend Engineer, Accessibility Specialist).

The existing backend, Supabase architecture, database schema, authentication, service layer, business calculations, payment logic, reminder services, subscription entitlements, and tenant isolation are working and MUST be protected.

The redesign is strictly a **PRESENTATION / UX / UI redesign**.

---

## 1. Product North Star & Aesthetic Tone

GymFlow is a deliberately simple operational tool for gym owners.
The core question is:
> **"Who needs my attention today?"**

The product must feel:
- **Calm, trustworthy, fast, practical, premium, professional, human, understated, easy for non-technical gym owners, highly usable on mobile, and visually refined.**

It must **NOT** feel:
- AI-generated, template-generated, over-designed, enterprise-heavy, flashy, dashboard-generic, overly rounded, excessively card-based, gradient-heavy, glassmorphic, decorative, or visually noisy.

---

## 2. Non-Negotiable Engineering & Redesign Rules

1. **Do not redesign by simply modifying existing visual values.**
2. **Do not preserve bad UI patterns merely because they already exist.**
3. **Do not make the existing screen prettier while keeping its structural problems.**
4. **Rethink** the information architecture, hierarchy, composition, spacing, typography, interaction patterns, component structure, and responsive behavior.
5. **Build from:** `FOUNDATIONS` → `TOKENS` → `ATOMS` → `MOLECULES` → `COMPLEX COMPONENTS` → `LAYOUTS` → `SCREENS` → `WORKFLOWS`.
6. **Every visual element must have a reason to exist.** If removing an element makes the screen clearer, remove it. If combining two elements improves comprehension, combine them.
7. **Avoid AI-generated dashboard aesthetics.**
8. **Strictly Avoid:**
   - Excessive rounded cards / nested cards
   - Excessive pills
   - Giant headings / giant cards
   - Oversized buttons / oversized icons
   - Excessive shadows / gradients / glassmorphism / decorative blobs
   - Meaningless charts / generic illustrations
   - Excessive metric cards / excessive empty space
   - Excessive borders
   - Random visual decoration
9. **The product should feel like a mature commercial SaaS product designed by an experienced human product team.**
10. **Use restraint.** Prefer hierarchy, spacing, typography, alignment, and grouping over decorative containers.
11. **Mobile-first is mandatory.** Define intentional responsive behavior for each component across all breakpoints:
    - `375px`, `390px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`.
12. **The interface should feel compact but breathable.**
13. **Do not use emoji as interface icons.** Use one coherent icon family (`lucide-react`).
14. **Brand Color (`#B2E624`):**
    - Use it deliberately and strategically.
    - Do NOT make the entire interface green or use it as background washes.
    - Use brand color ONLY for:
      - Primary action buttons
      - Selected chip/pill states
      - Active navigation indicator
      - Focus rings
      - Positive/high-confidence interaction feedback
    - Use neutral colors (`#FAFAF9` canvas, `#FFFFFF` surfaces, `neutral-950` text) for the majority of the interface.
15. **Do not introduce unrelated visual styles between screens.** Every component must come from the same design system.
16. **Every state must be designed:** Default, Hover, Active, Focus, Disabled, Loading, Success, Warning, Error, Empty, Selected, Destructive (where applicable).
17. **Accessibility is part of the design, not a final patch:**
    - Visible focus rings
    - Touch targets ≥44x44px
    - Keyboard navigation & focus trapping
    - Screen-reader ARIA semantics (`role="dialog"`, `role="tablist"`, etc.)
    - Form label association (`htmlFor` / `id`, `aria-describedby`, `aria-invalid`)
    - Respects `prefers-reduced-motion`
18. **Preserve the existing Supabase backend and working service architecture.**
19. **DO NOT modify:**
    - Database schema & Supabase migrations
    - Supabase tables & RLS policies
    - Database functions/RPCs
    - Authentication architecture
    - Business calculations & payment logic
    - Reminder backend behavior & subscription backend behavior
    - Tenant isolation & security architecture
    - Existing working data contracts
20. **Do not introduce mock production data.**
21. **Do not replace real data with hardcoded design examples.**
22. **Do not create duplicate components when an equivalent system component exists.**
23. **Do not create one-off styling that contradicts the design system.**
24. **Prefer composition over duplication.**
25. **The result must feel intentionally designed, not generated.**

---

## 3. Phased Execution & Reporting Discipline

Work incrementally and systematically:

### Pre-Implementation Inspection:
1. Inspect the existing implementation.
2. Identify reusable components.
3. Identify duplicate components.
4. Identify deprecated components.
5. Identify existing tokens.
6. Identify existing responsive behavior.
7. Identify existing accessibility behavior.
8. Identify what must remain untouched.

### Execution:
- Implement **ONLY** the requested phase.
- **STOP after completing only the requested phase. Do not automatically continue into the next phase.**

### Post-Implementation Verification:
- Run typecheck (`npx tsc --noEmit`).
- Run lint / build (`npm run build`).
- Verify affected screens across mobile and desktop.

### Phase Report Structure:
1. Files changed
2. Components created
3. Components modified
4. Components removed
5. Visual decisions made
6. Responsive behavior implemented
7. Verification results
8. Unresolved issues
