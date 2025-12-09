# ⚠️ CRITICAL: You MUST Update Render Dashboard Settings

## The Problem
You likely haven't updated the **Start Command** in Render's dashboard yet.

---

## 🔴 STEP-BY-STEP FIX (Follow Exactly)

### Step 1: Push Your Code
```bash
git add .
git commit -m "Add serve configuration"
git push
```

### Step 2: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your service (hackathon-management)

### Step 3: Update Settings
Click **"Settings"** tab, then scroll down and change:

**Build Command:**
```
npm install && npm run build
```

**Start Command:** (CHANGE THIS!)
```
npx serve -s dist -l $PORT
```

**Publish Directory:** (DELETE THIS FIELD - leave it empty!)
```
(leave empty or delete)
```

### Step 4: Add Environment Variables
Still in Settings → Environment:
```
NODE_VERSION = 18
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_key
```

### Step 5: Save and Deploy
1. Click **"Save Changes"** at the bottom
2. Go to **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Verification Checklist

Before deploying, verify in Render dashboard:
- [ ] Start Command = `npx serve -s dist -l $PORT`
- [ ] Build Command = `npm install && npm run build`
- [ ] Publish Directory = (empty)
- [ ] NODE_VERSION = 18
- [ ] Both Supabase env vars are set

---

## 🎯 Common Mistakes

### ❌ WRONG:
- Start Command: (empty)
- Publish Directory: `dist`
- Service Type: Static Site

### ✅ CORRECT:
- Start Command: `npx serve -s dist -l $PORT`
- Publish Directory: (empty)
- Service Type: Web Service

---

## 🔍 How to Check if It's Working

After deployment, check Render logs for:
```
✓ Serving!
- Local:    http://localhost:10000
- Network:  http://0.0.0.0:10000
```

If you see this, it's working! Test by:
1. Visit your URL
2. Go to /admin
3. Reload the page
4. Should work with NO 404!

---

## 📸 Screenshot Guide

If still having issues, send me a screenshot of:
1. Render → Settings → Build & Deploy section
2. Render → Environment Variables section
3. Render → Deploy logs (after deployment)

---

## 🆘 Alternative: Use Netlify Instead

If Render is too complicated, Netlify works with just the `_redirects` file:

1. Sign up at https://netlify.com
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. That's it! The `_redirects` file will work automatically.

Netlify is much simpler for SPAs.
