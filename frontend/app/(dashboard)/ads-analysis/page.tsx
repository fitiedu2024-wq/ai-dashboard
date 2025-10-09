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
