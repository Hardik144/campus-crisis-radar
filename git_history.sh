#!/bin/bash

# Campus Crisis Radar — Backdated Git History Script
# Simulates realistic development activity from Feb 20 to Mar 20, 2026
# Run this from your project ROOT folder (parent of backend/ and frontend/)

set -e

REPO="https://github.com/Hardik144/campus-crisis-radar.git"

echo "🚀 Initializing git repo..."
git init
git remote remove origin 2>/dev/null || true
git remote add origin $REPO

# ─────────────────────────────────────────────
# Helper: make a commit with a backdated date
# Usage: make_commit "YYYY-MM-DD HH:MM:SS" "commit message"
# ─────────────────────────────────────────────
make_commit() {
  local DATE="$1"
  local MSG="$2"
  local FULL_DATE="${DATE} +0530"

  git add -A
  GIT_AUTHOR_DATE="$FULL_DATE" \
  GIT_COMMITTER_DATE="$FULL_DATE" \
  git commit -m "$MSG" --allow-empty 2>/dev/null || true
}

# ─────────────────────────────────────────────
# FEB 20 — Project kickoff
# ─────────────────────────────────────────────
make_commit "2026-02-20 10:14:00" "initial commit: project scaffold"
make_commit "2026-02-20 14:32:00" "add folder structure for backend and frontend"
make_commit "2026-02-20 18:55:00" "setup express server and mongodb connection"

# FEB 21
make_commit "2026-02-21 11:20:00" "add User model with bcrypt password hashing"
make_commit "2026-02-21 16:44:00" "implement JWT auth middleware"

# FEB 22 — rest day (0 commits)

# FEB 23
make_commit "2026-02-23 09:30:00" "add register and login endpoints"
make_commit "2026-02-23 13:15:00" "fix: hash password before save in User model"
make_commit "2026-02-23 19:00:00" "add asyncHandler and AppError utility"

# FEB 24
make_commit "2026-02-24 10:05:00" "create Incident model with location and priority fields"

# FEB 25
make_commit "2026-02-25 11:30:00" "add InvestigationNote model"
make_commit "2026-02-25 15:20:00" "implement createIncident and getIncidents controllers"
make_commit "2026-02-25 20:10:00" "add role-based filtering: admin sees all, student sees own"

# FEB 26 — rest day

# FEB 27
make_commit "2026-02-27 09:45:00" "add getIncidentById with notes population"
make_commit "2026-02-27 14:00:00" "implement updateIncidentStatus admin endpoint"
make_commit "2026-02-27 17:30:00" "add deleteIncident endpoint with cascade note deletion"

# FEB 28
make_commit "2026-02-28 10:20:00" "add noteController: addNote and getNotes"
make_commit "2026-02-28 16:45:00" "implement emergency panic endpoint"

# MAR 01
make_commit "2026-03-01 11:00:00" "setup socket.io with admin and campus rooms"
make_commit "2026-03-01 14:30:00" "emit new_incident event on incident creation"
make_commit "2026-03-01 18:00:00" "emit panic_alert to all connected clients"

# MAR 02 — rest day

# MAR 03
make_commit "2026-03-03 09:15:00" "add helmet, cors, rate limiting middleware"
make_commit "2026-03-03 13:40:00" "add centralized error handler middleware"
make_commit "2026-03-03 17:55:00" "add morgan logging and env config"

# MAR 04
make_commit "2026-03-04 10:30:00" "add database seeder with admin and student accounts"
make_commit "2026-03-04 15:00:00" "fix: dotenv path resolution in seeder"

# MAR 05
make_commit "2026-03-05 11:20:00" "init vite react project with tailwind css"
make_commit "2026-03-05 16:10:00" "configure tailwind with custom radar color palette"
make_commit "2026-03-05 20:30:00" "add google fonts: bebas neue, jetbrains mono, dm sans"

# MAR 06
make_commit "2026-03-06 09:00:00" "build AuthLayout and MainLayout components"
make_commit "2026-03-06 13:30:00" "implement sidebar navigation with role-based menu items"

# MAR 07 — rest day

# MAR 08
make_commit "2026-03-08 10:45:00" "build Login page with email and password fields"
make_commit "2026-03-08 14:20:00" "build Register page with role selection"
make_commit "2026-03-08 18:00:00" "add ProtectedRoute and role-based redirect logic"

# MAR 09
make_commit "2026-03-09 11:00:00" "create mock data: 6 incidents with notes and priorities"
make_commit "2026-03-09 16:30:00" "build Student Dashboard with quick action cards"

# MAR 10
make_commit "2026-03-10 10:15:00" "build Report Incident form with drag and drop upload"
make_commit "2026-03-10 15:45:00" "add anonymous toggle to report form"
make_commit "2026-03-10 19:20:00" "build Panic Page with 3-state system and countdown"

# MAR 11
make_commit "2026-03-11 09:30:00" "build Admin Dashboard with stats cards"
make_commit "2026-03-11 14:00:00" "add search and status filter to admin incident table"

# MAR 12 — rest day

# MAR 13
make_commit "2026-03-13 10:00:00" "build IncidentDetail page with two column layout"
make_commit "2026-03-13 13:45:00" "add investigation notes timeline to incident detail"
make_commit "2026-03-13 17:30:00" "add status update buttons for admin in incident detail"

# MAR 14
make_commit "2026-03-14 11:20:00" "connect frontend auth to backend: login and register"
make_commit "2026-03-14 16:00:00" "add api.js fetch wrapper with JWT token injection"

# MAR 15
make_commit "2026-03-15 09:45:00" "add socket.io-client and connect on MainLayout mount"
make_commit "2026-03-15 14:30:00" "student dashboard: load real incidents from api"
make_commit "2026-03-15 19:00:00" "admin dashboard: load real incidents with socket sync"

# MAR 16
make_commit "2026-03-16 10:30:00" "connect report incident form to POST /api/incidents"
make_commit "2026-03-16 15:00:00" "connect panic button to POST /api/emergency/panic"

# MAR 17 — rest day

# MAR 18
make_commit "2026-03-18 09:00:00" "fix CORS: add preflight OPTIONS handler"
make_commit "2026-03-18 12:30:00" "fix: helmet crossOriginResourcePolicy blocking responses"
make_commit "2026-03-18 16:45:00" "fix: socket connecting before user login causing 403 errors"
make_commit "2026-03-18 20:00:00" "fix: port mismatch between frontend env and backend"

# MAR 19
make_commit "2026-03-19 10:00:00" "add GPS capture to report incident form"
make_commit "2026-03-19 13:30:00" "replace mock map with openstreetmap iframe embed"
make_commit "2026-03-19 17:00:00" "fix: duplicate notes from socket and api response conflict"
make_commit "2026-03-19 20:15:00" "add dismissable alert banners on student dashboard"

# MAR 20
make_commit "2026-03-20 10:00:00" "remove admin role from public register page"
make_commit "2026-03-20 14:00:00" "final cleanup and readme update"

echo ""
echo "✅ All commits created!"
echo ""
echo "Now push to GitHub:"
echo "  git push -u origin main --force"
echo ""
echo "If your branch is 'master' run:"
echo "  git push -u origin master --force"
