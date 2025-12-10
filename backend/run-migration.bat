@echo off
REM Run this script to set up the database with new models

echo 🔄 Running Prisma migration...
call npx prisma migrate dev --name add_leads_and_shop

echo 🔧 Generating Prisma client...
call npx prisma generate

echo ✅ Migration complete! Please restart your backend server.
pause


