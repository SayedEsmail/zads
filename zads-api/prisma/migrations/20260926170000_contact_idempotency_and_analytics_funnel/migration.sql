-- Migration: 20260926170000_contact_idempotency_and_analytics_funnel

-- AlterTable: contact_requests add idempotency_key
ALTER TABLE "contact_requests" ADD COLUMN "idempotency_key" TEXT;
CREATE UNIQUE INDEX "contact_requests_idempotency_key_key" ON "contact_requests"("idempotency_key");

-- CreateTable: platform_events
CREATE TABLE "platform_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "session_id" TEXT,
    "user_id" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "dedup_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_events_dedup_key_key" ON "platform_events"("dedup_key");
CREATE INDEX "platform_events_event_type_idx" ON "platform_events"("event_type");
CREATE INDEX "platform_events_session_id_idx" ON "platform_events"("session_id");
CREATE INDEX "platform_events_created_at_idx" ON "platform_events"("created_at");

-- Unique constraint for active pending requests between same parent & teacher for same subject
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_contact_request" ON "contact_requests"("parent_id", "teacher_id", COALESCE("subject_id", '00000000-0000-0000-0000-000000000000')) WHERE status = 'pending';

