#!/bin/bash

# EriMuga Production Deployment Script
# Run this script to prepare your code for production

echo "🚀 Preparing EriMuga for Production Deployment..."

# Install compression dependency
echo "📦 Installing production dependencies..."
cd server
npm install compression
cd ../

# Build frontend
echo "🏗️  Building frontend..."
cd client
npm install
npm run build
cd ../

# Run tests (if any)
echo "🧪 Running tests..."
cd server
# npm test (uncomment when tests are available)
cd ../

# Check environment variables
echo "🔍 Checking environment setup..."
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env not found. Copy from .env.example"
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  Warning: client/.env not found. Copy from .env.example"
fi

echo "✅ Production preparation complete!"
echo ""
echo "📋 Pre-deployment checklist:"
echo "  □ Set up MongoDB Atlas database"
echo "  □ Configure environment variables in Render"
echo "  □ Set up Google OAuth credentials"
echo "  □ Configure Cloudinary account"
echo "  □ Update CORS origins for production domain"
echo "  □ Test authentication flow"
echo "  □ Test multi-user scenarios"
echo ""
echo "🌐 Ready for Render deployment!"
