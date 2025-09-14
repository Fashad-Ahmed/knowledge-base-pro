import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface CollaboratorInfo {
  user_id: string;
  cursor_position: number;
  selection_start: number;
  selection_end: number;
  last_seen: string;
}

interface CollaborationIndicatorsProps {
  collaborators: CollaboratorInfo[];
  isConnected: boolean;
}

export const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  collaborators,
  isConnected,
}) => {
  const getCollaboratorColor = (userId: string) => {
    // Generate consistent colors based on user ID
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const isActive = (lastSeen: string) => {
    const lastSeenTime = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    return now - lastSeenTime < 30000; // Active if seen within 30 seconds
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-muted-foreground" />
        <Badge variant="secondary" className="text-xs">
          {isConnected ? 'Live' : 'Offline'}
        </Badge>
      </div>

      {collaborators.length > 0 && (
        <div className="flex items-center gap-1">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.user_id}
              className="relative"
              title={`User ${getInitials(collaborator.user_id)} - ${
                isActive(collaborator.last_seen) ? 'Active' : 'Idle'
              }`}
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback 
                  className={`text-xs text-white ${getCollaboratorColor(collaborator.user_id)}`}
                >
                  {getInitials(collaborator.user_id)}
                </AvatarFallback>
              </Avatar>
              
              {isActive(collaborator.last_seen) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};