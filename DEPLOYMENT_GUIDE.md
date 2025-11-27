# Free Deployment Guide for FCRB Fees Management System

## 🚀 Recommended Free Hosting Stack

### Option 1: Railway (Easiest - All-in-One) ⭐ RECOMMENDED

**Railway.app** provides free hosting for backend, database, and frontend in one place.

#### Free Tier Limits:
- $5 credit per month (usually enough for small apps)
- Automatic HTTPS
- PostgreSQL database included
- Easy deployment from GitHub

#### Steps:

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your `fcrb-fees-management` repository

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will create a database automatically

4. **Configure Backend Service**
   - Click on your backend service
   - Go to "Variables" tab
   - Add environment variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-production-secret-key-here
     PORT=4000
     NODE_ENV=production
     ```
   - Go to "Settings" tab
   - Set "Root Directory" to `backend`
   - Set "Build Command" to `npm install && npx prisma generate && npx prisma migrate deploy`
   - Set "Start Command" to `npm start`

5. **Configure Frontend Service**
   - Click "+ New" → "GitHub Repo" (same repo)
   - Go to "Variables" tab
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Go to "Settings" tab
   - Set "Root Directory" to `frontend`
   - Set "Build Command" to `npm install && npm run build`
   - Set "Start Command" to `npm run preview`

6. **Generate Domain**
   - Click on each service
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URLs

7. **Seed Database**
   - Go to backend service
   - Click "..." → "Run Command"
   - Run: `npm run prisma:seed`

**Total Time: 15-20 minutes**

---

### Option 2: Render + Vercel (Separate Services)

#### Backend + Database: Render.com
#### Frontend: Vercel.com

#### Render.com (Backend + Database)

**Free Tier:**
- PostgreSQL database (90 days, then $7/month)
- Web service (sleeps after 15 min inactivity)
- Automatic HTTPS

**Steps:**

1. **Sign up at Render.com**
   - https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `fcrb-database`
   - Database: `fees_tracker`
   - User: `fees_tracker_user`
   - Region: Choose closest to you
   - Click "Create Database"
   - Copy the "Internal Database URL"

3. **Create Web Service (Backend)**
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `fcrb-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Click "Advanced" → Add Environment Variables:
     ```
     DATABASE_URL=<paste internal database URL>
     JWT_SECRET=your-production-secret-key
     PORT=4000
     NODE_ENV=production
     ```
   - Click "Create Web Service"

4. **Seed Database**
   - Once deployed, go to "Shell" tab
   - Run: `npm run prisma:seed`

#### Vercel.com (Frontend)

**Free Tier:**
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Auto-deploy from GitHub

**Steps:**

