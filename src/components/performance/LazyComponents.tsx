import { lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components for better performance
export const LazyEditor = lazy(() => import('@/pages/Editor'));
export const LazySettings = lazy(() => import('@/pages/Settings'));
export const LazyPrivacy = lazy(() => import('@/pages/Privacy'));
export const LazyTermsOfService = lazy(() => import('@/pages/TermsOfService'));

// Loading fallback component
export const ComponentLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);