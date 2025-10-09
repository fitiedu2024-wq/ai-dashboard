'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);
      
      // Simulate analysis (replace with real API call)
      setTimeout(() => {
        setStatus({ status: 'completed' });
        setResult({
          your_site: { total_pages: 25, avg_word_count: 1200 },
          competitors: competitorList,
          content_gaps: { keyword_gaps: [
            { keyword: 'AI marketing tools', competitor_usage: 3, priority: 'high' },
            { keyword: 'automated analytics', competitor_usage: 2, priority: 'medium' }
          ]}
        });
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Deep Analysis
          </h1>
          <p className="text-gray-300 text-lg">Multi-page crawl + AI competitive intelligence</p>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 text-white">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-purple-300 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Your Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300">
                Competitors (comma-separated)
              </label>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="competitor1.com, competitor2.com"
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-all"
                disabled={loading}
              />
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                <span>💡</span>
                Up to 3 competitors recommended
              </p>
            </div>
          </div>
          
          <button
            onClick={startAnalysis}
            disabled={loading || !domain}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl disabled:opacity-50 font-bold text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Start Deep Analysis
              </>
            )}
          </button>
        </div>

        {status && (
          <div className={`glass rounded-2xl p-6 mb-8 border-2 ${
            status.status === 'completed' ? 'border-green-400/50' : 'border-blue-400/50'
          }`}>
            <div className="flex items-center gap-4">
              {status.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
              )}
              <div className="flex-1">
                <div className="font-bold text-white text-lg capitalize">{status.status}</div>
                <p className="text-gray-300 text-sm">
                  {status.status === 'completed' && '✅ Analysis complete! Results below.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {result.your_site?.total_pages || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">Pages Analyzed</div>
              </div>
              
              <div className="glass rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  {result.your_site?.avg_word_count || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">Avg Words/Page</div>
              </div>
              
              <div className="glass rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {result.content_gaps?.keyword_gaps?.length || 0}
                </div>
                <div className="text-sm text-gray-300 mt-2">Keyword Gaps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
