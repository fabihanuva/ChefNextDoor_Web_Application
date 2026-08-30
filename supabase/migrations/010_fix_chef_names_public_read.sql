-- =====================================================================
--  Fix: chef names not showing on /browse or the landing page
-- =====================================================================
-- Root cause: tbl_users only had a policy letting a user read THEIR OWN
-- row (Phase 5's "Users can read own profile"). That's correct for a
-- customer's own profile page, but it also silently blocked guests and
-- other customers from reading a CHEF's name/avatar when browsing —
-- the nested tbl_users join in ChefCard/browse queries came back null,
-- and the UI fell back to the generic "Chef" placeholder.
--
-- This policy adds public read access to tbl_users, but ONLY for rows
-- that belong to a verified chef — customers' own private profile rows
-- remain unreadable by anyone else. Run this in the SQL Editor.
-- =====================================================================

CREATE POLICY "Anyone can read verified chefs' public profile info"
    ON tbl_users FOR SELECT
    USING (
        usr_id IN (
            SELECT chf_user_id FROM tbl_chef_profile
            WHERE chf_verification_status = 'verified'
        )
    );
