# 🚀 Render Deployment - Combined (Backend + Frontend Together)

## Option: Host Both on Single Web Service

Instead of deploying backend and frontend separately, you can host both on a single Render Web Service!

---

## Architecture

```
┌─────────────────────────────────────────┐
│      Render Web Service                 │
│  (Node.js + Express + React)            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Backend (Express.js)            │  │
│  │  - API routes                    │  │
│  │  - WebSocket                     │  │
│  │  - MongoDB connection            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Frontend (React - Static)       │  │
│  │  - Served from /dist folder      │  │
│  │  - Automatically redirects to    │  │
│  │    backend for API calls         │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      MongoDB Atlas                      │
│      (Cloud Database)                   │
└─────────────────────────────────────────┘
```

---

## Step 1: Modify Backend Server

Update `backend/server.js` to serve the frontend:

```javascript
// At the end of server.js, before listening:

// Serve static files from frontend/dist
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
```

---

## Step 2: Update Frontend API URL

Update `frontend/.env`:

```env
VITE_API_URL=/api
```

Or update `frontend/src/api/axios.ts` (or wherever you configure axios):

```typescript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  timeout: 10000,
});
```

This way, API calls go to `/api` which is on the same server.

---

## Step 3: Create Render Web Service

### Step 3.1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**

### Step 3.2: Connect GitHub
1. Select **`mchanga-company`** repository
2. Click **"Connect"**

### Step 3.3: Configure Service

**Name**: `lite-kideko-aggregates`

**Environment**: `Node`

**Build Command**:
```bash
cd frontend && npm install && npm run build && cd ../backend && npm install
```

**Start Command**:
```bash
cd backend && npm start
```

**Plan**: `Starter` ($7/month) or `Standard` ($25/month)

### Step 3.4: Add Environment Variables

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lite_kideko_aggregates
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://lite-kideko-aggregates.onrender.com
```

### Step 3.5: Deploy

Click **"Create Web Service"**

---

## Step 4: Configure MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Add to Render environment variables

---

## Deployment URLs

After deployment:

```
Website: https://lite-kideko-aggregates.onrender.com
API:     https://lite-kideko-aggregates.onrender.com/api
Health:  https://lite-kideko-aggregates.onrender.com/api/health
```

---

## Advantages of Combined Deployment

✅ **Single URL** - No CORS issues
✅ **Cheaper** - One service instead of two ($7/month vs $14/month)
✅ **Simpler** - Easier to manage
✅ **Faster** - No cross-origin requests
✅ **Better Performance** - Same server, no network latency

---

## Disadvantages of Combined Deployment

❌ **Scaling** - Can't scale frontend and backend independently
❌ **Maintenance** - Restart affects both
❌ **Separation** - Less modular architecture

---

## Comparison: Combined vs Separate

| Feature | Combined | Separate |
|---------|----------|----------|
| Cost | $7/month | $14/month |
| URLs | 1 | 2 |
| CORS | No issues | Need config |
| Scaling | Together | Independent |
| Maintenance | Simpler | More complex |
| Performance | Faster | Slightly slower |

---

## Testing Combined Deployment

### Test Backend
```bash
curl https://lite-kideko-aggregates.onrender.com/api/health
```

### Test Frontend
```bash
# Open in browser
https://lite-kideko-aggregates.onrender.com
```

### Test API from Frontend
1. Open browser console
2. Check network tab
3. API calls should go to `/api/*`

---

## Troubleshooting

### Frontend Shows 404
- Check `frontend/dist` folder exists
- Verify build command ran successfully
- Check logs in Render dashboard

### API Calls Fail
- Check `VITE_API_URL=/api` in frontend
- Verify backend is running
- Check MongoDB connection

### Build Takes Too Long
- Render has 45-minute timeout
- If build takes longer, split into separate services

---

## Migration from Separate to Combined

If you already deployed separately:

1. Delete frontend static site from Render
2. Update backend server.js to serve frontend
3. Update frontend .env to use `/api`
4. Rebuild frontend: `npm run build`
5. Push to GitHub
6. Render auto-deploys

---

## Recommendation

**For this project, I recommend COMBINED deployment because:**

1. ✅ Simpler setup
2. ✅ Lower cost ($7/month vs $14/month)
3. ✅ No CORS issues
4. ✅ Better performance
5. ✅ Easier to manage

---

## Quick Start (Combined)

### 1. Update Backend Server
Add static file serving to `backend/server.js`

### 2. Update Frontend .env
```env
VITE_API_URL=/api
```

### 3. Build Frontend
```bash
cd frontend && npm run build
```

### 4. Create Render Service
- Name: `lite-kideko-aggregates`
- Build: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- Start: `cd backend && npm start`
- Environment variables: MONGODB_URI, NODE_ENV, PORT, CORS_ORIGIN

### 5. Deploy
Click "Create Web Service"

### 6. Test
Visit: https://lite-kideko-aggregates.onrender.com

---

## Files to Modify

1. **backend/server.js** - Add static file serving
2. **frontend/.env** - Set VITE_API_URL=/api
3. **render.yaml** - Update build/start commands (optional)

---

**Status**: ✅ Ready for combined deployment

Choose this option for simplicity and cost savings! 🚀

