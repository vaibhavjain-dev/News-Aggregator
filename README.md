# 📰 News Aggregator

A backend API server for a News Aggregator application built with modern TypeScript tooling.

> **Current Version:** v0.5 (5th commit) — Database schemas for posts, comments & upvotes.

---

## 🛠 Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| **Runtime**    | [Bun](https://bun.sh)                   |
| **Framework**  | [Hono](https://hono.dev)                |
| **Database**   | PostgreSQL (via Docker)                 |
| **ORM**        | [Drizzle ORM](https://orm.drizzle.team) |
| **Auth**       | [Lucia Auth v3](https://lucia-auth.com) |
| **Validation** | [Zod](https://zod.dev)                  |
| **Language**   | TypeScript                              |

---

## 📁 Project Structure

```
News-Aggregator/
├── Shared/
│   └── types.ts              # Zod schemas & shared response types
├── server/
│   ├── index.ts              # Hono app entry point, middleware, error handler
│   ├── adapter.ts            # Drizzle + Postgres connection, Lucia adapter
│   ├── context.ts            # Hono context type (user & session)
│   ├── lucia.ts              # Lucia auth instance & type declarations
│   ├── db/
│   │   └── schemas/
│   │       ├── auth.ts       # User & Session table schemas
│   │       ├── posts.ts      # Posts table & relations
│   │       ├── comments.ts   # Comments table & relations (self-referencing)
│   │       └── upvotes.ts    # Post & Comment upvote tables & relations
│   ├── Middleware/
│   │   └── loggedIn.ts       # Auth guard middleware
│   └── routes/
│       └── auth.ts           # Auth routes (signup, login, logout, user)
├── compose.yml               # Docker Compose for PostgreSQL
├── drizzle.config.ts         # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── .env
```

---

## ✅ What's Been Done

### v0.4 — Auth System

- **Project scaffolding** — Bun + Hono + TypeScript setup with path aliases (`@/*` → `./server/*`).
- **Database** — PostgreSQL running in Docker with Drizzle ORM for schema management.
- **User & Session tables** — Defined with Drizzle (`user`, `session`) with proper foreign keys.
- **Lucia Auth integration** — Session-based authentication with cookie management.
- **Session middleware** — Global middleware that validates session cookies on every request and exposes `user`/`session` on the Hono context.
- **Auth guard middleware** — `loggedIn` middleware that blocks unauthenticated access with a `401`.
- **Zod validation** — `loginSchema` validates `username` (3-20 chars, alphanumeric + underscore) and `password` (6-20 chars, alphanumeric + underscore).
- **Password hashing** — Using `Bun.password.hash()` (Argon2) for secure password storage.
- **Global error handler** — Catches `HTTPException` errors and generic errors, returns consistent JSON responses, and hides stack traces in production.
- **CORS** enabled for cross-origin requests.

### v0.5 — Database Schemas & Relations

- **Posts table** — `id`, `user_id`, `title`, `url`, `content`, `points`, `comment_count`, `created_at`.
- **Comments table** — `id`, `user_id`, `post_id`, `parent_comment_id`, `content`, `depth`, `comment_count`, `points`, `created_at`. Supports nested/threaded comments via self-referencing relation.
- **Post upvotes table** — `id`, `user_id`, `post_id`, `created_at`.
- **Comment upvotes table** — `id`, `user_id`, `comment_id`, `created_at`.
- **Drizzle relations** — All tables connected with proper `one`/`many` relations (author, post↔comments, post↔upvotes, comment↔upvotes, parent↔child comments).
- **Adapter updated** — All schemas and relations registered in the Drizzle instance.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/) installed and running

### Setup

```sh
# 1. Clone the repo
git clone <your-repo-url>
cd News-Aggregator

# 2. Install dependencies
bun install

# 3. Start the PostgreSQL database
docker compose up -d

# 4. Push database schema
bunx drizzle-kit push

# 5. Start the dev server
bun run dev
```

Server runs at **http://localhost:3000**

---

## 🧪 API Tests (Postman)

All 4 auth endpoints have been tested and verified. Use **x-www-form-urlencoded** body format in Postman.

### 1. Signup — `POST /api/auth/signup`

| Field      | Value               |
| ---------- | ------------------- |
| `username` | `my_first_user`     |
| `password` | `secretpassword123` |

**Expected:** `201 Created`

```json
{ "success": true, "message": "User created" }
```

A `Set-Cookie` header with the session cookie is returned.

---

### 2. Login — `POST /api/auth/login`

| Field      | Value               |
| ---------- | ------------------- |
| `username` | `my_first_user`     |
| `password` | `secretpassword123` |

**Expected:** `200 OK`

```json
{ "success": true, "message": "User logged in" }
```

**Wrong password test:**

| Field      | Value           |
| ---------- | --------------- |
| `username` | `my_first_user` |
| `password` | `wrongpassword` |

**Expected:** `401 Unauthorized`

```json
{ "success": false, "error": "Invalid credentials" }
```

---

### 3. Get User — `GET /api/auth/user`

No body required. Session cookie must be present (auto-saved by Postman after login).

**Expected (logged in):** `200 OK`

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "username": "my_first_user" }
}
```

**Expected (not logged in):** `401 Unauthorized`

```json
{ "success": false, "error": "Unauthorized" }
```

---

### 4. Logout — `GET /api/auth/logout`

No body required. Session cookie must be present.

**Expected:** `302 Found` — Redirects to `/` and clears the session cookie.

After logout, calling `GET /api/auth/user` should return `401 Unauthorized`.

---

## 📝 Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/news-aggregator-DB
PORT=3000
```

---

## 🐳 Docker

The `compose.yml` runs a PostgreSQL instance:

```sh
docker compose up -d     # Start database
docker compose down      # Stop database
docker compose down -v   # Stop and wipe all data
```
