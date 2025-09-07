import { useState } from "react";
import { Bold, Italic, List, Hash, Quote, Code, Save, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NoteEditor = () => {
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState("Start writing your thoughts...");
  const [tags, setTags] = useState(["draft", "ideas"]);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatButtons = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: List, label: "List" },
    { icon: Hash, label: "Heading" },
    { icon: Quote, label: "Quote" },
    { icon: Code, label: "Code" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none shadow-none p-0 bg-transparent focus-visible:ring-0 text-foreground"
            placeholder="Untitled Note"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Add tag..."
              className="w-24 h-6 text-xs"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddTag}
              className="h-6 px-2 text-xs"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1">
          {formatButtons.map(({ icon: Icon, label }) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              className="hover:bg-accent hover:text-accent-foreground"
              title={label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[600px] border-none shadow-none resize-none text-lg leading-relaxed bg-transparent focus-visible:ring-0 p-0"
            placeholder="Start writing your thoughts..."
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-border px-8 py-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last saved: 2 minutes ago</span>
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  );
};