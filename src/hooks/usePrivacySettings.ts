import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PrivacySettings {
  ai_features_enabled: boolean;
  data_sharing_enabled: boolean;
  analytics_enabled: boolean;
  encryption_enabled: boolean;
}

const defaultSettings: PrivacySettings = {
  ai_features_enabled: false,
  data_sharing_enabled: false,
  analytics_enabled: false,
  encryption_enabled: false,
};

export const usePrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: updatedSettings as any })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings,
  };
};