-- ============================================================
-- CakeDay Schema
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive');
CREATE TYPE order_status AS ENUM ('pending_approval', 'approved', 'skipped', 'dispatched');

-- ============================================================
-- companies (must be created before users for FK)
-- ============================================================
CREATE TABLE companies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  contact_name          TEXT,
  contact_email         TEXT NOT NULL,
  headcount             INT NOT NULL DEFAULT 0,
  subscription_status   subscription_status NOT NULL DEFAULT 'inactive',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  default_cake_type     TEXT NOT NULL DEFAULT 'Vanilla Sponge',
  default_delivery_notes TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- users (mirrors auth.users, adds role + company_id)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'client',
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- employees
-- ============================================================
CREATE TABLE employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  -- MM-DD format, no year (e.g. "03-25")
  birthday         CHAR(5) NOT NULL CHECK (birthday ~ '^\d{2}-\d{2}$'),
  delivery_address TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_birthday   ON employees(birthday);
CREATE INDEX idx_employees_company_id ON employees(company_id);

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  delivery_date    DATE NOT NULL,
  cake_type        TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status           order_status NOT NULL DEFAULT 'pending_approval',
  approved_at      TIMESTAMPTZ,
  dispatched_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_company_id    ON orders(company_id);
CREATE INDEX idx_orders_employee_id   ON orders(employee_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status        ON orders(status);

-- ============================================================
-- bakery_summary_emails (log table)
-- ============================================================
CREATE TABLE bakery_summary_emails (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Trigger: auto-insert into public.users after auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_app_meta_data ->> 'role')::user_role, 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_auth_user();