1. **Sign up at Vercel.com**
   - https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://fcrb-backend.onrender.com
     ```
   - Click "Deploy"

**Total Time: 20-25 minutes**

---

### Option 3: Heroku (Classic Option)

**Note:** Heroku removed free tier in 2022, but offers student credits through GitHub Student Pack.

---

### Option 4: Fly.io (Developer Friendly)

**Free Tier:**
- 3 VMs with 256MB RAM
- PostgreSQL (3GB storage)
- Good for full-stack apps

**Steps:**

1. **Install Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign up**
   ```bash
   fly auth signup
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   fly launch --name fcrb-backend
   # Follow prompts, select region
   
   # Add PostgreSQL
   fly postgres create --name fcrb-db
   fly postgres attach fcrb-db
   
   # Set environment variables
   fly secrets set JWT_SECRET=your-secret-key
   
   # Deploy
   fly deploy
   
   # Run migrations
   fly ssh console
   npm run prisma:migrate deploy
   npm run prisma:seed
   ```

4. **Deploy Frontend**
   ```bash
   cd ../frontend
   fly launch --name fcrb-frontend
   fly secrets set VITE_API_URL=https://fcrb-backend.fly.dev
   fly deploy
   ```

**Total Time: 25-30 minutes**

---

## 📊 Comparison Table

| Service | Backend | Database | Frontend | Ease | Sleep Time | Best For |
|---------|---------|----------|----------|------|------------|----------|
| **Railway** | ✅ | ✅ PostgreSQL | ✅ | ⭐⭐⭐⭐⭐ | None (with credit) | Beginners |
| **Render + Vercel** | ✅ | ✅ PostgreSQL (90 days) | ✅ | ⭐⭐⭐⭐ | 15 min | Good balance |
| **Fly.io** | ✅ | ✅ PostgreSQL | ✅ | ⭐⭐⭐ | None | Developers |
| **Heroku** | ✅ | ✅ PostgreSQL | ✅ | ⭐⭐⭐⭐ | Paid only | Students (with credits) |

---

## 🎯 My Recommendation: Railway.app

**Why Railway?**
1. ✅ **Easiest setup** - Everything in one dashboard
2. ✅ **Free PostgreSQL** - No time limit (within credit)
3. ✅ **No sleep time** - App stays awake (within credit)
4. ✅ **Automatic deployments** - Push to GitHub, auto-deploy
5. ✅ **Environment variables** - Easy to manage
6. ✅ **Logs & monitoring** - Built-in

**Limitations:**
- $5/month credit (usually enough for small apps)
- If you exceed, app pauses until next month
- For production with traffic, you'll need to upgrade

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to GitHub
- [ ] `.env` files are NOT in repository
- [ ] `.env.example` files exist
- [ ] `package.json` has correct scripts:
  ```json
  {
    "scripts": {
      "start": "node dist/index.js",
      "build": "tsc",
      "dev": "ts-node-dev src/index.ts"
    }
  }
  ```
- [ ] Backend has build script
- [ ] Frontend has build script
- [ ] Database migrations are ready
- [ ] Seed script is ready

---

## 📝 Post-Deployment Steps

After deployment:

1. **Test the application**
   - Visit frontend URL
   - Try logging in with default credentials
   - Test all features

2. **Change default passwords**
   - Login as admin
   - Change admin password
   - Change coach password

3. **Monitor usage**
   - Check Railway/Render dashboard
   - Monitor database size
   - Watch for errors in logs

4. **Set up custom domain (optional)**
   - Buy domain from Namecheap/GoDaddy
   - Add CNAME records
   - Configure in Railway/Vercel

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables
- Check DATABASE_URL is correct
- Check logs for errors
- Verify build command ran successfully

### Database connection failed
- Verify DATABASE_URL format
- Check database is running
- Run migrations: `npx prisma migrate deploy`

### Frontend can't reach backend
- Check VITE_API_URL is correct
- Verify backend URL is accessible
- Check CORS settings in backend

### App is slow
- Backend might be sleeping (Render free tier)
- First request wakes it up (takes 30-60 seconds)
- Consider upgrading or using Railway

---

## 💰 Cost After Free Tier

If you need to upgrade:

| Service | Cost/Month | What You Get |
|---------|-----------|--------------|
| Railway | $5-20 | More compute credits |
| Render | $7 (DB) + $7 (Web) | Always-on services |
| Vercel | Free | Frontend always free |
| Fly.io | $0-10 | Pay for what you use |

---

## 🎓 For Students

**GitHub Student Developer Pack** includes:
- Heroku credits
- DigitalOcean credits
- Azure credits
- And more!

Apply at: https://education.github.com/pack

---

## 🚀 Quick Start with Railway (Step-by-Step)

1. Push code to GitHub
2. Go to https://railway.app
3. Sign up with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Click "+ New" → "Database" → "PostgreSQL"
7. Click on backend service → "Variables" → Add DATABASE_URL
8. Click on backend service → "Settings" → Set root directory to `backend`
9. Wait for deployment
10. Click "..." → "Run Command" → `npm run prisma:seed`
11. Get your URL from "Settings" → "Networking" → "Generate Domain"
12. Done! 🎉

**Your app is now live!**

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Fly.io Docs: https://fly.io/docs

---

## ✅ Success Checklist

After deployment:
- [ ] Frontend loads successfully
- [ ] Can login with admin credentials
- [ ] Dashboard shows data
- [ ] Can create new students
- [ ] Can record payments
- [ ] Charts display correctly
- [ ] System date setter works
- [ ] All pages accessible

**Congratulations! Your app is deployed! 🎉**

