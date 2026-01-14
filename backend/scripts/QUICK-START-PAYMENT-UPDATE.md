# Quick Start: Update Student Payments from Spreadsheet

## Fastest Method: CSV Export

1. **Export your spreadsheet as CSV:**
   - Open your Excel/Google Sheets file
   - File → Save As / Export → CSV (Comma Separated Values)
   - Save as `student-payments-update.csv` in the `backend/` folder

2. **Run the update script:**
   ```bash
   cd backend
   npx ts-node scripts/update-payments-from-csv.ts
   ```

3. **The script will:**
   - Find each student by name (and phone if available)
   - Delete all their existing payments
   - Create new payments based on the spreadsheet
   - Update student status (Active/Paused/Churned)
   - Set churned dates for churned/paused students
   - Update joining dates if provided

## CSV Format Required

Your CSV should have these columns (in any order):
- **Name** - Student's full name
- **Phone** - Phone number (optional but helps with matching)
- **Present Center** or **Center** - Center name (Depot18, Trilok (Resi), etc.)
- **Subscription Status** - Active, Paused, or Churned
- **Monthly** - Monthly fee amount (optional)
- **April, May, June, July, August, September, October, November, December, January, February, March** - Payment amounts for each month
- **Start Date** - Joining date in DD/MM/YYYY format (optional)
- **COMMENTS** - Any notes (optional)

## Example CSV Row

```
Name,Phone,Present Center,Subscription Status,Monthly,April,May,June,July,August,September,October,November,December,January,February,March,Start Date,COMMENTS
Anthony,8296777374,Depot18,Churned,5000,,,5000,5000,5000,,,,,,,05/07/2025,
```

## What Happens to Churned Students

- Status → `INACTIVE`
- `churnedDate` → 1st of the month AFTER their last payment
- Fee tracking stops after churn date
- No further dues calculated

## Verification

After running the script, check:
1. Student payment history in admin dashboard
2. Student status (should match spreadsheet)
3. Churned students should show churn date
4. Fee calculations should stop for churned students

## Troubleshooting

**"Student not found" errors:**
- Check that names match exactly (case doesn't matter)
- Try adding phone numbers to help with matching

**"Invalid month name" errors:**
- Ensure month columns are spelled correctly: April, May, June, etc. (not Apr, May, Jun)

**CSV parsing errors:**
- Make sure CSV uses commas as delimiters
- Check for special characters in names/comments that might break parsing
