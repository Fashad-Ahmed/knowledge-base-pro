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
      
      const params = new URLSearchParams();
      if (filters?.folder_id) params.append('folder_id', filters.folder_id);
      if (filters?.tag) params.append('tag', filters.tag);
      if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite));
      if (filters?.archived !== undefined) params.append('archived', String(filters.archived));
      
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/notes-api?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as Note[];
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
      
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/notes-api/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as Note;
    },
    enabled: !!user && !!id,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noteData: CreateNoteData) => {
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/notes-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/notes-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/notes-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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