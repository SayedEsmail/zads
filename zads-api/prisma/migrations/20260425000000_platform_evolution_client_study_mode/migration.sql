-- Platform evolution: Client/Learner personas, study modes, online/offline pricing
-- PE-1: Prisma schema changes

-- Create new enums
CREATE TYPE "ClientAccountKind" AS ENUM ('student', 'guardian');
CREATE TYPE "RequestTarget" AS ENUM ('self', 'dependent');
CREATE TYPE "StudyMode" AS ENUM ('online', 'offline', 'both');

-- Add clientAccountKind to parents table
ALTER TABLE "parents" ADD COLUMN "client_account_kind" "ClientAccountKind" NOT NULL DEFAULT 'guardian';

-- Add requestTarget and studyMode to tutor_requests table
ALTER TABLE "tutor_requests" ADD COLUMN "request_target" "RequestTarget" NOT NULL DEFAULT 'dependent';
ALTER TABLE "tutor_requests" ADD COLUMN "study_mode" "StudyMode" NOT NULL DEFAULT 'both';

-- Add priceOnline and priceOffline to teacher_subjects table
ALTER TABLE "teacher_subjects" ADD COLUMN "price_online" INTEGER;
ALTER TABLE "teacher_subjects" ADD COLUMN "price_offline" INTEGER;

-- Backfill: if parentChildId is null, set requestTarget = self
UPDATE "tutor_requests" SET "request_target" = 'self' WHERE "parent_child_id" IS NULL;
-- (rows with parentChildId already default to 'dependent' above)

-- Backfill: clientAccountKind = guardian if parent has any children, else student
UPDATE "parents" SET "client_account_kind" = 'student'
  WHERE id NOT IN (SELECT DISTINCT parent_id FROM "parent_children");

-- Backfill: priceOffline from priceAtStudent (most representative in-person price)
UPDATE "teacher_subjects"
  SET "price_offline" = COALESCE("price_at_student", "price_at_teacher")
  WHERE "price_offline" IS NULL;

-- Backfill: priceOnline from priceAtStudent as initial estimate (teachers can update later)
UPDATE "teacher_subjects"
  SET "price_online" = COALESCE("price_at_student", "price_at_teacher")
  WHERE "price_online" IS NULL;
