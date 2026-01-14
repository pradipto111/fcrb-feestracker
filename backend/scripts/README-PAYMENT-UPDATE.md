# Student Payment Update Scripts

This directory contains scripts to update student payment data from the spreadsheet.

## Option 1: Using CSV File (Recommended)

1. **Export your spreadsheet as CSV**
   - Open your spreadsheet in Excel/Google Sheets
   - File → Save As / Export → CSV
   - Save it as `student-payments-update.csv` in the `backend/` directory

2. **Ensure CSV has these columns:**
   - Name
   - Phone
   - Present Center (or Center)
   - Subscription Status
   - Monthly
   - April, May, June, July, August, September, October, November, December, January, February, March
   - Start Date (optional, DD/MM/YYYY format)
   - COMMENTS (optional)

3. **Run the script:**
   ```bash
   cd backend
   npx ts-node scripts/update-payments-from-csv.ts
   ```

## Option 2: Using JSON Data

1. **Create a JSON file** with student data in this format:
   ```json
   [
     {
       "name": "Anthony",
       "phone": "8296777374",
       "presentCenter": "Depot18",
       "subscriptionStatus": "Churned",
       "monthlyFee": 5000,
       "startDate": "05/07/2025",
       "payments": {
         "July": 5000,
         "August": 5000,
         "September": 5000
       },
       "comments": ""
     }
   ]
   ```

2. **Run the script:**
   ```bash
   cd backend
   npx ts-node scripts/update-student-payments-from-spreadsheet.ts < your-data.json
   ```

## Option 3: Using API Endpoint

You can also use the bulk update API endpoint from the admin dashboard or via API call:

**Endpoint:** `POST /students/bulk-update-payments`

**Request Body:**
```json
{
  "students": [
    {
      "name": "Anthony",
      "phone": "8296777374",
      "subscriptionStatus": "Churned",
      "monthlyFee": 5000,
      "startDate": "05/07/2025",
      "payments": [
        { "month": "July", "year": 2025, "amount": 5000 },
        { "month": "August", "year": 2025, "amount": 5000 },
        { "month": "September", "year": 2025, "amount": 5000 }
      ],
      "comments": ""
    }
  ]
}
```

## Important Notes

1. **Payment Dates:** All payments are set to the **1st of the respective month**
2. **Churned Students:** 
   - Status is set to `INACTIVE`
   - `churnedDate` is set to the 1st of the month AFTER their last payment
   - Fee tracking stops after the churn date
3. **Paused Students:**
   - Status is set to `INACTIVE`
   - `churnedDate` is set similarly to stop fee tracking
4. **Active Students:**
   - Status is set to `ACTIVE`
   - `churnedDate` is cleared (set to null)

## What the Script Does

For each student:
1. Finds the student by name (and phone if provided)
2. **Deletes all existing payments** for that student
3. Creates new payment records based on the spreadsheet data
4. Updates student status (Active/Paused/Churned)
5. Sets `churnedDate` for churned/paused students
6. Updates `joiningDate` if Start Date is provided
7. Updates `monthlyFeeAmount` if Monthly fee is provided

## Troubleshooting

- **Student not found:** Check that the name matches exactly (case-insensitive)
- **Payment dates incorrect:** Ensure month names are spelled correctly (e.g., "April" not "Apr")
- **CSV parsing errors:** Check that your CSV uses commas as delimiters and handles quoted fields correctly
