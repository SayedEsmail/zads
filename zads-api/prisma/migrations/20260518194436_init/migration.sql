-- CreateTable
CREATE TABLE "whatsapp_clicks" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_clicks_teacher_id_idx" ON "whatsapp_clicks"("teacher_id");

-- CreateIndex
CREATE INDEX "whatsapp_clicks_parent_id_idx" ON "whatsapp_clicks"("parent_id");

-- AddForeignKey
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
