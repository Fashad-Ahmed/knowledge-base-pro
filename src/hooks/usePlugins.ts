import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  manifest: any;
  code: string;
  enabled: boolean;
  installed_at: string;
  updated_at: string;
}

interface PluginManifest {
  name: string;
  version: string;
  description: string;
  permissions: string[];
  commands?: Array<{
    name: string;
    description: string;
    shortcut?: string;
  }>;
  panels?: Array<{
    name: string;
    title: string;
    position: 'sidebar' | 'modal';
  }>;
}

export const usePlugins = () => {
  const { user } = useAuth();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlugins();
    }
  }, [user]);

  const loadPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('user_id', user?.id)
        .order('installed_at', { ascending: false });

      if (error) throw error;
      setPlugins(data || []);
    } catch (error) {
      console.error('Error loading plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const installPlugin = async (manifest: PluginManifest, code: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('plugins')
        .insert({
          user_id: user.id,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          manifest: manifest as any,
          code,
          enabled: true,
        });

      if (error) throw error;

      await loadPlugins();
      return true;
    } catch (error) {
      console.error('Error installing plugin:', error);
      return false;
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('plugins')
        .update({ enabled })
        .eq('id', pluginId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPlugins(prev => 
        prev.map(plugin => 
          plugin.id === pluginId ? { ...plugin, enabled } : plugin
        )
      );
      return true;
    } catch (error) {
      console.error('Error toggling plugin:', error);
      return false;
    }
  };

  const removePlugin = async (pluginId: string) => {
    try {
      const { error } = await supabase
        .from('plugins')
        .delete()
        .eq('id', pluginId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPlugins(prev => prev.filter(plugin => plugin.id !== pluginId));
      return true;
    } catch (error) {
      console.error('Error removing plugin:', error);
      return false;
    }
  };

  const executePlugin = async (pluginId: string, context: any = {}) => {
    const plugin = plugins.find(p => p.id === pluginId && p.enabled);
    if (!plugin) return null;

    try {
      // Create a sandboxed environment for plugin execution
      const sandbox = {
        console,
        context,
        // Add safe APIs (limited for security)
        fetch: fetch, // Allow HTTP requests
      };

      // Execute plugin code in sandbox
      const func = new Function('sandbox', `
        const { console, context, supabase } = sandbox;
        ${plugin.code}
      `);

      return func(sandbox);
    } catch (error) {
      console.error('Error executing plugin:', error);
      return null;
    }
  };

  const getEnabledPlugins = () => {
    return plugins.filter(plugin => plugin.enabled);
  };

  const getPluginCommands = () => {
    return getEnabledPlugins()
      .filter(plugin => plugin.manifest.commands)
      .flatMap(plugin => 
        plugin.manifest.commands.map((cmd: any) => ({
          ...cmd,
          pluginId: plugin.id,
          pluginName: plugin.name,
        }))
      );
  };

  return {
    plugins,
    loading,
    installPlugin,
    togglePlugin,
    removePlugin,
    executePlugin,
    getEnabledPlugins,
    getPluginCommands,
    refresh: loadPlugins,
  };
};