#!/bin/bash

# Fertiwell Production Deployment Script

echo "🚀 Deploying Fertiwell to Production..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found!"
    echo "This file is required for production deployment."
    exit 1
fi

# Confirm production deployment
echo "⚠️  This will deploy to production environment."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Stop existing production containers
echo "🧹 Stopping existing production containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start production environment
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)

if [ "$backend_health" == "200" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed (HTTP $backend_health)"
fi

if [ "$frontend_health" == "200" ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed (HTTP $frontend_health)"
fi

echo ""
echo "🎉 Production deployment complete!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:5000"
echo ""
echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "Stop services: docker-compose -f docker-compose.prod.yml down"
