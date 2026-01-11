# macOS Setup Guide for FCRB Fees Management System

Complete step-by-step guide to set up the FCRB Fees Management System on a macOS machine.

## 📋 Prerequisites Installation

### 1. Install Homebrew (if not already installed)

Homebrew is the package manager for macOS:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify installation:
```bash
brew --version
```

### 2. Install Node.js

```bash
brew install node@18
```

Or use the latest LTS version:
```bash
brew install node
```

Verify installation:
```bash
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
brew install postgresql@14
```

**Important:** After installation, start the PostgreSQL service:
```bash
brew services start postgresql@14
```

Verify installation:
```bash
psql --version
```

### 4. Install Git (Usually pre-installed on macOS)

Verify:
```bash
git --version
```

If not installed:
```bash
brew install git
```

### 5. Code Editor

- **VS Code** (Recommended): Download from https://code.visualstudio.com/
- Or use any editor of your choice

## 🔧 PostgreSQL Initial Setup (CRITICAL FOR macOS)

After installing PostgreSQL, you need to set up the database properly:

### Step 1: Create the postgres superuser role

```bash
# Connect to PostgreSQL using your macOS username
psql postgres

# Inside psql, create the postgres superuser role:
CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';

# Exit psql
\q
```

### Step 2: Create the fees_tracker database

Now you can use the postgres user:

```bash
# Connect as postgres user
psql -U postgres -d postgres

# Create the database
CREATE DATABASE fees_tracker;

# Verify the database was created
\l

# Exit psql
\q
```

### Alternative: Quick Setup Script

If the above doesn't work, try this approach:

```bash
# Create your user database first (to avoid the "database does not exist" error)
createdb $(whoami)

# Now connect to it
psql

# Create postgres role
CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';

# Create the fees_tracker database
CREATE DATABASE fees_tracker;

# Exit
\q
```

### Verify PostgreSQL is Running

```bash
# Check if PostgreSQL service is running
brew services list | grep postgresql

# If not running, start it:
brew services start postgresql@14

# Test connection
psql -U postgres -d fees_tracker
```

## 🚀 Project Setup

### Step 1: Navigate to Project Directory

```bash
cd /Users/pradiptom/fcrb
```

### Step 2: Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the `backend` folder:
   ```bash
   nano .env
   ```
   
   Or use any text editor:
   ```bash
   code .env
   ```

4. Add this content:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fees_tracker?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=4000
   ```

5. Save the file:
   - If using nano: Press `Ctrl+O`, then `Enter`, then `Ctrl+X`
   - If using VS Code: Just save normally (`Cmd+S`)

6. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

7. **IMPORTANT:** Add the FAN enum value manually (PostgreSQL requirement):
   ```bash
   psql -U postgres -d fees_tracker -c "ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'FAN';"
   ```

8. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

9. Seed initial data:
   ```bash
   npm run prisma:seed
   ```

10. (Optional) If you need to reset and re-run everything:
   ```bash
   # Add the FAN enum value first
   psql -U postgres -d fees_tracker -c "ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'FAN';"
   
   # Then reset and migrate
   npx prisma migrate reset --force
   npx prisma migrate deploy
   npm run prisma:seed
   ```

### Step 3: Frontend Setup

1. Open a **NEW** terminal window/tab (`Cmd+T`)
2. Navigate to frontend folder:
   ```bash
   cd /Users/pradiptom/fcrb/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. (Optional) Create `.env` file in `frontend` folder:
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

### Step 4: Start the Application

You need **TWO** separate terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd /Users/pradiptom/fcrb/backend
npm run dev
```

Wait until you see: `✓ Server running on http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd /Users/pradiptom/fcrb/frontend
npm run dev
```

Wait until you see: `Local: http://localhost:5173/`

### Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

## 🔑 Login Credentials

**Admin Account:**
- Email: `admin@feestrack.com`
- Password: `admin123`

**Coach Account:**
- Email: `coach@feestrack.com`
- Password: `coach123`

## 🛠️ Common macOS-Specific Issues & Solutions

### Issue 1: "psql: error: connection to server on socket failed"

**Cause:** PostgreSQL service is not running.

**Solution:**
```bash
# Start PostgreSQL service
brew services start postgresql@14

# Verify it's running
brew services list | grep postgresql

# Should show: postgresql@14 started
```

### Issue 2: "FATAL: role 'postgres' does not exist"

**Cause:** The postgres superuser role was not created during installation.

**Solution:**
```bash
# Connect using your macOS username
psql postgres

# Create the postgres role
CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';

# Exit
\q
```

### Issue 3: "FATAL: database 'pradiptom' does not exist"

**Cause:** PostgreSQL tries to connect to a database with your username by default.

**Solution:**
```bash
# Create a database with your username
createdb $(whoami)

# Or specify the database explicitly when connecting
psql -d postgres
```

### Issue 4: Port Already in Use

