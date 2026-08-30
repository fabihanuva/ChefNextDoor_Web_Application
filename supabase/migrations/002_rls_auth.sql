-- =====================================================================
--  Phase 5 — RLS policies required for signup/login to work
--  Run this in Supabase SQL Editor AFTER the main schema.
-- =====================================================================

-- tbl_users: a logged-in user can update their own row
-- (needed so signup can fill in usr_phone after the trigger creates the row)
CREATE POLICY "Users can update own profile"
    ON tbl_users FOR UPDATE
    USING (auth.uid() = usr_id)
    WITH CHECK (auth.uid() = usr_id);

-- tbl_users: a logged-in user can read their own row
CREATE POLICY "Users can read own profile"
    ON tbl_users FOR SELECT
    USING (auth.uid() = usr_id);

-- tbl_customer: a logged-in user can insert their own customer row at signup
CREATE POLICY "Users can insert own customer row"
    ON tbl_customer FOR INSERT
    WITH CHECK (auth.uid() = cs_user_id);

-- tbl_customer: a customer can read/update their own row
CREATE POLICY "Customers can read own row"
    ON tbl_customer FOR SELECT
    USING (auth.uid() = cs_user_id);

CREATE POLICY "Customers can update own row"
    ON tbl_customer FOR UPDATE
    USING (auth.uid() = cs_user_id)
    WITH CHECK (auth.uid() = cs_user_id);

-- tbl_chef_profile: a logged-in user can insert their own chef row at signup
CREATE POLICY "Users can insert own chef profile"
    ON tbl_chef_profile FOR INSERT
    WITH CHECK (auth.uid() = chf_user_id);

-- tbl_chef_profile: a chef can read/update their own row;
-- everyone (including guests) can read VERIFIED chefs, for chef discovery later
CREATE POLICY "Chefs can read own profile"
    ON tbl_chef_profile FOR SELECT
    USING (auth.uid() = chf_user_id);

CREATE POLICY "Anyone can read verified chef profiles"
    ON tbl_chef_profile FOR SELECT
    USING (chf_verification_status = 'verified');

CREATE POLICY "Chefs can update own profile"
    ON tbl_chef_profile FOR UPDATE
    USING (auth.uid() = chf_user_id)
    WITH CHECK (auth.uid() = chf_user_id);

-- tbl_admin: allow the admin login check to read by email.
-- This only exposes adm_id/adm_email lookups, never adm_password_hash
-- from the client, since Supabase Auth (not this table) handles login.
CREATE POLICY "Authenticated users can check admin membership"
    ON tbl_admin FOR SELECT
    USING (auth.role() = 'authenticated');

-- tbl_payment_method: public lookup table, safe to expose to everyone
CREATE POLICY "Anyone can read payment methods"
    ON tbl_payment_method FOR SELECT
    USING (true);

-- =====================================================================
-- End of Phase 5 RLS policies
-- =====================================================================
