# TaskFlow — Task Management App

Production-ready full-stack task management application.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT in HTTP-only cookies, bcrypt
- **Security:** AES-256-CBC encryption on sensitive fields

## Live Demo
- **App:** [Add Vercel URL here after deploy]
- **GitHub:** https://github.com/aditya32193213/taskflow

## Local Setup

1. Clone the repo
```bash
   git clone https://github.com/aditya32193213/taskflow.git
   cd taskflow
```

2. Install dependencies
```bash
   npm install
```

3. Create `.env.local` in root:
```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret_min_32_chars
   ENCRYPTION_KEY=exactly_32_characters_here!
```

4. Run locally
```bash
   npm run dev
```
   Open http://localhost:3000

## Architecture
```
┌─────────────────────────────────────┐
│           Next.js 14 App            │
│  ┌──────────────┐  ┌─────────────┐  │
│  │   Frontend   │  │  API Routes │  │
│  │  /login      │  │  /api/auth  │  │
│  │  /register   │  │  /api/tasks │  │
│  │  /dashboard  │  └──────┬──────┘  │
│  └──────────────┘         │         │
│  ┌─────────────────────────────────┐ │
│  │  lib/ → db, auth, encryption   │ │
│  └──────────────────────────────── ┘ │
└───────────────────┬─────────────────┘
                    │
           MongoDB Atlas
```

## Security Features
- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HttpOnly + Secure cookies
- Task descriptions AES-256-CBC encrypted at rest
- NoSQL injection prevention via ObjectId validation
- Route protection via Next.js Edge Middleware
- No secrets hardcoded — all via environment variables

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Tasks (all require auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (pagination, filter, search) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Query Parameters for GET /api/tasks
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)
- `status` — filter: `todo`, `in-progress`, `done`
- `search` — search by title

### Sample Request
```json
POST /api/auth/register
{
  "name": "Aditya Kumar",
  "email": "aditya@example.com",
  "password": "secret123"
}
```

### Sample Response
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "65f...",
    "name": "Aditya Kumar",
    "email": "aditya@example.com"
  }
}
```