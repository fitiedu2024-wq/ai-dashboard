#!/bin/bash

echo "🔄 FORCING BACKEND REDEPLOY"
echo "============================"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

cd backend

# Make a small change to trigger redeploy
echo -e "${BLUE}📝 Creating deployment trigger...${NC}"

# Add a comment to main.py to force git change
echo "" >> main.py
echo "# Deployment trigger - $(date)" >> main.py

cd ..

echo -e "${BLUE}📤 Committing and pushing...${NC}"

git add .
git commit -m "🔄 Force backend redeploy - Add missing endpoints"
git push origin main

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ PUSHED TO GITHUB!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Now:"
echo "  1. Go to: https://dashboard.render.com"
echo "  2. Find: ai-dashboard-backend-7dha"
echo "  3. Click: 'Manual Deploy' → 'Deploy latest commit'"
echo ""
echo "OR wait 2-3 minutes for auto-deploy"
echo ""

