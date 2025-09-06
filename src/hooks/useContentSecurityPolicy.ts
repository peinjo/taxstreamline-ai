import { useEffect } from 'react';

export function useContentSecurityPolicy() {
  useEffect(() => {
    // Add CSP meta tag if it doesn't exist
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' https://*.supabase.co https://api.openai.com;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim();
      
      document.head.appendChild(meta);
    }
  }, []);
}