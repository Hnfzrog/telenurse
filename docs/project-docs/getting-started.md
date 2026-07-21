# TeleNurse — Getting Started

## Description

Quick start guide untuk development TeleNurse (Next.js monolith).

## Important

- Pastikan Node.js 18+ sudah terinstall
- Perlu akun: Vercel, Neon Tech, Resend (semua free)
- Satu project, satu terminal — simple

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Prerequisites](#prerequisites)
- [Setup Steps](#setup-steps)

## Scope

Setup guide dari nol sampai bisa develop locally.

## Goals

1. Developer bisa setup project dalam 15 menit

## Non Goals

- Deployment guide (lihat ci-cd.md)

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |

### Free Accounts Needed

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | https://vercel.com | Hosting |
| Neon Tech | https://neon.tech | Database |
| Resend | https://resend.com | Email |
| cron-job.org | https://cron-job.org | Supplement cron jobs |

---

## Setup Steps

### 1. Clone & Install

```bash
git clone <repo-url> telenurse
cd telenurse
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Neon Tech (get from console.neon.tech)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# Resend (get from resend.com/api-keys)
RESEND_API_KEY="re_..."

# Cron secret
CRON_SECRET="any-random-string"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed sample data
npx prisma db seed

# (Optional) Open visual DB browser
npx prisma studio
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Default Accounts (Seeder)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@telenurse.com | password |
| Perawat | perawat@telenurse.com | password |
| Pasien | pasien@telenurse.com | password |
