# Windows Setup Guide for FCRB Fees Management System

Complete step-by-step guide to set up the FCRB Fees Management System on a Windows machine.

## 📋 Prerequisites Installation

### 1. Install Node.js

1. Download Node.js LTS (v18 or higher) from: https://nodejs.org/
2. Run the installer (`.msi` file)
3. Follow the installation wizard (keep default settings)
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - **Remember the password** you set for the `postgres` user
   - Default port: `5432` (keep this)
   - Install pgAdmin 4 (recommended for database management)
4. Verify installation:
   ```cmd
   psql --version
   ```

### 3. Install Git (Optional but Recommended)

1. Download from: https://git-scm.com/download/win
2. Run installer with default settings
3. Verify:
   ```cmd
   git --version
   ```

### 4. Install a Code Editor

- **VS Code** (Recommended): https://code.visualstudio.com/
- Or any editor of your choice

## 🚀 Project Setup

### Step 1: Get the Code

**Option A: Using Git**
```cmd
git clone <your-repo-url>
cd fcrb-feestracker-new
```

**Option B: Download ZIP**
1. Download the repository as ZIP
2. Extract to a folder (e.g., `C:\Projects\fcrb`)
3. Open Command Prompt or PowerShell in that folder

### Step 2: Create PostgreSQL Database

1. Open **pgAdmin 4** or use command line
2. Create a new database named `fees_tracker`

**Using pgAdmin:**
- Right-click on "Databases" → Create → Database
- Name: `fees_tracker`
- Click Save

**Using Command Line:**
```cmd
psql -U postgres
CREATE DATABASE fees_tracker;
\q
```

### Step 3: Backend Setup

1. Navigate to backend folder:
   ```cmd
   cd backend
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Create `.env` file in the `backend` folder:
   ```cmd
   notepad .env
   ```

4. Add this content (replace `YOUR_PASSWORD` with your PostgreSQL password):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fees_tracker?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=4000
   ```

5. Save and close the file

6. Run database migrations:
   ```cmd
   npx prisma migrate deploy
   ```

7. Seed initial data (minimal clean seed):
   ```cmd
   npm run prisma:seed
   ```

8. (Optional) If you need to reset and re-run everything:
   ```cmd
   npx prisma migrate reset --force
   npx prisma migrate deploy
   npm run prisma:seed
   ```

### Step 4: Frontend Setup

1. Open a **NEW** Command Prompt/PowerShell window
2. Navigate to frontend folder:
   ```cmd
   cd C:\path\to\fcrb-feestracker-new\frontend
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```

4. (Optional) Create `.env` file in `frontend` folder:
   ```cmd
   notepad .env
   ```
   
   Add:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

### Step 5: Start the Application

You need **TWO** separate terminal windows:

**Terminal 1 - Backend:**
```cmd
cd C:\path\to\fcrb-feestracker-new\backend
npm run dev
```

Wait until you see: `✓ Server running on http://localhost:4000`

**Terminal 2 - Frontend:**
```cmd
cd C:\path\to\fcrb-feestracker-new\frontend
npm run dev
```

Wait until you see: `Local: http://localhost:5173/`

### Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

## 🔑 Login Credentials

**Admin Account:**
- Email: `admin@feestrack.com`
- Password: `admin123`

**Coach Account:**
- Email: `coach@feestrack.com`
- Password: `coach123`

## 🛠️ Common Windows-Specific Issues

### Issue 1: "command not found" or "not recognized"

**Solution:** Restart your terminal after installing Node.js or PostgreSQL, or add to PATH manually.

### Issue 2: PowerShell Execution Policy Error

