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

    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const noteId = pathSegments[pathSegments.length - 1];

    switch (method) {
      case 'GET':
        if (noteId && noteId !== 'notes-api') {
          // Get single note
          const { data: note, error } = await supabaseClient
            .from('notes')
            .select(`
              *,
              folders (
                id,
                name,
                color
              )
            `)
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching note:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(note), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all notes with optional filters
          const { searchParams } = url;
          const folder_id = searchParams.get('folder_id');
          const tag = searchParams.get('tag');
          const favorite = searchParams.get('favorite');
          const archived = searchParams.get('archived');
          const limit = parseInt(searchParams.get('limit') || '50');
          const offset = parseInt(searchParams.get('offset') || '0');

          let query = supabaseClient
            .from('notes')
            .select(`
              *,
              folders (
                id,
                name,
                color
              )
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (folder_id) query = query.eq('folder_id', folder_id);
          if (tag) query = query.contains('tags', [tag]);
          if (favorite === 'true') query = query.eq('is_favorite', true);
          if (archived === 'true') query = query.eq('is_archived', true);
          else if (archived !== 'all') query = query.eq('is_archived', false);

          const { data: notes, error } = await query;

          if (error) {
            console.error('Error fetching notes:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(notes), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const createData = await req.json();
        const { data: newNote, error: createError } = await supabaseClient
          .from('notes')
          .insert({
            ...createData,
            user_id: user.id,
          })
          .select(`
            *,
            folders (
              id,
              name,
              color
            )
          `)
          .single();

        if (createError) {
          console.error('Error creating note:', createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(newNote), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        const updateData = await req.json();
        const { data: updatedNote, error: updateError } = await supabaseClient
          .from('notes')
          .update(updateData)
          .eq('id', noteId)
          .eq('user_id', user.id)
          .select(`
            *,
            folders (
              id,
              name,
              color
            )
          `)
          .single();

        if (updateError) {
          console.error('Error updating note:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedNote), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        const { error: deleteError } = await supabaseClient
          .from('notes')
          .delete()
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting note:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in notes-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});