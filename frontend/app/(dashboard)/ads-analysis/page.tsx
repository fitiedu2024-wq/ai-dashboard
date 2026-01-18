'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { analysisAPI } from '../../lib/api';
import { useToast } from '../../lib/toast';

export default function AdsAnalysis() {
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { error: showError, success } = useToast();

  const analyze = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.adsAnalysis(domain, brandName || undefined);
      if (response.error) {
        showError('Error', response.error);
      } else {
        setResults(response.data);
        success('Analysis Complete', 'Ad library links generated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to analyze ads');
    }
    setLoading(false);
  };

  // Helper to get the actual data (handles both nested and flat structures)
  const getAnalysisData = () => {
    if (!results) return null;
    // Handle double-nested structure from API wrapper
    return results.data?.data || results.data || results;
  };

  const analysisData = getAnalysisData();

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Ads Intelligence
        </h1>
        <p className="text-gray-200 text-lg mb-8">Discover competitor ads across all platforms</p>

        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300">Brand Name (optional)</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nike"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Discovering Ads...</> : <><Search className="w-5 h-5" />Discover Ads</>}
          </button>
        </div>

        {results?.success && analysisData?.platforms && (
          <div className="space-y-6">
            {/* Social Accounts Found */}
            {analysisData.social_accounts && Object.keys(analysisData.social_accounts).length > 0 && (
              <div className="glass rounded-2xl p-8 border border-cyan-400/30">
                <h3 className="text-2xl font-bold text-white mb-6">🔗 Social Accounts Found</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analysisData.social_accounts).map(([platform, username]: [string, any]) => (
                    username && (
                      <div key={platform} className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-sm text-gray-400 capitalize">{platform}</div>
                        <div className="font-bold text-white">{username}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Meta (Facebook/Instagram) */}
            {analysisData.platforms.meta?.url && (
              <div className="glass rounded-2xl p-8 border border-blue-400/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Meta (Facebook/Instagram)</h3>
                    <p className="text-sm text-gray-400">Official Ad Library</p>
                  </div>
                </div>

                <a
                  href={analysisData.platforms.meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Meta Ad Library
                </a>
              </div>
            )}

            {/* TikTok */}
            {analysisData.platforms.tiktok?.url && (
              <div className="glass rounded-2xl p-8 border border-purple-400/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0012.14-4.36v-7.2a6.88 6.88 0 001.48.15c.14 0 .27 0 .4-.01V6.7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">TikTok Ads</h3>
                    <p className="text-sm text-gray-400">Creative Library</p>
                  </div>
                </div>

                {analysisData.platforms.tiktok.username && (
                  <div className="bg-purple-500/10 p-4 rounded-xl mb-4">
                    <div className="text-sm text-gray-300">
                      <strong>Username:</strong> {analysisData.platforms.tiktok.username}
                    </div>
                  </div>
                )}

                <a
                  href={analysisData.platforms.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open TikTok Ad Library
                </a>
              </div>
            )}

            {/* Google */}
            {analysisData.platforms.google?.url && (
              <div className="glass rounded-2xl p-8 border border-green-400/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Google Ads</h3>
                    <p className="text-sm text-gray-400">Transparency Center</p>
                  </div>
                </div>

                <a
                  href={analysisData.platforms.google.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Google Transparency
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
