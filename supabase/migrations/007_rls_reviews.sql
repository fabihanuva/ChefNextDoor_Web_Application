-- =====================================================================
--  Reviews RLS
-- =====================================================================

-- A customer can insert a review for their own order
CREATE POLICY "Customers can insert own review"
    ON tbl_review FOR INSERT
    WITH CHECK (
        rv_customer_id IN (
            SELECT cs_id FROM tbl_customer WHERE cs_user_id = auth.uid()
        )
    );

-- Anyone can read reviews — needed to display them on chef profiles,
-- and reviews contain no private information
CREATE POLICY "Anyone can read reviews"
    ON tbl_review FOR SELECT
    USING (true);

-- =====================================================================
-- Order status notification (Observer pattern)
-- =====================================================================
-- Rather than a raw SQL trigger, this project wires the Observer
-- pattern's notification step through Supabase's Database Webhooks UI:
-- Dashboard → Database → Webhooks → New hook → table: tbl_order,
-- event: Update, target: the send-order-email Edge Function
-- (see supabase/functions/send-order-email/index.ts). No SQL needed —
-- the dashboard creates the underlying trigger for you.
