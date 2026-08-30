-- =====================================================================
--  ChefNextDoor — PostgreSQL Database Schema (Supabase-ready)
--  Version: 04 / Wired to Supabase Auth
-- =====================================================================
-- Run this in Supabase SQL Editor: left sidebar → SQL Editor → New query
-- Paste the WHOLE file and click Run (or Cmd+Enter). Tables are already
-- ordered by FK dependency, so no need to split it into chunks.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
CREATE TYPE admin_access_level_enum AS ENUM ('super_admin', 'moderator', 'support');
CREATE TYPE chef_verification_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE order_status_enum      AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE delivery_status_enum   AS ENUM ('available', 'busy', 'offline');

-- =====================================================================
-- 1. tbl_admin  (standalone entity — NOT linked to Supabase Auth,
--    NOT a role on tbl_users. Own password hash, own login flow.)
-- =====================================================================
CREATE TABLE tbl_admin (
    adm_id            SERIAL PRIMARY KEY,
    adm_full_name     VARCHAR(100)  NOT NULL,
    adm_email         VARCHAR(150)  NOT NULL,
    adm_password_hash VARCHAR(255)  NOT NULL,
    adm_access_level  admin_access_level_enum NOT NULL DEFAULT 'support',
    adm_is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    adm_created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    adm_updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_adm_email UNIQUE (adm_email)
);

