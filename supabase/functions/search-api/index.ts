import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, filters = {} } = await req.json();

    if (!query || query.trim() === '') {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the full-text search function
    const { data: searchResults, error: searchError } = await supabaseClient
      .rpc('search_notes', {
        search_query: query,
        user_uuid: user.id
      });

    if (searchError) {
      console.error('Error searching notes:', searchError);
      return new Response(JSON.stringify({ error: searchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply additional filters if provided
    let filteredResults = searchResults || [];
    
    if (filters.folder_id) {
      const { data: folderNotes } = await supabaseClient
        .from('notes')
        .select('id')
        .eq('folder_id', filters.folder_id)
        .eq('user_id', user.id);
      
      const folderNoteIds = new Set(folderNotes?.map(n => n.id) || []);
      filteredResults = filteredResults.filter(note => folderNoteIds.has(note.id));
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredResults = filteredResults.filter(note => 
        filters.tags.some(tag => note.tags?.includes(tag))
      );
    }

    if (filters.favorite) {
      const { data: favoriteNotes } = await supabaseClient
        .from('notes')
        .select('id')
        .eq('is_favorite', true)
        .eq('user_id', user.id);
      
      const favoriteNoteIds = new Set(favoriteNotes?.map(n => n.id) || []);
      filteredResults = filteredResults.filter(note => favoriteNoteIds.has(note.id));
    }

    // Log search query for analytics
    try {
      await supabaseClient
        .from('search_history')
        .insert({
          user_id: user.id,
          query: query,
          results_count: filteredResults.length
        });
    } catch (logError) {
      console.error('Error logging search:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({
      results: filteredResults,
      total: filteredResults.length,
      query: query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});