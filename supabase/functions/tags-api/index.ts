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
    const tagId = pathSegments[pathSegments.length - 1];

    switch (method) {
      case 'GET':
        if (tagId && tagId !== 'tags-api') {
          // Get single tag with note count
          const { data: tag, error } = await supabaseClient
            .from('tags')
            .select('*')
            .eq('id', tagId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching tag:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Get note count for this tag
          const { count: noteCount } = await supabaseClient
            .from('note_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tagId);

          return new Response(JSON.stringify({
            ...tag,
            note_count: noteCount || 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all tags with note counts and usage stats
          const { data: tags, error } = await supabaseClient
            .from('tags')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching tags:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Get note counts for each tag
          const tagsWithCounts = await Promise.all(
            (tags || []).map(async (tag) => {
              const { count: noteCount } = await supabaseClient
                .from('note_tags')
                .select('*', { count: 'exact', head: true })
                .eq('tag_id', tag.id);

              return {
                ...tag,
                note_count: noteCount || 0
              };
            })
          );

          // Also get tags from notes.tags array for migration/compatibility
          const { data: noteTags } = await supabaseClient
            .from('notes')
            .select('tags')
            .eq('user_id', user.id)
            .not('tags', 'is', null);

          const tagFrequency = new Map();
          noteTags?.forEach(note => {
            note.tags?.forEach(tagName => {
              tagFrequency.set(tagName, (tagFrequency.get(tagName) || 0) + 1);
            });
          });

          // Merge with existing tags
          const allTags = [...tagsWithCounts];
          tagFrequency.forEach((count, tagName) => {
            if (!allTags.find(t => t.name === tagName)) {
              allTags.push({
                id: `temp_${tagName}`,
                name: tagName,
                color: '#6366f1',
                note_count: count,
                created_at: new Date().toISOString(),
                user_id: user.id
              });
            }
          });

          return new Response(JSON.stringify(allTags), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const createData = await req.json();
        
        // Check if tag already exists
        const { data: existingTag } = await supabaseClient
          .from('tags')
          .select('*')
          .eq('name', createData.name)
          .eq('user_id', user.id)
          .single();

        if (existingTag) {
          return new Response(JSON.stringify({ error: 'Tag already exists' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: newTag, error: createError } = await supabaseClient
          .from('tags')
          .insert({
            ...createData,
            user_id: user.id,
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating tag:', createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          ...newTag,
          note_count: 0
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        const updateData = await req.json();
        const { data: updatedTag, error: updateError } = await supabaseClient
          .from('tags')
          .update(updateData)
          .eq('id', tagId)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('Error updating tag:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedTag), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        // Remove tag from note_tags junction table
        const { error: junctionError } = await supabaseClient
          .from('note_tags')
          .delete()
          .eq('tag_id', tagId);

        if (junctionError) {
          console.error('Error removing tag relationships:', junctionError);
        }

        // Delete the tag
        const { error: deleteError } = await supabaseClient
          .from('tags')
          .delete()
          .eq('id', tagId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting tag:', deleteError);
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
    console.error('Error in tags-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});