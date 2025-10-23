# 🚀 Combined Deployment Setup Guide

## What's Been Done

✅ **Backend Updated** - `backend/server.js` now serves the frontend static files

---

## What You Need to Do

### Step 1: Update Frontend Environment Variables

Update `frontend/.env` (or create if doesn't exist):

```env
VITE_API_URL=/api
```

This tells the frontend to use relative API URLs (same server).

---

### Step 2: Check Frontend API Configuration

Find where your frontend makes API calls. Usually in:
- `frontend/src/api/axios.ts` or
- `frontend/src/api/client.ts` or
- `frontend/src/services/api.ts`

Make sure it uses `VITE_API_URL`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export default api;
```

---

### Step 3: Build Frontend

```bash
cd frontend
npm run build
```

This creates the `frontend/dist` folder that the backend will serve.

---

### Step 4: Test Locally

```bash
cd backend
npm start
```

Then visit: http://localhost:5000

You should see:
- ✅ Frontend loads
- ✅ API calls work
- ✅ All features work

---

### Step 5: Deploy to Render

#### Option A: Using Render Dashboard

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **`mchanga-company`** repository
4. Fill in:
   - **Name**: `lite-kideko-aggregates`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start Command**: 
     ```
     cd backend && npm start
     ```
   - **Plan**: `Starter` ($7/month)

5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lite_kideko_aggregates
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://lite-kideko-aggregates.onrender.com
   ```

6. Click **"Create Web Service"**

#### Option B: Using render.yaml

Update `render.yaml`:

```yaml
services:
  - type: web
    name: lite-kideko-aggregates
    env: node
    plan: starter
    buildCommand: cd frontend && npm install && npm run build && cd ../backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        fromDatabase:
          name: lite-kideko-aggregates-db
          property: connectionString
      - key: CORS_ORIGIN
        value: https://lite-kideko-aggregates.onrender.com
    healthCheckPath: /api/health
    autoDeploy: true

databases:
  - name: lite-kideko-aggregates-db
    databaseName: lite_kideko_aggregates
    user: lite_kideko_user
    plan: free
```

---

## Deployment URLs

After deployment:

```
Website:  https://lite-kideko-aggregates.onrender.com
API:      https://lite-kideko-aggregates.onrender.com/api
Health:   https://lite-kideko-aggregates.onrender.com/api/health
```

---

## Testing Combined Deployment

### Test 1: Frontend Loads
```bash
curl https://lite-kideko-aggregates.onrender.com
```
Should return HTML (index.html)

### Test 2: API Works
```bash
curl https://lite-kideko-aggregates.onrender.com/api/health
```
Should return JSON with status "ok"

### Test 3: Frontend in Browser
Visit: https://lite-kideko-aggregates.onrender.com

Should see:
- ✅ Dashboard loads
- ✅ All pages work
- ✅ API calls succeed
- ✅ Real-time updates work

---

## Troubleshooting

### Issue: Frontend Shows 404
**Solution**: 
- Check `frontend/dist` folder exists
- Verify build command ran: `npm run build`
- Check logs in Render dashboard

### Issue: API Calls Fail
**Solution**:
- Check `VITE_API_URL=/api` in frontend
- Verify backend is running
- Check MongoDB connection
- Check CORS_ORIGIN in backend

### Issue: Build Takes Too Long
**Solution**:
- Render has 45-minute timeout
- If build takes longer, split into separate services
- Or optimize dependencies

### Issue: Static Files Not Served
**Solution**:
- Ensure `frontend/dist` folder exists
- Check path in `backend/server.js`
- Verify build completed successfully

---

## File Changes Summary

### Modified Files

1. **backend/server.js**
   - Added `path` and `fileURLToPath` imports
   - Added `__dirname` setup for ES modules
   - Added static file serving for frontend
   - Added fallback route for React Router
   - Updated console logs

2. **frontend/.env** (create/update)
   - Set `VITE_API_URL=/api`

### No Changes Needed

- ✅ `backend/package.json` - Already correct
- ✅ `frontend/package.json` - Already correct
- ✅ All API routes - Already correct
- ✅ All components - Already correct

---

## Deployment Checklist

- [ ] Updated `frontend/.env` with `VITE_API_URL=/api`
- [ ] Verified frontend API configuration uses `VITE_API_URL`
- [ ] Built frontend: `npm run build`
- [ ] Tested locally: `npm start` in backend
- [ ] Verified frontend loads at http://localhost:5000
- [ ] Verified API works at http://localhost:5000/api/health
- [ ] Committed changes to git
- [ ] Pushed to GitHub
- [ ] Created Render Web Service
- [ ] Added environment variables
- [ ] Deployment started
- [ ] Verified frontend loads at https://lite-kideko-aggregates.onrender.com
- [ ] Verified API works at https://lite-kideko-aggregates.onrender.com/api/health
- [ ] Tested all features

---

## Cost Comparison

| Option | Cost | Setup |
|--------|------|-------|
| Combined | $7/month | Simpler |
| Separate | $14/month | More complex |

**Savings**: $7/month with combined deployment!

---

## Performance

- **Combined**: Faster (same server, no cross-origin)
- **Separate**: Slightly slower (cross-origin requests)

---

## Next Steps

1. ✅ Update `frontend/.env`
2. ✅ Build frontend: `npm run build`
3. ✅ Test locally
4. ✅ Commit and push to GitHub
5. ✅ Deploy to Render
6. ✅ Test in production

---

**Status**: ✅ Ready for combined deployment

Your system is now configured for combined deployment! 🚀

**Deployment Time**: ~5-10 minutes
**Cost**: $7/month
**Performance**: Optimized

