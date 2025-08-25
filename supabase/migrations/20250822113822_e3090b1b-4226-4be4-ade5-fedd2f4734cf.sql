-- Create user secure data table for proper client-side data storage
CREATE TABLE IF NOT EXISTS public.user_secure_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  data_key text NOT NULL,
  data_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, data_key)
);

-- Enable RLS
ALTER TABLE public.user_secure_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_secure_data
CREATE POLICY "Users can view their own secure data"
ON public.user_secure_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secure data"
ON public.user_secure_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secure data"
ON public.user_secure_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secure data"
ON public.user_secure_data
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_secure_data_updated_at
BEFORE UPDATE ON public.user_secure_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();