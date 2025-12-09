# 🚀 72-Hour Hackathon Management Platform

A comprehensive full-stack web application for managing 72-hour hackathons with real-time team registration, problem allocation, countdown timers, and submission tracking.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)

## ✨ Features

### 👨‍💼 Admin Dashboard
- **📊 Real-time Statistics**: Live tracking of teams, problems, allocations, and submissions
- **⏱️ Timer Controls**: Start, restart, and stop 72-hour hackathon countdown
- **📝 Problem Management**: Add, edit, and delete problem statements with capacity limits
- **🎯 Project Request Control**: Enable/disable team problem selection
- **📤 Submission Management**: Open/close submissions and view all team submissions
- **🎲 Random Allocation**: Automatically allocate waitlisted teams to available problems
- **👥 Team Overview**: View all registered teams and their allocations

### 👨‍🎓 Student Dashboard
- **📋 Team Registration**: 3-member team registration with leader and members
- **🎯 Priority-based Problem Selection**: Select up to 3 problem preferences (1st, 2nd, 3rd priority)
- **⏰ Live Countdown Timer**: Real-time 72-hour countdown display
- **✅ FCFS Allocation**: First-come-first-serve allocation with automatic fallback to lower priorities
- **📤 Project Submission**: Submit GitHub repository and Loom video links
- **🔒 Secure Access**: Authentication-based access control

### 🎨 Design Highlights
- **Modern Glassmorphism UI**: Beautiful glass-card effects with backdrop blur
- **Vibrant Color Palette**: Purple, pink, cyan gradients throughout
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Fade-in, slide-in, and micro-interactions
- **Dark Theme**: Eye-friendly dark mode with vibrant accents

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite 5.4** - Build tool and dev server
- **React Router 6.28** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Vanilla CSS** - Custom styling with CSS variables

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - RPC functions

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Hackathon management"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the following SQL scripts in your Supabase SQL Editor (in order):

1. **`database-schema.sql`** - Creates all tables and RPC functions
2. **`ADMIN_SETUP.sql`** - Sets up admin user (update with your email)

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

## 🗄️ Database Schema

### Tables
- **`hackathon_settings`** - Global settings (timer, toggles)
- **`teams`** - Team information
- **`team_members`** - Team member details
- **`problem_statements`** - Hackathon problems with capacity
- **`project_requests`** - Team problem selections and allocations
- **`submissions`** - Final project submissions

### Key RPC Functions
- `create_project_request()` - Multi-priority allocation with FCFS
- `create_submission()` - Submit project with validation
- `start_hackathon()` - Initialize 72-hour timer

## 🎯 User Workflows

### Admin Workflow
1. Login with admin email
2. Add problem statements with capacity limits
3. Open project requests for teams
4. Start 72-hour hackathon timer
5. Monitor team allocations in real-time
6. Open submissions when ready
7. View all team submissions
8. Stop/restart timer as needed

### Student Workflow
1. Register 3-member team
2. Wait for admin to open project requests
3. Select 3 problem priorities (🥇 1st, 🥈 2nd, 🥉 3rd)
4. Get allocated based on FCFS and availability
5. View countdown timer
6. Wait for admin to open submissions
7. Submit GitHub repo + Loom video
8. Can update submission until timer ends

## 🔐 Authentication

### Admin Access
- Email: `anilkumarkondeboina@gmail.com` (configured in `ADMIN_SETUP.sql`)
- Admin status checked via JWT claims

### Student Access
- Any authenticated user who is not admin
- Must register team before accessing dashboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your Git repository
2. Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Build command: `npm run build`
4. Output directory: `dist`

## 📁 Project Structure

```
Hackathon management/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── ProblemSelector.jsx
│   │   ├── SubmissionForm.jsx
│   │   ├── Toast.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx
│   │   ├── SignIn.jsx
│   │   ├── TeamRegistration.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx
│   ├── utils/              # Utility functions
│   │   ├── allocation.js
│   │   └── validation.js
│   ├── lib/                # Third-party configs
│   │   └── supabase.js
│   ├── index.css           # Global styles
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
├── database-schema.sql     # Database setup
├── ADMIN_SETUP.sql         # Admin configuration
├── .env                    # Environment variables
├── package.json
└── vite.config.js
```

## 🎨 Key Components

### `ProblemSelector`
- Displays problem cards with priority selection
- 🥇🥈🥉 Medal emojis for visual clarity
- Real-time allocation updates
- "Not Allocated - Contact Admin" state

### `CountdownTimer`
- Live 72-hour countdown
- Updates every second
- Shows days, hours, minutes, seconds
- Automatically detects timer end

### `SubmissionForm`
- GitHub URL validation
- Loom video URL validation
- Editable until hackathon ends
- Shows "Submitted" badge

### `AdminDashboard`
- 5 stat cards with live counts
- Control panel with 5 buttons
- Problem management with edit/delete
- Allocations and submissions tables

## 🔧 Configuration

### Modify Timer Duration
Edit `handleStartHackathon` in `AdminDashboard.jsx`:
```javascript
const endTime = new Date(startTime.getTime() + (72 * 60 * 60 * 1000)); // Change 72 to desired hours
```

### Change Admin Email
Update `ADMIN_SETUP.sql`:
```sql
WHERE email = 'your-admin-email@example.com';
```

### Adjust Team Size
Update validation in `TeamRegistration.jsx` and database constraints.

## 🐛 Troubleshooting

### Stats showing zero
- Hard refresh browser (`Ctrl+Shift+R`)
- Check if data exists in Supabase tables
- Verify RLS policies are correct

### Timer not showing
- Ensure admin has started the hackathon
- Check `hackathon_settings` table for start/end times

### Allocation not working
- Verify problem capacity is not full
- Check `create_project_request` RPC function exists
- Ensure team hasn't already submitted a request

### Submission form not appearing
- Student must have an allocated problem
- Admin must have opened submissions
- Check both conditions are met

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for managing hackathons efficiently.

## 🙏 Acknowledgments

- **Supabase** - Amazing backend platform
- **Lucide Icons** - Beautiful icon library
- **React** - Powerful UI library
- **Vite** - Lightning-fast build tool

---

**Need help?** Check the troubleshooting section or review the code comments for detailed explanations.
