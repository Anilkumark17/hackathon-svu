# Frontend Not Updating - Quick Fix Guide

## Issue
Changes made to files aren't showing in the browser.

## Solutions (Try in order)

### 1. Hard Refresh Browser (Quickest)
**Windows/Linux:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

This clears cache and forces reload.

---

### 2. Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

### 3. Check Dev Server
The dev server should show:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

If you don't see this, the server might have crashed.

---

### 4. Restart Dev Server
1. In terminal, press `Ctrl + C` to stop the server
2. Run `npm run dev` again
3. Wait for "ready" message
4. Open http://localhost:5174 in browser

---

### 5. Check for Errors
If the browser screen is blank or shows errors:
1. Open browser console (F12)
2. Look for red error messages
3. Share the error messages with me

---

## What Was Changed

### Files Modified:
1. ✅ `src/index.css` - Added CSS for dropdown options (lines 238-250)
2. ✅ `src/components/ProblemSelector.jsx` - Added value="" and emojis to dropdown (line 252)
3. ✅ `src/pages/AdminDashboard.jsx` - Added edit/delete buttons and modal

### To See Changes:
1. **Priority Dropdown**: Go to student dashboard → should see 🥇🥈🥉 emoji options with better visibility
2. **Edit/Delete Buttons**: Go to admin dashboard → should see pencil ✏️ and trash 🗑️ icons on problem cards

---

## Test Steps

### For Admin (Edit/Delete):
1. Login as `anilkumarkondeboina@gmail.com`
2. Go to Admin Dashboard
3. Scroll to "Manage Problem Statements" section
4. You should see small pencil and trash icons on each problem card
5. Click pencil → Edit modal should open
6. Click trash → Confirmation dialog should appear

### For Student (Priority Dropdown):
1. Login as student
2. Go to Dashboard
3. If project requests are open, you'll see problem cards
4. Each card should have dropdown with:
   - "Select Priority..."
   - 🥇 1st Priority
   - 🥈 2nd Priority
   - 🥉 3rd Priority
5. Text should be clearly visible (white on dark background)

---

## Still Not Working?

If after hard refresh you still don't see changes:

1. Check the terminal running `npm run dev` for errors
2. Close browser completely and reopen
3. Try in incognito/private mode
4. Clear all site data:
   - F12 → Application → Clear Storage → Clear site data

Let me know what you see!
