-- Create missing tables referenced in the codebase

-- Create site_photos table for project site documentation
CREATE TABLE public.site_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for site_photos
ALTER TABLE public.site_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for site_photos
CREATE POLICY "Users can view own company site photos" 
ON public.site_photos 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = site_photos.company_id))));

CREATE POLICY "Users can insert own company site photos" 
ON public.site_photos 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = site_photos.company_id))));

CREATE POLICY "Users can update own company site photos" 
ON public.site_photos 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = site_photos.company_id))));

CREATE POLICY "Users can delete own company site photos" 
ON public.site_photos 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = site_photos.company_id))));

-- Create reminders table for project and task reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Users can view own company reminders" 
ON public.reminders 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = reminders.company_id))));

CREATE POLICY "Users can insert own company reminders" 
ON public.reminders 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = reminders.company_id))));

CREATE POLICY "Users can update own company reminders" 
ON public.reminders 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = reminders.company_id))));

CREATE POLICY "Users can delete own company reminders" 
ON public.reminders 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = reminders.company_id))));

-- Add meta columns to projects table for additional project data
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS meta JSONB;

-- Add meta columns to invoices table for additional invoice data (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'meta') THEN
        ALTER TABLE public.invoices ADD COLUMN meta JSONB;
    END IF;
END $$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_site_photos_updated_at
BEFORE UPDATE ON public.site_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();