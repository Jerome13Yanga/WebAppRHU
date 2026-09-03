-- ============================================================================
-- Padre Burgos RHU Maternal & Infant Health Monitoring System
-- Migration: Enable Nurse/Midwife Edit Permissions on Emergency Contacts
-- Run this once in Supabase Dashboard > SQL Editor if your tables already exist.
-- ============================================================================

-- Drop old admin-only policies on emergency_contacts
drop policy if exists "Allow admin write on emergency_contacts" on public.emergency_contacts;
drop policy if exists "Allow staff or admin write on emergency_contacts" on public.emergency_contacts;

-- Create updated policy allowing:
-- 1. Administrator: can create/edit/delete contacts for ANY barangay.
-- 2. Nurse / Midwife: can create/edit contacts for THEIR ASSIGNED BARANGAY only.
create policy "Allow staff or admin write on emergency_contacts" on public.emergency_contacts for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Administrator')
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Nurse / Midwife', 'Nurse', 'Midwife') and barangay = emergency_contacts.barangay)
  )
)
with check (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Administrator')
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Nurse / Midwife', 'Nurse', 'Midwife') and barangay = emergency_contacts.barangay)
  )
);
