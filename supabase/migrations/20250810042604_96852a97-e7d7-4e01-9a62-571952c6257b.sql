-- Core schema for UK + Construction MVP with secure RLS and helper functions
-- Uses SECURITY DEFINER helpers to avoid recursive policies

-- 1) Utilities: updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper: ensure gen_random_uuid available
-- Note: pgcrypto is typically enabled in Supabase. We avoid CREATE EXTENSION here.

-- 2) Companies and Memberships
CREATE TABLE IF NOT EXISTS public.companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  name          text NOT NULL,
  country       text NOT NULL DEFAULT 'UK',
  industry      text NOT NULL DEFAULT 'construction',
  settings      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  role        text NOT NULL DEFAULT 'member',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_company_members_company_user
  ON public.company_members(company_id, user_id);

-- 3) VAT Schemes
CREATE TABLE IF NOT EXISTS public.vat_schemes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scheme        text NOT NULL,             -- e.g., 'standard','flat-rate','reverse-charge'
  country       text NOT NULL DEFAULT 'UK',
  rules         jsonb NOT NULL DEFAULT '{}'::jsonb, -- {rates:[...], thresholds:[...], effective_from:date}
  effective_from date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 4) Invoices and Retentions
CREATE TABLE IF NOT EXISTS public.invoices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  number      text NOT NULL,
  client      text,
  total       numeric(12,2) NOT NULL DEFAULT 0,
  due_date    date,
  status      text NOT NULL DEFAULT 'draft', -- draft/sent/paid/overdue
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb, -- {project_id, retention_terms, reverse_charge:boolean}
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ux_invoice_company_number UNIQUE (company_id, number)
);

CREATE TABLE IF NOT EXISTS public.retentions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  percent      numeric(5,2) NOT NULL DEFAULT 5,  -- retention %
  amount       numeric(12,2) NOT NULL DEFAULT 0,
  release_date date,
  status       text NOT NULL DEFAULT 'held', -- held/released
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 5) Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount      numeric(12,2) NOT NULL,
  category    text,
  ai_tags     jsonb,
  txn_date    date NOT NULL DEFAULT (now()::date),
  supplier    text,
  project_id  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 6) Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title       text NOT NULL,
  items       jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{name, qty, material:boolean, unit_cost, margin}]
  total       numeric(12,2) NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'draft', -- draft/sent/accepted
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 7) Tenders and Tender Packages
CREATE TABLE IF NOT EXISTS public.tenders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title      text,
  url        text,
  deadline   date,
  agency     text,
  scraped    jsonb,
  status     text NOT NULL DEFAULT 'found', -- found/qualified/bidding/submitted
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_tenders_url ON public.tenders((lower(url)));

CREATE TABLE IF NOT EXISTS public.tender_packages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id   uuid NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  checklist   jsonb,
  documents   jsonb,
  status      text NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 8) Dynamic Scheduler
CREATE TABLE IF NOT EXISTS public.schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cadence     text NOT NULL,              -- daily/weekly/monthly/cron
  scope       text NOT NULL,              -- project/site/company
  criteria    jsonb NOT NULL DEFAULT '{}'::jsonb, -- equipment, headcount, certifications
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id  uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  kind         text NOT NULL,             -- toolbox, mewp, scaffold, ram-update, tender-scan, payment-reminder
  due_on       date NOT NULL,
  status       text NOT NULL DEFAULT 'pending', -- pending/done/cancelled
  payload      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 9) Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_companies_updated_at'
  ) THEN
    CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vat_schemes_updated_at'
  ) THEN
    CREATE TRIGGER trg_vat_schemes_updated_at
    BEFORE UPDATE ON public.vat_schemes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_invoices_updated_at'
  ) THEN
    CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_retentions_updated_at'
  ) THEN
    CREATE TRIGGER trg_retentions_updated_at
    BEFORE UPDATE ON public.retentions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expenses_updated_at'
  ) THEN
    CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quotes_updated_at'
  ) THEN
    CREATE TRIGGER trg_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tenders_updated_at'
  ) THEN
    CREATE TRIGGER trg_tenders_updated_at
    BEFORE UPDATE ON public.tenders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tender_packages_updated_at'
  ) THEN
    CREATE TRIGGER trg_tender_packages_updated_at
    BEFORE UPDATE ON public.tender_packages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_schedules_updated_at'
  ) THEN
    CREATE TRIGGER trg_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tasks_updated_at'
  ) THEN
    CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 10) Security helper functions (SECURITY DEFINER, STABLE)
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_invoice_company_member(_invoice_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_company_member(i.company_id)
  FROM public.invoices i
  WHERE i.id = _invoice_id;
$$;

CREATE OR REPLACE FUNCTION public.is_tender_company_member(_tender_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_company_member(t.company_id)
  FROM public.tenders t
  WHERE t.id = _tender_id;
$$;

CREATE OR REPLACE FUNCTION public.is_schedule_company_member(_schedule_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_company_member(s.company_id)
  FROM public.schedules s
  WHERE s.id = _schedule_id;
$$;

-- 11) Enable RLS
ALTER TABLE public.companies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vat_schemes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retentions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks           ENABLE ROW LEVEL SECURITY;

-- 12) RLS Policies
-- Companies
DROP POLICY IF EXISTS "Companies view"  ON public.companies;
DROP POLICY IF EXISTS "Companies crud"  ON public.companies;
CREATE POLICY "Companies view"
ON public.companies
FOR SELECT
TO authenticated
USING (public.is_company_member(id));

CREATE POLICY "Companies crud"
ON public.companies
FOR ALL
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Company members
DROP POLICY IF EXISTS "Members view"   ON public.company_members;
DROP POLICY IF EXISTS "Members manage" ON public.company_members;
CREATE POLICY "Members view"
ON public.company_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.is_company_member(company_id)
);

