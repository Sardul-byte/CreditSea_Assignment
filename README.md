# Loan Management System

Monorepo for a loan management platform with a Next.js client and Express API server.

## Structure

```
/
├── client/     Next.js 14 (App Router) + TypeScript + Tailwind CSS
├── server/     Node.js + Express + TypeScript + MongoDB
├── .env        Environment variables (copy from .env.example)
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes `npm` on your PATH)
- [MongoDB](https://www.mongodb.com/) running locally or a cloud connection string

> **Windows:** If `npm` is not recognized, install [Node.js LTS](https://nodejs.org/) and restart your terminal (or add `C:\Program Files\nodejs` to your PATH).

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment

Copy the example env file and edit values as needed:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `PORT` | API server port (default `5000`) |
| `NEXT_PUBLIC_API_URL` | Base URL for the API (used by the client) |

### 3. Seed the database (optional)

Placeholder seed script — extend when models are added:

```bash
npm run seed
```

### 4. Run in development

Start both client and server:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:5000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run client and server concurrently |
| `npm run dev:client` | Next.js dev server only |
| `npm run dev:server` | Express dev server only |
| `npm run build` | Build client and server |
| `npm run seed` | Run database seed script |

## Packages

- **client** — Frontend at `/client`
- **server** — API at `/server`
