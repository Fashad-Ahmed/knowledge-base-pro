import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
  note_count?: number;
  children?: Folder[];
}

export interface CreateFolderData {
  name: string;
  parent_id?: string;
  color?: string;
  description?: string;
}

export const useFolders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('folders-api');
      
      if (error) throw error;
      return data as Folder[];
    },
    enabled: !!user,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderData: CreateFolderData) => {
      const { data, error } = await supabase.functions.invoke('folders-api', {
        body: {
          method: 'POST',
          ...folderData,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create folder');
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...folderData }: Partial<CreateFolderData> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('folders-api', {
        body: {
          method: 'PUT',
          folderId: id,
          ...folderData,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update folder');
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('folders-api', {
        body: {
          method: 'DELETE',
          folderId: id,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Folder deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete folder');
    },
  });
};