If you see: `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 3: Port Already in Use

**Kill process on port 4000 (Backend):**
```cmd
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F
```

**Kill process on port 5173 (Frontend):**
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Issue 4: PostgreSQL Connection Failed

1. Verify PostgreSQL service is running:
   - Open Services (`services.msc`)
   - Find "postgresql-x64-XX" service
   - Ensure it's running

2. Check your `.env` file:
   - Correct password
   - Correct port (default: 5432)
   - Database name: `fees_tracker`

3. Test connection:
   ```cmd
   psql -U postgres -d fees_tracker
   ```

### Issue 5: npm install fails

**Solution 1:** Clear npm cache
```cmd
npm cache clean --force
npm install
```

**Solution 2:** Delete `node_modules` and reinstall
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue 6: Prisma Migration Errors

**Reset and recreate database:**
```cmd
cd backend
npx prisma migrate reset --force
npx prisma migrate dev
npm run prisma:seed
```

## 📁 File Structure to Push to GitHub

### ✅ Files to INCLUDE:

```
fcrb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ✅
│   │   ├── seed-clean.ts          ✅
│   │   ├── seed-simple.ts         ✅
│   │   └── seed.ts                ✅
│   ├── src/                       ✅ (all files)
│   ├── package.json               ✅
│   ├── package-lock.json          ✅
│   ├── tsconfig.json              ✅
│   └── .env.example               ✅ (create this - see below)
├── frontend/
│   ├── public/                    ✅ (logo and images)
│   ├── src/                       ✅ (all files)
│   ├── index.html                 ✅
│   ├── package.json               ✅
│   ├── package-lock.json          ✅
│   ├── tsconfig.json              ✅
│   ├── vite.config.ts             ✅
│   └── .env.example               ✅ (create this - see below)
├── assets/                        ✅ (original images)
├── .gitignore                     ✅
├── README.md                      ✅
└── WINDOWS_SETUP.md               ✅
```

### ❌ Files to EXCLUDE (already in .gitignore):

```
❌ node_modules/
❌ .env (contains secrets!)
❌ dist/
❌ build/
❌ backend/prisma/migrations/ (will be regenerated)
❌ .DS_Store
❌ *.log
❌ .vscode/
❌ .idea/
```

## 📝 Create .env.example Files

Before pushing to GitHub, create example environment files:

**backend/.env.example:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fees_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
```

**frontend/.env.example:**
```env
VITE_API_URL=http://localhost:4000
```

## 🔄 Steps to Push to GitHub

1. **Initialize Git** (if not already done):
   ```cmd
   git init
   git add .
   git commit -m "Initial commit - FCRB Fees Management System"
   ```

2. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Create a new repository (e.g., `fcrb-fees-management`)
   - **Don't** initialize with README (you already have one)

3. **Push to GitHub:**
   ```cmd
   git remote add origin https://github.com/YOUR_USERNAME/fcrb-fees-management.git
   git branch -M main
   git push -u origin main
   ```

## 🔄 Setup on Another Windows Machine

1. **Install Prerequisites** (Node.js, PostgreSQL, Git)

2. **Clone Repository:**
   ```cmd
   git clone https://github.com/YOUR_USERNAME/fcrb-fees-management.git
   cd fcrb-fees-management
   ```

3. **Create `.env` files** (copy from `.env.example` and fill in your values)

4. **Backend Setup:**
   ```cmd
   cd backend
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Frontend Setup:**
   ```cmd
   cd ..\frontend
   npm install
   ```

6. **Start Both Servers** (in separate terminals)

## 🎯 Quick Start Scripts (Optional)

Create these batch files in the root folder for easier startup:

**start-backend.bat:**
```batch
@echo off
cd backend
npm run dev
```

**start-frontend.bat:**
```batch
@echo off
cd frontend
npm run dev
```

**reset-database.bat:**
```batch
@echo off
cd backend
npx prisma migrate reset --force
npm run prisma:seed
echo Database reset complete!
pause
```

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify all prerequisites are installed
3. Ensure PostgreSQL service is running
4. Check `.env` file configuration
5. Try resetting the database

## 🎉 Success Checklist

- [ ] Node.js installed and verified
- [ ] PostgreSQL installed and running
- [ ] Database `fees_tracker` created
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Database migrated and seeded
- [ ] Frontend dependencies installed
- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 5173
- [ ] Can login with admin credentials
- [ ] Can see dashboard and data

**You're all set! 🚀**



