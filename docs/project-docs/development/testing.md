# TeleNurse — Testing Strategy

## Description

Testing strategy dan verification commands untuk TeleNurse (Next.js monolith).

## Important

- Testing scope dioptimasi untuk solo developer
- Prioritas: manual testing di mobile viewport > unit tests > e2e
- Semua fitur harus di-test di viewport 360px (mobile) dan 1280px (desktop)

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Testing Approach](#testing-approach)
- [Verification Commands](#verification-commands)

## Scope

Testing guidelines untuk Next.js full-stack application.

## Goals

1. Ensure semua CRUD operations bekerja
2. Role-based access control terverifikasi
3. Responsive layout benar di mobile dan desktop
4. Abnormal threshold detection akurat

## Non Goals

- 100% code coverage
- E2E automated testing (MVP)
- Load/stress testing
- Accessibility testing (WCAG compliance)

---

## Testing Approach

| Type | Tool | Scope |
|------|------|-------|
| **Unit Tests** | Vitest | Utility functions, threshold logic, helpers |
| **API Tests** | Vitest + supertest | API route handlers, auth middleware |
| **Component Tests** | React Testing Library | Critical components (monitoring form, login) |
| **Manual Testing** | Browser DevTools | Responsive layout, user flows per role |

---

## Verification Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build check (catches SSR errors)
npm run build

# Dev server (manual testing)
npm run dev

# Prisma
npx prisma migrate dev        # Run migrations
npx prisma db seed             # Seed data
npx prisma studio              # Visual DB browser
npx prisma generate            # Regenerate client
```

### Manual Testing Checklist

- [ ] Register pasien baru
- [ ] Login sebagai pasien / perawat / admin
- [ ] Input data monitoring
- [ ] Lihat riwayat monitoring
- [ ] Lihat grafik trend (⏳)
- [ ] Buka edukasi kesehatan + filter kategori
- [ ] Lihat daftar obat & pengingat
- [ ] Lihat jadwal kontrol
- [ ] Edit profil
- [ ] Login sebagai perawat → lihat daftar pasien
- [ ] Buat pengkajian keperawatan (SOAP)
- [ ] Login sebagai admin → CRUD artikel
- [ ] Admin → tambah akun perawat
- [ ] Test responsive: 360px, 768px, 1280px
- [ ] Test auth redirect (unauthenticated → login)
- [ ] Test role guard (pasien → /admin → redirect)
