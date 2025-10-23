# ⚡ Quick Combined Deployment (5 Minutes)

## What's Already Done ✅

- ✅ Backend updated to serve frontend
- ✅ Static file serving configured
- ✅ React Router fallback added

---

## What You Need to Do (3 Steps)

### Step 1: Update Frontend Environment (1 minute)

Create or update `frontend/.env`:

```env
VITE_API_URL=/api
```

That's it! This tells the frontend to use the same server for API calls.

---

### Step 2: Build Frontend (2 minutes)

```bash
cd frontend
npm run build
```

This creates the `frontend/dist` folder that the backend will serve.

---

### Step 3: Deploy to Render (2 minutes)

#### Option A: Dashboard (Easiest)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **`mchanga-company`** repository
4. Fill in:
   - **Name**: `lite-kideko-aggregates`
   - **Environment**: `Node`
   - **Build**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start**: `cd backend && npm start`
   - **Plan**: `Starter` ($7/month)

5. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lite_kideko_aggregates
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://lite-kideko-aggregates.onrender.com
   ```

6. Click **"Create Web Service"**

#### Option B: Git Push (Auto-Deploy)

```bash
git add .
git commit -m "Setup combined deployment"
git push origin main
```

Then follow Option A.

---

## Testing (1 minute)

### Test 1: Frontend Loads
```bash
curl https://lite-kideko-aggregates.onrender.com
```

### Test 2: API Works
```bash
curl https://lite-kideko-aggregates.onrender.com/api/health
```

### Test 3: Browser
Visit: https://lite-kideko-aggregates.onrender.com

---

## URLs After Deployment

```
Website:  https://lite-kideko-aggregates.onrender.com
API:      https://lite-kideko-aggregates.onrender.com/api
Health:   https://lite-kideko-aggregates.onrender.com/api/health
```

---

## Checklist

- [ ] Updated `frontend/.env` with `VITE_API_URL=/api`
- [ ] Built frontend: `npm run build`
- [ ] Committed changes
- [ ] Pushed to GitHub
- [ ] Created Render Web Service
- [ ] Added environment variables
- [ ] Deployment started
- [ ] Frontend loads
- [ ] API works
- [ ] All features work

---

## Troubleshooting

### Frontend Shows 404
```bash
# Check if build succeeded
ls frontend/dist/

# If empty, rebuild
cd frontend && npm run build
```

### API Calls Fail
```bash
# Check VITE_API_URL
cat frontend/.env

# Should show: VITE_API_URL=/api
```

### Build Takes Too Long
- Render has 45-minute timeout
- If it fails, check logs in dashboard
- May need to split into separate services

---

## Cost & Performance

| Metric | Value |
|--------|-------|
| **Cost** | $7/month |
| **Setup Time** | 5 minutes |
| **Performance** | Optimized |
| **URLs** | 1 |
| **CORS** | No issues |

---

## That's It! 🎉

Your system is now deployed on Render with both frontend and backend on a single service!

**Total Time**: ~5 minutes
**Cost**: $7/month
**Performance**: Optimized

---

## Next Steps

1. ✅ Update `frontend/.env`
2. ✅ Build frontend
3. ✅ Deploy to Render
4. ✅ Test
5. ✅ Share with team

---

**Status**: ✅ Ready to deploy

Let's go! 🚀

