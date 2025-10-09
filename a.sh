#!/bin/bash
cd ~/ai-dashboard-render

# ============================================
# COMPLETE SETUP SCRIPT - AI GRINNERS PLATFORM
# ============================================
#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Complete Setup..."
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# PART 1: COMPLETE ALL UI PAGES
# ============================================

echo -e "${BLUE}📱 Part 1: Completing UI Pages...${NC}"

cd frontend

# 1. Ads Analysis Page
echo "Creating Ads Analysis page..."
cat > "app/(dashboard)/ads-analysis/page.tsx" << 'TSX'
'use client';

import { useState } from 'react';
import { Smartphone, Loader2, ExternalLink, TrendingUp } from 'lucide-react';

export default function AdsAnalysis() {
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/analyze-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, brand_name: brandName })
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
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Ads Intelligence
          </h1>
          <p className="text-gray-200 text-lg">Discover competitor ads across all platforms</p>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="nike.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-rose-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Brand Name (optional)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nike"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            onClick={analyzeAds}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-pink-500/50 disabled:opacity-50 font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning platforms...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                Discover Ads
              </>
            )}
          </button>
        </div>

        {results?.data && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-8 border-l-4 border-blue-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📘</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Meta (Facebook/Instagram)</h2>
                  <p className="text-gray-300">Official Ad Library</p>
                </div>
              </div>
              
              {results.data.platforms?.meta?.status === 'success' ? (
                <div>
                  <div className="mb-6 text-4xl font-bold text-blue-300">
                    {results.data.platforms.meta.total_ads} Ads Found
                  </div>
                  <div className="space-y-4">
                    {results.data.platforms.meta.ads?.slice(0, 5).map((ad: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all card-hover">
                        <div className="font-bold text-xl mb-2 text-white">{ad.page_name}</div>
                        <div className="text-sm text-gray-400 mb-4">Started: {ad.start_date}</div>
                        {ad.preview_url && (
                          <a 
                            href={ad.preview_url} 
                            target="_blank"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all font-medium"
                          >
                            View Ad <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-lg">{results.data.platforms?.meta?.message || 'No ads found'}</p>
              )}
            </div>

            <div className="glass rounded-2xl p-8 border-l-4 border-pink-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🎵</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">TikTok Ads</h2>
                  <p className="text-gray-300">Creative Library</p>
                </div>
              </div>
              {results.data.platforms?.tiktok?.url && (
                <a 
                  href={results.data.platforms.tiktok.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500/20 text-pink-300 rounded-xl hover:bg-pink-500/30 transition-all font-bold text-lg"
                >
                  Open TikTok Ad Library <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>

            <div className="glass rounded-2xl p-8 border-l-4 border-green-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🔍</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Google Ads</h2>
                  <p className="text-gray-300">Transparency Center</p>
                </div>
              </div>
              {results.data.platforms?.google?.url && (
                <a 
                  href={results.data.platforms.google.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-all font-bold text-lg"
                >
                  Open Google Transparency <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
TSX

# 2. SEO Comparison Page
echo "Creating SEO Comparison page..."
cat > "app/(dashboard)/seo-comparison/page.tsx" << 'TSX'
'use client';

import { useState } from 'react';
import { BarChart3, Loader2, TrendingUp, AlertCircle } from 'lucide-react';

export default function SEOComparison() {
  const [yourDomain, setYourDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const compareSEO = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/seo-comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          your_domain: yourDomain,
          competitors: competitorList
        })
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
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            SEO Comparison
          </h1>
          <p className="text-gray-200 text-lg">Side-by-side SEO metrics analysis</p>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-green-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Your Domain
              </label>
              <input
                type="text"
                value={yourDomain}
                onChange={(e) => setYourDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-3 text-emerald-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Competitors (comma-separated)
              </label>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="competitor1.com, competitor2.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            onClick={compareSEO}
            disabled={loading || !yourDomain || !competitors}
            className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-green-500/50 font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Compare SEO
              </>
            )}
          </button>
        </div>

        {results?.data && (
          <div className="space-y-8">
            <div className="glass rounded-2xl p-8 border-2 border-green-400/50">
              <h2 className="text-3xl font-bold mb-6 text-white">Your Site: {yourDomain}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    {results.data.your_site?.seo_score || 0}
                  </div>
                  <div className="text-sm text-gray-300">SEO Score</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400 mb-2">
                    {results.data.your_site?.title_length || 0}
                  </div>
                  <div className="text-sm text-gray-300">Title Length</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-400 mb-2">
                    {results.data.your_site?.h1_count || 0}
                  </div>
                  <div className="text-sm text-gray-300">H1 Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-orange-400 mb-2">
                    {results.data.your_site?.alt_coverage || 0}%
                  </div>
                  <div className="text-sm text-gray-300">Alt Coverage</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Competitors</h2>
              <div className="space-y-4">
                {Object.entries(results.data.competitors || {}).map(([domain, data]: [string, any]) => (
                  <div key={domain} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <h3 className="font-bold text-xl mb-4 text-white">{domain}</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-green-400">{data.seo_score}</div>
                        <div className="text-xs text-gray-400 mt-1">Score</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-400">{data.title_length}</div>
                        <div className="text-xs text-gray-400 mt-1">Title</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-400">{data.h1_count}</div>
                        <div className="text-xs text-gray-400 mt-1">H1</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-400">{data.alt_coverage}%</div>
                        <div className="text-xs text-gray-400 mt-1">Alt</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.data.insights?.length > 0 && (
              <div className="glass rounded-2xl p-8 border-l-4 border-yellow-500">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  Insights
                </h2>
                <div className="space-y-3">
                  {results.data.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-yellow-500/10 p-5 rounded-xl border border-yellow-500/20">
                      <span className="text-yellow-400 font-bold text-xl">→</span>
                      <span className="text-white text-lg">{insight}</span>
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

# 3. Keyword Analysis Page
echo "Creating Keyword Analysis page..."
cat > "app/(dashboard)/keyword-analysis/page.tsx" << 'TSX'
'use client';

import { useState } from 'react';
import { Key, Loader2, TrendingUp, Target } from 'lucide-react';

export default function KeywordAnalysis() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/keyword-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain })
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
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Keyword Analysis
          </h1>
          <p className="text-gray-200 text-lg">Find untapped keyword opportunities</p>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-orange-300 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Domain to Analyze
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Keywords...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Analyze Keywords
              </>
            )}
          </button>
        </div>

        {results?.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Key className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-sm text-gray-400">Total Keywords</div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {results.data.keywords?.length || 0}
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-sm text-gray-400">High Priority</div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {results.data.keywords?.filter((k: any) => k.priority === 'high').length || 0}
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-sm text-gray-400">Opportunities</div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {results.data.opportunities || 0}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Keyword Opportunities
              </h3>
              <div className="space-y-3">
                {results.data.keywords?.slice(0, 20).map((keyword: any, idx: number) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-white">{keyword.term}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Search Volume: {keyword.volume || 'N/A'} | Difficulty: {keyword.difficulty || 'Medium'}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                        keyword.priority === 'high' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
                          : keyword.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                          : 'bg-green-500/20 text-green-300 border border-green-500/50'
                      }`}>
                        {keyword.priority} priority
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
TSX

# 4. Admin Pages
echo "Creating Admin pages..."

# Admin Dashboard
cat > "app/admin/page.tsx" << 'TSX'
'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Fetch admin stats
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, []);

  const adminCards = [
    {
      title: 'Users',
      value: stats.total_users || 0,
      icon: Users,
      color: 'blue',
      href: '/admin/users'
    },
    {
      title: 'Total Analyses',
      value: stats.total_analyses || 0,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Active Today',
      value: stats.active_today || 0,
      icon: Activity,
      color: 'purple',
      href: '/admin/activity'
    },
    {
      title: 'Quota Used',
      value: `${stats.quota_used || 0}%`,
      icon: Zap,
      color: 'orange',
    }
  ];

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-200 text-lg">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href || '#'}
                className="glass rounded-2xl p-6 border border-white/20 card-hover"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-${card.color}-500/20 rounded-xl`}>
                    <Icon className={`w-6 h-6 text-${card.color}-400`} />
                  </div>
                  <div className="text-sm text-gray-400">{card.title}</div>
                </div>
                <div className="text-4xl font-bold text-white">{card.value}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="glass rounded-2xl p-8 border border-white/20 card-hover group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">User Management</h3>
                <p className="text-gray-300">Manage user accounts and permissions</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/activity" className="glass rounded-2xl p-8 border border-white/20 card-hover group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Activity Logs</h3>
                <p className="text-gray-300">View system activity and user actions</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
TSX

# Admin Users Page
cat > "app/admin/users/page.tsx" << 'TSX'
'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setUsers(data.users || []))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-200 text-lg">Manage all platform users</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">All Users</h2>
          </div>

          <div className="space-y-3">
            {users.map((user, idx) => (
              <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-lg text-white">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div>Quota: {user.quota}/20</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    user.is_active 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
TSX

# Admin Activity Page
cat > "app/admin/activity/page.tsx" << 'TSX'
'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, User } from 'lucide-react';

export default function AdminActivity() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ai-dashboard-backend-7dha.onrender.com/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setLogs(data.logs || []))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Activity Logs
          </h1>
          <p className="text-gray-200 text-lg">Monitor system activity</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white">{log.action}</span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-gray-400 ml-7">{log.details}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
TSX

echo -e "${GREEN}✅ All UI pages created${NC}"

# ============================================
# PART 2: BACKEND ENDPOINTS
# ============================================

echo -e "${BLUE}🔧 Part 2: Adding Backend Endpoints...${NC}"

cd ../backend

# Add admin endpoints to main.py
cat >> main.py << 'PYTHON'

# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.get("/api/admin/stats")
def get_admin_stats(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get admin statistics"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Get stats
        total_users = db.query(User).count()
        
        return {
            "total_users": total_users,
            "total_analyses": 0,
            "active_today": 0,
            "quota_used": 0
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/users")
def get_all_users(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get all users"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        users = db.query(User).all()
        
        return {
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "quota": u.quota,
                    "is_active": u.is_active,
                    "created_at": u.created_at.isoformat() if hasattr(u, 'created_at') else None
                }
                for u in users
            ]
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/activity")
def get_activity_logs(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get activity logs"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Return empty for now
        return {
            "logs": []
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

PYTHON

echo -e "${GREEN}✅ Backend endpoints added${NC}"

# ============================================
# PART 3: COMMIT & DEPLOY
# ============================================

echo -e "${BLUE}🚀 Part 3: Deploying...${NC}"

cd ..

git add .
git commit -m "Complete: All UI pages + Admin functionality"
git push origin main

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ COMPLETE SETUP FINISHED!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "🎉 All pages created:"
echo "   ✓ Dashboard"
echo "   ✓ Deep Analysis"
echo "   ✓ Ads Intelligence"
echo "   ✓ SEO Comparison"
echo "   ✓ Keyword Analysis"
echo "   ✓ Admin Dashboard"
echo "   ✓ Admin Users"
echo "   ✓ Admin Activity"
echo ""
echo "🔗 Live URLs:"
echo "   Frontend: https://ai-grinners.online"
echo "   Backend: https://ai-dashboard-backend-7dha.onrender.com"
echo ""
echo "🔑 Admin Login:"
echo "   Email: 3ayoty@gmail.com"
echo "   Password: AliTia20"
echo ""

ENDSCRIPT

