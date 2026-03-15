# 📋 TaskFlow — Secure Task Management App

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Task%20Management-6366f1?style=for-the-badge&logo=checkmarx&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A full-stack, production-ready task manager with JWT authentication, AES-256 encryption, and a sleek dark UI.**

[🚀 Live Demo](https://taskflow-rosy-psi.vercel.app) · [📁 GitHub Repo](https://github.com/aditya32193213/taskflow) · [🐛 Report a Bug](#) · [💡 Request Feature](#)

</div>

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🔐 Security Architecture](#-security-architecture)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📡 API Reference](#-api-reference)
- [🖥️ Pages & Routes](#️-pages--routes)
- [🧠 How It Works](#-how-it-works)
- [☁️ Deployment](#️-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT stored in `HttpOnly` cookies (XSS-safe), with 7-day expiry
- 🔒 **AES-256-CBC Encryption** — Task descriptions are encrypted at rest in MongoDB
- 🧭 **Edge Middleware** — Route protection via Next.js Edge Runtime; no round-trips to the server
- ✅ **Full Task CRUD** — Create, read, update, and delete tasks with live feedback
- 🔎 **Search & Filter** — Filter tasks by status (`todo`, `in-progress`, `done`) and search by title
- 📄 **Pagination** — Efficient server-side pagination with configurable page size
- 🌑 **Dark UI** — Polished dark-themed interface built with Tailwind CSS utility classes
- 🛡️ **Authorization Guards** — Every task API route verifies user ownership before any DB operation
- 🔁 **Singleton DB Connection** — MongoDB connection is cached globally to survive Next.js hot reloads
- 💬 **Consistent API Responses** — Standardized `{ success, ...data }` shape across all endpoints
- 🚫 **User Enumeration Prevention** — Login returns identical errors for wrong email and wrong password

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖼️ **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS 3 |
| 🔧 **Backend** | Next.js API Routes (Edge + Node.js runtime) |
| 🗄️ **Database** | MongoDB via Mongoose ODM |
| 🔑 **Auth** | JSON Web Tokens (`jsonwebtoken` + `jose` for Edge) |
| 🔐 **Encryption** | Node.js `crypto` — AES-256-CBC |
| 🔒 **Password Hashing** | `bcryptjs` (12 salt rounds) |
| 🚦 **Middleware** | Next.js Edge Middleware with `jose` JWT verification |
| 🎨 **Styling** | Tailwind CSS with custom component classes |

---

## 📂 Project Structure

```
taskapp/
│
├── 📁 app/
│   ├── layout.js                  # Root layout — global CSS, metadata
│   ├── page.js                    # Root → redirects to /login
│   │
│   ├── 📁 login/
│   │   └── page.js                # 🔑 Login page (client component)
│   │
│   ├── 📁 register/
│   │   └── page.js                # 📝 Register page (client component)
│   │
│   ├── 📁 dashboard/
│   │   └── page.js                # 📋 Main task dashboard (protected)
│   │
│   └── 📁 api/
│       ├── 📁 auth/
│       │   ├── login/route.js     # POST — authenticate user
│       │   ├── register/route.js  # POST — create account
│       │   ├── logout/route.js    # POST — clear cookie
│       │   └── me/route.js        # GET  — current user info
│       │
│       └── 📁 tasks/
│           ├── route.js           # GET (list) · POST (create)
│           └── [id]/route.js      # GET · PUT · DELETE (single task)
│
├── 📁 models/
│   ├── User.js                    # Mongoose User schema + bcrypt hooks
│   └── Task.js                    # Mongoose Task schema (encrypted desc)
│
├── 📁 lib/
│   ├── auth.js                    # JWT sign/verify/cookie helpers
│   ├── db.js                      # Singleton MongoDB connection
│   ├── encryption.js              # AES-256-CBC encrypt/decrypt
│   └── apiResponse.js             # Standardised response helpers
│
├── middleware.js                  # Edge middleware — route guards
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json                  # Path alias (@/*)
└── package.json
```

---

## 🔐 Security Architecture

TaskFlow is built with security at every layer. Here's a breakdown of the key protections in place:

### 🔐 Architecture
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

### 🍪 Authentication Flow

```
User Login
    │
    ▼
POST /api/auth/login
    │  ✅ Validates credentials
    │  🔑 Signs JWT (7-day expiry)
    │
    ▼
Set HttpOnly Cookie (token)
    │  🚫 JS cannot read it (XSS protection)
    │  🔒 Secure flag in production (HTTPS only)
    │  🛡️ SameSite=lax (CSRF protection)
    │
    ▼
Edge Middleware (every request)
    │  ⚡ Verifies JWT using jose (Edge-compatible)
    │  🔄 Redirects unauthenticated → /login
    │  🔄 Redirects authenticated → /dashboard
```

### 🔒 Data Encryption

Task descriptions are **never stored in plaintext**. Before writing to MongoDB, each description is encrypted:

```
plaintext  ──►  AES-256-CBC(randomIV)  ──►  "iv_hex:data_hex"  ──►  MongoDB
MongoDB    ──►  "iv_hex:data_hex"       ──►  decrypt()           ──►  client
```

- A **fresh random IV** (16 bytes) is generated per encryption call — identical descriptions produce different ciphertext every time
- The `ENCRYPTION_KEY` must be exactly 32 bytes (auto-padded/sliced for safety)

### 🛡️ Authorization

Every task endpoint calls `findOwnedTask(taskId, userId)` which queries:

```js
Task.findOne({ _id: taskId, user: userId })
```

This makes it **impossible** to access or modify another user's task even if you know its ID.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- 🟢 **Node.js** v18+
- 🍃 **MongoDB** (local or [Atlas](https://mongodb.com/atlas) cloud cluster)
- 📦 **npm** or **yarn**

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/aditya32193213/taskflow.git
cd taskflow

# 2️⃣ Install dependencies
npm install

# 3️⃣ Set up environment variables
cp .env.example .env.local
# ✏️ Edit .env.local with your values (see below)

# 4️⃣ Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# 🍃 MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow

# 🔑 JWT secret — use a long, random string (min 32 chars recommended)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 🔒 AES-256 encryption key — MUST be exactly 32 characters
ENCRYPTION_KEY=your-32-character-encryption-key!
```

> ⚠️ **Never commit `.env.local` to version control.** Add it to `.gitignore`.

---

## 📡 API Reference

### 🔑 Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register` | Create a new account | ❌ |
| `POST` | `/api/auth/login` | Sign in & receive cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear session cookie | ❌ |
| `GET` | `/api/auth/me` | Get current user info | ✅ |

#### POST `/api/auth/register`
```json
// Request Body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

#### POST `/api/auth/login`
```json
// Request Body
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

### 📋 Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/tasks` | List tasks (paginated + filtered) | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `GET` | `/api/tasks/:id` | Get a single task | ✅ |
| `PUT` | `/api/tasks/:id` | Update a task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |

#### GET `/api/tasks` — Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page (max 50) |
| `status` | `string` | — | Filter: `todo` \| `in-progress` \| `done` |
| `search` | `string` | — | Case-insensitive title search |

```json
// Response 200
{
  "success": true,
  "tasks": [ { "_id": "...", "title": "Buy groceries", "status": "todo", ... } ],
  "pagination": {
    "page": 1, "limit": 10, "total": 42,
    "totalPages": 5, "hasNext": true, "hasPrev": false
  }
}
```

#### POST `/api/tasks`
```json
// Request Body
{
  "title": "Buy groceries",          // required, max 100 chars
  "description": "Milk, eggs, bread", // optional, encrypted at rest
  "status": "todo"                   // optional: todo | in-progress | done
}
```

#### PUT `/api/tasks/:id`
> All fields are optional — only send what you want to update.

```json
{
  "title": "Buy groceries (updated)",
  "status": "in-progress"
}
```

---

## 🖥️ Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.js` | Redirects → `/login` |
| `/login` | `app/login/page.js` | 🔑 Sign-in form |
| `/register` | `app/register/page.js` | 📝 Account creation form |
| `/dashboard` | `app/dashboard/page.js` | 📋 Main task manager (🔒 protected) |

### 🚦 Route Protection (Edge Middleware)

```
/dashboard/*  ──► Not authenticated?  ──► Redirect to /login?redirect=/dashboard
/login        ──► Already logged in?  ──► Redirect to /dashboard
/register     ──► Already logged in?  ──► Redirect to /dashboard
```

---

## 🧠 How It Works

### 1️⃣ User Registration & Login

```
Register Form  →  POST /api/auth/register
                    │
                    ├─ Validate inputs (name, email, password)
                    ├─ Check for duplicate email
                    ├─ Hash password with bcrypt (12 rounds)
                    ├─ Save User to MongoDB
                    ├─ Sign JWT (7d expiry)
                    └─ Set HttpOnly cookie → Redirect to dashboard
```

### 2️⃣ Task Operations

```
Dashboard  →  GET /api/tasks?page=1&status=todo&search=buy
               │
               ├─ Verify JWT from cookie
               ├─ Scope query to current user only
               ├─ Apply status filter + title regex search
               ├─ Paginate results
               └─ Decrypt descriptions before returning
```

### 3️⃣ MongoDB Connection (Hot Reload Safe)

```js
// Cached on global object — survives Next.js dev hot reloads
let cached = global.mongoose || { conn: null, promise: null };
```

---

## ☁️ Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Push** your code to a GitHub repository
2. **Import** the repo on [Vercel](https://vercel.com)
3. **Add Environment Variables** in the Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
4. **Deploy** — Vercel handles the rest 🎉

> 💡 **Tip:** Use [MongoDB Atlas](https://mongodb.com/atlas) for a free cloud database that pairs perfectly with Vercel.

### Build Locally

```bash
npm run build   # Build for production
npm start       # Start production server
```

---

## 🤝 Contributing

Contributions are always welcome! Here's how to get started:

```bash
# 1️⃣ Fork the repository
# 2️⃣ Create a feature branch
git checkout -b feature/amazing-feature

# 3️⃣ Commit your changes
git commit -m "✨ Add amazing feature"

# 4️⃣ Push to the branch
git push origin feature/amazing-feature

# 5️⃣ Open a Pull Request
```

Please make sure to:
- 🧹 Follow the existing code style
- 📝 Add comments where logic is non-obvious
- ✅ Test your changes before submitting

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Made with ❤️ and ☕ | **TaskFlow** — Stay organized, stay secure.

⭐ If you found this project useful, consider giving it a star on [GitHub](#)!

</div>
