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
    const folderId = pathSegments[pathSegments.length - 1];

    switch (method) {
      case 'GET':
        if (folderId && folderId !== 'folders-api') {
          // Get single folder with note count
          const { data: folder, error } = await supabaseClient
            .from('folders')
            .select(`
              *,
              notes (count)
            `)
            .eq('id', folderId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching folder:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(folder), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all folders with hierarchy and note counts
          const { data: folders, error } = await supabaseClient
            .from('folders')
            .select(`
              *,
              notes (count)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching folders:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Build folder hierarchy
          const folderMap = new Map();
          const rootFolders = [];

          folders?.forEach(folder => {
            folderMap.set(folder.id, { ...folder, children: [] });
          });

          folders?.forEach(folder => {
            if (folder.parent_id) {
              const parent = folderMap.get(folder.parent_id);
              if (parent) {
                parent.children.push(folderMap.get(folder.id));
              }
            } else {
              rootFolders.push(folderMap.get(folder.id));
            }
          });

          return new Response(JSON.stringify(rootFolders), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const createData = await req.json();
        const { data: newFolder, error: createError } = await supabaseClient
          .from('folders')
          .insert({
            ...createData,
            user_id: user.id,
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating folder:', createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(newFolder), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        const updateData = await req.json();
        const { data: updatedFolder, error: updateError } = await supabaseClient
          .from('folders')
          .update(updateData)
          .eq('id', folderId)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('Error updating folder:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedFolder), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        // Check if folder has children or notes
        const { data: children } = await supabaseClient
          .from('folders')
          .select('id')
          .eq('parent_id', folderId)
          .eq('user_id', user.id);

        const { data: notes } = await supabaseClient
          .from('notes')
          .select('id')
          .eq('folder_id', folderId)
          .eq('user_id', user.id);

        if (children && children.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Cannot delete folder with subfolders. Please delete or move subfolders first.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (notes && notes.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Cannot delete folder with notes. Please delete or move notes first.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from('folders')
          .delete()
          .eq('id', folderId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting folder:', deleteError);
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
    console.error('Error in folders-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});