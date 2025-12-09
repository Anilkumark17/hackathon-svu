# Render Deployment Configuration

## Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 or higher

## Environment Variables
Add these in Render dashboard:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## SPA Routing Fix

The `_redirects` file in the `public` folder fixes the 404 issue when reloading pages.

### How it works:
- All routes (`/*`) are redirected to `/index.html`
- Returns status code `200` (not a redirect)
- React Router handles the actual routing client-side

### Files Created:
1. `public/_redirects` - Tells Render to serve index.html for all routes

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push
   ```

2. **In Render Dashboard:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add environment variables

3. **Deploy**
   - Render will automatically build and deploy
   - The `_redirects` file will be copied to `dist` folder
   - All routes will work correctly!

## Testing
After deployment:
- Visit any route directly (e.g., `/admin`, `/dashboard`)
- Reload the page
- Should work without 404 errors!

## Troubleshooting

If still getting 404:
1. Check `dist` folder has `_redirects` file after build
2. Verify Publish Directory is set to `dist`
3. Check Render build logs for errors
4. Ensure environment variables are set correctly
