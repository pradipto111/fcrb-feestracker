# RealVerse QA Test Plan
**FC Real Bengaluru - End-to-End Quality Assurance**

**Version:** 1.0.0  
**Date:** 2024-12-19  
**Status:** In Progress

---

## Table of Contents
1. [Overview](#overview)
2. [Test Environment](#test-environment)
3. [Route + CTA Matrix](#route--cta-matrix)
4. [Role-Based Test Scenarios](#role-based-test-scenarios)
5. [Test Data Requirements](#test-data-requirements)
6. [Edge Cases & Negative Testing](#edge-cases--negative-testing)
7. [Performance Benchmarks](#performance-benchmarks)
8. [Security Testing](#security-testing)

---

## Overview

This test plan covers comprehensive end-to-end testing of the RealVerse application including:
- Public website (landing, shop, brochure)
- RealVerse internal app (student/coach/admin dashboards)
- Admin dashboard (management, analytics)
- Shop & checkout flow
- Trials & scouting system
- Season planning & load prediction

### Test Objectives
- Verify all routes are accessible and functional
- Validate all CTAs perform expected actions
- Ensure role-based access control works correctly
- Test data integrity and edge cases
- Verify UI/UX compliance (Laws of UX)
- Performance validation
- Security validation

---

## Test Environment

### Environments
- **Local Dev:** `http://localhost:5173` (frontend), `http://localhost:3000` (backend)
- **Staging:** TBD
- **Production:** TBD

### Build Commands
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

### Test Tools
- **E2E:** Playwright
- **Unit:** Vitest (to be added)
- **API:** Playwright API layer
- **Lint:** ESLint
- **Typecheck:** TypeScript

---

## Route + CTA Matrix

### Public Routes

| Route | Purpose | CTAs | Expected Action | Role Required |
|-------|---------|------|----------------|---------------|
| `/` | Landing page | "Join RealVerse", "View Brochure", "Shop" | Navigate to respective pages | Public |
| `/shop` | Shop listing | Product cards, "Add to Cart", Filters | Add items, filter products | Public |
| `/shop/:slug` | Product detail | "Add to Cart", "Buy Now" | Add to cart or checkout | Public |
| `/cart` | Shopping cart | "Checkout", "Remove", "Update Qty" | Proceed to checkout, modify cart | Public |
| `/checkout` | Checkout form | "Place Order", "Back to Cart" | Submit order, return to cart | Public |
| `/order-confirmation/:orderNumber` | Order confirmation | "Continue Shopping", "View Order" | Navigate to shop or order details | Public |
| `/brochure` | Interactive brochure | "Join Now", "Download PDF" | Navigate to join or download | Public |
| `/brochure/classic` | Classic brochure | "Join Now", "Download PDF" | Navigate to join or download | Public |

### RealVerse Authentication

| Route | Purpose | CTAs | Expected Action | Role Required |
|-------|---------|------|----------------|---------------|
| `/realverse/login` | Login page | "Login", "Forgot Password" | Authenticate user, reset password | Public |
| `/realverse/join` | Join page | Redirects to brochure | Navigate to brochure | Public |

### Student Routes

| Route | Purpose | CTAs | Expected Action | Role Required |
|-------|---------|------|----------------|---------------|
| `/realverse/student` | Student dashboard | Quick action cards, "View Profile", "View Load Dashboard" | Navigate to features | STUDENT |
| `/realverse/my-attendance` | Attendance view | "View Load Dashboard" | Show attendance, link to load | STUDENT |
| `/realverse/my-fixtures` | Fixtures view | Match cards, "View Details" | Show upcoming matches | STUDENT |
| `/realverse/student/pathway` | Pathway/roadmap | Progress indicators | Show development path | STUDENT |
| `/realverse/student/feedback` | Coach feedback | Feedback cards | Display coach notes | STUDENT |
| `/realverse/student/journey` | Development timeline | Timeline events | Show development history | STUDENT |
| `/realverse/student/matches` | Match selection | Match cards | Show match exposure | STUDENT |
| `/realverse/student/wellness` | Wellness tracking | "View Load Dashboard" | Show wellness data | STUDENT |
| `/realverse/student/analytics` | Player analytics | Metric panels, "Compare" | Show metrics, compare players | STUDENT |
| `/realverse/drills` | Drills & tutorials | Video cards, "Play" | Play training videos | STUDENT |
| `/realverse/feed` | Club feed | Post cards, "Like", "Comment" | View/interact with posts | STUDENT |
| `/realverse/leaderboard` | Leaderboard | Ranking table | Show player rankings | STUDENT |
| `/realverse/my-reports` | Development reports | Report cards, "View" | Display reports | STUDENT |
| `/realverse/player/:id/load-dashboard` | Load dashboard | Charts, filters | Show training load data | STUDENT (own) |

### Coach Routes

| Route | Purpose | CTAs | Expected Action | Role Required |
|-------|---------|------|----------------|---------------|
| `/realverse/coach` | Coach dashboard | "View All Players", "Start Batch Review", "Open Season Planner" | Navigate to features | COACH |
| `/realverse/coach/analytics` | Coach analytics | Charts, filters, "Export" | Show squad analytics | COACH |
| `/realverse/students` | Player list | "View Profile", "Edit", "Load Dashboard" | Manage players | COACH |
| `/realverse/attendance` | Attendance management | "Create Session", "Mark Attendance", "Bulk Actions" | Manage sessions | COACH |
| `/realverse/fixtures` | Fixtures management | "Create Fixture", "Select Team", "Edit" | Manage matches | COACH |
| `/realverse/admin/players/:id/profile` | Player profile | "Create Snapshot", "Add Note", "Compare", "Load Dashboard" | View/edit player | COACH |
| `/realverse/admin/batch-review` | Batch review | "Select Players", "Create Snapshots", "Save" | Review multiple players | COACH |
| `/realverse/admin/season-planning` | Season planning | "Create Plan", "View Calendar", "Development Blocks" | Plan season | COACH |
| `/realverse/scouting/board` | Scouting board | "Add to Shortlist", "Compare", "Create Decision" | Manage scouting | COACH |

### Admin Routes

| Route | Purpose | CTAs | Expected Action | Role Required |
|-------|---------|------|----------------|---------------|
| `/realverse/admin` | Redirects to `/realverse/admin/students` | — | — | ADMIN |
| `/realverse/admin/staff` | Staff management | "Add Staff", "Edit", "Remove" | Manage coaches/admins | ADMIN |
| `/realverse/admin/payments` | Payment tracking | "Mark Paid", "Generate Invoice", "Export" | Manage payments | ADMIN |
| `/realverse/admin/settings` | System settings | "Save Settings", "Reset" | Configure system | ADMIN |
| `/realverse/admin/centres` | Centres management | "Add Centre", "Edit", "Delete", "View Map" | Manage centres | ADMIN |
| `/realverse/admin/centres/:id` | Centre detail | "Edit", "Analytics", "Students" | View centre details | ADMIN |
| `/realverse/admin/centres/new` | Create centre | "Save", "Cancel" | Create new centre | ADMIN |
| `/realverse/admin/merch` | Merchandise management | "Add Product", "Edit", "Delete" | Manage shop products | ADMIN |
| `/realverse/admin/merch/new` | Create product | "Save", "Upload Images", "Cancel" | Create product | ADMIN |
| `/realverse/admin/leads` | Website leads | "View", "Export", "Mark Contacted" | Manage leads | ADMIN |
| `/realverse/trials/events` | Trial events | "Create Event", "Add Trialist", "View Board" | Manage trials | ADMIN |
| `/realverse/trials/events/:eventId` | Event detail | "Add Staff", "Add Trialist", "View Reports" | Manage event | ADMIN |
| `/realverse/trials/board` | Trial board | "Add Trialist", "Compare", "Create Decision" | Decision workspace | ADMIN |
| `/realverse/trials/trialists/:trialistId` | Trialist detail | "Create Report", "View History", "Add to Shortlist" | Manage trialist | ADMIN |

---

## Role-Based Test Scenarios

### Student Role Flows

#### 1. Login & Dashboard
- **Steps:** Login → Redirect to dashboard → Verify quick actions visible
- **Expected:** Dashboard loads, all CTAs clickable, no errors
- **API Calls:** `GET /api/students/dashboard`, `GET /api/students/attendance`

#### 2. Attendance View
- **Steps:** Navigate to attendance → View monthly calendar → Click "View Load Dashboard"
- **Expected:** Calendar displays, load dashboard link works
- **API Calls:** `GET /api/attendance/student`, `GET /api/season-planning/load-dashboard/:id`

#### 3. Profile & Analytics
- **Steps:** Navigate to analytics → View metrics → Check readiness → View timeline
- **Expected:** All metrics display, charts render, timeline shows history
- **API Calls:** `GET /api/player-metrics/snapshots/my`, `GET /api/player-metrics/readiness/my`

#### 4. Shop Browsing (if accessible)
- **Steps:** Navigate to shop → Browse products → Add to cart → View cart
- **Expected:** Products load, cart updates, checkout accessible
- **API Calls:** `GET /api/merchandise`, `POST /api/cart/add`

### Coach Role Flows

#### 1. Player Management
- **Steps:** View player list → Click "View Profile" → Create snapshot → Add note
- **Expected:** Profile loads, snapshot form works, note saves
- **API Calls:** `GET /api/students`, `GET /api/players/:id/profile`, `POST /api/player-metrics/snapshots`

#### 2. Attendance Management
- **Steps:** Create session → Mark attendance → Bulk actions → Export
- **Expected:** Session created, attendance marked, export works
- **API Calls:** `POST /api/attendance/sessions`, `POST /api/attendance/sessions/:id/attendance`

#### 3. Season Planning
- **Steps:** Open season planner → Create plan → Add phases → View calendar
- **Expected:** Planner loads, plan created, calendar displays sessions
- **API Calls:** `POST /api/season-planning/plans`, `GET /api/season-planning/planner`

### Admin Role Flows

#### 1. Centre Management
- **Steps:** View centres → Add centre → Edit centre → Verify map updates
- **Expected:** Centres list loads, CRUD works, map reflects changes
- **API Calls:** `GET /api/centres`, `POST /api/centres`, `PUT /api/centres/:id`

#### 2. Merchandise Management
- **Steps:** View products → Create product → Upload images → Verify shop listing
- **Expected:** Product created, images upload, shop shows new product
- **API Calls:** `POST /api/merchandise`, `GET /api/merchandise`

#### 3. Trial Management
- **Steps:** Create event → Add trialists → Create reports → Make decisions
- **Expected:** Event created, trialists added, reports save, decisions log
- **API Calls:** `POST /api/trials/events`, `POST /api/trials/reports`

---

## Test Data Requirements

### Seed Data Scenarios

#### Scenario 1: Minimal (5 students)
- 5 students across 2 centres
- 10 sessions, 20 attendance records
- 5 drills, 2 products
- 1 order

#### Scenario 2: Standard (10 students)
- 10 students across 3 centres
- 20 sessions, 50 attendance records
- 10 drills, 5 products
- 3 orders

#### Scenario 3: Large (20 students)
- 20 students across 4 centres
- 40 sessions, 100 attendance records
- 20 drills, 10 products
- 10 orders

#### Edge Cases to Include
- Students with missing optional fields
- Long names (50+ characters)
- Duplicate-like names (John Smith, John Smith Jr.)
- No attendance records
- Fully paid fees
- Overdue fees (>30 days)
- Partial payments
- Inactive/archived students
- Products with no images
- Products with multiple variants
- Orders in various states (pending, completed, cancelled)

---

## Edge Cases & Negative Testing

### Form Validation
- [ ] Empty required fields
- [ ] Extremely long strings (1000+ chars)
- [ ] Special characters and emojis
- [ ] Numbers out of range (negative fees, extremely high)
- [ ] Invalid dates (future/past constraints)
- [ ] Duplicate entries (same email, same SKU)
- [ ] Double submission (rapid clicking)
- [ ] Tab away mid-edit
- [ ] Refresh mid-form
- [ ] Back button behavior
- [ ] Browser autofill

### API & Backend
- [ ] Invalid payloads (missing fields)
- [ ] Unauthorized access (role tests)
- [ ] Rate limiting
- [ ] Concurrency (two users editing same record)
- [ ] Data integrity (orphaned records, invalid FKs)
- [ ] Error handling (proper status codes, no stack traces)

### UI/UX Compliance
- [ ] Text padding (no hugging borders)
- [ ] Consistent spacing
- [ ] CTAs clearly visible
- [ ] Tap targets >= 44px on mobile
- [ ] Keyboard navigation (focus states, enter/escape)
- [ ] Loading states for async actions
- [ ] Empty states when no data
- [ ] Error states when fetch fails

---

## Performance Benchmarks

### Targets
- **Page Load:** < 2s initial, < 1s subsequent
- **API Response:** < 500ms for most endpoints
- **Table Rendering:** < 1s for 20 rows, < 3s for 200 rows
- **Bundle Size:** < 500KB initial JS bundle

### Test Cases
- [ ] Dashboard loads with 20 students
- [ ] Dashboard loads with 200 students (if feasible)
- [ ] Large table pagination works
- [ ] Image lazy loading
- [ ] No layout shift (CLS < 0.1)

---

## Security Testing

### Authentication
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens work
- [ ] Logout invalidates tokens
- [ ] Session timeout works

### Authorization
- [ ] Students cannot access admin routes
- [ ] Coaches cannot access admin-only operations
- [ ] Admin can access all routes
- [ ] API endpoints enforce role checks

### Data Protection
- [ ] No sensitive data in logs
- [ ] No stack traces in production errors
- [ ] File uploads validated (type, size)
- [ ] SQL injection prevention (Prisma parameterized queries)

---

## Test Execution Schedule

1. **Phase 0:** Setup & Instrumentation (Day 1)
2. **Phase 1:** Route & CTA Inventory (Day 1-2)
3. **Phase 2:** Role-Based E2E Testing (Day 2-3)
4. **Phase 3:** Data Seed Testing (Day 3-4)
5. **Phase 4:** Edge Cases & Negative Testing (Day 4-5)
6. **Phase 5:** Shop/Payment Flow (Day 5)
7. **Phase 6:** Centres Map & CRUD (Day 5-6)
8. **Phase 7:** Bug Fix Loop (Day 6-7)
9. **Phase 8:** Final Report (Day 7)

---

## Sign-Off Criteria

- [ ] All routes accessible and functional
- [ ] All CTAs perform expected actions
- [ ] No console errors in production build
- [ ] No failed network requests in happy paths
- [ ] All role-based access controls work
- [ ] Edge cases handled gracefully
- [ ] Performance targets met
- [ ] Security checks passed
- [ ] UI/UX compliance verified
- [ ] Bug log complete with fixes

---

**Next Steps:** Execute Phase 0 - Setup & Instrumentation

