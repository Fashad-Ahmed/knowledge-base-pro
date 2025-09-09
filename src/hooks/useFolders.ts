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
      
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/folders-api`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as Folder[];
    },
    enabled: !!user,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderData: CreateFolderData) => {
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/folders-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(folderData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/folders-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(folderData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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
      const response = await fetch(`https://lgdxrrhahenmpmjbqrdb.supabase.co/functions/v1/folders-api/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Folder deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete folder');
    },
  });
};