CREATE POLICY "Members manage"
ON public.company_members
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- VAT schemes
DROP POLICY IF EXISTS "VAT view"  ON public.vat_schemes;
DROP POLICY IF EXISTS "VAT crud"  ON public.vat_schemes;
CREATE POLICY "VAT view"
ON public.vat_schemes
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "VAT crud"
ON public.vat_schemes
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Invoices
DROP POLICY IF EXISTS "Invoices view"  ON public.invoices;
DROP POLICY IF EXISTS "Invoices crud"  ON public.invoices;
CREATE POLICY "Invoices view"
ON public.invoices
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "Invoices crud"
ON public.invoices
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Retentions
DROP POLICY IF EXISTS "Retentions view"  ON public.retentions;
DROP POLICY IF EXISTS "Retentions crud"  ON public.retentions;
CREATE POLICY "Retentions view"
ON public.retentions
FOR SELECT
TO authenticated
USING (public.is_invoice_company_member(invoice_id));

CREATE POLICY "Retentions crud"
ON public.retentions
FOR ALL
TO authenticated
USING (public.is_invoice_company_member(invoice_id))
WITH CHECK (public.is_invoice_company_member(invoice_id));

-- Expenses
DROP POLICY IF EXISTS "Expenses view"  ON public.expenses;
DROP POLICY IF EXISTS "Expenses crud"  ON public.expenses;
CREATE POLICY "Expenses view"
ON public.expenses
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "Expenses crud"
ON public.expenses
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Quotes
DROP POLICY IF EXISTS "Quotes view"  ON public.quotes;
DROP POLICY IF EXISTS "Quotes crud"  ON public.quotes;
CREATE POLICY "Quotes view"
ON public.quotes
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "Quotes crud"
ON public.quotes
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Tenders
DROP POLICY IF EXISTS "Tenders view"  ON public.tenders;
DROP POLICY IF EXISTS "Tenders crud"  ON public.tenders;
CREATE POLICY "Tenders view"
ON public.tenders
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "Tenders crud"
ON public.tenders
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Tender packages
DROP POLICY IF EXISTS "TenderPackages view"  ON public.tender_packages;
DROP POLICY IF EXISTS "TenderPackages crud"  ON public.tender_packages;
CREATE POLICY "TenderPackages view"
ON public.tender_packages
FOR SELECT
TO authenticated
USING (public.is_tender_company_member(tender_id));

CREATE POLICY "TenderPackages crud"
ON public.tender_packages
FOR ALL
TO authenticated
USING (public.is_tender_company_member(tender_id))
WITH CHECK (public.is_tender_company_member(tender_id));

-- Schedules
DROP POLICY IF EXISTS "Schedules view"  ON public.schedules;
DROP POLICY IF EXISTS "Schedules crud"  ON public.schedules;
CREATE POLICY "Schedules view"
ON public.schedules
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

CREATE POLICY "Schedules crud"
ON public.schedules
FOR ALL
TO authenticated
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

-- Tasks
DROP POLICY IF EXISTS "Tasks view"  ON public.tasks;
DROP POLICY IF EXISTS "Tasks crud"  ON public.tasks;
CREATE POLICY "Tasks view"
ON public.tasks
FOR SELECT
TO authenticated
USING (public.is_schedule_company_member(schedule_id));

CREATE POLICY "Tasks crud"
ON public.tasks
FOR ALL
TO authenticated
USING (public.is_schedule_company_member(schedule_id))
WITH CHECK (public.is_schedule_company_member(schedule_id));
