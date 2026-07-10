-- Phase 21a — Add super_admin to user_role enum.
-- Run in Supabase SQL Editor as its OWN query (click Run once, wait for success).
--
-- PostgreSQL requires this to commit BEFORE any policy uses 'super_admin'.
-- Do NOT paste 022 in the same run. After this succeeds, run 022_super_admin_policies.sql.

alter type public.user_role add value if not exists 'super_admin';
