import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

interface AIContext {
  recentNotes: any[];
  currentNote?: any;
  userPreferences?: any;
}

export const useAdvancedAI = () => {
  const { user } = useAuth();
  const { settings } = usePrivacySettings();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const startNewSession = useCallback(() => {
    const sessionId = crypto.randomUUID();
    setCurrentSessionId(sessionId);
    setChatHistory([]);
    return sessionId;
  }, []);

  const loadChatHistory = useCallback(async (sessionId: string) => {
    if (!user || !settings.ai_features_enabled) return;

    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setChatHistory(data?.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant' | 'system'
      })) || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [user, settings.ai_features_enabled]);

  const saveChatMessage = useCallback(async (
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ) => {
    if (!user || !currentSessionId) return;

    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          session_id: currentSessionId,
          role,
          content,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      setChatHistory(prev => [...prev, {
        ...data,
        role: data.role as 'user' | 'assistant' | 'system'
      }]);
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }, [user, currentSessionId]);

  const buildAIContext = useCallback(async (): Promise<AIContext> => {
    if (!user) return { recentNotes: [] };

    try {
      // Get recent notes for context
      const { data: recentNotes, error } = await supabase
        .from('notes')
        .select('id, title, content, tags, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return {
        recentNotes: recentNotes || [],
      };
    } catch (error) {
      console.error('Error building AI context:', error);
      return { recentNotes: [] };
    }
  }, [user]);

  const enhancedChat = useCallback(async (
    message: string,
    options: {
      includeContext?: boolean;
      action?: 'chat' | 'summarize' | 'generate_ideas' | 'research';
      noteId?: string;
    } = {}
  ) => {
    if (!user || !settings.ai_features_enabled || isProcessing) return null;

    setIsProcessing(true);

    try {
      // Save user message
      await saveChatMessage('user', message);

      // Build context if requested
      let context: AIContext = { recentNotes: [] };
      if (options.includeContext) {
        context = await buildAIContext();
      }

      // Get specific note if provided
      if (options.noteId) {
        const { data: note } = await supabase
          .from('notes')
          .select('*')
          .eq('id', options.noteId)
          .eq('user_id', user.id)
          .single();
        
        if (note) {
          context.currentNote = note;
        }
      }

      // Call AI assistant with enhanced context
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: options.action || 'chat',
          content: message,
          context,
          chatHistory: chatHistory.slice(-10), // Last 10 messages for context
          preferences: {
            tone: 'helpful',
            detail_level: 'moderate',
          },
        },
      });

      if (error) throw error;

      // Save assistant response
      const assistantMessage = await saveChatMessage('assistant', data.result, {
        action: options.action,
        processing_time: data.processing_time,
      });

      return assistantMessage;
    } catch (error) {
      console.error('Error in enhanced chat:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, settings.ai_features_enabled, isProcessing, saveChatMessage, buildAIContext, chatHistory]);

  const summarizeNotes = useCallback(async (noteIds: string[]) => {
    if (!user || !settings.ai_features_enabled) return null;

    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('title, content, tags')
        .in('id', noteIds)
        .eq('user_id', user.id);

      if (error) throw error;

      const content = notes?.map(note => `Title: ${note.title}\n${note.content}`).join('\n\n---\n\n');
      
      return await enhancedChat(`Please summarize these notes:\n\n${content}`, {
        action: 'summarize',
        includeContext: false,
      });
    } catch (error) {
      console.error('Error summarizing notes:', error);
      return null;
    }
  }, [user, settings.ai_features_enabled, enhancedChat]);

  const generateIdeas = useCallback(async (topic: string, noteContext?: string) => {
    const prompt = noteContext 
      ? `Generate ideas related to "${topic}" based on this context:\n\n${noteContext}`
      : `Generate creative ideas and insights about: ${topic}`;

    return await enhancedChat(prompt, {
      action: 'generate_ideas',
      includeContext: true,
    });
  }, [enhancedChat]);

  const researchTopic = useCallback(async (topic: string) => {
    return await enhancedChat(`Research and provide comprehensive information about: ${topic}`, {
      action: 'research',
      includeContext: true,
    });
  }, [enhancedChat]);

  const clearChatHistory = useCallback(async (sessionId?: string) => {
    if (!user) return;

    try {
      const query = supabase
        .from('ai_chat_history')
        .delete()
        .eq('user_id', user.id);

      if (sessionId) {
        query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;

      if (!sessionId || sessionId === currentSessionId) {
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, [user, currentSessionId]);

  return {
    chatHistory,
    isProcessing,
    currentSessionId,
    enhancedChat,
    summarizeNotes,
    generateIdeas,
    researchTopic,
    startNewSession,
    loadChatHistory,
    clearChatHistory,
    isEnabled: settings.ai_features_enabled,
  };
};