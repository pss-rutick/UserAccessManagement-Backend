#!/bin/bash

# Fertiwell Development Environment Startup Script

echo "🔥 Starting Fertiwell Development Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "⚠️  Warning: serviceAccountKey.json not found!"
    echo "Please add your Firebase service account key to the backend directory."
    echo "Download it from: https://console.firebase.google.com/"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.dev.yml down >/dev/null 2>&1

# Start the development environment
echo "🚀 Starting development containers..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment stopped."
