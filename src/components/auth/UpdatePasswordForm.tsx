import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ValidatedInput, validationRules } from '@/components/ui/input-validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

export const UpdatePasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle the session from the URL parameters
    const handleAuthCallback = async () => {
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');
      
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        
        if (error) {
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or expired.",
            variant: "destructive",
          });
          navigate('/');
        }
      } else {
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or expired.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !confirmValid || loading) return;
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });
      
      navigate('/editor');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ValidatedInput
              label="New Password"
              type="password"
              value={password}
              onChange={setPassword}
              onValidation={setPasswordValid}
              rules={[validationRules.password()]}
              required
              placeholder="Enter your new password"
            />
            
            <ValidatedInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onValidation={setConfirmValid}
              rules={[validationRules.required(), validationRules.minLength(6)]}
              required
              placeholder="Confirm your new password"
            />
            
            <Button 
              type="submit" 
              className="w-full gradient-primary" 
              disabled={!passwordValid || !confirmValid || loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};