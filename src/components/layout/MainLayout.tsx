import { useState } from "react";
import { Search, FileText, Folder, Tag, Settings, Plus, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: notes = [] } = useNotes();
  const { data: folders = [] } = useFolders();
  const { search, results, isSearching, clearResults } = useSearch();

  const recentNotes = notes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])))
    .slice(0, 8);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      search(query);
    } else {
      clearResults();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-sidebar-foreground">KnowledgeBase</h1>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sidebar-foreground">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border focus:ring-sidebar-primary"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          {/* Quick Actions */}
          <div className="mb-6">
            <Button 
              className="w-full justify-start gap-2 mb-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/editor')}
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Search Results</h3>
              <div className="space-y-2">
                {results.slice(0, 5).map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/editor/${note.id}`)}
                  >
                    <h4 className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-primary truncate">
                      {note.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="mt-4 mb-6 bg-sidebar-border" />
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-sidebar-foreground">Folders</h3>
              </div>
              <div className="space-y-1">
                {folders.slice(0, 6).map((folder) => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={() => navigate(`/?folder=${folder.id}`)}
                  >
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: folder.color }}></div>
                    {folder.name}
                    {folder.note_count !== undefined && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {folder.note_count}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator className="mb-6 bg-sidebar-border" />

          {/* Recent Notes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Recent Notes</h3>
            <div className="space-y-2">
              {recentNotes.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No notes yet. Create your first note!
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/editor/${note.id}`)}
                  >
                    <h4 className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-primary truncate">
                      {note.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="mb-6 bg-sidebar-border" />

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-sidebar-foreground">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
                    onClick={() => handleSearch(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate('/privacy')}
          >
            <Shield className="w-4 h-4" />
            Privacy & Security
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};