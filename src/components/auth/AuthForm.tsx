import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ValidatedInput, validationRules } from '@/components/ui/input-validation';
import { LoadingState } from '@/components/ui/loading-spinner';
import { SEOHead, seoConfigs } from '@/components/ui/seo-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { PasswordResetForm } from './PasswordResetForm';

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const isFormValid = emailValid && passwordValid && (!isSignUp || nameValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast({ 
          title: "Account created!", 
          description: "Please check your email to verify your account." 
        });
      } else {
        await signIn(email, password);
        toast({ title: "Welcome back!" });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <>
        <SEOHead {...seoConfigs.homepage} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
          <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead {...seoConfigs.homepage} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Start building your knowledge base' : 'Access your secure notes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <ValidatedInput
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  onValidation={setNameValid}
                  rules={[validationRules.required(), validationRules.minLength(2)]}
                  required
                />
              )}
              <ValidatedInput
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onValidation={setEmailValid}
                rules={[validationRules.email()]}
                required
              />
              <ValidatedInput
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                onValidation={setPasswordValid}
                rules={isSignUp ? [validationRules.password()] : [validationRules.required()]}
                required
              />
              <Button type="submit" className="w-full gradient-primary" disabled={!isFormValid || loading}>
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
                
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    Forgot your password?
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};