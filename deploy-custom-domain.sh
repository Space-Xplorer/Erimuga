#!/bin/bash

# Deployment script for EriMuga with custom domain

echo "🚀 Starting EriMuga deployment process..."

# Build frontend for production
echo "📦 Building frontend..."
cd client
npm install
npm run build
cd ..

# Backend is already configured
echo "⚙️ Backend configuration ready..."

echo "📋 Next steps:"
echo "1. Deploy backend to Render as Web Service"
echo "2. Deploy frontend to Render as Static Site" 
echo "3. Configure DNS in Cloudflare:"
echo "   - A Record: www.erindmuga.in → [Frontend IP]"
echo "   - CNAME: api.erindmuga.in → [Backend URL]"
echo "4. Update environment variables in Render dashboard"
echo "5. Test at https://www.erindmuga.in"

echo "✅ Deployment preparation complete!"