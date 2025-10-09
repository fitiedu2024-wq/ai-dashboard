#!/bin/bash

set -e

echo "🎯 TARGETED FIX - Creating Missing Pages"
echo "========================================"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd frontend

# ============================================
# FIX 1: CREATE MISSING AI TOOLS PAGES
# ============================================

echo -e "${BLUE}📱 Creating missing AI Tools pages...${NC}"

# Analytics Page
cat > "app/(dashboard)/analytics/page.tsx" << 'TSX'
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-200 text-lg mb-8">Platform insights & metrics</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">1,284</div>
            <div className="text-sm text-gray-400">Total Analyses</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Target className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">428</div>
            <div className="text-sm text-gray-400">Competitors Tracked</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">3.2K</div>
            <div className="text-sm text-gray-400">Insights Generated</div>
          </div>
        </div>

        {data?.daily && (
          <div className="glass rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Daily Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#7C3AED" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
TSX

# Vision AI Page
cat > "app/(dashboard)/vision-ai/page.tsx" << 'TSX'
'use client';

import { useState } from 'react';
import { Eye, Upload, Loader2 } from 'lucide-react';

export default function VisionAI() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeImage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/vision/detect-brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image_url: imageUrl })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Vision AI
        </h1>
        <p className="text-gray-200 text-lg mb-8">Logo & Brand Detection</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-blue-300">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyzeImage}
            disabled={loading || !imageUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Eye className="w-5 h-5" />Detect Brands</>}
          </button>
        </div>

        {results?.success && (
          <div className="space-y-6">
            {results.data.logos.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">🏷️ Detected Logos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {results.data.logos.map((logo: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-xl">
                      <div className="font-bold text-white">{logo.name}</div>
                      <div className="text-sm text-green-400">{logo.confidence}% confident</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
TSX

# Sentiment Page
cat > "app/(dashboard)/sentiment/page.tsx" << 'TSX'
'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, TrendingUp } from 'lucide-react';

export default function Sentiment() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/language/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Sentiment Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">AI-powered emotion detection</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-purple-300">Text to Analyze</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text for sentiment analysis..."
              rows={6}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyze}
            disabled={loading || !text}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><MessageSquare className="w-5 h-5" />Analyze Sentiment</>}
          </button>
        </div>

        {results?.success && (
          <div className="glass rounded-2xl p-8 border-2 border-green-400/50">
            <div className="flex items-center gap-6 mb-6">
              <TrendingUp className="w-12 h-12 text-green-400" />
              <div>
                <div className="text-4xl font-bold text-white">{results.sentiment.label}</div>
                <div className="text-gray-300">Score: {results.sentiment.score}</div>
              </div>
            </div>

            {results.entities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Key Entities</h3>
                <div className="space-y-2">
                  {results.entities.map((entity: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl">
                      <div className="font-bold text-white">{entity.name}</div>
                      <div className="text-sm text-gray-400">Type: {entity.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
TSX

echo -e "${GREEN}✅ AI Tools pages created${NC}"

# ============================================
# FIX 2: ADMIN AUTHENTICATION ISSUE
# ============================================

echo -e "${BLUE}🔐 Fixing Admin authentication...${NC}"

# Update admin pages to check auth properly
cat > app/admin/page.tsx << 'TSX'
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      // First, check if user is admin
      const userResponse = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/user', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        console.log('User check failed, redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      console.log('User data:', userData);

      if (!userData.is_admin) {
        alert('Admin access required');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Now fetch stats
      const statsResponse = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      alert('Error checking admin access. Please try logging in again.');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Checking admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_users || 0}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.online_users || 0}</div>
            <div className="text-sm text-gray-400">Online Now</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.total_reports || 0}</div>
            <div className="text-sm text-gray-400">Total Reports</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-orange-400 mb-4" />
            <div className="text-4xl font-bold text-white">{stats.reports_today || 0}</div>
            <div className="text-sm text-gray-400">Reports Today</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/users" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">User Management</h3>
            <p className="text-gray-300">Manage all platform users</p>
          </Link>
          <Link href="/admin/activity" className="glass rounded-2xl p-8 border border-white/20 card-hover">
            <Activity className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Activity Logs</h3>
            <p className="text-gray-300">Monitor system activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
TSX

echo -e "${GREEN}✅ Admin auth fixed${NC}"

# ============================================
# DEPLOY
# ============================================

cd ..

echo -e "${BLUE}🚀 Deploying fixes...${NC}"

git add .
git commit -m "🎯 Targeted Fix: Created missing AI pages + Fixed admin auth"
git push origin main

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ TARGETED FIX COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Fixed:"
echo "  ✅ Created analytics page"
echo "  ✅ Created vision-ai page"
echo "  ✅ Created sentiment page"
echo "  ✅ Fixed admin authentication flow"
echo ""
echo "Test now:"
echo "  1. Go to /analytics - should work"
echo "  2. Go to /admin - should check auth properly"
echo "  3. Check browser console for debug logs"
echo ""
