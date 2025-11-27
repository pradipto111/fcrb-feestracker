# Render.com Deployment Guide

## 🚀 Deploy FCRB to Render (Free Tier)

This guide will help you deploy your app to Render using the `render.yaml` configuration file.

---

## 📋 What You'll Get

- ✅ **Backend API** - Express.js server (free tier, sleeps after 15 min)
- ✅ **PostgreSQL Database** - Free for 90 days
- ✅ **Frontend** - React app (free tier, sleeps after 15 min)
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Auto-deploy** - Deploys on every GitHub push

---

## 🎯 Quick Deploy (Using render.yaml)

### Step 1: Push Code to GitHub

Make sure your code (including `render.yaml`) is pushed:

```bash
cd /Users/pradiptom/fcrb
git add .
git commit -m "Add Render configuration"
git push origin main
```

### Step 2: Sign Up on Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub**
4. Authorize Render to access your repositories

### Step 3: Create New Blueprint

1. From Render Dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your GitHub repository: **pradipto111/fcrb-feestracker**
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### Step 4: Review Services

Render will create:
- ✅ `fcrb-database` - PostgreSQL database
- ✅ `fcrb-backend` - Backend API service
- ✅ `fcrb-frontend` - Frontend web service

Click **"Create Services"** to deploy all at once!

### Step 5: Wait for Deployment (5-10 minutes)

Monitor the deployment:
- Database provisions first (~2 min)
- Backend builds and deploys (~3-5 min)
- Frontend builds and deploys (~3-5 min)

### Step 6: Update Frontend Environment Variable

After backend deploys:

1. Go to **fcrb-backend** service
2. Copy the URL (e.g., `https://fcrb-backend.onrender.com`)
3. Go to **fcrb-frontend** service
4. Click **"Environment"** tab
5. Edit `VITE_API_URL` to your backend URL
6. Click **"Save Changes"**
7. Frontend will auto-redeploy

### Step 7: Seed the Database

1. Go to **fcrb-backend** service
2. Click **"Shell"** tab (top right)
3. Run:
   ```bash
   npm run prisma:seed
   ```
4. Wait for completion

### Step 8: Test Your App! 🎉

1. Go to **fcrb-frontend** service
2. Click the URL at the top (e.g., `https://fcrb-frontend.onrender.com`)
3. Login with:
   - Email: `admin@feestrack.com`
   - Password: `admin123`

---

## 🔧 Manual Setup (Without render.yaml)

If you prefer manual setup or need to customize:

### 1. Create PostgreSQL Database

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `fcrb-database`
3. Database: `fees_tracker`
4. User: `fees_tracker_user`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click **"Create Database"**
8. Copy the **"Internal Database URL"**

### 2. Create Backend Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository: `pradipto111/fcrb-feestracker`
3. Configure:
   - **Name**: `fcrb-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build && npx prisma generate && npx prisma db push --accept-data-loss
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free

4. Add **Environment Variables**:
   ```
   DATABASE_URL = [paste internal database URL]
   JWT_SECRET = your-super-secret-production-key-change-this
   PORT = 4000
   NODE_ENV = production
   ```

5. Click **"Create Web Service"**

### 3. Create Frontend Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect same repository
3. Configure:
   - **Name**: `fcrb-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm run preview -- --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free

4. Add **Environment Variable**:
   ```
   VITE_API_URL = https://fcrb-backend.onrender.com
   ```
   (Replace with your actual backend URL)

5. Click **"Create Web Service"**

---

## 📝 Important Notes

### Free Tier Limitations

- ⏰ **Services sleep after 15 minutes** of inactivity
- 🐌 **First request takes 30-60 seconds** (waking up)
- 💾 **Database free for 90 days**, then $7/month
- 🔄 **750 hours/month** of runtime per service

### Keeping Services Awake (Optional)

Use a service like **UptimeRobot** or **Cron-job.org**:
1. Sign up for free
2. Add your backend URL
3. Set to ping every 14 minutes
4. Keeps your app awake during business hours

