# 🚨 Campus Crisis Radar

A full-stack campus safety platform built for SRMIST that enables students to report incidents, trigger emergency panic alerts, and allows administrators to manage and respond to campus safety events in real time.

---

## 📸 Preview

| Student Dashboard | Admin Dashboard | Incident Detail |
|---|---|---|
| Quick actions, recent reports, safety tips | Live alerts, stats, incident table | Map, timeline, status management |

---

## ⚙️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | Real-time WebSocket communication |
| JWT + bcryptjs | Authentication and password hashing |
| Helmet + CORS | Security headers |
| express-rate-limit | Rate limiting |
| Morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v7 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| Socket.io Client | Real-time event handling |
| OpenStreetMap | Embedded incident location maps |

---

## 📁 Project Structure

```
campus-crisis-radar/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login
│   │   ├── incidentController.js  # CRUD for incidents
│   │   ├── noteController.js      # Investigation notes
│   │   └── emergencyController.js # Panic alert trigger
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + adminOnly
│   │   └── errorHandler.js        # Centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Incident.js
│   │   └── InvestigationNote.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incidentRoutes.js
│   │   └── emergencyRoutes.js
│   ├── sockets/
│   │   └── socketManager.js       # Socket.io rooms and events
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── asyncHandler.js
│   │   ├── AppError.js
│   │   └── seeder.js              # Database seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── api.js             # Fetch wrapper with JWT
    │   │   └── socket.js          # Socket.io client
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AuthLayout.jsx
    │   │   │   └── MainLayout.jsx
    │   │   └── ui/
    │   │       ├── Badges.jsx
    │   │       └── ProtectedRoute.jsx
    │   ├── data/
    │   │   └── mockData.js        # Incident types, safety tips
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── ReportIncident.jsx
    │   │   │   └── PanicPage.jsx
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx
    │   │   └── IncidentDetail.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

### 1. Clone the repository

```bash
git clone https://github.com/Hardik144/campus-crisis-radar.git
cd campus-crisis-radar
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with sample data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:5001`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your `.env` file:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get token |
| GET | `/api/auth/me` | Private | Get current user |

### Incidents
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/incidents` | Private | Create incident |
| GET | `/api/incidents` | Private | Get incidents (role-filtered) |
| GET | `/api/incidents/:id` | Private | Get incident + notes |
| PUT | `/api/incidents/:id/status` | Admin | Update status |
| DELETE | `/api/incidents/:id` | Admin | Delete incident |

### Investigation Notes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/incidents/:id/notes` | Admin | Add note |
| GET | `/api/incidents/:id/notes` | Private | Get notes timeline |

### Emergency
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/emergency/panic` | Private | Trigger panic alert |

---

## ⚡ Real-Time Events (Socket.io)

| Event | Trigger | Broadcast To |
|---|---|---|
| `new_incident` | Incident created | Admins |
| `incident_update` | Status changed | Admins |
| `new_note` | Note added | Admins |
| `panic_alert` | Panic triggered | Admins + All campus |

### Frontend Socket Usage

```js
import { socket } from './api/socket'

socket.emit('join_admin')   // for admin users
socket.emit('join_campus')  // for student users

socket.on('panic_alert', (data) => {
  // Show full-screen emergency alert
})
```

---

## 🗺️ Features

### Student
- 📋 **Report Incidents** — file reports with type, location, description, GPS coordinates, and photo evidence
- 🚨 **Emergency Panic Button** — 3-second countdown alert that broadcasts GPS location to all admins instantly
- 📍 **GPS Capture** — attach real coordinates to any incident report
- 📊 **Personal Dashboard** — view your reported incidents and their status
- 🔔 **Live Alerts** — see real-time critical alerts on campus with dismiss option

### Admin
- 📊 **Command Dashboard** — total, pending, investigating, and resolved incident counts
- 🔴 **Live Panic Alerts** — receive instant panic notifications with GPS location
- 🗂️ **Incident Management** — search, filter, view, and manage all campus incidents
- 📝 **Investigation Notes** — add timestamped notes to build an investigation timeline
- ✅ **Status Updates** — move incidents through pending → investigating → resolved
- 🗺️ **Location Maps** — view exact GPS location of each incident on OpenStreetMap

---

## 🔒 Security

- Passwords hashed with **bcrypt** (salt rounds: 12)
- **JWT** tokens with 7-day expiry
- **Helmet** for secure HTTP headers
- **CORS** restricted to frontend origin
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth routes
- Role-based access control on every sensitive endpoint
- Anonymous report support — reporter identity hidden from non-admins

---

## 🌐 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5001) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Backend Socket.io URL |

---

## 👨‍💻 Author

**Hardik Patidar**
B.Tech Computer Science — SRMIST Chennai
- GitHub: [@Hardik144](https://github.com/Hardik144)

---

## 📄 License

This project is built for academic purposes as part of campus safety research at SRMIST.
