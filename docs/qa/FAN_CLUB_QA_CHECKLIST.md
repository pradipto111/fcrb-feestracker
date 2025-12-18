# RealVerse Fan Club — QA Checklist

This checklist validates the **Fan Club** role end-to-end without breaking existing RealVerse flows.

## Roles & Routing

- [ ] **Student login** routes to `/realverse/dashboard` and existing pages work.
- [ ] **Coach login** routes to `/realverse/coach` and existing pages work.
- [ ] **Admin login** routes to `/realverse/admin` and existing pages work.
- [ ] **Fan Club login** routes to `/realverse/fan` and shows Fan Club nav.
- [ ] **Wrong-role guard**:
  - [ ] Fan trying `/realverse/admin/*` redirects away (no data leakage).
  - [ ] Student trying `/realverse/fan/*` redirects away.

## Public Site (No Login)

- [ ] Header CTA **“Your benefits for backing FC Real Bengaluru”** routes to `/fan-club/benefits`.
- [ ] `/fan-club/benefits` loads without auth and renders tiers + sponsor preview with **locked/blurred** rewards.
- [ ] Existing public routes (Shop/checkout) still work.

## Admin Control Plane (Fan Club)

Routes:
- [ ] `/realverse/admin/fans`
- [ ] `/realverse/admin/fans/tiers`
- [ ] `/realverse/admin/fans/rewards`
- [ ] `/realverse/admin/fans/games`
- [ ] `/realverse/admin/fans/analytics`
- [ ] `/realverse/admin/fans/settings`

Checks:
- [ ] **Create fan** returns a temp password and fan appears in list.
- [ ] **Suspend/Activate** updates fan status.
- [ ] **Assign tier** updates immediately.
- [ ] **Reset password** returns a temp password.
- [ ] **Settings (feature flags)** toggling propagates to Fan UI:
  - [ ] offers disabled hides Benefits
  - [ ] games disabled hides Games
  - [ ] matchday disabled hides Matchday
  - [ ] programs disabled hides Programs

## Fan HQ + Subpages

- [ ] `/realverse/fan` loads with:
  - [ ] Welcome + tier + points + streak
  - [ ] Benefits preview (if enabled)
  - [ ] Matchday module (if enabled)
  - [ ] Redeem now (if enabled)
  - [ ] Games & quests (if enabled)
  - [ ] Programs conversion (if enabled)

- [ ] `/realverse/fan/benefits`
  - [ ] Coupons render and **Redeem** creates redemption
  - [ ] Redeemed coupon shows state change (no double redeem)

- [ ] `/realverse/fan/games`
  - [ ] Submitting quiz/prediction/spin creates game sessions

- [ ] `/realverse/fan/matchday`
  - [ ] Fixtures view uses existing fixtures source (no duplication)

- [ ] `/realverse/fan/profile`
  - [ ] Tier/points/streak render
  - [ ] Redemption history lists redeemed coupons

- [ ] `/realverse/fan/programs`
  - [ ] Clicking a program creates a conversion lead

## Analytics & Exports

- [ ] `/realverse/admin/fans/analytics` shows:
  - [ ] counts (fans/active/redemptions/leads)
  - [ ] tier distribution
  - [ ] redemptions by sponsor
  - [ ] program interest breakdown
- [ ] Export CSV downloads:
  - [ ] redemptions CSV
  - [ ] leads CSV

## Non-regression

- [ ] Shop checkout still works (cart → checkout → confirmation).
- [ ] Existing Admin tools unaffected (centres, staff, payments, sessions).
- [ ] No console-spam: API debug logging only when `localStorage.debugApi` enabled.


