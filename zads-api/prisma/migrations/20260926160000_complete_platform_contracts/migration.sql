-- Complete platform contracts: missing schema alignments and contact/subject evolution
-- Migration: 20260926160000_complete_platform_contracts

-- AlterTable: teachers
ALTER TABLE "teachers" ADD COLUMN "certificate_url" TEXT;
ALTER TABLE "teachers" ADD COLUMN "verified_at" TIMESTAMP(3);
ALTER TABLE "teachers" ADD COLUMN "verified_by" TEXT;
ALTER TABLE "teachers" ADD COLUMN "verification_notes" TEXT;

-- AlterTable: parent_children
ALTER TABLE "parent_children" ADD COLUMN "school_type" TEXT;

-- AlterTable: teacher_subjects
ALTER TABLE "teacher_subjects" ADD COLUMN "is_offline" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "teacher_subjects" ADD COLUMN "is_online" BOOLEAN NOT NULL DEFAULT false;

-- Backfill teacher_subjects: set is_online = true where price_online is present
UPDATE "teacher_subjects" SET "is_online" = true WHERE "price_online" IS NOT NULL;

-- AlterTable: contact_requests
ALTER TABLE "contact_requests" ADD COLUMN "initiated_by" TEXT NOT NULL DEFAULT 'parent';
ALTER TABLE "contact_requests" ADD COLUMN "reply_message" TEXT;
ALTER TABLE "contact_requests" ADD COLUMN "study_mode" "StudyMode";
ALTER TABLE "contact_requests" ADD COLUMN "teaching_place" TEXT;
ALTER TABLE "contact_requests" ADD COLUMN "preferred_time" TEXT;
ALTER TABLE "contact_requests" ADD COLUMN "tutor_request_id" TEXT;

-- CreateTable: teacher_availabilities
CREATE TABLE "teacher_availabilities" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_availabilities_teacher_id_day_of_week_start_time_en_key" ON "teacher_availabilities"("teacher_id", "day_of_week", "start_time", "end_time");
CREATE INDEX "contact_requests_tutor_request_id_idx" ON "contact_requests"("tutor_request_id");

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_tutor_request_id_fkey" FOREIGN KEY ("tutor_request_id") REFERENCES "tutor_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
