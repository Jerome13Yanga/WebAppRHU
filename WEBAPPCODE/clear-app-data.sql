-- Clean RHU app data for fresh testing.
-- Run this in Supabase Dashboard > SQL Editor.
-- This clears app tables only. It does NOT delete Supabase Auth users.

truncate table
  public.maternal_records,
  public.infant_records,
  public.checkup_schedules,
  public.reminders,
  public.monthly_reports,
  public.emergency_contacts,
  public.profiles
restart identity cascade;
