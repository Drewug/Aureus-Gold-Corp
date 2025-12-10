import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url, type = 'website', keywords = [] }) => {
  useEffect(() => {
    // Update Title
    document.title = title.includes('Aureus') ? title : `${title} | Aureus Gold Corp`;

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, attr = 'name') => {
      if (!content) return;
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description || '');
    updateMeta('keywords', keywords.join(', '));
    
    // Open Graph
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description || '', 'property');
    if (image) updateMeta('og:image', image, 'property');
    if (url) updateMeta('og:url', url, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:site_name', 'Aureus Gold Corp', 'property');

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description || '');
    if (image) updateMeta('twitter:image', image);

    return () => {
        // Cleanup optional if needed, but usually overwriting is sufficient in SPA
    };
  }, [title, description, image, url, type, keywords]);

  return null;
};
