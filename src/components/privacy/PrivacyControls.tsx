import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PrivacySettings {
  ai_features_enabled: boolean;
  data_sharing_enabled: boolean;
  analytics_enabled: boolean;
  encryption_enabled: boolean;
}

export const PrivacyControls = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    ai_features_enabled: false,
    data_sharing_enabled: false,
    analytics_enabled: false,
    encryption_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data?.privacy_settings) {
        setSettings(data.privacy_settings as unknown as PrivacySettings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (newSettings: PrivacySettings) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: newSettings as any })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    updatePrivacySettings(newSettings);
  };

  const exportData = async () => {
    try {
      const { error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user?.id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Data export requested. You will receive a download link when ready.');
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast.error('Failed to request data export');
    }
  };

  const deleteAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all user data
      await supabase.from('notes').delete().eq('user_id', user?.id);
      await supabase.from('folders').delete().eq('user_id', user?.id);
      await supabase.from('search_history').delete().eq('user_id', user?.id);
      
      toast.success('All data deleted successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data');
    }
  };

  if (loading) {
    return <div className="p-4">Loading privacy settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security Controls
          </CardTitle>
          <CardDescription>
            Manage your data privacy and security preferences. All settings are stored locally in your self-hosted instance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy-First Design:</strong> This is a self-hosted application. Your data never leaves your server unless you explicitly enable external features below.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-features">AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered content enhancement, summarization, and smart tagging. 
                  <strong className="text-destructive"> Requires OpenAI API (external service)</strong>
                </p>
              </div>
              <Switch
                id="ai-features"
                checked={settings.ai_features_enabled}
                onCheckedChange={(value) => handleSettingChange('ai_features_enabled', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="encryption">Local Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive notes locally before storing in database
                </p>
              </div>
              <Switch
                id="encryption"
                checked={settings.encryption_enabled}
                onCheckedChange={(value) => handleSettingChange('encryption_enabled', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Track usage patterns to improve your experience (data stays local)
                </p>
              </div>
              <Switch
                id="analytics"
                checked={settings.analytics_enabled}
                onCheckedChange={(value) => handleSettingChange('analytics_enabled', value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sharing">Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sharing notes and folders with other users (if implemented)
                </p>
              </div>
              <Switch
                id="sharing"
                checked={settings.data_sharing_enabled}
                onCheckedChange={(value) => handleSettingChange('data_sharing_enabled', value)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your data. As per GDPR compliance, you have full control over your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={exportData} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export All Data (JSON)
          </Button>
          
          <Button onClick={deleteAllData} variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};