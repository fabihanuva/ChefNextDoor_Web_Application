-- =====================================================================
--  Fix: "infinite recursion detected in policy for relation tbl_order"
-- =====================================================================
-- Cause: tbl_order's chef-read policy queries tbl_order_items to check
-- ownership. tbl_order_items' customer-read policy queries tbl_order
-- right back. When Postgres evaluates one, it triggers the other, which
-- triggers the first again — infinite loop.
--
-- Fix: move the chef-ownership check into a SECURITY DEFINER function.
-- Functions like this run with the privileges of their owner, which
-- bypasses RLS on the tables it queries internally — breaking the cycle
-- without weakening security (the check itself is unchanged, it just no
-- longer re-triggers RLS while running).
-- =====================================================================

CREATE OR REPLACE FUNCTION is_chef_order(order_id INTEGER, chef_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tbl_order_items oi
    JOIN tbl_dish d ON d.dsh_id = oi.oi_dish_id
    JOIN tbl_chef_profile cp ON cp.chf_id = d.dsh_chef_id
    WHERE oi.oi_order_id = order_id
    AND cp.chf_user_id = chef_auth_id
  );
$$;

DROP POLICY IF EXISTS "Chefs can read own orders" ON tbl_order;
DROP POLICY IF EXISTS "Chefs can update own orders" ON tbl_order;

CREATE POLICY "Chefs can read own orders"
    ON tbl_order FOR SELECT
    USING (is_chef_order(ord_id, auth.uid()));

CREATE POLICY "Chefs can update own orders"
    ON tbl_order FOR UPDATE
    USING (is_chef_order(ord_id, auth.uid()))
    WITH CHECK (is_chef_order(ord_id, auth.uid()));
