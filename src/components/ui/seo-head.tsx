import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  structuredData,
  noIndex = false
}: SEOHeadProps) {
  useEffect(() => {
    // Set title
    document.title = title;
    
    // Set or update meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }
    
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, true);
    }
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      
      canonical.href = canonicalUrl;
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, canonicalUrl, ogImage, structuredData, noIndex]);

  return null;
}

// Pre-built SEO configurations for common pages
export const seoConfigs = {
  homepage: {
    title: 'Personal Knowledge Base - Privacy-First Note Taking',
    description: 'Secure, self-hosted personal knowledge management system. Take notes, organize thoughts, and manage your knowledge with complete privacy control.',
    keywords: ['knowledge base', 'note taking', 'privacy', 'self-hosted', 'personal wiki', 'notes app'],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Personal Knowledge Base",
      "description": "Privacy-first personal knowledge management system",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  editor: {
    title: 'Note Editor - Personal Knowledge Base',
    description: 'Create and edit your notes with our powerful, privacy-focused editor. Organize your thoughts securely.',
    keywords: ['note editor', 'writing', 'documentation', 'privacy', 'secure notes']
  },
  
  privacy: {
    title: 'Privacy Policy - Personal Knowledge Base',
    description: 'Learn about our commitment to privacy and how we protect your data in our self-hosted knowledge management system.',
    keywords: ['privacy policy', 'data protection', 'GDPR', 'self-hosted', 'data security'],
    noIndex: true
  },
  
  settings: {
    title: 'Settings - Personal Knowledge Base',
    description: 'Manage your account settings, privacy preferences, and customize your knowledge base experience.',
    keywords: ['settings', 'preferences', 'account', 'privacy settings'],
    noIndex: true
  }
};