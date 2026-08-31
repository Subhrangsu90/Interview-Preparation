# Generative UI

Full-stack application with **Angular** frontend, **Express** API server, **Drizzle ORM**, and **PostgreSQL** (Docker).

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

---

## Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment file
cp .env.example .env

# 3. Start PostgreSQL container
npm run docker:up

# 4. Apply database migrations
npm run db:migrate
```

---

## Run Commands

### 1. Development (Both Frontend + Backend)

Runs Angular (`http://localhost:4200`) and the API server (`http://localhost:3000`) concurrently:

```bash
npm run dev
```

### 2. Run Independently

```bash
# Frontend only (port 4200)
npm start

# Backend API only (port 3000, with hot reload)
npm run server:dev
```

---

## Database & Docker Commands

```bash
# Start PostgreSQL container
npm run docker:up

# Stop PostgreSQL container
npm run docker:down

# Generate new migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (web UI database viewer)
npm run db:studio
```

---

## Build & Quality Checks

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Run linter
npm run lint

# Run tests
npm run test
```
