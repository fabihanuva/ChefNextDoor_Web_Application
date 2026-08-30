-- =====================================================================
--  Chef flow RLS: dishes + order line items
--  (tbl_order's chef policies are NOT here — see 006_fix_order_recursion.sql,
--  which defines the corrected, non-recursive version of those policies.
--  They were originally written inline here as a plain subquery, which
--  caused "infinite recursion detected in policy for relation tbl_order"
--  once combined with tbl_order_items' own policies. Keeping the history
--  honest: this file only ever defines the tbl_dish / tbl_order_items
--  policies that were correct from the start.)
-- =====================================================================

-- tbl_dish: a chef can insert/update/delete their own dishes
CREATE POLICY "Chefs can insert own dishes"
    ON tbl_dish FOR INSERT
    WITH CHECK (
        dsh_chef_id IN (
            SELECT chf_id FROM tbl_chef_profile WHERE chf_user_id = auth.uid()
        )
    );

CREATE POLICY "Chefs can read own dishes"
    ON tbl_dish FOR SELECT
    USING (
        dsh_chef_id IN (
            SELECT chf_id FROM tbl_chef_profile WHERE chf_user_id = auth.uid()
        )
    );

CREATE POLICY "Chefs can update own dishes"
    ON tbl_dish FOR UPDATE
    USING (
        dsh_chef_id IN (
            SELECT chf_id FROM tbl_chef_profile WHERE chf_user_id = auth.uid()
        )
    )
    WITH CHECK (
        dsh_chef_id IN (
            SELECT chf_id FROM tbl_chef_profile WHERE chf_user_id = auth.uid()
        )
    );

CREATE POLICY "Chefs can delete own dishes"
    ON tbl_dish FOR DELETE
    USING (
        dsh_chef_id IN (
            SELECT chf_id FROM tbl_chef_profile WHERE chf_user_id = auth.uid()
        )
    );

-- tbl_order_items: a chef can read line items for orders containing their dishes
CREATE POLICY "Chefs can read own order items"
    ON tbl_order_items FOR SELECT
    USING (
        oi_dish_id IN (
            SELECT d.dsh_id FROM tbl_dish d
            JOIN tbl_chef_profile cp ON cp.chf_id = d.dsh_chef_id
            WHERE cp.chf_user_id = auth.uid()
        )
    );
