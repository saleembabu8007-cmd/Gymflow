# GymFlow — Complete Product Redesign Rules & Contract

We are executing a complete visual and UX redesign of GymFlow.
This is NOT a visual polish pass or a slight improvement of existing screens. Treat this as if GymFlow has engaged a dedicated senior product design team (Product Designer, UX Designer, UI Designer, Design Systems Designer, Frontend Architect, Accessibility Specialist).

The existing backend, Supabase architecture, database schema, authentication, service layer, business logic, and working data flows are valuable and MUST be protected.

The redesign is primarily a **PRESENTATION / UX / UI redesign**.

---

## 1. Non-Negotiable Rules

1. **Do not redesign by simply modifying existing visual values.**
2. **Do not preserve bad UI patterns merely because they already exist.**
3. **Do not make the existing screen prettier while keeping its structural problems.**
4. **Rethink** the information architecture, hierarchy, composition, spacing, typography, interaction patterns, component structure, and responsive behavior.
5. **Build a coherent design system BEFORE redesigning individual screens.**
6. **Every visual element must have a reason to exist.**
7. **Avoid AI-generated dashboard aesthetics.**
8. **Strictly Avoid:**
   - Excessive rounded cards
   - Excessive pills
   - Giant headings
   - Oversized buttons / oversized icons
   - Excessive shadows / gradients / glassmorphism / decorative blobs
   - Meaningless charts / generic illustrations
   - Excessive metric cards / excessive empty space
   - Excessive borders / nested cards
   - Random visual decoration
9. **The product should feel like a mature commercial SaaS product designed by an experienced human product team.**
10. **Use restraint.**
11. **Prefer hierarchy, spacing, typography, alignment, and grouping over decorative containers.**
12. **Mobile-first is mandatory.**
13. **Responsive behavior must be intentionally designed for each breakpoint**, not simply `desktop = horizontal / mobile = vertical`.
14. **Do not use huge blocks, huge buttons, or huge typography.**
15. **The interface should feel compact but breathable.**
16. **Do not use emoji as interface icons.**
17. **Use one coherent icon family (`lucide-react`).**
18. **Brand Color (`#B2E624`):**
    - Use it deliberately.
    - Do NOT make the entire interface green or use it as background washes.
    - Use brand color ONLY for:
      - Primary action buttons
      - Selected chip/pill states
      - Active navigation indicator
      - Focus rings
      - Positive brand moments
    - Use neutral colors for most of the interface.
19. **Do not introduce unrelated visual styles between screens.**
20. **Every component must come from the same design system.**
21. **Every state must be designed:**
    - Default, Hover, Active, Focus, Disabled, Loading, Success, Warning, Error, Empty, Selected, Destructive (where applicable).
22. **Accessibility is part of the design, not a final patch:**
    - Visible focus rings
    - Touch targets ≥44x44px
    - Keyboard navigation
    - Semantic HTML
23. **Preserve the existing Supabase backend and working service architecture.**
24. **DO NOT modify:**
    - Database schema
    - Supabase tables
    - RLS policies
    - Authentication architecture
    - Business logic
    - Payment transaction logic
    - Tenant isolation
    - Backend services
    *(Unless a change is absolutely required to support existing UI behavior and is explicitly justified BEFORE implementation).*
25. **Do not introduce mock production data.**
26. **Do not replace real data with hardcoded design examples.**
27. **Do not create duplicate components when an equivalent system component exists.**
28. **Do not create one-off styling that contradicts the design system.**
29. **Before creating a component, classify it into:**
    `Foundation` → `Atom` → `Molecule` → `Organism` → `Pattern` → `Page`.
30. **Prefer composition over duplication.**
31. **The result must feel intentionally designed, not generated.**

---

## 2. Reference Design Language & Principles

Study the reference design archetypes for:
- **Density & Restraint:** Clean, high-density whitespace with compact controls.
- **Two-Tier Numbers:** Stacked/paired bold values with smaller gray unit/caption captions (e.g., `₹1,500` bold + `/mo` muted).
- **Anti-Card Discipline:** Plain list items and metadata lines use subtle dividers on white/neutral surfaces rather than floating bordered boxes.
- **Lightweight Quick Action Tiles:** Square 3-up/4-up tiles with centered icon badges and captions (`IconTile`).
- **Unified Entity Rows:** Doctor/Entity row pattern (Avatar, bold name, monospace subtitle, ≤2 metadata badges, trailing two-tier value, single primary pill action, and `•••` overflow menu).

---

## 3. Product Principle

GymFlow's core question is:
> **"Who needs my attention today?"**

The UI must optimize for:
1. **Understanding**
2. **Action**
3. **Speed**
4. **Trust**
5. **Clarity**

The product must be simple enough that a non-technical gym owner can use it effortlessly without training.

---

## 4. Implementation Discipline

Work incrementally:
1. **Inspect** existing implementation.
2. **Explain** what will be changed.
3. **Implement** only the requested phase.
4. **Run typecheck** (`npx tsc --noEmit`).
5. **Run lint / build** (`npm run build`).
6. **Verify** affected screens across mobile and desktop.
7. **Report:**
   - Files changed
   - Components created / modified / removed
   - Design decisions
   - Responsive behavior
   - Validation results
   - Remaining issues
