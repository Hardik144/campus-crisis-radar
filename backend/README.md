# 🚨 Campus Crisis Radar — Backend

Production-ready Node.js/Express/MongoDB backend for the Campus Crisis Radar campus safety platform.

---

## Architecture Overview

```
Request → Express Router → Auth Middleware → Controller → Model → MongoDB
                                                  ↓
                                           Socket.io → Connected Clients
```

### Key Design Decisions

| Concern | Solution |
|---|---|
| Authentication | JWT (stateless, stored client-side) |
| Password Security | bcryptjs with salt rounds = 12 |
| Role Separation | `protect` middleware + `adminOnly` guard |
| Realtime | Socket.io rooms (`admins`, `campus`) |
| Error Handling | Centralized `errorHandler` middleware |
| Rate Limiting | Per-IP limits on all `/api/` routes |
| Input Safety | Mongoose validators + field-level `trim` + `maxlength` |

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js       # register, login, getMe
│   ├── incidentController.js   # full CRUD for incidents
│   ├── noteController.js       # investigation notes
│   └── emergencyController.js  # panic trigger
├── middleware/
│   ├── authMiddleware.js       # protect, adminOnly
│   └── errorHandler.js        # centralized error handler
├── models/
│   ├── User.js
│   ├── Incident.js
│   └── InvestigationNote.js
├── routes/
│   ├── authRoutes.js
│   ├── incidentRoutes.js
│   └── emergencyRoutes.js
├── sockets/
│   └── socketManager.js       # init, emit helpers
├── utils/
│   ├── generateToken.js
│   ├── asyncHandler.js
│   ├── AppError.js
│   └── seeder.js              # DB seed script
├── .env.example
├── package.json
└── server.js
```

---

## Setup & Installation

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/campus_crisis_radar
JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates:
- **Admin:** `admin@campus.edu` / `Admin@123`
- **Student:** `student@campus.edu` / `Student@123`
- 3 sample incidents + 1 note

### 4. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

---

### AUTH

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "Secret@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "email": "john@campus.edu", "role": "student" }
}
```

> ⚠️ Public registration always assigns role `student`. Admin accounts must be seeded or created directly in MongoDB.

---

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@campus.edu",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Admin User", "email": "admin@campus.edu", "role": "admin" }
}
```

---

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### INCIDENTS

#### Create Incident
```
POST /api/incidents
Authorization: Bearer <token>

{
  "title": "Fire alarm triggered in Block B",
  "description": "Fire alarm went off near Room 301. Smoke visible.",
  "type": "Fire Hazard",
  "priority": "high",
  "isAnonymous": false,
  "location": {
    "address": "Block B, Room 301",
    "latitude": 12.8234,
    "longitude": 80.0451
  }
}
```

**Fields:**
| Field | Required | Values |
|---|---|---|
| title | ✅ | string |
| description | ✅ | string |
| type | ✅ | string |
| priority | ❌ | `low`, `medium`, `high`, `critical` |
| isAnonymous | ❌ | boolean |
| location.address | ❌ | string |
| location.latitude | ❌ | number |
| location.longitude | ❌ | number |

**Socket Event Emitted:** `new_incident` → all admins

---

#### Get Incidents
```
GET /api/incidents
Authorization: Bearer <token>
```

**Query Parameters (Admin only - students always see only their own):**
```
?status=pending
?priority=high
?type=Fire
?page=1&limit=20
```

---

#### Get Incident by ID
```
GET /api/incidents/:id
Authorization: Bearer <token>
```

Returns incident + reporter info + notes timeline.

---

#### Update Status (Admin only)
```
PUT /api/incidents/:id/status
Authorization: Bearer <admin-token>

{
  "status": "investigating"
}
```

Valid values: `pending`, `investigating`, `resolved`

**Socket Event Emitted:** `incident_update` → all admins

---

#### Delete Incident (Admin only)
```
DELETE /api/incidents/:id
Authorization: Bearer <admin-token>
```

Also deletes all associated investigation notes.

---

### INVESTIGATION NOTES

#### Add Note (Admin only)
```
POST /api/incidents/:id/notes
Authorization: Bearer <admin-token>

