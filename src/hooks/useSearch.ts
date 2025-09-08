import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from './useNotes';

export interface SearchFilters {
  folder_id?: string;
  tags?: string[];
  favorite?: boolean;
}

export const useSearch = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('search-api', {
        body: { query, filters },
      });
      
      if (error) throw error;
      return data as Note[];
    },
    onMutate: () => {
      setIsSearching(true);
    },
    onSuccess: (data) => {
      setResults(data);
      setIsSearching(false);
    },
    onError: () => {
      setIsSearching(false);
      setResults([]);
    },
  });

  const search = (query: string, filters?: SearchFilters) => {
    if (query.trim()) {
      searchMutation.mutate({ query, filters });
    } else {
      setResults([]);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    search,
    results,
    isSearching,
    clearResults,
    error: searchMutation.error,
  };
};