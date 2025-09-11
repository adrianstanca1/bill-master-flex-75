import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureLogging } from '@/hooks/useSecureLogging';

export function EnhancedSecurityHeaders() {
  const { logSecurityEvent } = useSecureLogging();

  useEffect(() => {
    const enforceEnhancedSecurityHeaders = async () => {
      try {
        // Enhanced Content Security Policy with stricter rules
        const headers = [
          {
            name: 'Content-Security-Policy',
            content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.elevenlabs.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
          },
          {
            name: 'X-Frame-Options',
            content: 'DENY'
          },
          {
            name: 'X-Content-Type-Options',
            content: 'nosniff'
          },
          {
            name: 'X-XSS-Protection',
            content: '1; mode=block'
          },
          {
            name: 'Referrer-Policy',
            content: 'strict-origin-when-cross-origin'
          },
          {
            name: 'Permissions-Policy',
            content: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(self), fullscreen=(self)'
          },
          {
            name: 'Strict-Transport-Security',
            content: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            name: 'Cross-Origin-Embedder-Policy',
            content: 'require-corp'
          },
          {
            name: 'Cross-Origin-Opener-Policy',
            content: 'same-origin'
          },
          {
            name: 'Cross-Origin-Resource-Policy',
            content: 'same-origin'
          }
        ];

        // Apply headers
        headers.forEach(({ name, content }) => {
          let metaTag = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('http-equiv', name);
            document.head.appendChild(metaTag);
          }
          metaTag.setAttribute('content', content);
        });

        // Enhanced viewport with security considerations
        let viewportTag = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
        if (!viewportTag) {
          viewportTag = document.createElement('meta');
          viewportTag.setAttribute('name', 'viewport');
          document.head.appendChild(viewportTag);
        }
        viewportTag.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0');

        // Add security-focused meta tags
        const securityMetas = [
          { name: 'robots', content: 'noindex, nofollow, nosnippet, noarchive' },
          { name: 'format-detection', content: 'telephone=no, email=no, address=no' },
          { name: 'theme-color', content: '#000000' }
        ];

        securityMetas.forEach(({ name, content }) => {
          let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', name);
            document.head.appendChild(metaTag);
          }
          metaTag.setAttribute('content', content);
        });

        // Monitor for unauthorized script injections
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-authorized')) {
                  logSecurityEvent({
                    eventType: 'UNAUTHORIZED_SCRIPT_INJECTION',
                    severity: 'critical',
                    details: {
                      script_src: element.getAttribute('src'),
                      script_content: element.textContent?.substring(0, 100),
                      timestamp: new Date().toISOString()
                    }
                  });
                }
              }
            });
          });
        });

        observer.observe(document.head, { childList: true, subtree: true });
        observer.observe(document.body, { childList: true, subtree: true });

        // Log security headers enforcement
        await logSecurityEvent({
          eventType: 'SECURITY_HEADERS_ENFORCED',
          severity: 'low',
          details: {
            headers_count: headers.length,
            enhanced_features: ['CSP', 'COEP', 'COOP', 'CORP', 'mutation_observer'],
            timestamp: new Date().toISOString()
          }
        });

        return () => observer.disconnect();
      } catch (error) {
        console.error('Failed to enforce enhanced security headers:', error);
        await logSecurityEvent({
          eventType: 'SECURITY_HEADERS_ENFORCEMENT_FAILED',
          severity: 'high',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    enforceEnhancedSecurityHeaders();
  }, [logSecurityEvent]);

  return null;
}