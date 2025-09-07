import { useState } from "react";
import { Search, FileText, Folder, Tag, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const mockNotes = [
    { id: 1, title: "Project Ideas", category: "Work", tags: ["brainstorming", "projects"], updatedAt: "2 hours ago" },
    { id: 2, title: "Reading List", category: "Personal", tags: ["books", "learning"], updatedAt: "1 day ago" },
    { id: 3, title: "Meeting Notes", category: "Work", tags: ["meetings", "notes"], updatedAt: "3 days ago" },
    { id: 4, title: "Travel Plans", category: "Personal", tags: ["travel", "planning"], updatedAt: "1 week ago" },
  ];

  const categories = ["Work", "Personal", "Research", "Learning"];
  const recentTags = ["brainstorming", "projects", "books", "learning", "meetings", "travel"];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground">KnowledgeBase</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border focus:ring-sidebar-primary"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          {/* Quick Actions */}
          <div className="mb-6">
            <Button className="w-full justify-start gap-2 mb-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Note
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-sidebar-foreground">Categories</h3>
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="mb-6 bg-sidebar-border" />

          {/* Recent Notes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Recent Notes</h3>
            <div className="space-y-2">
              {mockNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                >
                  <h4 className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-primary">
                    {note.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{note.updatedAt}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-6 bg-sidebar-border" />

          {/* Tags */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-sidebar-foreground">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
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