import { FileText, Search, Tag, TrendingUp, Clock, BookOpen, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { useNavigate } from "react-router-dom";

export const WelcomeDashboard = () => {
  const navigate = useNavigate();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();

  const recentNotes = notes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));
  
  const stats = [
    { icon: FileText, label: "Total Notes", value: notes.length.toString(), trend: `${notes.filter(n => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.created_at) > weekAgo;
    }).length} this week` },
    { icon: Tag, label: "Tags Used", value: allTags.length.toString(), trend: "Active tags" },
    { icon: Clock, label: "Recent Notes", value: recentNotes.length.toString(), trend: "Updated recently" },
    { icon: BookOpen, label: "Folders", value: folders.length.toString(), trend: "Well organized" },
  ];

  const quickActions = [
    { 
      icon: Plus, 
      label: "New Note", 
      description: "Start writing a new note",
      onClick: () => navigate('/editor')
    },
    { 
      icon: Search, 
      label: "Search", 
      description: "Find existing notes",
      onClick: () => {} // Will be handled by search in sidebar
    },
    { 
      icon: Tag, 
      label: "Manage Tags", 
      description: "Organize your tags",
      onClick: () => {}
    },
    { 
      icon: TrendingUp, 
      label: "Analytics", 
      description: "View your writing stats",
      onClick: () => {}
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-lg text-muted-foreground">
            Ready to capture your thoughts and build your knowledge base?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(({ icon: Icon, label, value, trend }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {notesLoading || foldersLoading ? "..." : value}
                </div>
                <p className="text-xs text-muted-foreground">{trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your most common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map(({ icon: Icon, label, description, onClick }) => (
                    <Button
                      key={label}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-accent hover:text-accent-foreground"
                      onClick={onClick}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-muted-foreground">{description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
                <CardDescription>Your latest knowledge work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notesLoading ? (
                    <div className="text-center text-muted-foreground">Loading...</div>
                  ) : recentNotes.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No notes yet. Create your first note to get started!
                    </div>
                  ) : (
                    recentNotes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                           onClick={() => navigate(`/editor/${note.id}`)}>
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-foreground">{note.title}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {note.folder && (
                              <Badge variant="outline" className="text-xs">
                                {note.folder.name}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {note.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-accent-light to-accent-light/50 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <TrendingUp className="w-5 h-5" />
              Knowledge Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent-foreground/80">
              Try using consistent tags across your notes to build powerful connections. 
              Tags like #project, #learning, and #ideas help you find related content quickly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};