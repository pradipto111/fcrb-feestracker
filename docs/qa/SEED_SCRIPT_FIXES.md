# QA Seed Script Fixes
**FC Real Bengaluru - Quality Assurance**

**Date:** 2024-12-19  
**Status:** ✅ Fixed

---

## Issues Fixed

### 1. Session Creation - Missing `coachId`
**Error:** `Property 'coachId' is missing`

**Fix:** Added coach lookup and `coachId` field to session creation:
```typescript
const coach = await prisma.coach.findFirst({ where: { role: 'COACH' } });
// ...
coachId: coach.id,
```

### 2. Attendance Status - Invalid Enum Value
**Error:** `Type '"NOT_MARKED"' is not assignable to type 'AttendanceStatus'`

**Fix:** Changed to valid enum values (PRESENT, ABSENT, EXCUSED):
```typescript
// Before: 'NOT_MARKED'
// After: Only use PRESENT, ABSENT, EXCUSED
const status = i % 3 === 0 ? 'PRESENT' : i % 3 === 1 ? 'ABSENT' : 'EXCUSED';
```

### 3. Payment Model - Invalid Fields
**Error:** Payment model doesn't have `dueDate` or `status` fields

**Fix:** Removed invalid fields, used correct Payment model structure:
```typescript
// Removed: dueDate, status
// Added: centerId (required)
// Fixed: paymentDate and paymentMode are required
```

### 4. Payment Fields - Cannot Be Null
**Error:** `paymentDate` and `paymentMode` cannot be null

**Fix:** Always provide values:
```typescript
paymentDate: isPaid ? paymentDate : new Date(), // Always provide date
paymentMode: isPaid ? (i % 2 === 0 ? 'CASH' : 'UPI') : 'CASH', // Always provide mode
```

### 5. Video Model - Wrong Fields
**Error:** `isActive` doesn't exist, missing `createdById` and `platform`

**Fix:** Updated to match Video model:
```typescript
// Removed: isActive
// Added: createdById, platform
createdById: coach.id,
platform: 'YOUTUBE',
```

### 6. Product Model - Wrong Name
**Error:** `Property 'merchandise' does not exist on type 'PrismaClient'`

**Fix:** Changed to `Product` model with correct fields:
```typescript
// Changed: prisma.merchandise -> prisma.product
// Updated fields: stockQuantity -> stock, price in paise
await prisma.product.create({
  data: {
    // ... correct fields
    price: (500 + (i * 100)) * 100, // Price in paise
    stock: i % 2 === 0 ? 10 : 0,
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['test', 'qa'],
  },
});
```

---

## Verification

✅ Seed script runs successfully:
```bash
npm run seed:qa -- --students=5
```

✅ Test data created:
- 4 centres
- 1 coach
- 1 admin
- 6 students (5 + 1 test)
- 20 sessions
- 100 attendance records
- 10 payment records
- 10 drills
- 5 products

✅ Test credentials work:
- Student: `student@test.com` / `test123`
- Coach: `coach@test.com` / `test123`
- Admin: `admin@test.com` / `test123`

---

**Last Updated:** 2024-12-19

