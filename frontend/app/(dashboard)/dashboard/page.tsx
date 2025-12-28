'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Activity, Target, Zap, ArrowRight, Clock } from 'lucide-react';
import { authAPI } from '../../lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authAPI.getUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

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
      gradient: 'from-indigo-600 to-purple-600',
      stats: 'Real-time data'
    },
    {
      icon: Zap,
      title: 'Keyword Gaps',
      description: 'Find untapped content opportunities',
      href: '/keyword-analysis',
      gradient: 'from-blue-600 to-cyan-600',
      stats: 'AI-powered insights'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-10 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-2xl text-gray-200">Ready to gain competitive advantage?</p>
            </div>
            <div className="text-7xl">🚀</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-gray-300">Analyses Today</div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-gray-300">Competitors Tracked</div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-gray-300">Insights Generated</div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{user?.quota || 15}</div>
            <div className="text-sm text-gray-300">Analysis Quota</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                href={feature.href}
                className="glass rounded-2xl p-8 border border-white/20 card-hover group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-4 text-lg">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{feature.stats}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-2 group-hover:text-white transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
