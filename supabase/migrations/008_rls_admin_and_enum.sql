-- =====================================================================
--  Phase 10 — schema migration + RLS policies for the admin panel
--  Run this in Supabase SQL Editor. Phases 5/7/8 policies must already exist.
-- =====================================================================

-- Add a 'suspended' state for chefs. Your original enum only covers the
-- signup lifecycle (pending -> verified/rejected); this adds the ability
-- to pull a previously-verified chef without deleting their account.
ALTER TYPE chef_verification_enum ADD VALUE IF NOT EXISTS 'suspended';

-- Admin needs to be able to read its own row via the REGULAR (non-service-
-- role) client — this is what Phase 5's middleware uses to decide whether
-- to let a request through to /admin/*. Without this policy, even a real
-- admin gets bounced back to /admin/login.
CREATE POLICY "Admins can read their own admin row"
ON tbl_admin FOR SELECT
USING (adm_email = auth.email());

-- =====================================================================
-- End of Phase 10 migration
-- =====================================================================
