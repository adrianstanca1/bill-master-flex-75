import { useEffect } from 'react';

export function SecurityHeadersEnforcer() {
  useEffect(() => {
    const enforceSecurityHeaders = () => {
      // Create meta tags for security headers
      const headers = [
        {
          name: 'Content-Security-Policy',
          content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' http: https: ws: wss: https://api.elevenlabs.io; frame-ancestors 'none';"
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
          content: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(self)'
        },
        {
          name: 'Strict-Transport-Security',
          content: 'max-age=31536000; includeSubDomains; preload'
        }
      ];

      headers.forEach(({ name, content }) => {
        let metaTag = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('http-equiv', name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      });

      // Add security-focused viewport meta tag
      let viewportTag = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (!viewportTag) {
        viewportTag = document.createElement('meta');
        viewportTag.setAttribute('name', 'viewport');
        document.head.appendChild(viewportTag);
      }
      viewportTag.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
    };

    enforceSecurityHeaders();
  }, []);

  return null;
}