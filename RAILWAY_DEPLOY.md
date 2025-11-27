# Quick Railway Deployment Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Prepare Your Code (2 minutes)

1. Make sure all changes are committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Set Up Railway (3 minutes)

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your **fcrb-fees-management** repository

### Step 3: Add Database (1 minute)

1. In your Railway project dashboard
2. Click **"+ New"**
3. Select **"Database"**
4. Choose **"PostgreSQL"**
5. Wait for it to provision (30 seconds)

### Step 4: Configure Backend (2 minutes)

1. Click on your **backend service** (it auto-detects from repo)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add:

   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   JWT_SECRET = your-super-secret-production-key-here
   PORT = 4000
   NODE_ENV = production
   ```

4. Go to **"Settings"** tab
5. Under **"Build & Deploy"**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

6. Click **"Deploy"**

### Step 5: Configure Frontend (2 minutes)

1. Click **"+ New"** in your project
2. Select **"GitHub Repo"** (same repository)
3. Go to **"Variables"** tab
4. Add:
   ```
   VITE_API_URL = https://your-backend-service.railway.app
   ```
   (Get this URL from backend service → Settings → Networking → Generate Domain)

5. Go to **"Settings"** tab
6. Under **"Build & Deploy"**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

7. Click **"Deploy"**

### Step 6: Generate Public URLs (1 minute)

1. Click on **backend service**
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL

5. Repeat for **frontend service**

6. Go back to **frontend Variables** and update `VITE_API_URL` with the backend URL

### Step 7: Seed Database (1 minute)

1. Click on **backend service**
2. Click the **"..."** menu (top right)
3. Select **"Run Command"**
4. Type: `npm run prisma:seed`
5. Press Enter

### Step 8: Test Your App! 🎉

1. Visit your frontend URL
2. Login with:
   - Email: `admin@feestrack.com`
   - Password: `admin123`

---

## 📝 Environment Variables Quick Reference

### Backend Variables:
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
JWT_SECRET = your-production-secret-key
PORT = 4000
NODE_ENV = production
```

### Frontend Variables:
```
VITE_API_URL = https://your-backend.railway.app
```

---

## 🔧 Common Issues & Fixes

### Issue: Build Failed

**Solution:**
- Check the logs in Railway
- Verify `package.json` has correct scripts
- Make sure all dependencies are in `dependencies`, not `devDependencies`

### Issue: Database Connection Error

**Solution:**
- Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Make sure PostgreSQL service is running
- Check backend logs for specific error

### Issue: Frontend Can't Reach Backend

**Solution:**
- Verify `VITE_API_URL` is correct
- Make sure backend has a public domain generated
- Check backend is deployed and running

### Issue: Migrations Not Running

**Solution:**
- Go to backend service → "..." → "Run Command"
- Run: `npx prisma migrate deploy`
- Then run: `npm run prisma:seed`

---

## 💡 Pro Tips

1. **Auto-Deploy**: Railway automatically redeploys when you push to GitHub
2. **Logs**: Click on service → "Deployments" → Click latest → View logs
3. **Database Access**: Click PostgreSQL → "Data" to view tables
4. **Custom Domain**: Settings → Networking → Add custom domain
5. **Environment Sync**: Use Railway CLI to sync env vars locally

---

## 📊 Monitor Your Usage

1. Go to Railway dashboard
2. Click on your project
3. View **"Usage"** tab
4. Track your $5 monthly credit

**Typical usage:**
- Small app: $2-3/month
- Medium traffic: $4-5/month
- If exceeded: App pauses until next month

---

## 🎯 Next Steps After Deployment

1. ✅ Change default admin password
2. ✅ Change default coach password
3. ✅ Test all features
4. ✅ Add custom domain (optional)
5. ✅ Set up monitoring
6. ✅ Share with users!

---

## 🆘 Need Help?

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check logs in Railway dashboard
- Review error messages carefully

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Frontend environment variables set
- [ ] Frontend deployed successfully
- [ ] Public domains generated
- [ ] Database seeded
- [ ] Login works
- [ ] All features tested

**You're live! 🚀**

