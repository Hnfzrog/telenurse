# TeleNurse — UI/UX Design Guidelines

## Description

Panduan desain UI/UX untuk TeleNurse, berdasarkan reference image yang diberikan client. Mobile-first responsive design dengan tema healthcare biru-putih.

## Important

- **Design reference**: WhatsApp Image 2026-07-17 (6 screen mockup dari client)
- **Approach**: Mobile-first, kemudian scale up ke tablet/desktop
- **Branding**: Mengikuti reference image (belum ada logo/palette resmi dari client)
- **Konsultasi Online screen dari reference image TIDAK dibangun**

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Design System](#design-system)
- [Screen Inventory](#screen-inventory)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Component Patterns](#component-patterns)

## Scope

Visual design guidelines dan screen inventory untuk seluruh halaman TeleNurse MVP.

## Goals

1. Mobile-first responsive — optimal di smartphone 360px+
2. Accessible — font besar untuk lansia, kontras tinggi
3. Konsisten dengan reference image healthcare theme
4. Simple navigation — bottom nav (mobile), sidebar (desktop)

## Non Goals

- Native mobile app design
- Dark mode (MVP)
- Complex animations
- Design system library/Storybook

---

## Design System

### Color Palette (dari reference image)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#2196F3` | Primary blue — header, buttons, icons |
| `--primary-dark` | `#1565C0` | Darker blue — hover states, gradients |
| `--primary-light` | `#BBDEFB` | Light blue — backgrounds, cards |
| `--accent` | `#4CAF50` | Green — status normal, success |
| `--warning` | `#FF9800` | Orange — warning states |
| `--danger` | `#F44336` | Red — error, abnormal values |
| `--background` | `#F5F7FA` | Page background |
| `--surface` | `#FFFFFF` | Card/surface background |
| `--text-primary` | `#212121` | Primary text |
| `--text-secondary` | `#757575` | Secondary text |
| `--text-on-primary` | `#FFFFFF` | Text on primary color |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 (Page title) | Inter / System | 24px | 700 |
| H2 (Section) | Inter / System | 20px | 600 |
| H3 (Card title) | Inter / System | 16px | 600 |
| Body | Inter / System | 14px | 400 |
| Caption | Inter / System | 12px | 400 |
| Button | Inter / System | 14px | 600 |

### Spacing Scale

```
4px  — xs
8px  — sm
12px — md
16px — lg
24px — xl
32px — 2xl
```

### Border Radius

```
8px  — cards, inputs
12px — buttons
16px — modals, bottom sheets
50%  — avatars, icon circles
```

---

## Screen Inventory

### Auth Screens

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 1 | **Splash Screen** | `/` | Logo + tagline, auto-redirect ke login/dashboard |
| 2 | **Login** | `/auth/login` | Email + password, "Ingat saya", "Lupa password?", link register |
| 3 | **Register** | `/auth/register` | Form: nama, email, password, confirm password |
| 4 | **Forgot Password** | `/auth/forgot-password` | Input email → kirim reset link |

### Pasien Screens

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 5 | **Home / Dashboard** | `/dashboard` | Greeting, 6 menu grid (tanpa Konsultasi Online = 5 menu), "Butuh bantuan?" section |
| 6 | **Monitoring - List** | `/monitoring` | List riwayat data kesehatan, tombol "+ Catat" |
| 7 | **Monitoring - Input** | `/monitoring/create` | Form input: TD, gula, suhu, SpO2, BB, HR, keluhan |
| 8 | **Monitoring - Detail** | `/monitoring/:id` | Detail satu record + status Normal/Abnormal |
| 9 | **Monitoring - Grafik** | `/monitoring/chart` | Grafik trend parameter dari waktu ke waktu |
| 10 | **Edukasi - List** | `/education` | Kategori tabs + list artikel dengan thumbnail |
| 11 | **Edukasi - Detail** | `/education/:slug` | Artikel full + embed video |
| 12 | **Pengingat Obat** | `/medications` | List obat (detail efek samping/instruksi) + jadwal minum |
| 13 | **Jadwal Kontrol** | `/schedule` | Booking jadwal, list upcoming + history + status |
| 14 | **Riwayat** | `/history` | Timeline pelayanan keperawatan |
| 15 | **Profil** | `/profile` | Data pribadi + data kesehatan + edit |
| 16 | **Notifikasi** | `/notifications` | List notifikasi in-app |

### Perawat Screens

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 17 | **Dashboard Perawat** | `/nurse/dashboard` | List pasien, alert abnormal, quick actions |
| 18 | **Pasien Detail** | `/nurse/patients/:id` | Overview pasien: monitoring terbaru, obat, jadwal |
| 19 | **Pengkajian** | `/nurse/assessments/create` | Form SOAP: Subjective, Objective, Assessment, Plan |
| 20 | **Intervensi** | `/nurse/interventions/create` | Form tindakan + hasil |
| 21 | **Evaluasi** | `/nurse/evaluations/create` | Form evaluasi + follow-up |
| 22 | **Jadwal Pasien** | `/nurse/patients/:id/schedules` | Approve/reject booking jadwal kontrol |
| 23 | **Riwayat Pasien** | `/nurse/patients/:id/history` | Timeline asuhan keperawatan |

### Admin Screens

| # | Screen | Route | Notes |
|---|--------|-------|-------|
| 23 | **Dashboard Admin** | `/admin/dashboard` | Stats overview |
| 24 | **Kelola Artikel** | `/admin/articles` | CRUD artikel edukasi |
| 25 | **Artikel Form** | `/admin/articles/create` | Editor: title, category, body, thumbnail, video |
| 26 | **Kelola Perawat** | `/admin/nurses` | List perawat + tambah akun perawat |
| 27 | **Tambah Perawat** | `/admin/nurses/create` | Form: nama, email, generate password |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | < 768px | Single column, bottom nav, hamburger menu |
| **Tablet** | 768px - 1024px | 2 column grid, bottom nav or sidebar |
| **Desktop** | > 1024px | Sidebar nav, multi-column content, wider cards |

### Mobile Layout (Primary)

```
┌─────────────────────────┐
│ Header (greeting/title) │
├─────────────────────────┤
│                         │
│   Content Area          │
│   (scrollable)          │
│                         │
│                         │
├─────────────────────────┤
│ Bottom Navigation       │
│ Home | Edukasi | Mon | Akun │
└─────────────────────────┘
```

### Desktop Layout

```
┌──────────┬──────────────────────────────┐
│          │  Header / Breadcrumb         │
│ Sidebar  ├──────────────────────────────┤
│ Nav      │                              │
│          │  Content Area                │
│ - Home   │  (multi-column possible)     │
│ - Mon    │                              │
│ - Edu    │                              │
│ - Obat   │                              │
│ - Jadwal │                              │
│ - Riwayat│                              │
│ - Profil │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

---

## Component Patterns

### Menu Grid (Home Dashboard)

Dari reference image — 6 icon grid (kita jadi 5 tanpa Konsultasi Online):

```
┌──────────┬──────────┬──────────┐
│ Pengingat│Monitoring│ Edukasi  │
│   Obat   │Kesehatan │Kesehatan │
├──────────┼──────────┼──────────┤
│  Jadwal  │ Riwayat  │          │
│ Kontrol  │Konsultasi│          │
└──────────┴──────────┴──────────┘
```

Setiap item: icon circle (primary color) + label text di bawah.

### Health Monitoring Card

Dari reference image — vertical list:

```
┌─────────────────────────────────┐
│ 🔴 Tekanan Darah                │
│    120/80 mmHg          Normal  │
├─────────────────────────────────┤
│ 🟡 Suhu Tubuh                   │
│    36.5 °C              Normal  │
├─────────────────────────────────┤
│ 🟢 Denyut Nadi                  │
│    80 x/menit           Normal  │
├─────────────────────────────────┤
│ 🔵 Saturasi Oksigen             │
│    98 %                         │
├─────────────────────────────────┤
│      [ Simpan Data ]            │
└─────────────────────────────────┘
```

### Education Card

Dari reference image — horizontal card with thumbnail:

```
┌──────┬──────────────────────────┐
│      │ Pola Hidup Sehat Setiap  │
│ IMG  │ Hari                     │
│      │ Tips menjaga kesehatan...│
│      │ Baca selengkapnya →      │
└──────┴──────────────────────────┘
```

### Bottom Navigation (Mobile)

```
┌───────┬───────────┬────────────┬───────┐
│ Home  │ Edukasi   │ Monitoring │ Akun  │
│  🏠   │   📚      │    ❤️      │  👤   │
└───────┴───────────┴────────────┴───────┘
```

### Jadwal Kontrol Card

```
┌─────────────────────────────────┐
│ 📅 15 Agustus 2026, 14:00       │
│    RSUD Sejahtera               │
│                                 │
│ Status: ⏳ Menunggu Konfirmasi  │
│ Tujuan: Kontrol Rutin           │
└─────────────────────────────────┘
```