{
  "note": "Security team arrived on scene. Situation under control."
}
```

**Socket Event Emitted:** `new_note` → all admins

---

#### Get Notes
```
GET /api/incidents/:id/notes
Authorization: Bearer <token>
```

Returns notes in chronological order (oldest first).

---

### EMERGENCY

#### Trigger Panic Alert
```
POST /api/emergency/panic
Authorization: Bearer <token>

{
  "message": "I need immediate help near the parking lot.",
  "location": {
    "address": "Parking Lot C",
    "latitude": 12.8238,
    "longitude": 80.0460
  }
}
```

Creates a `critical` priority `Emergency Panic` incident and broadcasts to all connected clients.

**Socket Event Emitted:** `panic_alert` → all admins + all campus clients

---

## Socket.io Integration

### Frontend Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join rooms
socket.emit('join_campus');         // All users
socket.emit('join_admin');          // Admins only

// Listen for events
socket.on('new_incident', (data) => {
  console.log('New incident reported:', data.incident);
});

socket.on('incident_update', (data) => {
  console.log('Status changed:', data.newStatus);
});

socket.on('new_note', (data) => {
  console.log('New note on:', data.incidentTitle);
});

socket.on('panic_alert', (data) => {
  console.log('🚨 PANIC ALERT from:', data.triggeredBy.name);
  // Show full-screen alert modal
});
```

### Event Payloads

#### `new_incident`
```json
{
  "type": "NEW_INCIDENT",
  "incident": { ...full incident object },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### `incident_update`
```json
{
  "type": "STATUS_UPDATE",
  "incidentId": "...",
  "newStatus": "investigating",
  "updatedBy": { "id": "...", "name": "Admin User" },
  "timestamp": "..."
}
```

#### `new_note`
```json
{
  "type": "NEW_NOTE",
  "incidentId": "...",
  "incidentTitle": "Fire alarm triggered in Block B",
  "note": { ...full note object },
  "addedBy": { "id": "...", "name": "Admin User" },
  "timestamp": "..."
}
```

#### `panic_alert`
```json
{
  "type": "PANIC_ALERT",
  "incidentId": "...",
  "title": "🚨 PANIC ALERT — John Doe",
  "triggeredBy": { "id": "...", "name": "John Doe", "email": "john@campus.edu" },
  "location": { "address": "Parking Lot C", "latitude": 12.8238, "longitude": 80.0460 },
  "timestamp": "..."
}
```

---

## Testing with Thunder Client / Postman

### Recommended Test Flow

1. **Seed DB** → `npm run seed`

2. **Login as admin** → `POST /api/auth/login` → copy token

3. **Login as student** → `POST /api/auth/login` → copy token

4. **Create incident** (student token) → `POST /api/incidents`

5. **Get all incidents** (admin token) → `GET /api/incidents`

6. **Update status** (admin token) → `PUT /api/incidents/:id/status`

7. **Add note** (admin token) → `POST /api/incidents/:id/notes`

8. **Get incident detail** → `GET /api/incidents/:id`

9. **Trigger panic** (student token) → `POST /api/emergency/panic`

10. **Delete incident** (admin token) → `DELETE /api/incidents/:id`

### Environment Variables (Postman/Thunder)
```
base_url = http://localhost:5000/api
admin_token = <from login response>
student_token = <from login response>
incident_id = <from create response>
```

---

## Error Response Format

All errors return:
```json
{
  "success": false,
  "status": "fail",
  "message": "Human-readable error message"
}
```

Common HTTP codes:
| Code | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Duplicate (e.g., email already exists) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — restricted to `CLIENT_URL`
- **Rate Limiting** — 100 req/15min globally, 20 req/15min on auth routes
- **bcrypt** — passwords hashed with salt rounds = 12
- **JWT** — stateless tokens, 7-day expiry
- **Role Guards** — `protect` + `adminOnly` middleware on every sensitive route
- **Input Validation** — Mongoose schema validators + field trimming
- **No Password Leaks** — `select: false` on password field; `toJSON` strips it

---

## Connecting the Frontend

In your React (Vite) frontend, set:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Replace mock data calls with:
```javascript
// Example: login
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
// data.token → store in localStorage as ccr_token
// data.user  → store in localStorage as ccr_user
```

For authenticated requests:
```javascript
const token = localStorage.getItem('ccr_token');
const res = await fetch(`${import.meta.env.VITE_API_URL}/incidents`, {
  headers: { Authorization: `Bearer ${token}` },
});
```
