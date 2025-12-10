# Fix: Centre Analytics Error

## Error
`Cannot read properties of undefined (reading 'findMany')`

## Cause
The Prisma client hasn't been regenerated after adding the `CentreMonthlyMetrics` model.

## Solution

### Step 1: Stop Backend Server
Stop any running backend server (Ctrl+C in the terminal where it's running)

### Step 2: Regenerate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 3: Restart Backend Server
```bash
npm run dev
```

## Alternative: If Prisma Generate Fails

If you get a file lock error, close all terminals and VS Code, then:

1. Open a new terminal
2. Navigate to backend folder
3. Run: `npx prisma generate`
4. Restart backend server

## Verification

After regenerating, the centre analytics page should work without errors. The page will show:
- Empty metrics if no data exists (graceful degradation)
- Full analytics if data exists

