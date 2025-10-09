'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Activity, Target, Zap, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Deep Analysis',
      description: 'Multi-page crawl + AI competitive intelligence',
      href: '/dashboard/analyze',
      gradient: 'from-purple-600 to-pink-600',
      stats: 'Powered by Gemini AI'
    },
    {
      icon: Activity,
      title: 'Ads Intelligence',
      description: 'Cross-platform ad discovery and tracking',
      href: '/ads-analysis',
      gradient: 'from-pink-600 to-rose-600',
      stats: 'Meta, TikTok, Google'
    },
    {
      icon: Target,
      title: 'SEO Compare',
      description: 'Side-by-side competitor metrics analysis',
      href: '/seo-comparison',
      gradient: 'from-purple-600 to-indigo-600',
      stats: 'Real-time data'
    },
    {
      icon: Zap,
      title: 'Keyword Gaps',
      description: 'Find untapped content opportunities',
      href: '/keyword-analysis',
      gradient: 'from-indigo-600 to-blue-600',
      stats: 'AI-powered insights'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="glass rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Marketing Intelligence Platform
              </h1>
              <p className="text-xl text-gray-200">AI-powered competitive analysis at your fingertips</p>
            </div>
            <div className="text-6xl">🧠</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Today</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400">Analyses Run</div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-sm text-gray-400">This Week</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400">Competitors Tracked</div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400">Insights Generated</div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Available</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">15</div>
            <div className="text-sm text-gray-400">Analysis Quota</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                href={feature.href}
                className="glass rounded-2xl p-8 card-hover group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{feature.stats}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Recent Activity</h2>
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-2xl mb-2 font-bold">Ready to start?</p>
              <p className="text-gray-300 mb-6">Launch your first competitive analysis now</p>
              <Link 
                href="/dashboard/analyze"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:shadow-2xl transition-all"
              >
                Start Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job: any, idx: number) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 hover:bg-white/10 transition-all border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{job.domain}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(job.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                      Complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
