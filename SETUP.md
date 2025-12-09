# 🚀 Quick Setup Guide

## Step 1: Set Up Supabase Database

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: fljsxprfzadcxgeprbut
3. **Open SQL Editor**: Click on "SQL Editor" in the left sidebar
4. **Execute Schema**:
   - Open the `database-schema.sql` file in this project
   - Copy ALL the SQL content
   - Paste it into the Supabase SQL Editor  
   - Click "Run" to execute
   - ✅ This will create all tables, policies, indexes, and sample problem statements

## Step 2: Enable Email Auth in Supabase

1. Go to **Authentication** > **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates if needed (optional)

## Step 3: Run the Application

The development server is already running at: **http://localhost:5174**

If not running, execute:
```bash
npm run dev
```

## Step 4: Test the Application

### Admin Account (Pre-configured):

**Email:** anilkumarkondeboina@gmail.com  
**Password:** Anil1678

This account automatically gets admin privileges. Use these credentials to:
1. Sign in at http://localhost:5174
2. Access the admin dashboard
3. Manage the hackathon event

### Create Student Accounts:
1. Sign up with any other email (e.g., `student@test.com`)
2. Password: anything (minimum 6 characters)
3. You'll be assigned student role

### Admin Workflow:
1. Sign in as admin
2. Go to Admin Dashboard (`/admin`)
3. Click "Release Project Requests"
4. Click "Start Hackathon" (starts 72-hour timer)
5. Click "Release Submissions"
6. Monitor team allocations and submissions

### Student Workflow:
1. Sign in as student
2. Register your team with:
   - Team name
   - Leader name and roll number
   - Two teammate roll numbers
3. Select a problem (first 4 teams get FCFS allocation)
4. Submit GitHub repo and Loom video URLs
5. Watch the countdown timer!

## 🎨 Features to Test

- ✅ Glassmorphism UI effects
- ✅ Smooth animations and transitions
- ✅ Real-time countdown timer
- ✅ FCFS problem allocation (first 4 teams)
- ✅ Waitlist for remaining teams
- ✅ Roll number validation (no duplicates)
- ✅ Admin controls with real-time updates
- ✅ Toast notifications

## 📝 Important Notes

- **Admin Role**: Emails containing "admin" get admin role automatically
- **Team Size**: Fixed at 3 members (1 leader + 2 teammates)
- **FCFS Limit**: First 4 teams per problem get immediate allocation
- **Timer**: 72 hours from when admin clicks "Start Hackathon"
- **Sample Problems**: 6 pre-loaded problem statements in database

## 🔥 Next Steps

1. **Customize**: Edit problem statements in Supabase dashboard
2. **Deploy**: Run `npm run build` for production build
3. **Host**: Deploy to Vercel, Netlify, or any static hosting
4. **Database**: Your Supabase project is already configured

---

**You're all set!** 🎉 The platform is ready to manage your 72-hour hackathon.
