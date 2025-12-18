# FCRB Fees Management System

A comprehensive fees tracking and management system for FCRB Academy with separate portals for Admin, Coach, and Student roles.

## 🚀 Features

### Admin Portal
- Create and manage academy centers
- Add/edit students with custom payment frequencies (1-12 months)
- View comprehensive dashboard with revenue analytics
- Revenue Collections chart (actual payments by date)
- Monthly Collections chart (allocated payments across months)
- Filter by center, payment mode, and time period
- System date setter for testing and debugging

### Coach Portal
- View all assigned centers and students
- Track fees collection, outstanding amounts
- Filter and search students by center, status, program
- Revenue and monthly collection analytics
- Payment mode filters

### Student Portal
- View personal fee details
- Payment history
- Outstanding amount tracking

## 📁 Project Structure

```
fcrb/
├── backend/                 # Express.js + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed-clean.ts   # Initial seed data
│   └── src/
│       ├── auth/           # Authentication middleware
│       ├── modules/        # Feature modules (centers, students, payments, etc.)
│       └── utils/          # Utilities (system date, etc.)
├── frontend/               # React + TypeScript frontend
│   ├── public/            # Static assets (logo, images)
│   └── src/
│       ├── api/           # API client
│       ├── components/    # Reusable components
│       ├── context/       # Auth context
│       └── pages/         # Page components
└── assets/                # Original assets (logo, photos)
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router DOM
- Context API for state management

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fcrb
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fees_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
```

**Important:** Replace `USER` and `PASSWORD` with your PostgreSQL credentials.

### 3. Database Setup

```bash
# Create database and run migrations
npx prisma migrate dev

# Seed initial data (creates admin and coach accounts)
npm run prisma:seed
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults work):

```env
VITE_API_URL=http://localhost:4000
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 🔑 Default Credentials

After seeding, use these credentials:

**Admin:**
- Email: `admin@feestrack.com`
- Password: `admin123`

**Coach:**
- Email: `coach@feestrack.com`
- Password: `coach123`

## 🎨 Branding

The application uses FCRB's official branding:
- Logo: `/frontend/public/fcrb-logo.png`
- Color Palette: Green gradient (#43e97b to #38f9d7)
- Background images in login and navigation

## 🧪 Testing Features

### System Date Setter
A debugging tool in the navigation bar allows you to set a custom system date for testing:
- Test payment calculations
- Verify outstanding amount logic
- Check monthly allocation across different time periods

**Note:** System date affects all calculations including outstanding amounts, revenue charts, and monthly collections.

## 📊 Payment Logic

### Payment Frequency
Students can have payment frequencies from 1-12 months:
- **1 month:** Pay monthly
- **2 months:** Pay bi-monthly (every 2 months)
- **3 months:** Pay quarterly
- **6 months:** Pay half-yearly
- **12 months:** Pay yearly

### Outstanding Calculation
- Payments are expected at the **beginning of each cycle**

## ⭐ RealVerse Fan Club (New)

RealVerse now supports a 4th role: **Fan Club** (`role: FAN`) with an Admin-controlled membership system.

### Public entry (no login)

- **Header CTA**: “Your benefits for backing FC Real Bengaluru”
- **Route**: `/fan-club/benefits` (preview page with locked/blurred rewards)

### Fan dashboard routes

- `/realverse/fan` (Fan Club HQ)
- `/realverse/fan/benefits` (Sponsors + rewards + coupon redemption)
- `/realverse/fan/games` (Mini games + quests)
- `/realverse/fan/matchday` (Weekly fixtures + unlock messaging)
- `/realverse/fan/profile` (Tier, points, badges, history)
- `/realverse/fan/programs` (Program interest conversion)

Fan modules are **admin-driven** via `FanTier.featureFlags` (offers/games/matchday/programs).

### Admin control plane routes

All are under the existing Admin layout (no disruption to other Admin tools):

- `/realverse/admin/fans` (accounts)
- `/realverse/admin/fans/tiers` (tiers + pricing + benefits + featureFlags)
- `/realverse/admin/fans/rewards` (sponsors + campaigns + coupon pools)
- `/realverse/admin/fans/games` (quests)
- `/realverse/admin/fans/analytics` (KPIs + CSV exports)
- `/realverse/admin/fans/settings` (tier feature toggles)

Legacy redirects are supported:
- `/admin/fans/*` → `/realverse/admin/fans/*`

### Backend API (Fan Club)

Fan endpoints (Fan role only):
- `GET /fan/me`
- `GET /fan/tiers`
- `GET /fan/sponsors`
- `GET /fan/rewards`
- `GET /fan/coupons`
- `GET /fan/quests`
- `GET /fan/history`
- `POST /fan/redeem`
- `POST /fan/game/session`
- `POST /fan/program-interest`

Admin endpoints (Admin role only):
- `GET/POST /api/admin/fans`
- `PATCH /api/admin/fans/:id/status`
- `PATCH /api/admin/fans/:id/tier`
- `POST /api/admin/fans/:id/reset-password`
- `GET/POST /api/admin/fans/tiers`
- `GET/POST /api/admin/fans/sponsors`
- `GET/POST /api/admin/fans/campaigns`
- `GET/POST /api/admin/fans/coupon-pools`
- `GET/POST /api/admin/fans/quests`
- `GET /api/admin/fans/analytics/summary`
- `GET /api/admin/fans/redemptions`
- `GET /api/admin/fans/leads`
- `GET /api/admin/fans/audit`

### Demo (seed + logins)

1) Seed QA (includes Fan Club demo data):

```bash
cd backend
npm run seed:qa -- --students=10 --centres=4 --sessions=20
```

2) Fan Club demo credentials (printed by seed script):
- Fan Club: `fan1@test.com` / `fan123`

3) Admin-controlled credentials:
- Go to `/realverse/admin/fans`
- Create a fan → copy the temp password (shown once)
- Fan logs in at `/realverse/login` using **Fan Club** role

4) QA checklist:
- See `docs/qa/FAN_CLUB_QA_CHECKLIST.md`

- Outstanding is calculated based on completed payment cycles from joining date
- Uses system date (or custom debug date) for calculations

### Monthly Collections Chart
- Allocates payments across months based on student's monthly fee
- **Fills outstanding months first**, then current/future months
- Example: If a student owes 2 months and pays ₹10k (₹5k/month), ₹5k goes to each outstanding month

## 🚀 Deployment

### Environment Variables for Production

**Backend:**
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-random-secret-for-production"
PORT=4000
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.com
```

### Build Commands

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the 'dist' folder with any static hosting service
```

## 📝 Database Management

### Reset Database
```bash
cd backend
npx prisma migrate reset --force
```

### View Database (Prisma Studio)
```bash
cd backend
npx prisma studio
```

### Create New Migration
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

## 🔒 Security Notes

1. **Change default credentials** after first login
2. **Use strong JWT_SECRET** in production
3. **Never commit `.env` files** to version control
4. **Use HTTPS** in production
5. **Enable CORS** properly for production domains

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database `fees_tracker` exists

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Migration Errors
```bash
cd backend
npx prisma migrate reset --force
npx prisma migrate dev
npm run prisma:seed
```

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

[Your License Here]





