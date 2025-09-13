import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BookOpen, Shield, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeFlowProps {
  onComplete: () => void;
}

export const WelcomeFlow = ({ onComplete }: WelcomeFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  const steps = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Welcome to SecureNotes!",
      description: "Your privacy-first knowledge management system",
      content: "Get started with creating your first note and organizing your thoughts securely."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Privacy First",
      description: "Your data belongs to you",
      content: "All your notes are encrypted and stored securely. You have full control over your data with export and deletion options."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: "Organize & Search",
      description: "Keep everything organized",
      content: "Use folders, tags, and our powerful search to find exactly what you need, when you need it."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Start Creating",
      description: "Create your first note",
      content: "Click the button below to create your first note and begin your knowledge journey!"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">{steps[currentStep].content}</p>
          </div>

          {currentStep === 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No tracking or analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Full data ownership</span>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={skip}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};