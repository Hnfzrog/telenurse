-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASIEN', 'PERAWAT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('IMPROVED', 'STABLE', 'WORSENED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEDICATION_REMINDER', 'ABNORMAL_ALERT', 'SCHEDULE_REMINDER', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PASIEN',
    "phone" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender",
    "address" TEXT,
    "blood_type" VARCHAR(5),
    "allergies" TEXT,
    "medical_history" TEXT,
    "current_medications" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "blood_sugar" DECIMAL(6,2),
    "body_temperature" DECIMAL(4,1),
    "oxygen_saturation" INTEGER,
    "body_weight" DECIMAL(5,1),
    "heart_rate" INTEGER,
    "height" DECIMAL(5,1),
    "complaints" TEXT,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "abnormal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "nurse_id" INTEGER,
    "name" TEXT NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "instructions" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "side_effects" TEXT,
    "special_instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_reminders" (
    "id" SERIAL NOT NULL,
    "medication_id" INTEGER NOT NULL,
    "reminder_time" VARCHAR(5) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_schedules" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "nurse_id" INTEGER,
    "scheduled_date" DATE NOT NULL,
    "scheduled_time" VARCHAR(5),
    "facility_name" TEXT,
    "facility_address" TEXT,
    "purpose" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by" VARCHAR(10) NOT NULL DEFAULT 'pasien',
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "needs_follow_up" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_date" DATE,
    "completion_notes" TEXT,

    CONSTRAINT "control_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_logs" (
    "id" SERIAL NOT NULL,
    "medication_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "reported_issue" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_content" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "video_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_assessments" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "nurse_id" INTEGER NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjective" TEXT,
    "objective" TEXT,
    "diagnosis" TEXT,
    "plan" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_interventions" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "nurse_id" INTEGER NOT NULL,
    "intervention_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "result" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_evaluations" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "nurse_id" INTEGER NOT NULL,
    "evaluation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EvaluationStatus" NOT NULL,
    "findings" TEXT NOT NULL,
    "follow_up_plan" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_user_id_key" ON "patient_profiles"("user_id");

-- CreateIndex
CREATE INDEX "health_records_patient_id_idx" ON "health_records"("patient_id");

-- CreateIndex
CREATE INDEX "health_records_recorded_at_idx" ON "health_records"("recorded_at");

-- CreateIndex
CREATE INDEX "health_records_is_abnormal_idx" ON "health_records"("is_abnormal");

-- CreateIndex
CREATE UNIQUE INDEX "education_categories_name_key" ON "education_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "education_categories_slug_key" ON "education_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "education_content_slug_key" ON "education_content"("slug");

-- CreateIndex
CREATE INDEX "education_content_category_id_idx" ON "education_content"("category_id");

-- CreateIndex
CREATE INDEX "education_content_is_published_idx" ON "education_content"("is_published");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_schedules" ADD CONSTRAINT "control_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_schedules" ADD CONSTRAINT "control_schedules_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_content" ADD CONSTRAINT "education_content_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "education_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_content" ADD CONSTRAINT "education_content_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_assessments" ADD CONSTRAINT "nursing_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_assessments" ADD CONSTRAINT "nursing_assessments_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_interventions" ADD CONSTRAINT "nursing_interventions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "nursing_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_interventions" ADD CONSTRAINT "nursing_interventions_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_evaluations" ADD CONSTRAINT "nursing_evaluations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "nursing_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_evaluations" ADD CONSTRAINT "nursing_evaluations_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
