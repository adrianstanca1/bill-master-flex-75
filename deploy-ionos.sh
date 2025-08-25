#!/bin/bash

# Ionos Deployment Script
# Run this script to build and prepare files for Ionos hosting

echo "🚀 Building for production..."
npm run build

echo "📋 Copying .htaccess to dist folder..."
cp .htaccess dist/

echo "📦 Creating deployment archive..."
cd dist
tar -czf ../ionos-deployment.tar.gz *
cd ..

echo "✅ Deployment files ready!"
echo "📁 Upload the contents of the 'dist' folder to your Ionos web directory"
echo "📦 Or upload and extract 'ionos-deployment.tar.gz' on your server"
echo ""
echo "🔧 Next steps:"
echo "1. Upload files to your Ionos hosting"
echo "2. Update Supabase site URL to your domain"
echo "3. Configure OAuth redirect URLs"