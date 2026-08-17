# GYMFLOW — MASTER PRODUCT SPECIFICATION

Version: 1.0
Status: Product source of truth
Product: GymFlow
Users: Gym owners
Platform: Web SaaS
Backend: Supabase
Build path: Google AI Studio → Antigravity → Supabase → Production

## 1. Vision

GymFlow is a deliberately simple web application for gym owners who currently depend on notebooks, manual receipts, spreadsheets, WhatsApp messages, or memory to track memberships and payments.

The product's core question is:

> Who needs my attention today?

GymFlow should feel simple, fast, trustworthy, calm, professional, modern, and easy enough for a non-technical gym owner.

It must NOT feel AI-generated, over-designed, enterprise-heavy, or complicated.

## 2. Core problem

The owner needs to know:
- who paid
- who has not paid
- who is due today
- who is due soon
- who is overdue
- how much was collected
- who needs a reminder
- when the next payment is due

## 3. Product promise

A gym owner should be able to:
1. Add a member.
2. Assign a membership.
3. Record payment.
4. Know the next payment date.
5. See overdue/due-soon members immediately.
6. Remind a member.
7. Understand the gym's payment situation at a glance.

## 4. Business model

Version 1 has exactly ONE paid GymFlow plan.

There is:
- no free plan
- no free trial
- no basic plan
- no premium plan

Real GymFlow subscription checkout is hidden for now. The backend architecture must remain ready for future billing.

## 5. Two payment concepts

### Member payment
Money paid by a member to the gym. This is a core version-one feature.

### GymFlow subscription payment
Money paid by the gym owner to GymFlow. This is disabled for now.

Never mix these concepts in UI or database logic.

## 6. Multi-tenant model

GymFlow is a multi-tenant SaaS.

Example:

Gym A → Owner A → Members → Memberships → Payments
Gym B → Owner B → Members → Memberships → Payments

Gym A must never access Gym B data.

Tenant isolation must be enforced by Supabase authorization/RLS. Frontend filtering is not security.

## 7. User types

### Platform Owner/Admin
Owns and operates GymFlow. Can manage platform-level information.

### Gym Owner
Customer using GymFlow. Can access only their own gym.

Version 1 ownership model:
One user → one gym.

Design the database so future multi-gym ownership is possible.

## 8. Product areas

Public:
- Landing
- Login
- Signup
- Password recovery

Gym owner:
- Today
- Members
- Payments
- Reminders
- Settings

Platform admin:
- Admin login
- Overview
- Gyms
- Users
- Subscriptions
- Audit logs
- Settings

## 9. Gym owner navigation

Keep it compact:

Today
Members
Payments
Reminders
Settings

Membership management can be surfaced through member workflows when that produces a simpler UX.

## 10. Today dashboard

The dashboard answers:

> Who needs my attention today?

Primary information:
- Overdue
- Due Today
- Due Soon
- Active Members
- Collected This Month

Primary actions:
- Add Member
- Record Payment
- Remind

Avoid unnecessary analytics and charts.

## 11. Members

A member profile should contain:
- full name
- phone
- optional email
- optional notes
- membership
- payment status
- next payment date
- payment history
- membership status

Actions:
- Record Payment
- Remind
- Edit
- Change Membership
- Archive/Deactivate

## 12. Membership plans

Each gym can define plans such as:
- Monthly — 30 days — ₹1,000
- Quarterly — 90 days — ₹2,500
- Yearly — 365 days — ₹9,000

A plan belongs to exactly one gym.

## 13. Membership states

Useful states:
- Paid
- Due Today
- Due Soon
- Overdue
- Expired

Date/status calculations should be centralized.

## 14. Member payment flow

Member → Record Payment → Amount → Method → Date → Note → Save → Update membership/payment state

Methods may include:
- Cash
- UPI
- Card
- Bank Transfer
- Other

Validate amounts and prevent negative/invalid payments.

## 15. Reminders

The owner identifies overdue/due-soon members and can use:

Member → Remind → Review message → Confirm → Send/queue → Record result

Never claim a message was sent unless the underlying operation succeeded.

## 16. Onboarding

Create Account → Create Your Gym → Essential gym information → Create Gym → Today

Do not expose gym IDs, database concepts, technical subscription details, or unnecessary configuration.

## 17. Authentication

Use Supabase Auth:
- signup
- login
- logout
- session persistence
- password reset
- protected routes

Never store passwords in application tables.

## 18. Admin

Recommended routes:
/admin/login
/admin
/admin/gyms
/admin/users
/admin/subscriptions
/admin/audit
/admin/settings

No public admin signup page.

Admin authorization must be enforced by trusted backend/database authorization.

## 19. Design principles

Use:
- professional typography
- clean spacing
- restrained colors
- consistent icons
- subtle borders
- restrained shadows
- clear states
- polished forms

Avoid:
- generic AI illustrations
- excessive gradients
- glassmorphism
- decorative blobs
- excessive pills
- noisy dashboards
- unnecessary animation

## 20. Technical architecture

UI → Hooks/State → Services → Supabase → PostgreSQL

Keep raw database queries out of presentation components where practical.

## 21. Version-one non-goals

Do not build:
- payroll
- staff attendance
- workout plans
- diet plans
- trainer scheduling
- complex inventory
- POS
- accounting
- advanced CRM
- multi-location management
- complex analytics
- AI coaching
- elaborate marketing automation

The product wins by solving the payment-follow-up problem extremely well.
