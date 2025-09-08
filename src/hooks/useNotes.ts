import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder_id?: string;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  folder?: {
    name: string;
    color: string;
  };
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tags?: string[];
  folder_id?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  folder_id?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
}

export const useNotes = (filters?: {
  folder_id?: string;
  tag?: string;
  favorite?: boolean;
  archived?: boolean;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('notes-api', {
        body: { filters },
      });
      
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
};

export const useNote = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!user || !id) throw new Error('User not authenticated or no ID provided');
      
      const { data, error } = await supabase.functions.invoke('notes-api', {
        body: { noteId: id },
      });
      
      if (error) throw error;
      return data as Note;
    },
    enabled: !!user && !!id,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noteData: CreateNoteData) => {
      const { data, error } = await supabase.functions.invoke('notes-api', {
        body: {
          method: 'POST',
          ...noteData,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create note');
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...noteData }: UpdateNoteData & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('notes-api', {
        body: {
          method: 'PUT',
          noteId: id,
          ...noteData,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note'] });
      toast.success('Note updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('notes-api', {
        body: {
          method: 'DELETE',
          noteId: id,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
};