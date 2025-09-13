import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { ComponentLoader } from "@/components/performance/LazyComponents";
import Index from "./pages/Index";
import { 
  LazyEditor, 
  LazySettings, 
  LazyPrivacy, 
  LazyTermsOfService 
} from "@/components/performance/LazyComponents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to main app if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (user) {
    return <Navigate to="/editor" replace />;
  }
  
  return <>{children}</>;
}

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        } />
        <Route path="/editor/:id?" element={
          <ProtectedRoute>
            <Suspense fallback={<ComponentLoader />}>
              <LazyEditor />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/reset-password" element={<UpdatePasswordForm />} />
        <Route path="/privacy" element={
          <Suspense fallback={<ComponentLoader />}>
            <LazyPrivacy />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<ComponentLoader />}>
            <LazyTermsOfService />
          </Suspense>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Suspense fallback={<ComponentLoader />}>
              <LazySettings />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
