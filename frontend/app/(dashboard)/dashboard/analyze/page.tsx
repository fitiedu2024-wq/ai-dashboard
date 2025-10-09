'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, TrendingUp, Target } from 'lucide-react';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deep Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">Multi-page crawl + AI competitive intelligence</p>
        
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
              <label className="block text-sm font-bold mb-3 text-pink-300">Competitors</label>
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
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Search className="w-5 h-5" />Start Analysis</>}
          </button>
        </div>

        {result?.data && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border-2 border-green-400/50">
              <CheckCircle className="w-6 h-6 text-green-400 inline mr-3" />
              <span className="font-bold text-white text-xl">Analysis Complete!</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white">{result.data.your_site?.total_pages || 0}</div>
                <div className="text-sm text-gray-400">Pages</div>
              </div>
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white">{result.data.your_site?.avg_word_count || 0}</div>
                <div className="text-sm text-gray-400">Avg Words</div>
              </div>
              <div className="glass rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white">{result.data.content_gaps?.keyword_gaps?.length || 0}</div>
                <div className="text-sm text-gray-400">Keyword Gaps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
