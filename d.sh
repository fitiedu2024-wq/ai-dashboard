#!/bin/bash

echo "🔍 DIAGNOSTIC - Finding Issues"
echo "=============================="

cd ~/ai-dashboard-render/frontend

echo ""
echo "📁 Checking directory structure:"
echo "================================"

# Check if directories exist
echo ""
echo "Admin pages:"
ls -la app/admin/ 2>/dev/null || echo "❌ app/admin/ NOT FOUND"
ls -la app/admin/users/ 2>/dev/null || echo "❌ app/admin/users/ NOT FOUND"
ls -la app/admin/activity/ 2>/dev/null || echo "❌ app/admin/activity/ NOT FOUND"

echo ""
echo "AI Tools pages:"
ls -la "app/(dashboard)/analytics/" 2>/dev/null || echo "❌ analytics NOT FOUND"
ls -la "app/(dashboard)/ai-recommendations/" 2>/dev/null || echo "❌ ai-recommendations NOT FOUND"
ls -la "app/(dashboard)/vision-ai/" 2>/dev/null || echo "❌ vision-ai NOT FOUND"
ls -la "app/(dashboard)/sentiment/" 2>/dev/null || echo "❌ sentiment NOT FOUND"

echo ""
echo "📄 Checking page files:"
echo "======================="

# Check specific files
[ -f "app/admin/page.tsx" ] && echo "✅ app/admin/page.tsx EXISTS" || echo "❌ app/admin/page.tsx NOT FOUND"
[ -f "app/admin/users/page.tsx" ] && echo "✅ app/admin/users/page.tsx EXISTS" || echo "❌ app/admin/users/page.tsx NOT FOUND"
[ -f "app/(dashboard)/analytics/page.tsx" ] && echo "✅ analytics page EXISTS" || echo "❌ analytics page NOT FOUND"

echo ""
echo "🔗 Checking Sidebar links:"
echo "========================="
grep -n "href=" app/components/Sidebar.tsx | head -20

echo ""
echo "📊 Summary:"
echo "==========="
echo "Run this script to see what's missing!"
echo "Then we'll create a targeted fix."
