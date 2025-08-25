-- Create missing tables to fix build errors

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dayworks table
CREATE TABLE IF NOT EXISTS public.dayworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  date DATE NOT NULL,
  work_description TEXT NOT NULL,
  hours_worked NUMERIC,
  hourly_rate NUMERIC,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  hire_date DATE,
  salary NUMERIC,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dayworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own company projects" ON public.projects FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = projects.company_id));

CREATE POLICY "Users can insert own company projects" ON public.projects FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = projects.company_id));

CREATE POLICY "Users can update own company projects" ON public.projects FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = projects.company_id));

CREATE POLICY "Users can delete own company projects" ON public.projects FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = projects.company_id));

-- RLS Policies for dayworks
CREATE POLICY "Users can view own company dayworks" ON public.dayworks FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = dayworks.company_id));

CREATE POLICY "Users can insert own company dayworks" ON public.dayworks FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = dayworks.company_id));

CREATE POLICY "Users can update own company dayworks" ON public.dayworks FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = dayworks.company_id));

CREATE POLICY "Users can delete own company dayworks" ON public.dayworks FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = dayworks.company_id));

-- RLS Policies for employees
CREATE POLICY "Users can view own company employees" ON public.employees FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = employees.company_id));

CREATE POLICY "Users can insert own company employees" ON public.employees FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = employees.company_id));

CREATE POLICY "Users can update own company employees" ON public.employees FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = employees.company_id));

CREATE POLICY "Users can delete own company employees" ON public.employees FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = employees.company_id));

-- Update triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dayworks_updated_at BEFORE UPDATE ON public.dayworks 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security enhancement: Secure storage functions
CREATE OR REPLACE FUNCTION public.secure_store_data(
  store_key TEXT,
  store_value JSONB
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'SECURE_STORE',
    'secure_storage',
    store_key,
    jsonb_build_object('key', store_key, 'value', store_value, 'timestamp', now())
  );
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.secure_retrieve_data(
  store_key TEXT
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT details->'value' INTO result
  FROM security_audit_log
  WHERE user_id = auth.uid()
    AND action = 'SECURE_STORE'
    AND resource_id = store_key
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Enhanced brute force protection
CREATE OR REPLACE FUNCTION public.enhanced_brute_force_check(
  check_user_id UUID DEFAULT NULL,
  check_ip INET DEFAULT NULL
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  user_failures INTEGER := 0;
  ip_failures INTEGER := 0;
  user_blocked BOOLEAN := FALSE;
  ip_blocked BOOLEAN := FALSE;
  block_expires_at TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  -- Check user failures in last hour
  IF check_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO user_failures
    FROM security_audit_log
    WHERE user_id = check_user_id
      AND action LIKE '%FAILED%'
      AND created_at > now() - INTERVAL '1 hour';
    
    user_blocked := user_failures >= 5;
  END IF;
  
  -- Check IP failures (would need server-side implementation)
  IF check_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_failures
    FROM security_audit_log
    WHERE ip_address = check_ip
      AND action LIKE '%FAILED%'
      AND created_at > now() - INTERVAL '1 hour';
    
    ip_blocked := ip_failures >= 10;
  END IF;
  
  -- Calculate block expiry
  IF user_blocked OR ip_blocked THEN
    block_expires_at := now() + INTERVAL '30 minutes';
  END IF;
  
  RETURN jsonb_build_object(
    'user_blocked', user_blocked,
    'ip_blocked', ip_blocked,
    'block_expires_at', block_expires_at,
    'user_failures', user_failures,
    'ip_failures', ip_failures
  );
END;
$$;