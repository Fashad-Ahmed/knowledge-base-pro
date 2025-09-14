import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CollaborationSession {
  id: string;
  note_id: string;
  user_id: string;
  cursor_position: number;
  selection_start: number;
  selection_end: number;
  last_seen: string;
}

interface CollaboratorInfo {
  user_id: string;
  cursor_position: number;
  selection_start: number;
  selection_end: number;
  last_seen: string;
}

export const useCollaboration = (noteId: string | null) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!noteId || !user) return;

    const channel = supabase
      .channel(`collaboration:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_sessions',
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          console.log('Collaboration update:', payload);
          updateCollaborators();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence sync:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await joinSession();
          await updateCollaborators();
        }
      });

    return () => {
      leaveSession();
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [noteId, user]);

  const joinSession = async () => {
    if (!noteId || !user) return;

    try {
      await supabase
        .from('collaboration_sessions')
        .upsert({
          note_id: noteId,
          user_id: user.id,
          cursor_position: 0,
          selection_start: 0,
          selection_end: 0,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'note_id,user_id'
        });
    } catch (error) {
      console.error('Error joining collaboration session:', error);
    }
  };

  const leaveSession = async () => {
    if (!noteId || !user) return;

    try {
      await supabase
        .from('collaboration_sessions')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error leaving collaboration session:', error);
    }
  };

  const updateCollaborators = async () => {
    if (!noteId) return;

    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('note_id', noteId)
        .neq('user_id', user?.id || '');

      if (error) throw error;

      setCollaborators(data || []);
    } catch (error) {
      console.error('Error updating collaborators:', error);
    }
  };

  const updateCursor = async (position: number, selectionStart?: number, selectionEnd?: number) => {
    if (!noteId || !user) return;

    try {
      await supabase
        .from('collaboration_sessions')
        .update({
          cursor_position: position,
          selection_start: selectionStart || position,
          selection_end: selectionEnd || position,
          last_seen: new Date().toISOString(),
        })
        .eq('note_id', noteId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  };

  return {
    collaborators,
    isConnected,
    updateCursor,
  };
};