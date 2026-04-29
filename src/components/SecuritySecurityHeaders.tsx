import { useEffect } from 'react';
import { getSupabaseConnectSources } from '@/lib/csp';

export function SecuritySecurityHeaders() {
  useEffect(() => {
    // Add security headers via meta tags for client-side protection
    const addSecurityHeaders = () => {
      const supabaseConnect = getSupabaseConnectSources();
      // Content Security Policy
      let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        cspMeta.setAttribute('content',
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "img-src 'self' data: blob: https:; " +
          `connect-src 'self' ${supabaseConnect}; ` +
          "frame-ancestors 'none'; " +
          "base-uri 'self';"
        );
        document.head.appendChild(cspMeta);
      }

      // X-Frame-Options
      let frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!frameMeta) {
        frameMeta = document.createElement('meta');
        frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
        frameMeta.setAttribute('content', 'DENY');
        document.head.appendChild(frameMeta);
      }

      // X-Content-Type-Options
      let contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        contentTypeMeta = document.createElement('meta');
        contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        contentTypeMeta.setAttribute('content', 'nosniff');
        document.head.appendChild(contentTypeMeta);
      }

      // X-XSS-Protection
      let xssMeta = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
      if (!xssMeta) {
        xssMeta = document.createElement('meta');
        xssMeta.setAttribute('http-equiv', 'X-XSS-Protection');
        xssMeta.setAttribute('content', '1; mode=block');
        document.head.appendChild(xssMeta);
      }

      // Referrer Policy
      let referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name', 'referrer');
        referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
        document.head.appendChild(referrerMeta);
      }

      // Permissions Policy
      let permissionsMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]');
      if (!permissionsMeta) {
        permissionsMeta = document.createElement('meta');
        permissionsMeta.setAttribute('http-equiv', 'Permissions-Policy');
        permissionsMeta.setAttribute('content', 
          'geolocation=(), microphone=(), camera=(), payment=(), usb=(), serial=(), bluetooth=()'
        );
        document.head.appendChild(permissionsMeta);
      }
    };

    addSecurityHeaders();
  }, []);

  return null; // This component doesn't render anything visible
}