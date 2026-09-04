-- ==============================================================================
-- Migration: Add Parent Linkage & Verification Columns to checkup_schedules
-- Padre Burgos RHU Maternal and Infant Health Monitoring System
-- ==============================================================================

-- 1. Ensure explicit linkage columns exist on public.checkup_schedules
alter table if exists public.checkup_schedules add column if not exists "parentName" text;
alter table if exists public.checkup_schedules add column if not exists "user_id" text;
alter table if exists public.checkup_schedules add column if not exists "maternalRecordId" text;
alter table if exists public.checkup_schedules add column if not exists "infantRecordId" text;
alter table if exists public.checkup_schedules add column if not exists "confirmedAt" timestamp with time zone;
alter table if exists public.checkup_schedules add column if not exists "confirmedBy" text;
alter table if exists public.checkup_schedules add column if not exists "instructions" text;
alter table if exists public.checkup_schedules add column if not exists "declineReason" text;

-- 2. Create performance indexes for rapid query & patient dashboard matching
create index if not exists idx_checkup_schedules_parent on public.checkup_schedules("parentName");
create index if not exists idx_checkup_schedules_user on public.checkup_schedules("user_id");
create index if not exists idx_checkup_schedules_maternal on public.checkup_schedules("maternalRecordId");
create index if not exists idx_checkup_schedules_infant on public.checkup_schedules("infantRecordId");
create index if not exists idx_checkup_schedules_status on public.checkup_schedules(status);
