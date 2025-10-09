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
