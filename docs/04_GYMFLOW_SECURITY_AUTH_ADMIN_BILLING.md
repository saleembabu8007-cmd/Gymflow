# GYMFLOW — SECURITY, AUTH, ADMIN & BILLING

Version: 1.0
Purpose: Security and authorization source of truth

## 1. Security principle

The browser is untrusted.

Frontend restrictions are UX.
Backend/database authorization is security.

## 2. Authentication

Use Supabase Auth for:
- signup
- login
- logout
- password reset
- session persistence
- session expiry

Do not store passwords in application tables.

## 3. User creation

Signup → Supabase Auth user → Profile → Gym → Owner access → Dashboard

The user must not choose:
- user ID
- gym ID
- role
- authorization values

## 4. Gym ownership

Version one:
One user → one gym.

The backend/database determines the user's authorized gym.

Never trust a client-supplied gym_id.

## 5. Multi-tenant security

Owner A must not:
- read Gym B
- insert into Gym B
- update Gym B
- delete Gym B
- create Gym B payments
- modify Gym B memberships
- read Gym B subscriptions

The same applies in reverse.

## 6. RLS

Enable Row Level Security on tenant-owned tables.

Avoid insecure policies such as USING(true) for private tenant data.

RLS must protect data even when the client manipulates request IDs.

## 7. Admin model

Platform admin is separate from gym ownership.

Routes:
/admin/login
/admin
/admin/gyms
/admin/users
/admin/subscriptions
/admin/audit
/admin/settings

No public admin signup.

## 8. Admin capabilities

Overview:
- total gyms
- active gyms
- suspended gyms
- subscription states
- platform activity

Gyms:
- view gym
- view owner
- member count
- subscription state
- suspend
- reactivate

Suspension must not delete data.

Users:
Show appropriate profile information.
Never show passwords or auth tokens.

Subscriptions:
- plan
- status
- billing period
- provider metadata

Audit:
Important platform/business events.

## 9. Admin security

Never secure admin using:
- hardcoded frontend email
- localStorage role
- hidden buttons
- secret URLs
- React state

Use trusted authorization.

## 10. Audit logs

Useful events:
- gym created
- gym suspended
- gym reactivated
- membership created
- payment recorded
- admin action
- subscription state changed

Never log secrets.

## 11. Subscription model

Exactly one paid plan in version one.

No:
- free
- trial
- basic
- premium

Checkout remains hidden until ready.

## 12. Development access

Development/test accounts may require an internal entitlement.

It must be:
- explicit
- controlled
- unavailable to ordinary production users
- never represented as a real payment

Do not create a public payment bypass.

## 13. Future billing

Gym Owner → One Plan → Checkout → Payment provider → Verified webhook → Subscription activation

The browser must never declare its own subscription as active.

## 14. Secret management

Never expose:
- service-role key
- database password
- payment secret
- webhook secret
- private API keys

Server-only secrets belong in secure server/Edge Function environments.

## 15. Environment files

Commit:
.env.example

Do not commit real credential files.

Check .gitignore.

## 16. Authorization tests

Test:
1. Owner A → Gym A = allowed
2. Owner A → Gym B = denied
3. Owner B → Gym B = allowed
4. Owner → /admin = denied
5. Logged-out → /app = denied
6. Logged-out → /admin = denied
7. Manipulated gym_id = still denied

## 17. Security definition of done

Do not call production-ready until:
- Auth works
- RLS works
- tenant isolation passes
- admin authorization is secure
- secret scanning passes
- environment files are safe
- subscription status cannot be forged
- critical/high security issues are resolved
