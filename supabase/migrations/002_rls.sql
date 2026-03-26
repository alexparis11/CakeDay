-- ============================================================
-- CakeDay Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE companies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_summary_emails ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper functions (stored in auth schema, no extra DB queries)
-- ============================================================

-- Read role from JWT app_metadata (set at user creation, zero DB cost)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'client'
  )
$$;

-- Read company_id from public.users for the current session user
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- companies policies
-- ============================================================

-- Admins can do everything
CREATE POLICY "admin_all_companies" ON companies
  FOR ALL
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- Clients can only see and update their own company
CREATE POLICY "client_read_own_company" ON companies
  FOR SELECT
  USING (id = auth.user_company_id());

CREATE POLICY "client_update_own_company" ON companies
  FOR UPDATE
  USING (id = auth.user_company_id())
  WITH CHECK (id = auth.user_company_id());

-- ============================================================
-- users policies
-- ============================================================

CREATE POLICY "admin_all_users" ON users
  FOR ALL
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "user_read_own_row" ON users
  FOR SELECT
  USING (id = auth.uid());

-- ============================================================
-- employees policies
-- ============================================================

CREATE POLICY "admin_all_employees" ON employees
  FOR ALL
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "client_read_own_employees" ON employees
  FOR SELECT
  USING (company_id = auth.user_company_id());

CREATE POLICY "client_insert_own_employees" ON employees
  FOR INSERT
  WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "client_update_own_employees" ON employees
  FOR UPDATE
  USING (company_id = auth.user_company_id())
  WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "client_delete_own_employees" ON employees
  FOR DELETE
  USING (company_id = auth.user_company_id());

-- ============================================================
-- orders policies
-- ============================================================

CREATE POLICY "admin_all_orders" ON orders
  FOR ALL
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "client_read_own_orders" ON orders
  FOR SELECT
  USING (company_id = auth.user_company_id());

-- Clients can only update status (not dispatched — that's admin only)
CREATE POLICY "client_update_own_order_status" ON orders
  FOR UPDATE
  USING (company_id = auth.user_company_id())
  WITH CHECK (
    company_id = auth.user_company_id()
    AND status IN ('approved', 'skipped')
  );

-- ============================================================
-- bakery_summary_emails policies (admin-only log)
-- ============================================================

CREATE POLICY "admin_all_bakery_emails" ON bakery_summary_emails
  FOR ALL
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');
