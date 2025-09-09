import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Check if user has enabled AI features (privacy-first approach)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('privacy_settings')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Respect user's privacy settings - AI features must be explicitly enabled
    const privacySettings = profile?.privacy_settings || {};
    if (!privacySettings.ai_features_enabled) {
      return new Response(JSON.stringify({ 
        error: 'AI features are disabled in your privacy settings. Please enable them in Settings > Privacy to use AI assistance.',
        code: 'AI_FEATURES_DISABLED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, content, context = {} } = await req.json();

    let systemPrompt;
    let userPrompt;

    switch (action) {
      case 'summarize':
        systemPrompt = 'You are a helpful AI assistant that creates concise, informative summaries of text content. Focus on the key points and main ideas.';
        userPrompt = `Please summarize the following content:\n\n${content}`;
        break;

      case 'enhance':
        systemPrompt = 'You are a writing assistant that improves text while maintaining the original meaning and tone. Make the content more clear, engaging, and well-structured.';
        userPrompt = `Please enhance and improve the following content:\n\n${content}`;
        break;

      case 'generate_tags':
        systemPrompt = 'You are a tagging expert. Generate relevant, concise tags for content. Return only a JSON array of strings, no other text.';
        userPrompt = `Generate 3-7 relevant tags for the following content:\n\n${content}`;
        break;

      case 'suggest_title':
        systemPrompt = 'You are a title generation expert. Create compelling, descriptive titles that capture the essence of the content. Return only the title, no other text.';
        userPrompt = `Suggest a compelling title for the following content:\n\n${content}`;
        break;

      case 'expand':
        systemPrompt = 'You are a content expansion expert. Take brief notes or ideas and expand them into more detailed, comprehensive content while maintaining the original intent.';
        userPrompt = `Please expand on the following notes with more detail and examples:\n\n${content}`;
        break;

      case 'chat':
        // Get user's recent notes for context
        const { data: recentNotes } = await supabaseClient
          .from('notes')
          .select('title, content, tags')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        const notesContext = recentNotes?.map(note => 
          `Title: ${note.title}\nContent: ${note.content?.substring(0, 500)}...\nTags: ${note.tags?.join(', ')}`
        ).join('\n\n---\n\n') || '';

        systemPrompt = `You are a knowledgeable AI assistant helping with personal knowledge management. You have access to the user's recent notes for context. Be helpful, concise, and relevant to their knowledge base.

Recent notes context:
${notesContext}`;
        userPrompt = content;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`AI Assistant - Action: ${action}, User: ${user.id}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // For tag generation, try to parse as JSON
    if (action === 'generate_tags') {
      try {
        const tags = JSON.parse(aiResponse);
        return new Response(JSON.stringify({ result: tags }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // If parsing fails, treat as regular response
      }
    }

    return new Response(JSON.stringify({ result: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});