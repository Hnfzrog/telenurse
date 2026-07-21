# TeleNurse — Product Requirements Document (PRD)

## Description

TeleNurse adalah website responsif pelayanan keperawatan digital berbasis smartphone dan internet. Platform ini memungkinkan pasien memantau kesehatan, mengakses edukasi, dan menerima asuhan keperawatan secara online dari perawat profesional.

## Important

- **Budget**: Rp 0 — seluruh stack menggunakan free tier
- **Scale target**: Minimal 50 concurrent users (testing phase)
- **Fitur excluded**: Konsultasi Online (chat real-time) — tidak dibangun
- Seluruh spesifikasi fitur di bawah sudah FINAL berdasarkan client feedback.

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Target Users & Personas](#target-users--personas)
- [Role System](#role-system)
- [Feature Specifications](#feature-specifications)

## Scope

Membangun MVP website TeleNurse dengan fitur monitoring kesehatan, edukasi digital, pengingat obat, jadwal kontrol, riwayat pelayanan, dan dokumentasi keperawatan digital. Aplikasi bersifat responsive (mobile-first) dan deployable di Vercel free tier (Next.js monolith).

## Goals

1. Pasien bisa self-register dan input data kesehatan harian secara mandiri
2. Perawat bisa memantau kondisi pasien dan mendokumentasikan asuhan keperawatan digital
3. Admin bisa mengelola konten edukasi dan akun perawat
4. Sistem berjalan stabil untuk 50+ user bersamaan
5. Responsive di smartphone, tablet, dan desktop
6. Seluruh infrastruktur menggunakan layanan gratis (Rp 0 budget)

## Non Goals

- Konsultasi Online / chat real-time antara pasien dan perawat
- Integrasi dengan sistem rekam medis rumah sakit (e.g., SIMRS)
- Pembayaran / billing system
- Telemedicine video call
- Native mobile app (Android/iOS) — hanya responsive website
- Multi-language support (English) — hanya Bahasa Indonesia

---

## Target Users & Personas

### 1. Pasien Penyakit Kronis
- Hipertensi, diabetes mellitus, gagal jantung, stroke
- Butuh monitoring berkelanjutan tanpa sering ke faskes
- Usia bervariasi, kemampuan teknologi dasar

### 2. Lansia
- Keterbatasan mobilitas, butuh bantuan keluarga/pendamping
- Interface harus simple dan font besar

### 3. Pasien Pasca Rawat Inap
- Butuh follow-up dan monitoring lanjutan
- Mencegah komplikasi pasca perawatan

### 4. Masyarakat Daerah Terpencil
- Akses faskes terbatas (jarak, biaya transportasi)
- Koneksi internet mungkin tidak stabil

### 5. Keluarga Pasien
- Membantu pasien dalam penggunaan aplikasi
- Akses edukasi kesehatan tentang perawatan di rumah

---

## Role System

| Role | Registrasi | Akses |
|------|-----------|-------|
| **Pasien** | Self-register (email + password) | Input monitoring, lihat edukasi, pengingat obat, jadwal kontrol, riwayat, profil |
| **Perawat** | Ditambahkan oleh Admin | Pantau monitoring pasien, dokumentasi keperawatan (pengkajian/intervensi/evaluasi), kelola jadwal kontrol |
| **Admin** | Seeded / manual | Kelola artikel edukasi, tambah & kelola akun perawat |

- Tidak ada limit jumlah pasien per perawat
- Pasien self-register tanpa invite/approval

---

## Feature Specifications

### F1. Auth & Registrasi

| Item | Detail |
|------|--------|
| Login | Email + password |
| Register | Pasien: self-register. Perawat: dibuat Admin |
| Lupa Password | Reset via email |
| Session | NextAuth.js (JWT in httpOnly cookie) |

### F2. Dashboard Home

| Item | Detail |
|------|--------|
| Pasien | Greeting "Hallo, [nama]", menu utama (5 icon grid), quick action, bottom nav |
| Perawat | Daftar pasien yang dipantau, notifikasi monitoring abnormal, akses dokumentasi |
| Admin | Kelola artikel, kelola akun perawat |

### F3. Monitoring Kesehatan

| Item | Detail |
|------|--------|
| Parameter (8) | Tekanan darah, gula darah, suhu tubuh, saturasi oksigen, berat badan, denyut nadi, keluhan, **tinggi badan** |
| Input | Pasien input manual, form per parameter |
| Frekuensi | Bebas input kapan saja (tidak dibatasi) |
| Status indikator | Normal / Abnormal berdasarkan threshold standar medis |
| Grafik trend | Ya, tampilan grafik perkembangan dari waktu ke waktu |
| Alert | Ya, notifikasi in-app ke perawat **DAN pasien** jika data abnormal |

### F4. Edukasi Kesehatan

| Item | Detail |
|------|--------|
| Format konten | Artikel teks + gambar + embed video YouTube |
| Kategori | Penyakit Tidak Menular (PTM), Kepatuhan Minum Obat, Pola Hidup Sehat, Lainnya |
| Konten awal | Dummy content (client akan sediakan nanti) |
| Pengelola | Admin (CRUD artikel) |
| Akses | Semua role bisa baca |

### F5. Pengingat Obat

| Item | Detail |
|------|--------|
| Channel notifikasi | In-app notification + email (Resend free tier, 100/hari). (WhatsApp excluded for MVP) |
| Siapa set jadwal | Perawat yang mengatur jadwal obat pasien |
| Detail obat | Nama obat, dosis, jadwal minum, aturan pakai, efek samping, instruksi khusus |
| Mekanisme | Vercel Cron / cron-job.org hit endpoint → kirim email + create in-app notif |

### F6. Jadwal Kontrol

| Item | Detail |
|------|--------|
| Tipe | Keduanya: Booking oleh pasien (request) DAN reminder manual dari perawat |
| Lokasi faskes | Input manual (tanpa database faskes) |
| Konfirmasi | Ya, jadwal yang di-request pasien butuh konfirmasi (approve/reject) oleh perawat |

### F7. Riwayat Konsultasi / Pelayanan

| Item | Detail |
|------|--------|
| Konten | Log semua pelayanan: pengkajian, intervensi, evaluasi |
| Retention | Simpan unlimited (selama DB storage cukup) |
| Export | Ya, export PDF + Excel (client-side generation) |
| Akses keluarga | Tidak ada (MVP) — hanya pasien dan perawat yang bisa lihat |

### F8. Dokumentasi Digital (Asuhan Keperawatan)

| Item | Detail |
|------|--------|
| Pengkajian | Perawat mengisi form pengkajian kondisi pasien |
| Diagnosis | Diagnosis keperawatan berdasarkan data |
| Intervensi | Rencana tindakan keperawatan |
| Implementasi | Catatan tindakan yang dilakukan |
| Evaluasi | Evaluasi hasil tindakan |

### F9. Profil & Akun

| Item | Detail |
|------|--------|
| Data pasien | Nama, email, telepon, tanggal lahir, alamat, jenis kelamin |
| Data kesehatan awal | Riwayat penyakit, alergi, golongan darah, obat rutin |
| Edit profil | User bisa update data pribadi |
