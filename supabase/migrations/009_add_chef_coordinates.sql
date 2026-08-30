-- =====================================================================
--  Add coordinates to tbl_chef_profile for real distance-based delivery fees
-- =====================================================================
ALTER TABLE tbl_chef_profile
    ADD COLUMN IF NOT EXISTS chf_latitude NUMERIC(9,6),
    ADD COLUMN IF NOT EXISTS chf_longitude NUMERIC(9,6);
