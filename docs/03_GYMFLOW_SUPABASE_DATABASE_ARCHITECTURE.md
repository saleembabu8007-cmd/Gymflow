# GYMFLOW — SUPABASE & DATABASE ARCHITECTURE

Version: 1.0
Backend: Supabase
Database: PostgreSQL
Authentication: Supabase Auth

## 1. Architecture goal

GymFlow is a multi-tenant SaaS.

Central relationship:

User → Profile → Gym → Gym-owned records

Version one:
ONE USER → ONE GYM

Design the model so future multi-gym ownership can be added.

## 2. Core tables

profiles
gyms
gym_settings
membership_plans
members
memberships
payments
reminders
subscription_plans
subscriptions
audit_logs

## 3. profiles

Application profile associated with auth.users.

Typical fields:
- id
- full_name
- role
- created_at
- updated_at

The ID should relate to the authenticated Supabase user.

Possible roles:
- gym_owner
- platform_admin

Authorization must not depend solely on browser-supplied role values.

## 4. gyms

Represents a customer tenant.

Recommended fields:
- id
- owner_user_id
- name
- phone
- address
- timezone
- currency
- status
- created_at
- updated_at

Possible status:
- active
- suspended

Suspension must not delete data.

## 5. gym_settings

Gym-specific configuration:
- id
- gym_id
- reminder preferences
- display preferences
- date preferences
- created_at
- updated_at

## 6. membership_plans

Fields:
- id
- gym_id
- name
- duration_days
- amount
- active
- created_at
- updated_at

Every plan belongs to exactly one gym.

## 7. members

Fields:
- id
- gym_id
- full_name
- phone
- email
- notes
- status
- created_at
- updated_at

Possible status:
- active
- inactive

Store only necessary personal information.

## 8. memberships

Fields:
- id
- gym_id
- member_id
- plan_id
- start_date
- next_payment_date
- end_date
- status
- created_at
- updated_at

Possible status:
- active
- expired
- cancelled

Payment state such as overdue should be calculated from business rules/dates rather than inconsistently duplicated.

## 9. payments

Fields:
- id
- gym_id
- member_id
- membership_id
- amount
- payment_date
- payment_method
- notes
- created_at

Possible methods:
- cash
- upi
- card
- bank_transfer
- other

Validate amount and prevent invalid/negative values.

## 10. reminders

Fields:
- id
- gym_id
- member_id
- payment_id (nullable when appropriate)
- channel
- message
- status
- sent_at
- created_at

Possible status:
- pending
- sent
- failed

Never mark sent unless the operation succeeded.

## 11. subscription_plans

GymFlow's SaaS plans.

Version one:
Exactly one paid plan.

Do not create free/trial/basic/premium plans.

## 12. subscriptions

Possible fields:
- id
- gym_id
- plan_id
- status
- provider
- provider_customer_id
- provider_subscription_id
- current_period_start
- current_period_end
- created_at
- updated_at

Provider fields can remain null until billing is implemented.

Possible states:
- development
- pending
- active
- past_due
- cancelled
- expired

Finalize exact statuses during implementation.

## 13. audit_logs

Possible fields:
- id
- actor_user_id
- gym_id (nullable)
- action
- entity_type
- entity_id
- metadata
- created_at

Never store passwords, auth tokens or secrets.

## 14. Relationships

auth.users
  ↓
profiles
  ↓
gyms
  ├── gym_settings
  ├── membership_plans
  ├── members
  │     └── memberships
  │            └── payments
  ├── reminders
  └── subscriptions

## 15. Tenant rule

Every tenant-owned record should have a clear ownership path, preferably an explicit gym_id.

Do not trust a gym_id supplied by the browser.

Authorization determines which gym a user can access.

## 16. Database constraints

Use:
- foreign keys
- NOT NULL where appropriate
- unique constraints
- CHECK constraints
- timestamps
- sensible cascade/restrict behavior
- indexes where justified

## 17. Indexes

Consider indexes for:
- gym_id
- member_id
- membership_id
- plan_id
- next_payment_date
- payment_date
- created_at
- subscription status

Do not blindly index every column.

## 18. Migrations

Use version-controlled SQL migrations.

Example:

supabase/
  migrations/
    001_initial_schema.sql
    002_indexes.sql
    003_rls_policies.sql
    004_functions.sql

Exact names can differ.

The repository should be the schema source of truth.

## 19. Authentication data

Supabase Auth owns credentials.

Do not create a custom password table.

## 20. RLS

RLS is mandatory for tenant-owned tables.

Fundamental test:

Owner A → Gym A = allowed
Owner A → Gym B = denied
Owner B → Gym B = allowed
Owner B → Gym A = denied

Test direct backend/database behavior, not just UI.

## 21. Service architecture

UI → Hooks/State → Services → Supabase client → PostgreSQL

Services may include:
- memberService
- membershipService
- paymentService
- reminderService
- subscriptionService
- adminService

Avoid scattered raw Supabase queries throughout components.

## 22. Environment variables

For the Vite client, use public client configuration such as:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Use the public key format/terminology appropriate to the installed Supabase client/project.

NEVER expose:
- SUPABASE_SERVICE_ROLE_KEY
- database password
- payment secret
- webhook secret
- private API keys

Server-only secrets belong in secure server/Edge Function environments.

## 23. .env.example

Example:

# Public browser configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Server-only secrets
# SUPABASE_SERVICE_ROLE_KEY=
# PAYMENT_SECRET=
# PAYMENT_WEBHOOK_SECRET=

Real environment files must not be committed.

## 24. Production data

Keep development seed data separate from production.

Security testing should use at least two test gyms.

## 25. Future billing

Checkout → Payment provider → Verified webhook → Subscription update → Access decision

Never trust a browser-supplied "active" subscription flag.
