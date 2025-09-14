import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlugins } from '@/hooks/usePlugins';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Package, Trash2, Settings, Code, Download } from 'lucide-react';

const PluginManager: React.FC = () => {
  const { plugins, loading, installPlugin, togglePlugin, removePlugin } = usePlugins();
  const { toast } = useToast();
  const [newPluginCode, setNewPluginCode] = useState('');
  const [newPluginManifest, setNewPluginManifest] = useState(`{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "permissions": ["notes.read", "notes.write"],
  "commands": [
    {
      "name": "sample-command",
      "description": "A sample command",
      "shortcut": "Ctrl+Shift+S"
    }
  ]
}`);

  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const handleInstallPlugin = async () => {
    try {
      const manifest = JSON.parse(newPluginManifest);
      const success = await installPlugin(manifest, newPluginCode);
      
      if (success) {
        toast({
          title: "Plugin Installed",
          description: `${manifest.name} has been installed successfully.`,
        });
        setShowInstallDialog(false);
        setNewPluginCode('');
      } else {
        toast({
          title: "Installation Failed",
          description: "Failed to install the plugin. Please check the code and manifest.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Invalid Manifest",
        description: "The plugin manifest is not valid JSON.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    const success = await togglePlugin(pluginId, enabled);
    if (success) {
      toast({
        title: enabled ? "Plugin Enabled" : "Plugin Disabled",
        description: `Plugin has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    }
  };

  const handleRemovePlugin = async (pluginId: string, pluginName: string) => {
    const success = await removePlugin(pluginId);
    if (success) {
      toast({
        title: "Plugin Removed",
        description: `${pluginName} has been removed.`,
      });
    }
  };

  const samplePlugins = [
    {
      name: "Word Counter",
      description: "Adds word count and reading time to notes",
      code: `// Word Counter Plugin
const plugin = {
  name: "Word Counter",
  activate() {
    console.log("Word Counter plugin activated");
    // Add word counting functionality
    return {
      getWordCount: (text) => text.split(/\\s+/).length,
      getReadingTime: (text) => Math.ceil(text.split(/\\s+/).length / 200)
    };
  }
};`,
      manifest: {
        name: "Word Counter",
        version: "1.0.0",
        description: "Adds word count and reading time to notes",
        permissions: ["notes.read"],
        commands: [
          { name: "word-count", description: "Show word count" }
        ]
      }
    },
    {
      name: "Auto Backup",
      description: "Automatically backs up notes to external storage",
      code: `// Auto Backup Plugin
const plugin = {
  name: "Auto Backup",
  activate() {
    console.log("Auto Backup plugin activated");
    return {
      scheduleBackup: () => {
        // Backup logic here
        console.log("Backup scheduled");
      }
    };
  }
};`,
      manifest: {
        name: "Auto Backup",
        version: "1.0.0",
        description: "Automatically backs up notes to external storage",
        permissions: ["notes.read", "storage.write"],
        commands: [
          { name: "backup-now", description: "Backup all notes now" }
        ]
      }
    }
  ];

  const installSamplePlugin = async (sample: typeof samplePlugins[0]) => {
    const success = await installPlugin(sample.manifest, sample.code);
    if (success) {
      toast({
        title: "Sample Plugin Installed",
        description: `${sample.name} has been installed.`,
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading plugins...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plugin Manager</h2>
          <p className="text-muted-foreground">Extend your knowledge base with custom plugins</p>
        </div>
        
        <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Install Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Install New Plugin</DialogTitle>
              <DialogDescription>
                Add a custom plugin by providing the manifest and code
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Plugin Manifest (JSON)</label>
                <Textarea
                  value={newPluginManifest}
                  onChange={(e) => setNewPluginManifest(e.target.value)}
                  placeholder="Plugin manifest in JSON format"
                  className="font-mono text-sm h-32"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Plugin Code (JavaScript)</label>
                <Textarea
                  value={newPluginCode}
                  onChange={(e) => setNewPluginCode(e.target.value)}
                  placeholder="Plugin JavaScript code"
                  className="font-mono text-sm h-64"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInstallPlugin}>
                  Install Plugin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sample Plugins */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sample Plugins</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {samplePlugins.map((sample, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {sample.name}
                </CardTitle>
                <CardDescription>{sample.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => installSamplePlugin(sample)}
                  variant="outline"
                  size="sm"
                >
                  Install Sample
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Installed Plugins */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Installed Plugins ({plugins.length})</h3>
        
        {plugins.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No plugins installed yet. Install a sample plugin or create your own.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {plugin.name}
                        <Badge variant={plugin.enabled ? "default" : "secondary"}>
                          v{plugin.version}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{plugin.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plugin.enabled}
                        onCheckedChange={(enabled) => handleTogglePlugin(plugin.id, enabled)}
                      />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Plugin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{plugin.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemovePlugin(plugin.id, plugin.name)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {plugin.manifest.permissions && (
                      <div>
                        <span className="text-sm font-medium">Permissions: </span>
                        {plugin.manifest.permissions.map((permission: string) => (
                          <Badge key={permission} variant="outline" className="ml-1">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {plugin.manifest.commands && plugin.manifest.commands.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Commands: </span>
                        {plugin.manifest.commands.map((command: any) => (
                          <Badge key={command.name} variant="outline" className="ml-1">
                            {command.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Installed: {new Date(plugin.installed_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;