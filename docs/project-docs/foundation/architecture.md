# TeleNurse — Architecture Document

## Description

Dokumentasi arsitektur teknis TeleNurse — digital nursing care platform. Menggunakan Next.js sebagai full-stack framework (React frontend + API Routes backend) dalam 1 project.

## Important

- **Seluruh stack menggunakan free tier** (budget Rp 0)
- **1 project, 1 deployment** — Next.js handles FE + BE
- Semua keputusan teknis di dokumen ini sudah **FINAL** dari developer

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Deployment Topology](#deployment-topology)
- [Repository Structure](#repository-structure)
- [Free Tier Limits & Constraints](#free-tier-limits--constraints)

## Scope

Arsitektur untuk MVP TeleNurse yang deployable di Vercel free tier, supporting 50+ concurrent users untuk testing phase.

## Goals

1. Zero-cost infrastructure — semua free tier
2. Single deployment — 1 project di Vercel
3. Simple DX — satu codebase, satu bahasa (TypeScript)
4. Scalable path — bisa scale tanpa rewrite

## Non Goals

- Microservices architecture
- Container orchestration (Docker/K8s in production)
- Multi-region deployment
- Real-time websocket connections

---

## Tech Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Framework** | Next.js | 14.x (App Router) | Full-stack React, SSR/SSG, API routes built-in |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **UI** | React + Tailwind CSS | 18.x / 3.x | Component-based, utility-first CSS, mobile-first |
| **Database** | Neon Tech (PostgreSQL) | 16 | Free 512MB, serverless, Vercel-friendly |
| **ORM** | Prisma | 5.x | Type-safe queries, migration system, Neon support |
| **Storage** | Vercel Blob / Backblaze B2 | - | 10GB free, untuk media edukasi |
| **Auth** | NextAuth.js (Auth.js) | 5.x | Credentials provider, JWT session, role-based |
| **Email** | Resend | - | Free 100 emails/day, React Email templates |
| **Cron** | Vercel Cron | - | Built-in, `vercel.json` config |
| **Charts** | Recharts | - | React charting library untuk monitoring grafik |

### Why Next.js Monolith?

| Keuntungan | Detail |
|-----------|--------|
| **1 project** | FE + BE dalam satu codebase → hemat resource Vercel |
| **No CORS** | API routes dan pages same origin |
| **SSR** | Server-side rendering untuk SEO dan performance |
| **Native Vercel** | Zero-config deploy, built by Vercel team |
| **TypeScript everywhere** | Satu bahasa untuk FE + BE |
| **No cold start issues** | Edge runtime available untuk API routes |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  VERCEL (1 Project)                   │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │            Next.js Application               │     │
│  │                                               │     │
│  │  ┌─────────────────┐  ┌──────────────────┐  │     │
│  │  │   React Pages    │  │   API Routes     │  │     │
│  │  │   (App Router)   │  │   /api/*         │  │     │
│  │  │                   │  │                  │  │     │
│  │  │ - Pasien pages   │  │ - Auth endpoints │  │     │
│  │  │ - Perawat pages  │  │ - CRUD endpoints │  │     │
│  │  │ - Admin pages    │  │ - Cron endpoints │  │     │
│  │  │ - Server Comp.   │  │ - Upload handler │  │     │
│  │  └─────────────────┘  └────────┬─────────┘  │     │
│  │                                 │             │     │
│  │  ┌─────────────────┐           │             │     │
│  │  │ NextAuth.js      │◀──────────┘             │     │
│  │  │ (Auth + Session) │                         │     │
│  │  └─────────────────┘                         │     │
│  └─────────────────────────────────────────────┘     │
│                         │                             │
└─────────────────────────┼─────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
  ┌──────────────┐ ┌────────────┐ ┌────────────┐
  │ Neon Tech    │ │ Vercel     │ │ Resend     │
  │ PostgreSQL   │ │ Blob       │ │ Email      │
  │              │ │            │ │            │
  │ 512MB free   │ │ 10GB free  │ │ 100/day    │
  └──────────────┘ └────────────┘ └────────────┘
```

### Request Flow

1. **User** → Browser → **Next.js** (pages via App Router, SSR/CSR)
2. **Client Component** → fetch → **API Route** `/api/*` (same origin, no CORS)
3. **Server Component** → direct Prisma query (no API call needed)
4. **API Route** → Prisma → **Neon PostgreSQL**
5. **Vercel Cron** → API Route `/api/cron/*` → Resend email

### Auth Flow (NextAuth.js)

1. User submits login form
2. NextAuth Credentials provider validates email + password (bcrypt)
3. JWT token generated with user role embedded
4. Token stored in httpOnly cookie (automatic)
5. Middleware checks auth + role on protected routes
6. Server Components access session via `getServerSession()`

---

## Deployment Topology

```
┌─────────────────────────────────────┐
│       Vercel (Hobby Plan)           │
│                                     │
│  telenurse.vercel.app               │
│  ├── Static assets → CDN edge       │
│  ├── React pages → Serverless SSR   │
│  └── /api/* → Serverless Functions  │
│                                     │
│  Cron jobs (vercel.json):           │
│  ├── /api/cron/medication-reminders │
│  └── /api/cron/abnormal-alerts      │
└─────────────────────────────────────┘
         │              │
         ▼              ▼
   Neon Tech DB    Vercel Blob
```

**Single deployment** — `git push main` → Vercel builds & deploys everything.

---

## Repository Structure

```
telenurse/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group (login, register)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/              # Protected dashboard group
│   │   │   ├── layout.tsx            # Shared dashboard layout + bottom nav
│   │   │   ├── page.tsx              # Home dashboard
│   │   │   ├── monitoring/
│   │   │   │   ├── page.tsx          # List records
│   │   │   │   ├── create/page.tsx   # Input form
│   │   │   │   ├── chart/page.tsx    # Trend chart
│   │   │   │   └── [id]/page.tsx     # Detail
│   │   │   ├── education/
│   │   │   │   ├── page.tsx          # List articles
│   │   │   │   └── [slug]/page.tsx   # Article detail
│   │   │   ├── medications/page.tsx  # Medication list + reminders
│   │   │   ├── schedule/page.tsx     # Control schedule
│   │   │   ├── history/page.tsx      # Consultation history
│   │   │   ├── notifications/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── nurse/                    # Perawat pages
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── assessments/create/page.tsx
│   │   │   ├── interventions/create/page.tsx
│   │   │   └── evaluations/create/page.tsx
│   │   ├── admin/                    # Admin pages
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   └── nurses/
│   │   │       ├── page.tsx
│   │   │       └── create/page.tsx
│   │   ├── api/                      # API Routes (Backend)
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── monitoring/route.ts
│   │   │   ├── education/route.ts
│   │   │   ├── medications/route.ts
│   │   │   ├── schedules/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── nurse/
│   │   │   ├── admin/
│   │   │   ├── upload/route.ts
│   │   │   ├── cron/
│   │   │   │   ├── medication-reminders/route.ts
│   │   │   │   └── abnormal-alerts/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   ├── components/                   # Shared React components
│   │   ├── ui/                       # Base UI components
│   │   ├── forms/                    # Form components
│   │   ├── charts/                   # Chart components
│   │   └── layout/                   # Layout components (nav, sidebar)
│   ├── lib/                          # Utilities
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── utils.ts                  # Helper functions
│   │   └── constants.ts              # Thresholds, enums
│   ├── types/                        # TypeScript types
│   └── middleware.ts                 # Auth + role middleware
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/
│   └── seed.ts                       # Seeder (admin, sample data)
├── public/                           # Static assets
├── docs/
│   └── project-docs/
├── next.config.js
├── tailwind.config.ts
├── vercel.json                       # Cron config
├── tsconfig.json
├── package.json
└── .env.local                        # Environment variables
```

---

## Free Tier Limits & Constraints

| Service | Free Tier Limit | TeleNurse Usage Estimate | Status |
|---------|----------------|--------------------------|--------|
| **Vercel** (Hobby) | 100GB bandwidth/mo, 10s function timeout, 100K invocations/mo | ~50 users, 1 project only | ✅ Lebih dari cukup |
| **Neon Tech** | 512MB storage, 190 compute hours/mo | ~50-100MB data | ✅ Aman |
| **Vercel Blob** | 10GB storage | Media edukasi ~1-3GB | ✅ Cukup |
| **Resend** | 100 emails/day | Reminders + reset password ~50-80/day | ✅ OK |
| **Vercel Cron** | 1 cron job (Hobby), daily max | Medication reminders | ⚠️ Limited — supplement with cron-job.org |

### Vercel Cron Limitation

Vercel Hobby plan only allows **1 cron job** running max **once per day**. Untuk pengingat obat yang perlu lebih frequent:

**Solution**: Pakai [cron-job.org](https://cron-job.org) (gratis) sebagai supplement:
- Hit `/api/cron/medication-reminders` setiap jam
- Hit `/api/cron/abnormal-alerts` setiap 30 menit
- Endpoint dilindungi dengan `CRON_SECRET` header
