#!/bin/bash

BACKEND_URL="https://ai-dashboard-backend-7dha.onrender.com"

echo "Testing AI Dashboard Backend Endpoints"
echo "======================================"
echo ""

# 1. Health Check
echo "1. Health Check..."
curl -s "$BACKEND_URL/" | jq . || echo "Failed"
echo ""

# 2. Login to get token
echo "2. Login..."
TOKEN=$(curl -s -X POST "$BACKEND_URL/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@grinners.com&password=admin123" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed. Creating test user..."
  # Try default credentials
  TOKEN="test_token_placeholder"
fi

echo "Token: ${TOKEN:0:20}..."
echo ""

# 3. Test Ads Analysis
echo "3. Testing /api/analyze-ads..."
curl -s -X POST "$BACKEND_URL/api/analyze-ads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"domain": "nike.com", "brand_name": "Nike"}' | jq .
echo ""

# 4. Test Keyword Analysis
echo "4. Testing /api/keyword-analysis..."
curl -s -X POST "$BACKEND_URL/api/keyword-analysis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"your_domain": "example.com", "competitors": ["competitor1.com"]}' | jq .
echo ""

# 5. Test SEO Comparison
echo "5. Testing /api/seo-comparison..."
curl -s -X POST "$BACKEND_URL/api/seo-comparison" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"your_domain": "example.com", "competitors": ["competitor1.com"]}' | jq .
echo ""

echo "======================================"
echo "Tests complete!"
