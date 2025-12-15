# RealVerse Test Data Seed Guide
**FC Real Bengaluru - QA Test Data**

**Version:** 1.0.0  
**Last Updated:** 2024-12-19

---

## Overview

This document describes the test data seeding strategy for QA testing. The seed script creates realistic, diverse data including edge cases to thoroughly test the application.

---

## Seed Scripts

### Location
- **Main Seed:** `backend/prisma/seed-qa.ts` (to be created)
- **Edge Cases:** `__qa__/test-data/edge-cases.json` (exists)

### Usage

```bash
# Seed with 5 students (minimal)
cd backend
npm run seed:qa -- --students=5

# Seed with 10 students (standard)
npm run seed:qa -- --students=10

# Seed with 20 students (large)
npm run seed:qa -- --students=20

# Seed with custom parameters
npm run seed:qa -- --students=20 --centres=4 --sessions=40 --attendance=100
```

---

## Seed Data Structure

### Students (Edge Cases Included)

#### Standard Students (80%)
- Complete profile data
- Normal names (10-30 chars)
- Active status
- Regular attendance patterns
- Standard fee payments

#### Edge Case Students (20%)

1. **Missing Optional Fields**
   - No email
   - No phone
   - No parent contact
   - No avatar

2. **Long Names**
   - First name: 50+ characters
   - Last name: 50+ characters
   - Full name: 100+ characters

3. **Duplicate-like Names**
   - "John Smith"
   - "John Smith Jr."
   - "John A. Smith"
   - "J. Smith"

4. **Attendance Patterns**
   - No attendance records (new student)
   - Perfect attendance (100%)
   - Poor attendance (<50%)
   - Irregular attendance

5. **Payment Status**
   - Fully paid (no outstanding)
   - Overdue (>30 days)
   - Partial payments
   - Multiple payment frequencies

6. **Status Variations**
   - Active
   - Inactive
   - Trial
   - Archived (if supported)

### Centres

All 4 current centres:
1. **3lok Football Fitness Hub** - Whitefield
2. **Deput18** - Jayamahal
3. **Blitzz** - Haralur
4. **Tronic City Turf** - Parappana Agrahara

Each centre should have:
- Correct coordinates for map
- Google Maps link
- Assigned coaches
- Students distributed across centres

### Sessions

- Mix of morning, afternoon, evening sessions
- Weekday and weekend sessions
- Past, present, and future sessions
- Different session types (training, match, recovery)

### Attendance Records

- Various statuses: PRESENT, ABSENT, EXCUSED, NOT_MARKED
- Realistic patterns (students miss some sessions)
- Bulk attendance for efficiency testing

### Drills

- Mix of video and text drills
- Long descriptions (500+ chars)
- Media links (YouTube, Vimeo)
- Categories: Technical, Tactical, Physical

### Merchandise

- Products with images
- Products without images (edge case)
- Multiple variants (sizes, colors)
- Different price ranges
- In-stock and out-of-stock items

### Orders

- Successful orders
- Cancelled orders
- Failed payment orders (simulated)
- Various order states

---

## Seed Script Parameters

```typescript
interface SeedOptions {
  students?: number;        // Default: 10
  centres?: number;         // Default: 4
  sessions?: number;        // Default: 20
  attendance?: number;      // Default: 50
  drills?: number;          // Default: 10
  products?: number;        // Default: 5
  orders?: number;         // Default: 3
  invoices?: number;        // Default: 2 per student
  clearExisting?: boolean;  // Default: false (idempotent)
}
```

---

## Idempotency

The seed script should be idempotent:
- Can be run multiple times safely
- Uses unique identifiers (emails, SKUs)
- Clears only QA namespace or uses a QA tenant
- Does not affect production data

---

## Edge Case Data Examples

### Student with Long Name
```json
{
  "fullName": "A Very Long Name That Exceeds Normal Expectations And Tests UI Layout",
  "email": "longname@test.com"
}
```

### Student with No Attendance
```json
{
  "fullName": "New Student",
  "email": "newstudent@test.com",
  "attendanceRecords": []
}
```

### Product with No Images
```json
{
  "name": "Test Product",
  "slug": "test-product",
  "images": []
}
```

---

## Verification After Seeding

After running the seed script, verify:

1. **Data Counts**
   - Correct number of students created
   - Correct number of sessions created
   - Attendance records match expected

2. **Data Integrity**
   - All foreign keys valid
   - No orphaned records
   - Centre assignments correct

3. **Edge Cases Present**
   - Long names visible
   - Missing fields handled
   - Various payment statuses

4. **Performance**
   - Dashboards load in < 2s
   - Tables render quickly
   - No N+1 queries

---

## Cleanup

To clean up test data:

```bash
npm run seed:qa:clean
```

This should:
- Remove only QA test data
- Preserve production data
- Be safe to run in dev environment

---

## Notes

- Seed data uses a "QA_" prefix or separate tenant to avoid conflicts
- All test emails use "@test.com" domain
- Test data is clearly marked for easy identification
- Seed script logs all operations for debugging

---

**Next Steps:** Create the seed script implementation