-- =====================================================================
-- 2. tbl_users  (profile table — 1-to-1 with Supabase auth.users.
--    usr_id IS the auth.users.id. No password stored here; Supabase
--    Auth owns credentials, sessions, and auth.uid() for RLS.)
-- =====================================================================
CREATE TABLE tbl_users (
    usr_id            UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    usr_full_name     VARCHAR(100)  NOT NULL,
    usr_email         VARCHAR(150)  NOT NULL,
    usr_phone         VARCHAR(20),
    usr_address       VARCHAR(255),
    usr_profile_image VARCHAR(255),
    usr_is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    usr_admin_id      INTEGER,                 -- oversight: admin who manages/verified this account
    usr_created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    usr_updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_usr_email UNIQUE (usr_email),
    CONSTRAINT fk_usr_admin FOREIGN KEY (usr_admin_id)
        REFERENCES tbl_admin (adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_usr_admin_id ON tbl_users (usr_admin_id);

-- =====================================================================
-- 3. tbl_customer  (1-to-1 extension of tbl_users)
-- =====================================================================
CREATE TABLE tbl_customer (
    cs_id              SERIAL PRIMARY KEY,
    cs_user_id         UUID          NOT NULL,
    cs_default_address VARCHAR(255),
    cs_loyalty_points  INTEGER       NOT NULL DEFAULT 0,
    cs_created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_cs_user_id UNIQUE (cs_user_id),
    CONSTRAINT fk_cs_user FOREIGN KEY (cs_user_id)
        REFERENCES tbl_users (usr_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_cs_loyalty_points CHECK (cs_loyalty_points >= 0)
);

-- =====================================================================
-- 4. tbl_chef_profile  (1-to-1 extension of tbl_users)
-- =====================================================================
CREATE TABLE tbl_chef_profile (
    chf_id                  SERIAL PRIMARY KEY,
    chf_user_id             UUID          NOT NULL,
    chf_bio                 TEXT,
    chf_kitchen_address     VARCHAR(255)  NOT NULL,
    chf_cuisine_type        VARCHAR(100),
    chf_rating_avg          NUMERIC(3,2)  NOT NULL DEFAULT 0.00,
    chf_verification_status chef_verification_enum NOT NULL DEFAULT 'pending',
    chf_created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_chf_user_id UNIQUE (chf_user_id),
    CONSTRAINT fk_chf_user FOREIGN KEY (chf_user_id)
        REFERENCES tbl_users (usr_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_chf_rating_avg CHECK (chf_rating_avg BETWEEN 0 AND 5)
);

-- =====================================================================
-- 5. tbl_payment_method  (lookup table — referenced by tbl_order only)
-- =====================================================================
CREATE TABLE tbl_payment_method (
    pm_id        SERIAL PRIMARY KEY,
    pm_name      VARCHAR(50)  NOT NULL,
    pm_is_active BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_pm_name UNIQUE (pm_name)
);

-- =====================================================================
-- 6. tbl_delivery_partner  (logistics; linked to tbl_order, not payment)
-- =====================================================================
CREATE TABLE tbl_delivery_partner (
    dp_id           SERIAL PRIMARY KEY,
    dp_admin_id     INTEGER,                     -- admin oversight of delivery fleet
    dp_full_name    VARCHAR(100)  NOT NULL,
    dp_phone        VARCHAR(20)   NOT NULL,
    dp_vehicle_type VARCHAR(50),
    dp_status       delivery_status_enum NOT NULL DEFAULT 'offline',
    dp_created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_dp_phone UNIQUE (dp_phone),
    CONSTRAINT fk_dp_admin FOREIGN KEY (dp_admin_id)
        REFERENCES tbl_admin (adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_dp_admin_id ON tbl_delivery_partner (dp_admin_id);

-- =====================================================================
-- 7. tbl_dish  (owned by a chef)
-- =====================================================================
CREATE TABLE tbl_dish (
    dsh_id          SERIAL PRIMARY KEY,
    dsh_chef_id     INTEGER       NOT NULL,
    dsh_name        VARCHAR(150)  NOT NULL,
    dsh_description TEXT,
    dsh_price       NUMERIC(10,2) NOT NULL,
    dsh_category    VARCHAR(80),
    dsh_image_url   VARCHAR(255),
    dsh_is_available BOOLEAN      NOT NULL DEFAULT TRUE,
    dsh_created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    dsh_updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT fk_dsh_chef FOREIGN KEY (dsh_chef_id)
        REFERENCES tbl_chef_profile (chf_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_dsh_price CHECK (dsh_price >= 0)
);

CREATE INDEX idx_dsh_chef_id ON tbl_dish (dsh_chef_id);

-- =====================================================================
-- 8. tbl_order
-- =====================================================================
CREATE TABLE tbl_order (
    ord_id                  SERIAL PRIMARY KEY,
    ord_customer_id         INTEGER       NOT NULL,
    ord_delivery_partner_id INTEGER,               -- nullable: assigned after confirmation
    ord_payment_method_id   INTEGER       NOT NULL,
    ord_status              order_status_enum NOT NULL DEFAULT 'pending',
    ord_total_amount        NUMERIC(10,2) NOT NULL,
    ord_delivery_address    VARCHAR(255)  NOT NULL,
    ord_order_date          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    ord_delivered_at        TIMESTAMPTZ,

    CONSTRAINT fk_ord_customer FOREIGN KEY (ord_customer_id)
        REFERENCES tbl_customer (cs_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ord_delivery_partner FOREIGN KEY (ord_delivery_partner_id)
        REFERENCES tbl_delivery_partner (dp_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_ord_payment_method FOREIGN KEY (ord_payment_method_id)
        REFERENCES tbl_payment_method (pm_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_ord_total_amount CHECK (ord_total_amount >= 0)
);

CREATE INDEX idx_ord_customer_id ON tbl_order (ord_customer_id);
CREATE INDEX idx_ord_delivery_partner_id ON tbl_order (ord_delivery_partner_id);
CREATE INDEX idx_ord_payment_method_id ON tbl_order (ord_payment_method_id);

-- =====================================================================
-- 9. tbl_order_items  (bridge table: Order <-> Dish, many-to-many resolved)
-- =====================================================================
CREATE TABLE tbl_order_items (
    oi_id         SERIAL PRIMARY KEY,
    oi_order_id   INTEGER       NOT NULL,
    oi_dish_id    INTEGER       NOT NULL,
    oi_quantity   INTEGER       NOT NULL DEFAULT 1,
    oi_unit_price NUMERIC(10,2) NOT NULL,
    oi_subtotal   NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_oi_order FOREIGN KEY (oi_order_id)
        REFERENCES tbl_order (ord_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_oi_dish FOREIGN KEY (oi_dish_id)
        REFERENCES tbl_dish (dsh_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT uq_oi_order_dish UNIQUE (oi_order_id, oi_dish_id),
    CONSTRAINT chk_oi_quantity CHECK (oi_quantity > 0),
    CONSTRAINT chk_oi_unit_price CHECK (oi_unit_price >= 0),
    CONSTRAINT chk_oi_subtotal CHECK (oi_subtotal >= 0)
);

CREATE INDEX idx_oi_order_id ON tbl_order_items (oi_order_id);
CREATE INDEX idx_oi_dish_id ON tbl_order_items (oi_dish_id);

-- =====================================================================
-- 10. tbl_review  (author: Customer, subject: Order — one review/order)
-- =====================================================================
CREATE TABLE tbl_review (
    rv_id          SERIAL PRIMARY KEY,
    rv_order_id    INTEGER       NOT NULL,
    rv_customer_id INTEGER       NOT NULL,
    rv_rating      SMALLINT      NOT NULL,
    rv_comment     TEXT,
    rv_created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_rv_order_id UNIQUE (rv_order_id),   -- one review per order
    CONSTRAINT fk_rv_order FOREIGN KEY (rv_order_id)
        REFERENCES tbl_order (ord_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_rv_customer FOREIGN KEY (rv_customer_id)
        REFERENCES tbl_customer (cs_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_rv_rating CHECK (rv_rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_rv_customer_id ON tbl_review (rv_customer_id);

-- =====================================================================
-- 11. tbl_favorites  (bridge table: Customer <-> Dish, many-to-many resolved)
-- =====================================================================
CREATE TABLE tbl_favorites (
    fav_id          SERIAL PRIMARY KEY,
    fav_customer_id INTEGER       NOT NULL,
    fav_dish_id     INTEGER       NOT NULL,
    fav_created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_fav_customer_dish UNIQUE (fav_customer_id, fav_dish_id),
    CONSTRAINT fk_fav_customer FOREIGN KEY (fav_customer_id)
        REFERENCES tbl_customer (cs_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_fav_dish FOREIGN KEY (fav_dish_id)
        REFERENCES tbl_dish (dsh_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_fav_customer_id ON tbl_favorites (fav_customer_id);
CREATE INDEX idx_fav_dish_id ON tbl_favorites (fav_dish_id);

-- =====================================================================
-- 12. tbl_support_content  (managed by Admin)
-- =====================================================================
CREATE TABLE tbl_support_content (
    sc_id         SERIAL PRIMARY KEY,
    sc_admin_id   INTEGER,
    sc_title      VARCHAR(200)  NOT NULL,
    sc_content    TEXT          NOT NULL,
    sc_category   VARCHAR(80),
    sc_created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    sc_updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT fk_sc_admin FOREIGN KEY (sc_admin_id)
        REFERENCES tbl_admin (adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_sc_admin_id ON tbl_support_content (sc_admin_id);

-- =====================================================================
-- AUTO-PROVISION tbl_users on Supabase Auth signup
-- =====================================================================
-- When someone signs up via supabase.auth.signUp(), Supabase inserts a
-- row into auth.users. This trigger automatically creates the matching
-- tbl_users profile row, pulling full_name from the signup metadata
-- you pass in (see note below). Without this, you'd have to remember
-- to insert into tbl_users manually after every signup call.
--
-- In your signup code, pass metadata like:
--   supabase.auth.signUp({ email, password, options: { data: { full_name: "..." } } })
-- =====================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tbl_users (usr_id, usr_full_name, usr_email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================================
-- SEED DATA — payment methods (lookup table)
-- =====================================================================
INSERT INTO tbl_payment_method (pm_name, pm_is_active) VALUES
    ('Cash on Delivery', TRUE),
    ('Card', TRUE),
    ('Bkash', TRUE),
    ('Nagad', TRUE);

-- =====================================================================
-- End of schema
-- =====================================================================