**Kill process on port 4000 (Backend):**
```bash
lsof -ti:4000 | xargs kill -9
```

**Kill process on port 5173 (Frontend):**
```bash
lsof -ti:5173 | xargs kill -9
```

### Issue 5: PostgreSQL Connection Failed

1. Check if PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Check PostgreSQL logs:
   ```bash
   tail -f /opt/homebrew/var/log/postgresql@14.log
   ```
   
   Or for Intel Macs:
   ```bash
   tail -f /usr/local/var/log/postgresql@14.log
   ```

3. Test connection:
   ```bash
   psql -U postgres -d fees_tracker
   ```

4. If connection still fails, restart PostgreSQL:
   ```bash
   brew services restart postgresql@14
   ```

### Issue 6: npm install fails

**Solution 1:** Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2:** Delete `node_modules` and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 7: Prisma Migration Errors

**Reset and recreate database:**
```bash
cd backend
npx prisma migrate reset --force
npx prisma migrate dev
npm run prisma:seed
```

### Issue 8: Permission Denied Errors

If you get permission errors with npm:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue 9: "command not found" after installation

**Solution:** Restart your terminal or reload your shell configuration:
```bash
source ~/.zshrc
# or
source ~/.bash_profile
```

## 🎯 Quick Start Scripts

Use the existing shell scripts in the project:

**Start Backend:**
```bash
./START_BACKEND.sh
```

**Start Frontend:**
```bash
./START_FRONTEND.sh
```

**Make scripts executable (if needed):**
```bash
chmod +x START_BACKEND.sh START_FRONTEND.sh
```

## 🔄 Complete Reset (If Everything Fails)

If you need to completely reset everything:

```bash
# 1. Stop PostgreSQL
brew services stop postgresql@14

# 2. Remove PostgreSQL data (CAUTION: This deletes all databases!)
rm -rf /opt/homebrew/var/postgresql@14
# Or for Intel Macs:
# rm -rf /usr/local/var/postgresql@14

# 3. Reinitialize PostgreSQL
brew services start postgresql@14

# 4. Recreate postgres role and database
psql postgres
CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';
CREATE DATABASE fees_tracker;
\q

# 5. Reset backend
cd /Users/pradiptom/fcrb/backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed

# 6. Reset frontend
cd /Users/pradiptom/fcrb/frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

**backend/.env:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fees_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
```

**frontend/.env (optional):**
```env
VITE_API_URL=http://localhost:4000
```

## 🔍 Debugging Tips

### Check PostgreSQL Status
```bash
brew services list
ps aux | grep postgres
```

### Check Database Connection
```bash
psql -U postgres -d fees_tracker -c "SELECT version();"
```

### Check Available Databases
```bash
psql -U postgres -l
```

### Check Available Roles
```bash
psql -U postgres -c "\du"
```

### View Backend Logs
```bash
cd backend
npm run dev
# Watch for any error messages
```

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify PostgreSQL service is running: `brew services list`
3. Verify postgres role exists: `psql -U postgres -d postgres -c "\du"`
4. Check `.env` file configuration
5. Try the "Complete Reset" section above

## 🎉 Success Checklist

- [ ] Homebrew installed
- [ ] Node.js installed and verified
- [ ] PostgreSQL installed and running
- [ ] PostgreSQL `postgres` role created
- [ ] Database `fees_tracker` created
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Prisma client generated
- [ ] Database migrated and seeded
- [ ] Frontend dependencies installed
- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 5173
- [ ] Can login with admin credentials
- [ ] Can see dashboard and data

**You're all set! 🚀**

## 🆘 Quick Fix for Your Current Issue

Based on your terminal output, here's the immediate fix:

```bash
# Step 1: Create your user database to avoid the default connection error
createdb pradiptom

# Step 2: Connect to PostgreSQL
psql

# Step 3: Create the postgres role
CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';

# Step 4: Create the fees_tracker database
CREATE DATABASE fees_tracker;

# Step 5: Verify
\l

# Step 6: Exit
\q

# Step 7: Test connection
psql -U postgres -d fees_tracker

# If successful, you should see the PostgreSQL prompt
# Exit with \q

# Step 8: Now proceed with backend setup
cd /Users/pradiptom/fcrb/backend
npm install
npx prisma generate

# Step 9: IMPORTANT - Add FAN enum value before migrations
psql -U postgres -d fees_tracker -c "ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'FAN';"

# Step 10: Deploy migrations
npx prisma migrate deploy

# Step 11: Seed the database
npm run prisma:seed
```

That's it! Your PostgreSQL should now be properly configured.

## ⚠️ Important Note About the FAN Enum

Due to a PostgreSQL limitation, enum values cannot be added and used in the same transaction. The migration for the Fan Club feature requires the 'FAN' role to be added manually before running migrations. This is why we run the manual ALTER TYPE command before `prisma migrate deploy`.

