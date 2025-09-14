-- Enable realtime for collaborative editing
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- Create collaboration sessions table
CREATE TABLE public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  session_data JSONB,
  cursor_position INTEGER DEFAULT 0,
  selection_start INTEGER DEFAULT 0,
  selection_end INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on collaboration_sessions
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for collaboration_sessions
CREATE POLICY "Users can view collaboration sessions for notes they can access" 
ON public.collaboration_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = collaboration_sessions.note_id 
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create collaboration sessions for their own notes" 
ON public.collaboration_sessions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = collaboration_sessions.note_id 
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own collaboration sessions" 
ON public.collaboration_sessions 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = collaboration_sessions.note_id 
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own collaboration sessions" 
ON public.collaboration_sessions 
FOR DELETE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = collaboration_sessions.note_id 
    AND notes.user_id = auth.uid()
  )
);

-- Create plugins table for the plugin system
CREATE TABLE public.plugins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  manifest JSONB NOT NULL,
  code TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plugins
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;

-- Create policies for plugins
CREATE POLICY "Users can view their own plugins" 
ON public.plugins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plugins" 
ON public.plugins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plugins" 
ON public.plugins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plugins" 
ON public.plugins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create AI chat history table for advanced AI features
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_chat_history
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_chat_history
CREATE POLICY "Users can view their own AI chat history" 
ON public.ai_chat_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chat history" 
ON public.ai_chat_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chat history" 
ON public.ai_chat_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_collaboration_sessions_updated_at
  BEFORE UPDATE ON public.collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at
  BEFORE UPDATE ON public.plugins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_sessions;