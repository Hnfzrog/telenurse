# TeleNurse — CI/CD

## Description

CI/CD setup — single Next.js project auto-deployed via Vercel.

## Important

- **1 project, 1 deployment** — Vercel builds everything (pages + API routes)
- Auto-deploy on push to `main` branch
- No separate CI pipeline needed

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Deployment Flow](#deployment-flow)
- [Environment Variables](#environment-variables)
- [Vercel Configuration](#vercel-configuration)

## Scope

Deployment configuration untuk Next.js monolith di Vercel.

## Goals

1. Zero-config auto deploy
2. Environment variables managed via Vercel dashboard

## Non Goals

- GitHub Actions / CI pipeline
- Docker-based deployment
- Multi-environment (staging)

---

## Deployment Flow

```
Developer pushes to `main`
        │
        ▼
Vercel detects push (Git integration)
        │
        ▼
npm install → prisma generate → next build
        │
        ├── Static pages → CDN edge
        ├── SSR pages → Serverless Functions
        └── API routes → Serverless Functions
        │
        ▼
Live at telenurse.vercel.app
```

---

## Environment Variables

Set via Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon pooled connection | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Neon direct connection (migrations) | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Random 32-char string |
| `NEXTAUTH_URL` | App URL | `https://telenurse.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | `vercel_blob_rw_...` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `CRON_SECRET` | Shared secret for cron endpoints | Random string |

---

## Vercel Configuration

### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/medication-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

> **Note**: Vercel Hobby plan only supports 1 cron job (daily max). Use cron-job.org for additional scheduled tasks.
