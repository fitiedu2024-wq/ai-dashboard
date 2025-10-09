'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, TrendingUp, Target, AlertCircle } from 'lucide-react';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain,
          competitors: competitors.split(',').map(c => c.trim()).filter(c => c),
          max_pages: 20
        })
      });
      
      const data = await response.json();
      setResult(data);
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Simulate progress
  useEffect(() => {
    if (loading && progress < 90) {
      const timer = setTimeout(() => setProgress(p => Math.min(p + 10, 90)), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, progress]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deep Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">Comprehensive multi-page competitive intelligence</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-purple-300">Your Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300">Competitors (comma-separated)</label>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="competitor1.com, competitor2.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            onClick={startAnalysis}
            disabled={loading || !domain}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-2xl transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Search className="w-5 h-5" />Start Deep Analysis</>}
          </button>

          {/* Progress Bar */}
          {loading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Progress</span>
                <span className="text-sm font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                  style={{width: `${progress}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Crawling pages and analyzing content...</p>
            </div>
          )}
        </div>

        {result?.data && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border-2 border-green-400/50">
              <CheckCircle className="w-6 h-6 text-green-400 inline mr-3" />
              <span className="font-bold text-white text-xl">Analysis Complete!</span>
            </div>

            {/* Your Site Stats */}
            <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                Your Site: {domain}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400">{result.data.your_site?.total_pages || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">Pages Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-400">{result.data.your_site?.avg_word_count || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">Avg Words/Page</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">{result.data.your_site?.seo_score || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">SEO Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">{result.data.your_site?.avg_alt_coverage || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Alt Coverage</div>
                </div>
              </div>
            </div>

            {/* Competitors Comparison */}
            {result.data.competitors && Object.keys(result.data.competitors).length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">⚔️</span>
                  Competitors Analysis
                </h3>
                <div className="space-y-4">
                  {Object.entries(result.data.competitors).map(([domain, data]: [string, any]) => (
                    <div key={domain} className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h4 className="font-bold text-xl text-white mb-4">{domain}</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{data.total_pages}</div>
                          <div className="text-xs text-gray-400">Pages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-400">{data.avg_word_count}</div>
                          <div className="text-xs text-gray-400">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{data.seo_score}</div>
                          <div className="text-xs text-gray-400">SEO</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{data.avg_alt_coverage}%</div>
                          <div className="text-xs text-gray-400">Alt</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Gaps */}
            {result.data.content_gaps?.keyword_gaps?.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  Keyword Opportunities
                </h3>
                <div className="space-y-3">
                  {result.data.content_gaps.keyword_gaps.map((gap: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg text-white">{gap.keyword}</div>
                          <div className="text-sm text-gray-400">Used by {gap.competitor_usage} competitors</div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                          gap.priority === 'high' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                        }`}>
                          {gap.priority} priority
                        </div>
                      </div>
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
