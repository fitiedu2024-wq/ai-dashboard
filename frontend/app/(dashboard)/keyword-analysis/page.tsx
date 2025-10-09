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
