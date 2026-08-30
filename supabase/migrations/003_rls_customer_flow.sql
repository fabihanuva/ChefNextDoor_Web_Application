-- =====================================================================
--  Phase 7 — additional RLS policies for the customer flow
--  Run this in Supabase SQL Editor. Phase 5's policies must already exist.
-- =====================================================================

-- tbl_dish: anyone can view available dishes belonging to verified chefs
-- (browse page, chef profile page, and /api/search all need this)
CREATE POLICY "Anyone can read available dishes from verified chefs"
    ON tbl_dish FOR SELECT
    USING (
        dsh_is_available = true
        AND EXISTS (
            SELECT 1 FROM tbl_chef_profile
            WHERE tbl_chef_profile.chf_id = tbl_dish.dsh_chef_id
            AND tbl_chef_profile.chf_verification_status = 'verified'
        )
    );

-- tbl_order: a customer can insert their own order at checkout
CREATE POLICY "Customers can insert own orders"
    ON tbl_order FOR INSERT
    WITH CHECK (
        ord_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

-- tbl_order: a customer can read their own orders (order history + tracking)
CREATE POLICY "Customers can read own orders"
    ON tbl_order FOR SELECT
    USING (
        ord_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

-- tbl_order_items: a customer can insert items into an order they just created
CREATE POLICY "Customers can insert own order items"
    ON tbl_order_items FOR INSERT
    WITH CHECK (
        oi_order_id IN (
            SELECT ord_id FROM tbl_order
            WHERE ord_customer_id IN (
                SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
            )
        )
    );

-- tbl_order_items: a customer can read items belonging to their own orders
CREATE POLICY "Customers can read own order items"
    ON tbl_order_items FOR SELECT
    USING (
        oi_order_id IN (
            SELECT ord_id FROM tbl_order
            WHERE ord_customer_id IN (
                SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
            )
        )
    );

-- tbl_favorites: a customer can insert/delete/read their own favorites
-- (Phase 5 only covered tbl_customer/tbl_chef_profile — this table was
-- missed there since favorites didn't exist until this phase)
CREATE POLICY "Customers can insert own favorites"
    ON tbl_favorites FOR INSERT
    WITH CHECK (
        fav_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

CREATE POLICY "Customers can read own favorites"
    ON tbl_favorites FOR SELECT
    USING (
        fav_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

CREATE POLICY "Customers can delete own favorites"
    ON tbl_favorites FOR DELETE
    USING (
        fav_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

-- =====================================================================
-- End of Phase 7 RLS policies
-- =====================================================================
