-- Create data export edge function to handle GDPR compliance
CREATE OR REPLACE FUNCTION public.create_data_export(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  export_data jsonb;
  user_profile jsonb;
  user_notes jsonb;
  user_folders jsonb;
  user_search_history jsonb;
BEGIN
  -- Verify user authorization
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to user data';
  END IF;

  -- Get user profile
  SELECT to_jsonb(p.*) INTO user_profile
  FROM profiles p
  WHERE p.user_id = user_uuid;

  -- Get user notes
  SELECT jsonb_agg(to_jsonb(n.*)) INTO user_notes
  FROM notes n
  WHERE n.user_id = user_uuid;

  -- Get user folders
  SELECT jsonb_agg(to_jsonb(f.*)) INTO user_folders
  FROM folders f
  WHERE f.user_id = user_uuid;

  -- Get user search history
  SELECT jsonb_agg(to_jsonb(s.*)) INTO user_search_history
  FROM search_history s
  WHERE s.user_id = user_uuid;

  -- Combine all data
  export_data := jsonb_build_object(
    'export_date', now(),
    'user_id', user_uuid,
    'profile', COALESCE(user_profile, '{}'::jsonb),
    'notes', COALESCE(user_notes, '[]'::jsonb),
    'folders', COALESCE(user_folders, '[]'::jsonb),
    'search_history', COALESCE(user_search_history, '[]'::jsonb)
  );

  RETURN export_data;
END;
$$;