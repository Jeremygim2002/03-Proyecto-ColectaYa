import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Collection } from '@/types'
import React from 'react'

// ====================================
// STYLING UTILITIES
// ====================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ====================================
// REACT 19 PRELOAD UTILITIES
// ====================================

/**
 * Preload an image before it's needed
 * React 19 will deduplicate multiple preload calls
 */
export function preloadImage(href: string, options?: { fetchPriority?: 'high' | 'low' | 'auto' }) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = href;
  
  if (options?.fetchPriority) {
    link.setAttribute('fetchpriority', options.fetchPriority);
  }
  
  // Only add if not already preloaded
  if (!document.querySelector(`link[rel="preload"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Preload multiple images
 */
export function preloadImages(hrefs: string[], options?: { fetchPriority?: 'high' | 'low' | 'auto' }) {
  hrefs.forEach((href) => preloadImage(href, options));
}

/**
 * Preload a font file
 */
export function preloadFont(href: string, type: string = 'font/woff2') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = href;
  link.type = type;
  link.crossOrigin = 'anonymous';
  
  if (!document.querySelector(`link[rel="preload"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Prefetch a page for future navigation
 */
export function prefetchPage(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  if (!document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Preconnect to external domain
 */
export function preconnect(href: string) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  
  if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Preload critical assets for the app
 */
export function preloadCriticalAssets() {
  // Preload hero images
  preloadImage('/hero-collaboration.jpg', { fetchPriority: 'high' });
  
  // Preconnect to API
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl) {
    const apiDomain = new URL(apiUrl).origin;
    preconnect(apiDomain);
  }
}

// ====================================
// REACT 19 METADATA UTILITIES
// ====================================

/**
 * Set page title and meta description
 * React 19 allows these tags anywhere in the component tree
 */
export function getPageMetadata(title: string, description?: string): React.ReactElement {
  const fullTitle = `${title} | ColectaYa`;
  
  return React.createElement(React.Fragment, null,
    React.createElement('title', null, fullTitle),
    description && React.createElement('meta', { name: 'description', content: description }),
    React.createElement('meta', { property: 'og:title', content: fullTitle }),
    description && React.createElement('meta', { property: 'og:description', content: description }),
    React.createElement('meta', { name: 'twitter:title', content: fullTitle }),
    description && React.createElement('meta', { name: 'twitter:description', content: description })
  );
}

/**
 * Generate Open Graph metadata for collection sharing
 */
export function getCollectionMetadata(collection: Collection): React.ReactElement {
  const title = `${collection.title} | ColectaYa`;
  const description = collection.description;
  const url = `${window.location.origin}/collection/${collection.id}`;
  
  return React.createElement(React.Fragment, null,
    React.createElement('title', null, title),
    React.createElement('meta', { name: 'description', content: description }),
    
    // Open Graph
    React.createElement('meta', { property: 'og:type', content: 'website' }),
    React.createElement('meta', { property: 'og:title', content: title }),
    React.createElement('meta', { property: 'og:description', content: description }),
    React.createElement('meta', { property: 'og:url', content: url }),
    React.createElement('meta', { property: 'og:image', content: collection.imageUrl }),
    
    // Twitter Card
    React.createElement('meta', { name: 'twitter:card', content: 'summary_large_image' }),
    React.createElement('meta', { name: 'twitter:title', content: title }),
    React.createElement('meta', { name: 'twitter:description', content: description }),
    React.createElement('meta', { name: 'twitter:image', content: collection.imageUrl }),
    
    // Canonical URL
    React.createElement('link', { rel: 'canonical', href: url })
  );
}

/**
 * Get default metadata for pages without specific content
 */
export function getDefaultMetadata(): React.ReactElement {
  return getPageMetadata(
    'ColectaYa',
    'Plataforma colaborativa para organizar colectas de dinero de manera fácil y transparente'
  );
}

/**
 * Get metadata for authentication pages
 */
export function getAuthMetadata(isLogin: boolean): React.ReactElement {
  return getPageMetadata(
    isLogin ? 'Iniciar Sesión' : 'Registrarse',
    isLogin 
      ? 'Accede a tu cuenta de ColectaYa' 
      : 'Crea tu cuenta y comienza a organizar colectas'
  );
}

/**
 * Get metadata for explore page
 */
export function getExploreMetadata(): React.ReactElement {
  return getPageMetadata(
    'Explorar Colectas',
    'Descubre colectas públicas y contribuye a causas que te importan'
  );
}

/**
 * Get metadata for dashboard
 */
export function getDashboardMetadata(): React.ReactElement {
  return getPageMetadata(
    'Mi Dashboard',
    'Gestiona tus colectas, revisa contribuciones y más'
  );
}
