# TeleNurse — API Contract

## Description

API contract untuk Next.js API Routes — backend endpoints yang melayani frontend. Karena Next.js monolith, beberapa data bisa diakses langsung via Server Components (tanpa API call), tapi API routes tetap tersedia untuk client-side fetching.

## Important

- **Base path**: `/api/*` (same origin, no CORS)
- **Auth**: NextAuth.js (JWT in httpOnly cookie, auto-attached)
- **Content-Type**: `application/json`
- Server Components bisa akses Prisma langsung tanpa API route

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Data Access Patterns](#data-access-patterns)
- [Common Response Format](#common-response-format)
- [Endpoints](#endpoints)

## Scope

Seluruh API route endpoints untuk MVP TeleNurse.

## Goals

1. RESTful naming conventions
2. Consistent response format
3. Role-based access control via NextAuth middleware
4. Pagination untuk list endpoints

## Non Goals

- GraphQL
- WebSocket / real-time endpoints
- API versioning
- Rate limiting (belum perlu untuk 50 users)

---

## Data Access Patterns

Next.js App Router memungkinkan 2 cara akses data:

| Pattern | Kapan Dipakai | Contoh |
|---------|---------------|--------|
| **Server Component → Prisma** | Read-only page render (SSR) | Dashboard, list monitoring, list edukasi |
| **API Route → Client fetch** | Mutations (create/update/delete), interaktif | Submit monitoring, login, CRUD artikel |

Ini berarti tidak semua operasi butuh API route — Server Components bisa langsung query database.

---

## Common Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Success (paginated)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 15,
    "totalPages": 5,
    "totalCount": 72
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden (wrong role) |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Server Error |

---

## Endpoints

### Auth (NextAuth.js)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `*` | `/api/auth/[...nextauth]` | Public | NextAuth catch-all (login, logout, session, CSRF) |
| `POST` | `/api/auth/register` | Public | Custom: register pasien baru |
| `POST` | `/api/auth/forgot-password` | Public | Custom: kirim email reset |
| `POST` | `/api/auth/reset-password` | Public | Custom: reset password |

#### POST `/api/auth/register`
```json
// Request
{
  "name": "Siti Aisyah",
  "email": "siti@example.com",
  "password": "password123",
  "passwordConfirmation": "password123"
}

// Response 201
{
  "success": true,
  "message": "Registrasi berhasil"
}
```

> **Login** handled by NextAuth.js `signIn("credentials", { email, password })` on the client side. No custom endpoint needed.

---

### Patient Profile

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/profile` | Pasien | Get own profile |
| `PUT` | `/api/profile` | Pasien | Update profile |
| `PUT` | `/api/profile/health` | Pasien | Update health data |

---

### Health Monitoring

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/monitoring` | Pasien | List own records (paginated) |
| `POST` | `/api/monitoring` | Pasien | Create new record |
| `GET` | `/api/monitoring/latest` | Pasien | Get latest record |
| `GET` | `/api/monitoring/chart` | Pasien | Chart trend data |

> **Note**: Detail record (`/monitoring/[id]`) dan list can be rendered via Server Component (direct Prisma query) — no API route needed.

#### POST `/api/monitoring`
```json
// Request
{
  "systolicBp": 120,
  "diastolicBp": 80,
  "bloodSugar": 95.5,
  "bodyTemperature": 36.5,
  "oxygenSaturation": 98,
  "bodyWeight": 65.0,
  "heartRate": 80,
  "height": 165.5,
  "complaints": "Sedikit pusing sejak tadi pagi"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 42,
    "systolicBp": 120,
    "diastolicBp": 80,
    "isAbnormal": false,
    "recordedAt": "2026-07-18T14:30:00Z"
  }
}
```

---

### Education

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/education` | Auth | List articles (paginated, filter by category) |
| `GET` | `/api/education/categories` | Auth | List categories |

> Detail article rendered via Server Component at `/education/[slug]`.

Query: `?categoryId=1&search=hipertensi&page=1&pageSize=10`

---

### Medications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/medications` | Pasien | List own medications + reminders |

---

### Schedules

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/schedules` | Pasien | List own control schedules |
| `POST` | `/api/schedules` | Pasien | Request (booking) jadwal kontrol baru |

---

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/notifications` | Auth | List notifications (paginated) |
| `PUT` | `/api/notifications/[id]/read` | Auth | Mark as read |
| `PUT` | `/api/notifications/read-all` | Auth | Mark all as read |
| `GET` | `/api/notifications/unread-count` | Auth | Get unread count |

---

### Nurse Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/nurse/patients` | Perawat | List all patients |
| `GET` | `/api/nurse/patients/[id]/monitoring` | Perawat | Patient health records |
| `GET` | `/api/nurse/alerts` | Perawat | Abnormal monitoring alerts |
| `POST` | `/api/nurse/assessments` | Perawat | Create SOAP assessment |
| `POST` | `/api/nurse/interventions` | Perawat | Create intervention |
| `POST` | `/api/nurse/evaluations` | Perawat | Create evaluation |
| `POST` | `/api/nurse/patients/[id]/medications` | Perawat | Add medication |
| `PUT` | `/api/nurse/medications/[id]` | Perawat | Update medication |
| `DELETE` | `/api/nurse/medications/[id]` | Perawat | Remove medication |
| `POST` | `/api/nurse/patients/[id]/schedules` | Perawat | Create control schedule |
| `PUT` | `/api/nurse/schedules/[id]` | Perawat | Update schedule |
| `PUT` | `/api/nurse/schedules/[id]/approve` | Perawat | Approve jadwal dari pasien |
| `PUT` | `/api/nurse/schedules/[id]/reject` | Perawat | Reject jadwal dari pasien |

---

### Admin Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/admin/articles` | Admin | Create article |
| `PUT` | `/api/admin/articles/[id]` | Admin | Update article |
| `DELETE` | `/api/admin/articles/[id]` | Admin | Delete article |
| `POST` | `/api/admin/articles/[id]/publish` | Admin | Publish/unpublish |
| `POST` | `/api/admin/categories` | Admin | Create category |
| `PUT` | `/api/admin/categories/[id]` | Admin | Update category |
| `DELETE` | `/api/admin/categories/[id]` | Admin | Delete category |
| `POST` | `/api/admin/nurses` | Admin | Create nurse account |
| `PUT` | `/api/admin/nurses/[id]` | Admin | Update nurse |
| `DELETE` | `/api/admin/nurses/[id]` | Admin | Deactivate nurse |

> **List** endpoints for admin (articles list, nurses list) can use Server Components — no API route needed.

---

### Cron Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/cron/medication-reminders` | CRON_SECRET | Send medication reminder emails |
| `GET` | `/api/cron/abnormal-alerts` | CRON_SECRET | Notify nurses and patients of abnormal records |
| `GET` | `/api/health` | Public | Health check / keep-warm |

---

### Upload

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/upload` | Admin | Get Vercel Blob upload token for client-side upload |
