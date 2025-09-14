import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { useToast } from '@/components/ui/use-toast';
import { Bot, User, Lightbulb, FileText, Search, Trash2, Plus, Send, Loader2 } from 'lucide-react';

interface AdvancedAIChatProps {
  noteId?: string;
  noteContent?: string;
}

const AdvancedAIChat: React.FC<AdvancedAIChatProps> = ({ noteId, noteContent }) => {
  const {
    chatHistory,
    isProcessing,
    currentSessionId,
    enhancedChat,
    summarizeNotes,
    generateIdeas,
    researchTopic,
    startNewSession,
    clearChatHistory,
    isEnabled,
  } = useAdvancedAI();

  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [aiMode, setAiMode] = useState<'chat' | 'summarize' | 'generate_ideas' | 'research'>('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!currentSessionId) {
      startNewSession();
    }
  }, [currentSessionId, startNewSession]);

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing || !isEnabled) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      const response = await enhancedChat(userMessage, {
        action: aiMode,
        includeContext: true,
        noteId,
      });

      if (!response) {
        toast({
          title: "AI Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message to AI assistant.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = async (action: string, content: string) => {
    if (isProcessing || !isEnabled) return;

    try {
      let response;
      
      switch (action) {
        case 'summarize':
          if (noteContent) {
            response = await enhancedChat(`Summarize this note: ${noteContent}`, {
              action: 'summarize',
              includeContext: false,
            });
          }
          break;
        
        case 'generate_ideas':
          response = await generateIdeas(content || 'general topics', noteContent);
          break;
        
        case 'research':
          response = await researchTopic(content || 'current topic');
          break;
        
        default:
          return;
      }

      if (!response) {
        toast({
          title: "AI Error",
          description: "Failed to complete the requested action.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in quick action:', error);
    }
  };

  const handleNewSession = () => {
    startNewSession();
    toast({
      title: "New Session",
      description: "Started a new AI chat session.",
    });
  };

  const handleClearHistory = async () => {
    await clearChatHistory(currentSessionId);
    toast({
      title: "History Cleared",
      description: "Chat history has been cleared.",
    });
  };

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Advanced AI Assistant
          </CardTitle>
          <CardDescription>
            AI features are disabled. Enable them in Privacy Settings to use this feature.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Advanced AI Assistant
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Enhanced AI with context awareness and advanced capabilities
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={aiMode} onValueChange={(value: any) => setAiMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="summarize">Summarize</SelectItem>
                  <SelectItem value="generate_ideas">Generate Ideas</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={handleNewSession}>
                <Plus className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              {/* Chat History */}
              <ScrollArea className="h-96 w-full border rounded-md p-4" ref={scrollAreaRef}>
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bot className="w-12 h-12 mb-2" />
                    <p>Start a conversation with your AI assistant</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[80%] ${
                            msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {msg.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div
                            className={`rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            {msg.metadata && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {msg.metadata.action && (
                                  <Badge variant="outline" className="text-xs">
                                    {msg.metadata.action}
                                  </Badge>
                                )}
                                {msg.metadata.processing_time && (
                                  <Badge variant="outline" className="text-xs">
                                    {msg.metadata.processing_time}ms
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask your AI assistant (${aiMode} mode)...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim() || isProcessing}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {noteContent && (
                  <Card className="cursor-pointer hover:bg-accent" onClick={() => handleQuickAction('summarize', '')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        Summarize Current Note
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Get a concise summary of the current note
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
                
                <Card className="cursor-pointer hover:bg-accent" onClick={() => handleQuickAction('generate_ideas', 'brainstorming')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4" />
                      Generate Ideas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Get creative ideas and insights
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="cursor-pointer hover:bg-accent" onClick={() => handleQuickAction('research', 'current topic')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Search className="w-4 h-4" />
                      Research Topic
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Get comprehensive research on any topic
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="cursor-pointer hover:bg-accent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Bot className="w-4 h-4" />
                      Smart Analysis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Analyze patterns in your notes
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAIChat;