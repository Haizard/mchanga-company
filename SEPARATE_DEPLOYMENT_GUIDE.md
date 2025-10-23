# 🚀 Separate Deployment Guide - Frontend & Backend

## Overview

Your project is now configured for **separate deployment**:
- **Backend**: Independent Node.js web service
- **Frontend**: Independent static site
- **Database**: MongoDB Atlas (shared between services)

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend Service             │
│     (mchanga-frontend.onrender.com)    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        React App                │   │
│  │     (Static Files)              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    │ API Calls
                    ▼
┌─────────────────────────────────────────┐
│           Backend Service              │
│     (mchanga-backend.onrender.com)     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Express Server           │   │
│  │     + Socket.IO + APIs          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         MongoDB Atlas                   │
│       (Cloud Database)                  │
└─────────────────────────────────────────┘
```

## Benefits of Separate Deployment

✅ **Independent Scaling**: Scale frontend and backend separately
✅ **Technology Flexibility**: Use different hosting optimizations
✅ **Faster Frontend**: Static site hosting with CDN
✅ **Better Caching**: Frontend assets cached globally
✅ **Easier Debugging**: Separate logs and monitoring
✅ **Team Workflow**: Frontend and backend teams can deploy independently

## Deployment URLs

```
Frontend: https://mchanga-frontend.onrender.com
Backend:  https://mchanga-backend.onrender.com
API:      https://mchanga-backend.onrender.com/api
Health:   https://mchanga-backend.onrender.com/api/health
```

## Changes Made

### ✅ Backend Changes (`backend/server.js`)
- Removed static file serving (no longer needed)
- Updated CORS to allow frontend domain
- Simplified console logging
- Removed path/fileURLToPath imports

### ✅ Frontend Changes
- Updated `frontend/.env` with production backend URL
- Created `frontend/.env.local` for local development
- Updated `vite.config.ts` for static site deployment

### ✅ Configuration Files
- Updated `render.yaml` with separate services
- Configured environment variables for both services

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

#### Step 1: Deploy Backend Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mchanga-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm ci`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Starter` ($7/month)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=[Your MongoDB connection string]
   CORS_ORIGIN=https://mchanga-frontend.onrender.com
   FRONTEND_URL=https://mchanga-frontend.onrender.com
   ```

6. Click **"Create Web Service"**

#### Step 2: Deploy Frontend Service
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `mchanga-frontend`
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://mchanga-backend.onrender.com/api
   ```

5. Click **"Create Static Site"**

### Option 2: Using render.yaml (Advanced)

1. Push your updated `render.yaml` to GitHub
2. Go to Render Dashboard
3. Click **"New +"** → **"Blueprint"**
4. Connect repository and select `render.yaml`
5. Review and deploy both services

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
# API calls proxied to localhost:5000
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local for development)
```env
VITE_API_URL=http://localhost:5000/api
```

### Frontend (.env for production)
```env
VITE_API_URL=https://mchanga-backend.onrender.com/api
```

## Testing

### Test Backend
```bash
curl https://mchanga-backend.onrender.com/api/health
```

### Test Frontend
```bash
curl https://mchanga-frontend.onrender.com
```

## Costs

- **Backend Service**: $7/month (Starter plan)
- **Frontend Service**: $0/month (Free static hosting)
- **Database**: $0/month (MongoDB Atlas free tier)
- **Total**: $7/month

## Next Steps

1. Deploy backend service first
2. Wait for backend to be live
3. Deploy frontend service
4. Test both services
5. Update DNS if using custom domain

## Troubleshooting

### CORS Errors
- Check `CORS_ORIGIN` environment variable in backend
- Ensure frontend URL matches exactly

### API Connection Issues
- Verify `VITE_API_URL` in frontend environment
- Check backend service is running and healthy

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

---

**Status**: ✅ Ready for separate deployment
**Estimated Setup Time**: 10-15 minutes
