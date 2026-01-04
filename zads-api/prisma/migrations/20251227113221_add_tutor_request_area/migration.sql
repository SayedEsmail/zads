/*
  Warnings:

  - You are about to drop the column `latitude` on the `tutor_requests` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `tutor_requests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tutor_requests_latitude_longitude_idx";

-- DropIndex
DROP INDEX "tutor_requests_subject_id_stage_id_status_idx";

-- AlterTable
ALTER TABLE "tutor_requests" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "area_id" TEXT,
ADD COLUMN     "parent_child_id" TEXT;

-- CreateIndex
CREATE INDEX "tutor_requests_area_id_subject_id_stage_id_status_idx" ON "tutor_requests"("area_id", "subject_id", "stage_id", "status");

-- CreateIndex
CREATE INDEX "tutor_requests_parent_id_idx" ON "tutor_requests"("parent_id");

-- AddForeignKey
ALTER TABLE "tutor_requests" ADD CONSTRAINT "tutor_requests_parent_child_id_fkey" FOREIGN KEY ("parent_child_id") REFERENCES "parent_children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_requests" ADD CONSTRAINT "tutor_requests_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
