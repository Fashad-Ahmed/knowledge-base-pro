import { useState, useEffect } from "react";
import { Bold, Italic, List, Hash, Quote, Code, Save, MoreHorizontal, Archive, Trash2, ArrowLeft } from "lucide-react";
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
import { useCreateNote, useUpdateNote, useNote, useDeleteNote } from "@/hooks/useNotes";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export const NoteEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewNote = !id;

  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: note, isLoading } = useNote(id || '');
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // Load note data when editing existing note
  useEffect(() => {
    if (note && !isNewNote) {
      setTitle(note.title);
      setContent(note.content || '');
      setTags(note.tags || []);
      setHasChanges(false);
    }
  }, [note, isNewNote]);

  // Track changes
  useEffect(() => {
    if (!isNewNote && note) {
      const hasChanges = 
        title !== note.title ||
        content !== (note.content || '') ||
        JSON.stringify(tags) !== JSON.stringify(note.tags || []);
      setHasChanges(hasChanges);
    } else if (isNewNote) {
      setHasChanges(title !== "Untitled Note" || content !== "" || tags.length > 0);
    }
  }, [title, content, tags, note, isNewNote]);

  const handleSave = async () => {
    try {
      if (isNewNote) {
        const result = await createNoteMutation.mutateAsync({
          title,
          content,
          tags,
        });
        navigate(`/editor/${result.id}`, { replace: true });
      } else {
        await updateNoteMutation.mutateAsync({
          id: id!,
          title,
          content,
          tags,
        });
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async () => {
    if (!isNewNote && id) {
      try {
        await deleteNoteMutation.mutateAsync(id);
        navigate('/');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleArchive = async () => {
    if (!isNewNote && id && note) {
      try {
        await updateNoteMutation.mutateAsync({
          id,
          is_archived: !note.is_archived,
        });
      } catch (error) {
        console.error('Archive error:', error);
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none shadow-none p-0 bg-transparent focus-visible:ring-0 text-foreground flex-1"
              placeholder="Untitled Note"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
              disabled={!hasChanges || createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createNoteMutation.isPending || updateNoteMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            {!isNewNote && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    {note?.is_archived ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={handleDelete}
                    disabled={deleteNoteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
          <span>
            {isNewNote ? 'New note' : `Last saved: ${note?.updated_at ? new Date(note.updated_at).toLocaleString() : 'Never'}`}
          </span>
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  );
};