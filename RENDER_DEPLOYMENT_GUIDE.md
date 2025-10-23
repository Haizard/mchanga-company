# 🚀 Render Deployment Guide - Lite Kideko Fleet Management System

## Prerequisites

Before deploying to Render, ensure you have:
- ✅ GitHub account with repository pushed
- ✅ Render account (https://render.com)
- ✅ MongoDB Atlas account (for database)
- ✅ Environment variables configured

---

## Step 1: Prepare Environment Variables

### Backend Environment Variables
Create `.env` file in `backend/` directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mchanga?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Optional: API Keys
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

### Frontend Environment Variables
Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Step 2: Create Render Services

### 2.1 Deploy Backend Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub Repository**:
   - Select your `mchanga-company` repository
   - Click "Connect"

4. **Configure Backend Service**:
   - **Name**: `mchanga-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Starter` (free tier) or `Standard`

5. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add all variables from `.env` file

6. **Deploy**: Click "Create Web Service"

### 2.2 Deploy Frontend Service

1. **Click "New +"** → **"Static Site"**
2. **Connect GitHub Repository**:
   - Select your `mchanga-company` repository
   - Click "Connect"

3. **Configure Frontend Service**:
   - **Name**: `mchanga-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Free` or `Starter`

4. **Add Environment Variables**:
   - **VITE_API_URL**: `https://mchanga-backend.onrender.com`

5. **Deploy**: Click "Create Static Site"

---

## Step 3: Configure MongoDB Atlas

### 3.1 Create MongoDB Cluster

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a new cluster**:
   - Choose free tier (M0)
   - Select region close to your users
   - Click "Create Cluster"

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Click "Add User"

4. **Whitelist IP Address**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials

### 3.2 Update Backend Environment

Add MongoDB URI to Render backend service:
- Go to backend service settings
- Add environment variable: `MONGODB_URI=<your-connection-string>`

---

## Step 4: Update CORS Settings

### Backend CORS Configuration

Update `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## Step 5: Configure Build Scripts

### Backend package.json

Ensure `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Frontend package.json

Ensure `frontend/package.json` has:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## Step 6: Deploy

### Automatic Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Render Auto-Deploy**:
   - Render automatically deploys when you push to main branch
   - Check deployment status in Render dashboard

### Manual Deployment

1. **Go to Render Dashboard**
2. **Select your service**
3. **Click "Manual Deploy"** → **"Deploy latest commit"**

---

## Step 7: Verify Deployment

### Check Backend

```bash
curl https://mchanga-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Check Frontend

Visit: `https://mchanga-frontend.onrender.com`

Expected: Fleet management dashboard loads

### Check API Endpoints

```bash
# Get vehicles
curl https://mchanga-backend.onrender.com/api/vehicles

# Get trips
curl https://mchanga-backend.onrender.com/api/trips

# Get reports
curl https://mchanga-backend.onrender.com/api/reports/trip
```

---

## Step 8: Configure Custom Domain (Optional)

1. **Go to service settings**
2. **Click "Custom Domain"**
3. **Enter your domain** (e.g., `api.mchanga.com`)
4. **Update DNS records** with provided CNAME
5. **Wait for SSL certificate** (usually 5-10 minutes)

---

## Troubleshooting

### Backend Not Starting

**Error**: `Cannot find module`
- **Solution**: Check `package.json` has all dependencies
- Run: `npm install` locally first

**Error**: `MongoDB connection failed`
- **Solution**: Check `MONGODB_URI` environment variable
- Verify IP whitelist in MongoDB Atlas

### Frontend Not Building

**Error**: `Build failed`
- **Solution**: Check `npm run build` works locally
- Verify all imports are correct

**Error**: `API calls failing`
- **Solution**: Check `VITE_API_URL` environment variable
- Verify backend is running

### Slow Performance

**Solution**: 
- Upgrade to paid plan
- Enable caching
- Optimize database queries

---

## Environment Variables Checklist

### Backend
- ✅ `MONGODB_URI` - MongoDB connection string
- ✅ `PORT` - Server port (default: 5000)
- ✅ `NODE_ENV` - Set to `production`
- ✅ `CORS_ORIGIN` - Frontend URL

### Frontend
- ✅ `VITE_API_URL` - Backend API URL

---

## Deployment Checklist

- ✅ GitHub repository created and pushed
- ✅ MongoDB Atlas cluster created
- ✅ Render account created
- ✅ Backend service configured
- ✅ Frontend service configured
- ✅ Environment variables set
- ✅ CORS configured
- ✅ Build scripts verified
- ✅ Deployment successful
- ✅ API endpoints tested
- ✅ Frontend loads correctly

---

## Monitoring

### View Logs

1. **Go to service**
2. **Click "Logs"**
3. **View real-time logs**

### Set Up Alerts

1. **Go to service settings**
2. **Click "Notifications"**
3. **Enable email alerts**

### Monitor Performance

1. **Go to service**
2. **Click "Metrics"**
3. **View CPU, memory, requests**

---

## Costs

### Free Tier
- Backend: $0/month (spins down after 15 min inactivity)
- Frontend: $0/month
- MongoDB: $0/month (M0 cluster)

### Paid Tier
- Backend: $7/month (Starter)
- Frontend: $7/month (Starter)
- MongoDB: $0/month (M0 cluster)

---

## Next Steps

1. Deploy backend service
2. Deploy frontend service
3. Configure MongoDB
4. Test all endpoints
5. Monitor performance
6. Set up custom domain (optional)
7. Enable auto-scaling (optional)

---

**Status**: ✅ Ready for Render deployment

Your Lite Kideko Fleet Management System is ready to be deployed on Render! 🚀

