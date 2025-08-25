# Ionos Hosting Deployment Guide

## Prerequisites
- Ionos hosting account with Node.js support
- Domain already configured with DNS pointing to Ionos

## Build Configuration

### 1. Production Build
```bash
npm run build
```
This creates a `dist/` folder with optimized static files.

### 2. Upload to Ionos
Upload the entire `dist/` folder contents to your Ionos web directory (usually `public_html` or similar).

### 3. Server Configuration
Create a `.htaccess` file in your web root for SPA routing:

```apache
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header set Cache-Control "public, max-age=2592000"
</FilesMatch>
```

### 4. Environment Configuration
Ensure your Supabase URLs are correctly configured for production in:
- `src/integrations/supabase/client.ts`
- Supabase project settings

### 5. Domain Configuration
Update your Supabase project settings:
1. Go to Authentication → URL Configuration
2. Add your custom domain to Site URL
3. Add redirect URLs for OAuth

## Automated Deployment (Optional)
You can set up automated deployment using GitHub Actions or similar CI/CD tools.

## File Structure After Upload
```
your-domain.com/
├── index.html
├── assets/
│   ├── css files
│   └── js files
├── favicon.ico
└── .htaccess
```