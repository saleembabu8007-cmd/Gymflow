# GYMFLOW — IMPLEMENTATION RUNBOOK

Version: 1.0
Purpose: Exact execution order for Google AI Studio, Antigravity and Supabase.

## 1. Golden rule

Do not implement everything at once.

After each major backend phase:
1. typecheck
2. lint
3. build
4. test affected flow
5. review report
6. continue only after verification

## 2. Tool responsibilities

Google AI Studio:
- initial prototype
- UX/UI exploration
- component generation
- design iteration

Antigravity:
- repository implementation
- architecture
- refactoring
- migrations
- Supabase integration
- tests
- production hardening

Supabase:
- Auth
- PostgreSQL
- RLS
- secure backend
- future Edge Functions

## 3. Exact order

00 Backup project
01 Existing project audit
02 Create Supabase project
03 Verify Supabase project
04 Configure environment variables
05 Supabase client foundation
06 Database migrations
07 Authentication
08 Gym owner onboarding
09 RLS / tenant security
10 Platform Admin
11 Initial Platform Owner
12 Tenant isolation testing
13 Members
14 Memberships
15 Member Payments
16 Today Dashboard
17 Reminders
18 Hide GymFlow subscription checkout
19 UX/UI refinement
20 Security audit
21 Production audit
22 Deployment
23 Future billing

## 4. Phase 00 — Backup

Before major changes:
- commit current code
- push to GitHub
- create a backup branch

Suggested:
backup/pre-supabase

## 5. Phase 01 — Audit

Antigravity should inspect:
- architecture
- routes
- services
- mock data
- auth
- database assumptions
- Supabase integration
- admin
- UI
- responsive behavior
- security

Do not modify code during the first audit.

## 6. Phase 02 — Supabase project

Human task:
Create the Supabase project.

Securely record:
- project URL
- public client key
- database password

Never place the database password in frontend code.

## 7. Phase 03 — Verify Supabase

Confirm:
- project exists
- project is accessible
- public client configuration is available
- region is appropriate
- no production data exists yet

## 8. Phase 04 — Environment

Typical Vite public configuration:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Follow the key format appropriate to the current Supabase project/client.

Never put server secrets into VITE_ variables.

## 9. Phase 05 — Client foundation

One centralized Supabase client.

Requirements:
- typed client
- persistent sessions
- token refresh
- no duplicate clients
- environment validation
- service abstraction

The current project has reported this foundation as complete; verify before moving on.

## 10. Phase 06 — Database

Create migrations for:
- profiles
- gyms
- gym_settings
- membership_plans
- members
- memberships
- payments
- reminders
- subscription_plans
- subscriptions
- audit_logs

Do not create tables from React components.

## 11. Phase 07 — Authentication

Implement:
- signup
- login
- logout
- password reset
- session persistence
- protected routes

## 12. Phase 08 — Onboarding

Signup → Create Gym → Dashboard

One user → one gym for version one.

## 13. Phase 09 — RLS

Enable and test RLS.

Required:
Gym A owner → Gym A = PASS
Gym A owner → Gym B = DENY
Gym B owner → Gym B = PASS
Gym B owner → Gym A = DENY

Test direct database/API behavior.

## 14. Phase 10 — Admin

Build:
/admin/login
/admin
/admin/gyms
/admin/users
/admin/subscriptions
/admin/audit
/admin/settings

No public admin signup.

## 15. Phase 11 — Platform owner

Securely provision the first platform owner.

Never hardcode an owner email in frontend code.

Never allow self-promotion.

## 16. Phase 12 — Security test

Create:
Owner A + Gym A
Owner B + Gym B

Attempt:
- cross-tenant reads
- cross-tenant writes
- manipulated IDs
- admin access as owner
- role escalation

Fix all critical/high failures.

## 17. Phase 13 — Members

Implement:
- add
- search
- edit
- view
- archive
- profile

Use real Supabase data.

## 18. Phase 14 — Memberships

Implement:
- plans
- membership creation
- start date
- next payment date
- end date
- status

Centralize date calculations.

## 19. Phase 15 — Member payments

Implement:
- amount
- date
- method
- note
- history

Do not confuse member payments with GymFlow subscription billing.

## 20. Phase 16 — Today dashboard

Prioritize:
- Overdue
- Due Today
- Due Soon
- Active Members
- Collected This Month

Actions:
- Add Member
- Record Payment
- Remind

## 21. Phase 17 — Reminders

Implement:
- overdue reminders
- due-today reminders
- due-soon reminders
- reminder status

Never report success when the operation failed.

## 22. Phase 18 — Hide billing

Keep:
- subscription plans
- subscription records
- status
- admin visibility

Hide:
- checkout
- subscription payment UI

until real billing is ready.

## 23. Phase 19 — UX/UI

Refine:
- typography
- spacing
- navigation
- forms
- tables
- dashboard
- mobile
- empty states
- loading
- errors
- success states

The final design must not look AI-generated.

## 24. Phase 20 — Security audit

Check:
- Auth
- RLS
- tenant isolation
- admin
- secrets
- environment files
- API authorization
- subscription integrity

## 25. Phase 21 — Production audit

Verify:
Typecheck PASS
Lint PASS
Tests PASS
Build PASS
Auth PASS
RLS PASS
Admin PASS
Tenant security PASS
Members PASS
Memberships PASS
Payments PASS
Reminders PASS
Responsive PASS
Accessibility PASS

## 26. Phase 22 — Deployment

Deploy only after production audit.

Architecture:

User
 ↓
Production web app
 ↓
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── RLS
 └── Edge Functions when required

Configure environment variables in the hosting platform.

Never upload local secret files.

## 27. Phase 23 — Future billing

One GymFlow plan → Checkout → Payment provider → Verified webhook → Subscription activation

Keep billing isolated so it can be introduced later without rebuilding the core product.

## 28. AI coding rules

When instructing Antigravity:
- inspect before replacing
- preserve working architecture
- do not duplicate services
- do not create duplicate Supabase clients
- do not invent fields
- do not use mock production data
- do not expose secrets
- do not bypass RLS
- do not use frontend authorization as security
- run typecheck/lint/build
- report files changed
- report unresolved issues
- never claim completion without verification

## 29. Stop conditions

STOP and review if:
- migration fails
- RLS is unclear
- auth cannot associate a user with a gym
- cross-tenant access is possible
- admin authorization is client-only
- service-role key appears in frontend
- build fails
- schema differs from specification
- major architecture rewrite is proposed
- multiple conflicting data sources exist

Do not patch around security problems.

## 30. Source-of-truth priority

When information conflicts, prioritize:

1. Security/authorization
2. Database architecture
3. Master product specification
4. UX/UI system
5. Implementation runbook
6. Existing code
7. AI assumptions

## 31. Final product principle

GymFlow should never become complicated simply because the technology allows it.

The competitive advantage is:

> A gym owner can understand what needs to be done today without needing to learn software.
