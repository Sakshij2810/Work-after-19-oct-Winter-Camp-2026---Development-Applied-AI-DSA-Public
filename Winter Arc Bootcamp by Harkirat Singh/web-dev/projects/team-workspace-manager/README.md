# Team Workspace Manager

A REST API built with JavaScript, Express, PostgreSQL (`pg`), JWT, and Zod.

## Features

- Signup and signin with hashed passwords
- JWT authentication and database-backed user lookup
- Create, list, and delete workspaces
- Create, list, update, and delete tasks
- Database-enforced ownership checks
- Workspace deletion cascades to its tasks
- Zod request validation
- Task pagination and case-insensitive search
- Optional due dates (must be today or later)
- Dashboard totals using SQL aggregation

## Requirements

- Node.js 18+
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database, for example:

   ```sql
   CREATE DATABASE team_workspace_manager;
   ```

3. Copy `.env.example` to `.env`, then update `DATABASE_URL` and `JWT_SECRET`.

   ```bash
   cp .env.example .env
   ```

4. Create the tables by running `src/schema.sql` against the database. For example:

   ```bash
   psql "postgresql://postgres:YOUR_PASSWORD@localhost:5432/team_workspace_manager" -f src/schema.sql
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:3000` by default.

## Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/signup` | No | Create account |
| POST | `/signin` | No | Get JWT |
| POST | `/workspace` | Yes | Create workspace |
| GET | `/workspaces` | Yes | List your workspaces |
| DELETE | `/workspace/:workspaceId` | Yes | Delete your workspace and its tasks |
| POST | `/task` | Yes | Create task; requires `workspaceid` header |
| GET | `/tasks` | Yes | List tasks; requires `workspaceid` header |
| PATCH | `/task/:taskId` | Yes | Update task completion |
| DELETE | `/task/:taskId` | Yes | Delete your task |
| GET | `/dashboard` | Yes | Workspace/task counts |

## Authentication header

For protected routes, send:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

For task creation/listing, also send:

```http
workspaceid: 1
```

## Example requests

### Signup

```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","password":"12345678"}'
```

### Signin

```bash
curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","password":"12345678"}'
```

Copy the returned token and set it in your terminal:

```bash
TOKEN="paste-token-here"
```

### Create a workspace

```bash
curl -X POST http://localhost:3000/workspace \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Personal"}'
```

### List workspaces

```bash
curl http://localhost:3000/workspaces \
  -H "Authorization: Bearer $TOKEN"
```

### Create a task

```bash
curl -X POST http://localhost:3000/task \
  -H "Authorization: Bearer $TOKEN" \
  -H "workspaceid: 1" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Express","description":"Complete middleware section","dueDate":"2099-12-31"}'
```

`dueDate` is optional. If supplied, use `YYYY-MM-DD`; dates before today's UTC date are rejected.

### List tasks (pagination + search)

```bash
curl "http://localhost:3000/tasks?page=1&limit=10&search=express" \
  -H "Authorization: Bearer $TOKEN" \
  -H "workspaceid: 1"
```

### Mark task complete

```bash
curl -X PATCH http://localhost:3000/task/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/task/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Dashboard

```bash
curl http://localhost:3000/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Security notes

- SQL inputs use PostgreSQL parameters (`$1`, `$2`, etc.); do not interpolate user input into SQL strings.
- Passwords are hashed using bcryptjs.
- JWTs expire after seven days.
- Workspace and task ownership is enforced inside SQL statements.
- Never commit `.env` or share your JWT secret.
- For production, configure TLS, rate limiting, logging, and a managed secrets store.
