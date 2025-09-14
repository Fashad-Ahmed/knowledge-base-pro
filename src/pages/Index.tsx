import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from "@/components/layout/MainLayout";
import { WelcomeDashboard } from "@/components/knowledge/WelcomeDashboard";
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { AuthForm } from '@/components/auth/AuthForm';

const Index = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome flow for new users
    if (user) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  // Show auth form for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeFlow onComplete={handleWelcomeComplete} />}
      <MainLayout>
        <WelcomeDashboard />
      </MainLayout>
    </>
  );
};

export default Index;
