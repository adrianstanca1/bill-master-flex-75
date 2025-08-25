
-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_id UUID,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create timesheets table for time tracking
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0, -- minutes
  description TEXT,
  location JSONB, -- GPS coordinates and address
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dayworks table for daily work reports
CREATE TABLE public.dayworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  project_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weather TEXT,
  crew_size INTEGER,
  work_description TEXT NOT NULL,
  materials_used JSONB DEFAULT '[]'::jsonb,
  equipment_used JSONB DEFAULT '[]'::jsonb,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_photos table for progress tracking
CREATE TABLE public.site_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  project_id UUID,
  url TEXT NOT NULL,
  caption TEXT,
  location JSONB, -- GPS coordinates
  taken_by UUID REFERENCES auth.users,
  photo_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB, -- AI-generated insights
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminders table for task management
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to UUID REFERENCES auth.users,
  created_by UUID REFERENCES auth.users,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  recurring BOOLEAN DEFAULT false,
  recurring_pattern TEXT, -- daily, weekly, monthly
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rams_documents table for Risk Assessments and Method Statements
CREATE TABLE public.rams_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  project_id UUID,
  activity_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  hazards JSONB NOT NULL DEFAULT '[]'::jsonb,
  control_measures JSONB NOT NULL DEFAULT '[]'::jsonb,
  method_statement TEXT,
  ppe_required JSONB DEFAULT '[]'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_tracking table for equipment and materials
CREATE TABLE public.asset_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- equipment, material, vehicle
  serial_number TEXT,
  current_location TEXT,
  assigned_to UUID REFERENCES auth.users,
  project_id UUID,
  status TEXT NOT NULL DEFAULT 'available',
  condition TEXT DEFAULT 'good',
  last_service_date DATE,
  next_service_due DATE,
  purchase_date DATE,
  purchase_cost NUMERIC(10,2),
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dayworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rams_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for timesheets
CREATE POLICY "Timesheets company access" ON public.timesheets FOR ALL USING (is_company_member(company_id));
CREATE POLICY "Timesheets company check" ON public.timesheets FOR ALL WITH CHECK (is_company_member(company_id));

-- RLS Policies for dayworks
CREATE POLICY "Dayworks company access" ON public.dayworks FOR ALL USING (is_company_member(company_id));
CREATE POLICY "Dayworks company check" ON public.dayworks FOR ALL WITH CHECK (is_company_member(company_id));

-- RLS Policies for site_photos
CREATE POLICY "Site photos company access" ON public.site_photos FOR ALL USING (is_company_member(company_id));
CREATE POLICY "Site photos company check" ON public.site_photos FOR ALL WITH CHECK (is_company_member(company_id));

-- RLS Policies for reminders
CREATE POLICY "Reminders company access" ON public.reminders FOR ALL USING (is_company_member(company_id));
CREATE POLICY "Reminders company check" ON public.reminders FOR ALL WITH CHECK (is_company_member(company_id));

-- RLS Policies for rams_documents
CREATE POLICY "RAMS company access" ON public.rams_documents FOR ALL USING (is_company_member(company_id));
CREATE POLICY "RAMS company check" ON public.rams_documents FOR ALL WITH CHECK (is_company_member(company_id));

-- RLS Policies for asset_tracking
CREATE POLICY "Assets company access" ON public.asset_tracking FOR ALL USING (is_company_member(company_id));
CREATE POLICY "Assets company check" ON public.asset_tracking FOR ALL WITH CHECK (is_company_member(company_id));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dayworks_updated_at BEFORE UPDATE ON public.dayworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rams_updated_at BEFORE UPDATE ON public.rams_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.asset_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
