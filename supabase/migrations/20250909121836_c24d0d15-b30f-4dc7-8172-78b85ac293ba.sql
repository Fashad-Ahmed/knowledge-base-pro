-- Add privacy settings to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"ai_features_enabled": false, "data_sharing_enabled": false, "analytics_enabled": false, "encryption_enabled": false}'::jsonb;

-- Add encryption fields to notes table if not exists
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_key_id TEXT;

-- Create data_export_requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on data export requests
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for data export requests
CREATE POLICY "Users can view their own data export requests" ON public.data_export_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data export requests" ON public.data_export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);