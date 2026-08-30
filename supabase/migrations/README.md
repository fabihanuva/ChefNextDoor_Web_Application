# Database Migrations

Run these in order in the Supabase SQL Editor when setting up a fresh
project. This folder is the full, honest history of the schema and every
RLS policy this project depends on — previously these only existed inside
the live Supabase dashboard with no record in version control.

| File | What it does |
|---|---|
| `001_schema.sql` | 12 tables, 4 enums, the `handle_new_user` trigger, seed payment methods |
| `002_rls_auth.sql` | Phase 5 — Auth-related RLS (`tbl_users`, `tbl_customer`, `tbl_chef_profile`, `tbl_admin` read) |
| `003_rls_customer_flow.sql` | Phase 7 — dish browsing, orders, favorites RLS |
| `004_rls_chef_flow.sql` | Phase 8 — dish CRUD + order_items RLS for chefs |
| `005_storage_policies.sql` | Storage bucket policies (create the 3 buckets in the dashboard first — see file comments) |
| `006_fix_order_recursion.sql` | Fixes an infinite-recursion bug between `tbl_order` and `tbl_order_items` policies — defines the actual (correct) chef read/update policies on `tbl_order` |
| `007_rls_reviews.sql` | Phase 9 — review RLS + notes on the Database Webhook setup (no SQL needed there, it's dashboard-configured) |
| `008_rls_admin_and_enum.sql` | Phase 10 — adds the `suspended` chef status, admin self-read policy |
| `009_add_chef_coordinates.sql` | Adds `chf_latitude`/`chf_longitude` for distance-based delivery fees |
| `010_fix_chef_names_public_read.sql` | Fixes chef names not displaying to guests — allows public read of a verified chef's name/avatar |

## Setup on a fresh Supabase project

Run files 001 through 010 in numeric order. Some steps need a manual
dashboard action first (noted in the file itself) — mainly creating the 3
Storage buckets before `005_storage_policies.sql`, and setting up the
Database Webhook mentioned in `007_rls_reviews.sql`.
