# TeleNurse — Database Schema

## Description

Database schema untuk TeleNurse menggunakan Neon Tech PostgreSQL via Prisma ORM.

## Important

- **Database**: Neon Tech PostgreSQL (free tier, 512MB)
- **ORM**: Prisma 5.x (type-safe, migration system)
- **Schema file**: `prisma/schema.prisma`
- Seluruh struktur sudah FINAL berdasarkan client feedback

## Table of Contents

- [Scope](#scope)
- [Goals](#goals)
- [Non Goals](#non-goals)
- [Prisma Schema](#prisma-schema)
- [Enums & Constants](#enums--constants)

## Scope

Seluruh tabel database yang dibutuhkan untuk MVP TeleNurse.

## Goals

1. Normalized schema — menghindari data redundancy
2. Support multi-role (pasien, perawat, admin)
3. Type-safe via Prisma generated types
4. Fit dalam 512MB Neon free tier

## Non Goals

- Audit log table (bisa ditambah nanti)
- Full-text search index
- Soft delete di semua tabel

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Neon pooled + direct
}

// ============================================================
// AUTH & USERS
// ============================================================

enum Role {
  PASIEN
  PERAWAT
  ADMIN
}

enum Gender {
  LAKI_LAKI
  PEREMPUAN
}

model User {
  id              Int       @id @default(autoincrement())
  name            String
  email           String    @unique
  emailVerifiedAt DateTime? @map("email_verified_at")
  password        String    // bcrypt hashed
  role            Role      @default(PASIEN)
  phone           String?
  avatarUrl       String?   @map("avatar_url")
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  patientProfile       PatientProfile?
  healthRecords        HealthRecord[]       @relation("PatientRecords")
  medications          Medication[]         @relation("PatientMedications")
  medicationsAssigned  Medication[]         @relation("NurseMedications")
  controlSchedules     ControlSchedule[]    @relation("PatientSchedules")
  schedulesCreated     ControlSchedule[]    @relation("NurseSchedules")
  assessmentsAsPatient NursingAssessment[]  @relation("PatientAssessments")
  assessmentsAsNurse   NursingAssessment[]  @relation("NurseAssessments")
  interventions        NursingIntervention[] @relation("NurseInterventions")
  evaluations          NursingEvaluation[]  @relation("NurseEvaluations")
  articlesCreated      EducationContent[]
  notifications        Notification[]

  @@map("users")
}

model PatientProfile {
  id                    Int      @id @default(autoincrement())
  userId                Int      @unique @map("user_id")
  dateOfBirth           DateTime? @map("date_of_birth") @db.Date
  gender                Gender?
  address               String?  @db.Text
  bloodType             String?  @map("blood_type") @db.VarChar(5)
  allergies             String?  @db.Text
  medicalHistory        String?  @map("medical_history") @db.Text
  currentMedications    String?  @map("current_medications") @db.Text
  emergencyContactName  String?  @map("emergency_contact_name")
  emergencyContactPhone String?  @map("emergency_contact_phone") @db.VarChar(20)
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("patient_profiles")
}

// ============================================================
// HEALTH MONITORING
// ============================================================

model HealthRecord {
  id                Int       @id @default(autoincrement())
  patientId         Int       @map("patient_id")
  recordedAt        DateTime  @default(now()) @map("recorded_at")
  systolicBp        Int?      @map("systolic_bp")       // mmHg
  diastolicBp       Int?      @map("diastolic_bp")      // mmHg
  bloodSugar        Decimal?  @map("blood_sugar") @db.Decimal(6, 2) // mg/dL
  bodyTemperature   Decimal?  @map("body_temperature") @db.Decimal(4, 1) // °C
  oxygenSaturation  Int?      @map("oxygen_saturation") // %
  bodyWeight        Decimal?  @map("body_weight") @db.Decimal(5, 1) // kg
  heartRate         Int?      @map("heart_rate")         // bpm
  height            Decimal?  @db.Decimal(5, 1)          // cm
  complaints        String?   @db.Text
  isAbnormal        Boolean   @default(false) @map("is_abnormal")
  abnormalNotes     String?   @map("abnormal_notes") @db.Text
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  patient User @relation("PatientRecords", fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
  @@index([recordedAt])
  @@index([isAbnormal])
  @@map("health_records")
}

// ============================================================
// MEDICATIONS & REMINDERS
// ============================================================

model Medication {
  id           Int       @id @default(autoincrement())
  patientId    Int       @map("patient_id")
  nurseId      Int?      @map("nurse_id")
  name         String
  dosage       String    @db.VarChar(100)
  frequency    String    @db.VarChar(100)
  instructions String?   @db.Text
  startDate    DateTime  @map("start_date") @db.Date
  endDate      DateTime? @map("end_date") @db.Date
  sideEffects  String?   @map("side_effects") @db.Text
  specialInstructions String? @map("special_instructions") @db.Text
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  patient   User                  @relation("PatientMedications", fields: [patientId], references: [id], onDelete: Cascade)
  nurse     User?                 @relation("NurseMedications", fields: [nurseId], references: [id])
  reminders MedicationReminder[]

  @@map("medications")
}

model MedicationReminder {
  id           Int       @id @default(autoincrement())
  medicationId Int       @map("medication_id")
  reminderTime String    @map("reminder_time") @db.VarChar(5) // "08:00"
  isActive     Boolean   @default(true) @map("is_active")
  lastSentAt   DateTime? @map("last_sent_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  medication Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)

  @@map("medication_reminders")
}

// ============================================================
// CONTROL SCHEDULE
// ============================================================

enum ScheduleStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
}

model ControlSchedule {
  id              Int            @id @default(autoincrement())
  patientId       Int            @map("patient_id")
  nurseId         Int?           @map("nurse_id")
  scheduledDate   DateTime       @map("scheduled_date") @db.Date
  scheduledTime   String?        @map("scheduled_time") @db.VarChar(5) // "14:00"
  facilityName    String?        @map("facility_name")
  facilityAddress String?        @map("facility_address") @db.Text
  purpose         String?        @db.Text
  status          ScheduleStatus @default(PENDING)
  requestedBy     String         @default("pasien") @map("requested_by") @db.VarChar(10) // 'pasien' or 'perawat'
  rejectionReason String?        @map("rejection_reason") @db.Text
  notes           String?        @db.Text
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  patient User  @relation("PatientSchedules", fields: [patientId], references: [id], onDelete: Cascade)
  nurse   User? @relation("NurseSchedules", fields: [nurseId], references: [id])

  @@map("control_schedules")
}

// ============================================================
// EDUCATION
// ============================================================

model EducationCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique @db.VarChar(100)
  slug        String   @unique @db.VarChar(100)
  description String?  @db.Text
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  contents EducationContent[]

  @@map("education_categories")
}

model EducationContent {
  id           Int       @id @default(autoincrement())
  categoryId   Int       @map("category_id")
  authorId     Int       @map("author_id")
  title        String
  slug         String    @unique
  excerpt      String?   @db.Text
  body         String    @db.Text
  thumbnailUrl String?   @map("thumbnail_url") @db.VarChar(500)
  videoUrl     String?   @map("video_url") @db.VarChar(500)
  isPublished  Boolean   @default(false) @map("is_published")
  publishedAt  DateTime? @map("published_at")
  viewCount    Int       @default(0) @map("view_count")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  category EducationCategory @relation(fields: [categoryId], references: [id])
  author   User              @relation(fields: [authorId], references: [id])

  @@index([categoryId])
  @@index([isPublished])
  @@map("education_content")
}

// ============================================================
// NURSING DOCUMENTATION
// ============================================================

enum EvaluationStatus {
  IMPROVED
  STABLE
  WORSENED
}

model NursingAssessment {
  id             Int       @id @default(autoincrement())
  patientId      Int       @map("patient_id")
  nurseId        Int       @map("nurse_id")
  assessmentDate DateTime  @default(now()) @map("assessment_date")
  subjective     String?   @db.Text  // Keluhan pasien (S)
  objective      String?   @db.Text  // Data objektif (O)
  diagnosis      String?   @db.Text  // Diagnosis keperawatan
  plan           String?   @db.Text  // Rencana tindakan
  notes          String?   @db.Text
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  patient       User                  @relation("PatientAssessments", fields: [patientId], references: [id], onDelete: Cascade)
  nurse         User                  @relation("NurseAssessments", fields: [nurseId], references: [id])
  interventions NursingIntervention[]
  evaluations   NursingEvaluation[]

  @@map("nursing_assessments")
}

model NursingIntervention {
  id               Int      @id @default(autoincrement())
  assessmentId     Int      @map("assessment_id")
  nurseId          Int      @map("nurse_id")
  interventionDate DateTime @default(now()) @map("intervention_date")
  action           String   @db.Text
  result           String?  @db.Text
  notes            String?  @db.Text
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  assessment NursingAssessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  nurse      User              @relation("NurseInterventions", fields: [nurseId], references: [id])

  @@map("nursing_interventions")
}

model NursingEvaluation {
  id             Int              @id @default(autoincrement())
  assessmentId   Int              @map("assessment_id")
  nurseId        Int              @map("nurse_id")
  evaluationDate DateTime         @default(now()) @map("evaluation_date")
  status         EvaluationStatus
  findings       String           @db.Text
  followUpPlan   String?          @map("follow_up_plan") @db.Text
  notes          String?          @db.Text
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  assessment NursingAssessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  nurse      User              @relation("NurseEvaluations", fields: [nurseId], references: [id])

  @@map("nursing_evaluations")
}

// ============================================================
// NOTIFICATIONS
// ============================================================

enum NotificationType {
  MEDICATION_REMINDER
  ABNORMAL_ALERT
  SCHEDULE_REMINDER
  GENERAL
}

model Notification {
  id            Int              @id @default(autoincrement())
  userId        Int              @map("user_id")
  type          NotificationType
  title         String
  message       String           @db.Text
  referenceType String?          @map("reference_type") @db.VarChar(50)
  referenceId   Int?             @map("reference_id")
  isRead        Boolean          @default(false) @map("is_read")
  readAt        DateTime?        @map("read_at")
  createdAt     DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@map("notifications")
}
```

---

## Enums & Constants

### Abnormal Thresholds (Standar medis umum)

```typescript
// lib/constants.ts
export const HEALTH_THRESHOLDS = {
  systolicBp:       { min: 90,   max: 140  },  // mmHg
  diastolicBp:      { min: 60,   max: 90   },  // mmHg
  bloodSugar:       { min: 70,   max: 200  },  // mg/dL
  bodyTemperature:  { min: 36.0, max: 37.5 },  // °C
  oxygenSaturation: { min: 95,   max: 100  },  // %
  heartRate:        { min: 60,   max: 100  },  // bpm
} as const;
```

### Seed Data

Education categories: `Penyakit Tidak Menular (PTM)`, `Kepatuhan Minum Obat`, `Pola Hidup Sehat`, `Lainnya`

Default accounts:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@telenurse.com | password |
| Perawat | perawat@telenurse.com | password |
| Pasien | pasien@telenurse.com | password |
