# 🔧 Render Setup - Commands & Configuration

## Pre-Deployment Commands

### 1. Verify Backend Builds Locally
```bash
cd backend
npm install
npm start
# Should see: "Server running on port 5000"
```

### 2. Verify Frontend Builds Locally
```bash
cd frontend
npm install
npm run build
# Should see: "dist/" folder created
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get vehicles
curl http://localhost:5000/api/vehicles

# Get trips
curl http://localhost:5000/api/trips
```

---

## Render Configuration

### Backend Service Configuration

**Service Type**: Web Service
**Runtime**: Node

**Build Settings**:
```
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

**Environment Variables**:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lite_kideko_aggregates?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://lite-kideko-aggregates-frontend.onrender.com
```

**Health Check**:
```
Path: /api/health
```

---

### Frontend Service Configuration

**Service Type**: Static Site
**Runtime**: Static

**Build Settings**:
```
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

**Environment Variables**:
```
VITE_API_URL=https://lite-kideko-aggregates-backend.onrender.com
```

---

## MongoDB Atlas Setup Commands

### 1. Create Connection String
```
mongodb+srv://username:password@cluster-name.mongodb.net/mchanga?retryWrites=true&w=majority
```

### 2. Replace Placeholders
```
username = your_database_user
password = your_database_password
cluster-name = your_cluster_name
```

### 3. Example Connection String
```
mongodb+srv://mchanga_user:hrz123@cluster0.8mawhgz.mongodb.net/mchanga?retryWrites=true&w=majority
```

---

## Deployment Commands

### Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Render Auto-Deploy
Once pushed to GitHub, Render automatically deploys:
1. Detects changes on main branch
2. Triggers build process
3. Deploys new version
4. Shows deployment status

---

## Verification Commands

### Test Backend Health
```bash
curl https://lite-kideko-aggregates-backend.onrender.com/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### Test API Endpoints
```bash
# Get vehicles
curl https://lite-kideko-aggregates-backend.onrender.com/api/vehicles

# Get trips
curl https://lite-kideko-aggregates-backend.onrender.com/api/trips

# Get reports
curl https://lite-kideko-aggregates-backend.onrender.com/api/reports/trip
```

### Test Frontend
```bash
# Open in browser
https://lite-kideko-aggregates-frontend.onrender.com
```

---

## Environment Variables Reference

### Backend Variables

| Variable | Value | Example |
|----------|-------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/lite_kideko_aggregates` |
| NODE_ENV | Environment | `production` |
| PORT | Server port | `5000` |
| CORS_ORIGIN | Frontend URL | `https://lite-kideko-aggregates-frontend.onrender.com` |

### Frontend Variables

| Variable | Value | Example |
|----------|-------|---------|
| VITE_API_URL | Backend URL | `https://lite-kideko-aggregates-backend.onrender.com` |

---

## Build Scripts

### Backend package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles"
  }
}
```

### Frontend package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest"
  }
}
```

---

## Troubleshooting Commands

### Check Backend Logs
```bash
# In Render dashboard:
1. Select mchanga-backend service
2. Click "Logs"
3. View real-time logs
```

### Check Frontend Build
```bash
# In Render dashboard:
1. Select mchanga-frontend service
2. Click "Logs"
3. View build output
```

### Restart Service
```bash
# In Render dashboard:
1. Select service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
```

### View Metrics
```bash
# In Render dashboard:
1. Select service
2. Click "Metrics"
3. View CPU, memory, requests
```

---

## MongoDB Commands

### Create Database User
```bash
# In MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Set username and password
4. Click "Add User"
```

### Whitelist IP
```bash
# In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere"
4. Click "Confirm"
```

### Get Connection String
```bash
# In MongoDB Atlas:
1. Click "Connect" on cluster
2. Select "Connect your application"
3. Copy connection string
4. Replace username and password
```

---

## Git Commands

### Initial Setup
```bash
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Haizard/mchanga-company.git
git push -u origin main
```

### Update and Push
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## Render CLI Commands (Optional)

### Install Render CLI
```bash
npm install -g @render-oss/render-cli
```

### Login to Render
```bash
render login
```

### Deploy Service
```bash
render deploy --service mchanga-backend
render deploy --service mchanga-frontend
```

### View Logs
```bash
render logs --service mchanga-backend
render logs --service mchanga-frontend
```

---

## Performance Optimization

### Enable Caching
```bash
# In Render dashboard:
1. Select service
2. Go to "Settings"
3. Enable "Cache"
```

### Set Resource Limits
```bash
# In Render dashboard:
1. Select service
2. Go to "Settings"
3. Set CPU and memory limits
```

### Enable Auto-Scaling
```bash
# In Render dashboard:
1. Select service
2. Go to "Settings"
3. Enable "Auto-scaling"
4. Set min/max instances
```

---

## Monitoring Setup

### Enable Notifications
```bash
# In Render dashboard:
1. Select service
2. Go to "Settings"
3. Click "Notifications"
4. Enable email alerts
```

### Set Up Monitoring
```bash
# In Render dashboard:
1. Select service
2. Click "Metrics"
3. View CPU, memory, requests
4. Set up custom alerts
```

---

## Deployment Checklist

- ✅ Backend builds locally
- ✅ Frontend builds locally
- ✅ API endpoints work
- ✅ Code pushed to GitHub
- ✅ MongoDB cluster created
- ✅ Environment variables set
- ✅ Backend service deployed
- ✅ Frontend service deployed
- ✅ Health check passes
- ✅ API endpoints accessible
- ✅ Frontend loads
- ✅ Features working

---

**Status**: ✅ Ready to deploy

Follow these commands and configurations to deploy your system on Render! 🚀