### Database Backup

⚠️ **Important**: Free database is deleted after 90 days!

**Options:**
1. Upgrade to paid plan ($7/month)
2. Export data before 90 days
3. Use another database service

---

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render auto-deploys! 🚀
```

### Disable Auto-Deploy

If you want manual control:
1. Go to service settings
2. Scroll to **"Auto-Deploy"**
3. Toggle off
4. Use **"Manual Deploy"** button when ready

---

## 🛠️ Post-Deployment Tasks

### 1. Seed Database

```bash
# In backend Shell tab
npm run prisma:seed
```

### 2. Change Default Passwords

Login and change:
- Admin password
- Coach password

### 3. Set Up Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render service → **"Settings"** → **"Custom Domain"**
3. Add your domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

### 4. Monitor Logs

- Click on service
- Go to **"Logs"** tab
- Monitor for errors

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check:**
1. Environment variables are set correctly
2. `DATABASE_URL` is the **Internal URL** (not External)
3. Build command completed successfully
4. Check logs for specific errors

**Solution:**
```bash
# In Shell tab
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

### Frontend Shows API Error

**Check:**
1. `VITE_API_URL` points to correct backend URL
2. Backend is running (check status)
3. Backend has public URL generated

**Solution:**
1. Go to frontend Environment
2. Update `VITE_API_URL`
3. Redeploy frontend

### Database Connection Failed

**Check:**
1. Database is running
2. Using **Internal Database URL** (not External)
3. Backend and database in same region

**Solution:**
1. Go to database service
2. Copy Internal Database URL
3. Update backend `DATABASE_URL`
4. Redeploy backend

### Migrations Failed

**Solution:**
```bash
# In backend Shell tab
npx prisma migrate reset --force
npx prisma migrate deploy
npm run prisma:seed
```

### App is Very Slow

**Reason:** Free tier services sleep after 15 minutes

**Solutions:**
1. Upgrade to paid plan ($7/month per service)
2. Use UptimeRobot to keep awake
3. Accept the delay (first request takes 30-60s)

---

## 💰 Cost Breakdown

### Free Tier (Current)
- Backend: Free (with sleep)
- Frontend: Free (with sleep)
- Database: Free for 90 days
- **Total: $0/month** (for 90 days)

### After 90 Days
- Backend: Free (with sleep)
- Frontend: Free (with sleep)
- Database: $7/month
- **Total: $7/month**

### Paid Tier (No Sleep)
- Backend: $7/month
- Frontend: $7/month
- Database: $7/month
- **Total: $21/month**

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Change default coach password
- [ ] Use strong `JWT_SECRET`
- [ ] Never commit `.env` files
- [ ] Enable 2FA on GitHub
- [ ] Review environment variables
- [ ] Set up database backups

---

## 📊 Monitoring

### View Logs
1. Go to service
2. Click **"Logs"** tab
3. Filter by date/time
4. Download logs if needed

### Check Metrics
1. Go to service
2. Click **"Metrics"** tab
3. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts
1. Service → **"Settings"**
2. **"Notifications"**
3. Add email for:
   - Deploy failures
   - Service crashes
   - High resource usage

---

## 🎯 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` in repository root
- [ ] Render account created
- [ ] Blueprint applied
- [ ] All services deployed successfully
- [ ] Frontend `VITE_API_URL` updated
- [ ] Database seeded
- [ ] Login tested
- [ ] All features working
- [ ] Default passwords changed
- [ ] Custom domain added (optional)

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check service logs for errors
- Review environment variables
- Verify build commands

---

## ✅ Success!

Your app should now be live at:
- **Frontend**: `https://fcrb-frontend.onrender.com`
- **Backend**: `https://fcrb-backend.onrender.com`

**Note:** First visit may take 30-60 seconds if services are asleep.

🎉 **Congratulations! Your FCRB app is deployed!** 🎉

