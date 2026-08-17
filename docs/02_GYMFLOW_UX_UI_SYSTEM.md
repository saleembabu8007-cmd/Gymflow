# GYMFLOW — UX & UI SYSTEM

Version: 1.0
Purpose: UX/UI source of truth for Google AI Studio, Antigravity and frontend work.

## 1. North star

GymFlow should feel like a mature commercial SaaS product designed by an experienced product team.

The user should understand the application without training.

Primary UX question:
> What do I need to do next?

## 2. UX principles

1. One obvious primary action per screen.
2. Short forms.
3. Familiar language.
4. Minimal navigation.
5. Strong hierarchy.
6. Clear status labels.
7. Useful empty states.
8. Helpful errors.
9. Fast repeat actions.
10. Mobile-first behavior.
11. Minimal configuration.
12. No technical terminology for normal users.

## 3. Dashboard

Recommended hierarchy:

Header
- greeting
- gym name
- profile/menu

Attention
- Overdue
- Due Today
- Due Soon

Quick actions
- Add Member
- Record Payment

Summary
- Active Members
- Collected This Month

Recent activity

The dashboard must prioritize attention-required members over decorative analytics.

## 4. Status design

Statuses must not depend on color alone.

Use:
- icon
- text
- restrained status treatment

Examples:
OVERDUE
DUE TODAY
DUE SOON
PAID

## 5. Member list

Prioritize:
- name
- phone
- membership
- payment status
- next payment date
- quick action

Search:
- name
- phone

Filters:
- All
- Overdue
- Due Today
- Due Soon
- Active
- Inactive

On mobile, use useful list/cards instead of forcing a huge table.

## 6. Add member

Required:
- name
- phone

Optional:
- email
- membership plan
- start date
- notes

If a plan is selected during creation, intelligently create/activate the membership rather than forcing unnecessary extra steps.

## 7. Record payment

Make payment recording available from:
- dashboard
- member profile
- payments list

Example:

Record Payment
Member: John Mathew
Amount: ₹1,000
Method: UPI
Date: Today
Note: optional
[Save Payment]

Success feedback should provide useful information such as the next payment date.

## 8. Empty states

Bad:
No data

Good:
No members yet.
Add your first member to start tracking payments.
[Add Member]

Empty states should guide the next action.

## 9. Loading

Use lightweight skeletons or clear loading states. Avoid blocking the whole application with a large spinner.

## 10. Errors

Never show:
PostgrestError: 42501

Instead:
We couldn't save that payment.
Please try again.

Never expose SQL/database errors to normal users.

## 11. Forms

- clear labels
- short fields
- sensible defaults
- inline validation
- mobile-friendly inputs
- adequate touch targets
- clear submit action
- prevent double submission

## 12. Typography

Primary recommendation:
Inter

Use a limited type scale:
- page title
- section title
- card title
- body
- supporting text
- labels

Avoid multiple unrelated font families.

## 13. Icons

Use a consistent Lucide-style icon system.

Icons should be:
- simple
- outlined
- consistent stroke weight
- familiar
- sparse

Do not mix unrelated icon styles or use emoji as navigation icons.

## 14. Color

Use:
- neutral background
- strong text
- muted secondary text
- one primary brand color
- controlled success/warning/error colors

Do not create a rainbow dashboard.

## 15. Cards

Cards should group information only when useful.

Avoid nested cards and decorative metric cards with no actionable meaning.

## 16. Tables

Desktop tables can be used for members/payments.

Keep columns useful and readable.

Mobile should use a deliberate mobile pattern rather than forcing every table into horizontal scrolling.

## 17. Responsive requirements

Test:
375px
390px
430px
768px
1024px
1280px
1440px

Critical mobile tasks:
- check today's dues
- search member
- record payment
- remind member
- add member

## 18. Accessibility

Require:
- keyboard navigation
- visible focus
- semantic HTML
- proper labels
- sufficient contrast
- accessible buttons/dialogs
- sensible tab order
- touch-friendly targets
- no color-only meaning

## 19. Motion

Use motion only when it improves comprehension.

Avoid decorative constant animation.

## 20. Admin UI

Admin can be more information-dense than the gym-owner UI but must remain clean.

Priorities:
1. Platform health
2. Gyms
3. Subscription status
4. Users
5. Audit activity

Never expose secrets.

## 21. Anti-AI-generated design rules

Avoid the typical generated-dashboard combination:
- giant gradient hero
- floating blobs
- excessive glassmorphism
- 8 metric cards
- random illustrations
- oversized rounded containers
- meaningless charts
- excessive purple/blue gradients
- excessive shadows

GymFlow must have a deliberate visual system.

## 22. Design approval questions

Before approving a screen:
1. Can a new gym owner understand it immediately?
2. Is the primary action obvious?
3. Is there unnecessary information?
4. Does it look like a real commercial product?
5. Does it look generated?
6. Are spacing and typography consistent?
7. Is mobile behavior intentional?
8. Are loading/error/empty/success states handled?
9. Can the task be completed in fewer steps?
10. Does every visual element serve a purpose?

If the design looks AI-generated, redesign it.
