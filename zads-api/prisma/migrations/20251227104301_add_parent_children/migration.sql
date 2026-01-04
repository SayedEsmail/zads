/*
  Warnings:

  - You are about to drop the column `latitude` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `parents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parents" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "area_id" TEXT;

-- CreateTable
CREATE TABLE "parent_children" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_child_subjects" (
    "id" TEXT NOT NULL,
    "parent_child_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "parent_child_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parent_children_parent_id_idx" ON "parent_children"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_child_subjects_parent_child_id_subject_id_key" ON "parent_child_subjects"("parent_child_id", "subject_id");

-- CreateIndex
CREATE INDEX "parents_area_id_idx" ON "parents"("area_id");

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_children" ADD CONSTRAINT "parent_children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_children" ADD CONSTRAINT "parent_children_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_child_subjects" ADD CONSTRAINT "parent_child_subjects_parent_child_id_fkey" FOREIGN KEY ("parent_child_id") REFERENCES "parent_children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_child_subjects" ADD CONSTRAINT "parent_child_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
