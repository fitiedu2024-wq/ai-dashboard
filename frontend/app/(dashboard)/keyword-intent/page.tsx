'use client';

import { useState } from 'react';
import { Search, Loader2, TrendingUp, TrendingDown, Minus, Info, Target, ShoppingCart, MapPin, BookOpen } from 'lucide-react';
import { useToast } from '../../lib/toast';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS', icon: '💻' },
  { value: 'ecom', label: 'E-Commerce', icon: '🛍️' },
  { value: 'local', label: 'Local Business', icon: '🏪' },
  { value: 'agency', label: 'Agency', icon: '🎨' },
  { value: 'course', label: 'Course Creator', icon: '📚' },
  { value: 'general', label: 'General', icon: '🌐' }
];

const INTENT_INFO = {
  informational: {
    icon: BookOpen,
    color: 'blue',
    title: 'Informational',
    description: 'Users seeking knowledge (how to, what is, guide)',
    examples: 'how to, what is, guide, tutorial, tips'
  },
  navigational: {
    icon: MapPin,
    color: 'green',
    title: 'Navigational',
    description: 'Users looking for specific pages (brand, login)',
    examples: 'brand name, login, contact, specific page'
  },
  commercial: {
    icon: Target,
    color: 'yellow',
    title: 'Commercial',
    description: 'Users researching before purchase (best, review)',
    examples: 'best, top, review, comparison, vs, alternative'
  },
  transactional: {
    icon: ShoppingCart,
    color: 'purple',
    title: 'Transactional',
    description: 'Users ready to purchase (buy, price, discount)',
    examples: 'buy, price, discount, deal, order, cost'
  }
};

export default function KeywordIntent() {
  const [domain, setDomain] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { error: showError, success } = useToast();

  const analyze = async () => {
    if (!domain) {
      showError('Error', 'Please enter a domain');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/keyword-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, business_type: businessType })
      });

      const data = await response.json();
      
      if (data.error) {
        showError('Error', data.error);
      } else {
        const keywordData = data.data?.data || data.data || data;
        setResults(keywordData);
        success('Analysis Complete', 'Keywords generated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to generate keywords');
    }
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'Rising') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'Falling') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-400';
    if (difficulty < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Keywords by Search Intent
        </h1>
        <p className="text-gray-200 text-lg mb-8">30 high-value keywords organized by user intent</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-blue-400/30 bg-blue-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What is Search Intent?</h3>
              <p className="text-gray-300 mb-4">
                Search intent reveals what users are trying to accomplish when they search. Understanding intent helps you
                create content that matches user needs at different stages of their journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(INTENT_INFO).map(([key, info]) => {
                  const Icon = info.icon;
                  return (
                    <div key={key} className={`bg-${info.color}-500/10 p-4 rounded-xl border border-${info.color}-500/20`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 text-${info.color}-400`} />
                        <span className={`font-bold text-${info.color}-300`}>{info.title}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{info.description}</p>
                      <p className="text-xs text-gray-400">Examples: {info.examples}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-green-300">Business Type</label>
            <div className="flex flex-wrap gap-3 mb-6">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBusinessType(type.value)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    businessType === type.value
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-white/20 bg-white/5 hover:border-green-400/50'
                  }`}
                  disabled={loading}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-white text-sm font-bold">{type.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-green-300">Website Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating Keywords...</> : <><Search className="w-5 h-5" />Generate Keywords</>}
          </button>
        </div>

        {/* Results */}
        {results?.keywords && (
          <div className="space-y-6">
            {/* Summary */}
            {results.summary && (
              <div className="glass rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-white">{results.summary.totalKeywords}</div>
                    <div className="text-sm text-gray-400">Total Keywords</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-400">{results.summary.avgDifficulty}</div>
                    <div className="text-sm text-gray-400">Avg Difficulty</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-green-400">{results.summary.avgOpportunityScore}</div>
                    <div className="text-sm text-gray-400">Avg Opportunity</div>
                  </div>
                </div>
                {results.summary.topOpportunities && (
                  <div className="mt-4">
                    <div className="text-sm font-bold text-green-400 mb-2">🎯 Top Opportunities:</div>
                    <div className="flex flex-wrap gap-2">
                      {results.summary.topOpportunities.map((kw: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keywords by Intent */}
            {Object.entries(results.keywords).map(([intent, keywords]: [string, any]) => {
              if (!keywords || keywords.length === 0) return null;
              const intentInfo = INTENT_INFO[intent as keyof typeof INTENT_INFO];
              const Icon = intentInfo.icon;

              return (
                <div key={intent} className="glass rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className={`w-8 h-8 text-${intentInfo.color}-400`} />
                    <div>
                      <h2 className="text-3xl font-bold text-white">{intentInfo.title} Keywords</h2>
                      <p className="text-gray-400 text-sm">{intentInfo.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {keywords.map((kw: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-xl font-bold text-white mb-1">{kw.term}</div>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-blue-400">Vol: {kw.volume}</span>
                              <span className={getDifficultyColor(kw.difficulty)}>Diff: {kw.difficulty}/100</span>
                              <span className="text-gray-400">CPC: {kw.cpc}</span>
                              <span className="text-gray-400">Rank: {kw.currentRank}</span>
                              <span className="flex items-center gap-1">
                                {getTrendIcon(kw.trend)}
                                <span className="text-gray-400">{kw.trend}</span>
                              </span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-xl border ${getOpportunityColor(kw.opportunityScore)}`}>
                            <div className="text-2xl font-bold">{kw.opportunityScore}</div>
                            <div className="text-xs">Opportunity</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
