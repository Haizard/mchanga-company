# 🚀 Render Deployment - Quick Start

## 5-Minute Setup

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create Backend Service
1. Click **"New +"** → **"Web Service"**
2. Select **`mchanga-company`** repository
3. Fill in:
   - **Name**: `lite-kideko-aggregates-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Starter` (free)

4. Click **"Advanced"** and add environment variables:
   ```
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/lite_kideko_aggregates
   NODE_ENV = production
   CORS_ORIGIN = https://lite-kideko-aggregates-frontend.onrender.com
   ```

5. Click **"Create Web Service"**

### Step 3: Create Frontend Service
1. Click **"New +"** → **"Static Site"**
2. Select **`mchanga-company`** repository
3. Fill in:
   - **Name**: `lite-kideko-aggregates-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Click **"Advanced"** and add environment variable:
   ```
   VITE_API_URL = https://lite-kideko-aggregates-backend.onrender.com
   ```

5. Click **"Create Static Site"**

### Step 4: Wait for Deployment
- Backend deploys in ~2-3 minutes
- Frontend deploys in ~2-3 minutes
- Both services will show green "Live" status

### Step 5: Test
- **Backend**: Visit `https://lite-kideko-aggregates-backend.onrender.com/api/health`
- **Frontend**: Visit `https://lite-kideko-aggregates-frontend.onrender.com`

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lite_kideko_aggregates?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://lite-kideko-aggregates-frontend.onrender.com
```

### Frontend (.env)
```env
VITE_API_URL=https://lite-kideko-aggregates-backend.onrender.com
```

---

## MongoDB Setup (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Add to backend environment variables

---

## Deployment URLs

After deployment, you'll have:

```
Backend:  https://mchanga-backend.onrender.com
Frontend: https://mchanga-frontend.onrender.com
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Verify MONGODB_URI is correct
# Ensure MongoDB cluster is running
```

### Frontend shows blank page
```bash
# Check VITE_API_URL is set correctly
# Verify backend is running
# Check browser console for errors
```

### API calls failing
```bash
# Verify CORS_ORIGIN matches frontend URL
# Check backend logs
# Verify MongoDB connection
```

---

## Auto-Deploy

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update"
git push origin main
```

Deployment starts automatically!

---

## Monitoring

1. Go to Render dashboard
2. Click on your service
3. View:
   - **Logs**: Real-time logs
   - **Metrics**: CPU, memory, requests
   - **Events**: Deployment history

---

## Costs

- **Backend**: Free (Starter plan)
- **Frontend**: Free (Static site)
- **Database**: Free (M0 cluster)

**Total**: $0/month (free tier)

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Configure MongoDB
4. ✅ Test all features
5. ✅ Monitor performance
6. ✅ Share with team

---

**Status**: ✅ Ready to deploy!

Your system is ready for Render. Follow the steps above and you'll be live in 10 minutes! 🎉

