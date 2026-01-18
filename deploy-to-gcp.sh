#!/bin/bash

# AI Marketing Dashboard - GCP Deployment Script
# This script pushes code to GitHub and triggers Cloud Build

set -e

echo "🚀 Starting GCP Deployment..."

# Configuration
PROJECT_ID="grinners-ai"
SERVICE_NAME="ai-marketing-dashboard"
REGION="us-central1"

echo "📦 Project: $PROJECT_ID"
echo "🎯 Service: $SERVICE_NAME"
echo "🌍 Region: $REGION"

# Navigate to backend directory
cd /home/ubuntu/ai-dashboard/backend

echo "🔨 Building Docker image locally for testing..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

echo "✅ Docker build successful!"

echo ""
echo "📋 Next steps:"
echo "1. Push image to GCR: gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME"
echo "2. Deploy to Cloud Run: gcloud run deploy $SERVICE_NAME --image gcr.io/$PROJECT_ID/$SERVICE_NAME --region $REGION"
echo ""
echo "Or use Cloud Console to deploy the image."

