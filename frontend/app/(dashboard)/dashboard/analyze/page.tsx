'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { analysisAPI } from '../../../lib/api';
import { useToast } from '../../../lib/toast';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const { error: showError } = useToast();

  const startAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);

    try {
      const competitorsList = competitors.split(',').map(c => c.trim()).filter(c => c);
      const response = await analysisAPI.deepAnalysis(domain, competitorsList, 50);

      if (response.error) {
        showError('Error', response.error);
      } else {
        // Extract the nested data structure: response.data contains { success, data: { your_site, competitors } }
        const analysisData = response.data?.data || response.data;
        setResult({ data: analysisData });
      }
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to analyze domain');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loading && progress < 90) {
      const timer = setTimeout(() => setProgress(p => Math.min(p + 10, 90)), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, progress]);

  const togglePage = (index: number) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deep Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">Professional SEO & Content Intelligence</p>
        
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
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Search className="w-5 h-5" />Start Deep Analysis</>}
          </button>

          {loading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Analysis Progress</span>
                <span className="text-sm font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                  style={{width: `${progress}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Crawling pages, analyzing SEO metrics, and generating insights...</p>
            </div>
          )}
        </div>

        {result?.data && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="glass rounded-2xl p-6 border-2 border-green-400/50">
              <CheckCircle className="w-6 h-6 text-green-400 inline mr-3" />
              <span className="font-bold text-white text-xl">Analysis Complete! Found {result.data.your_site?.total_pages || 0} pages</span>
            </div>

            {/* Overall Stats */}
            <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
              <h3 className="text-2xl font-bold text-white mb-6">📊 Your Site Overview: {domain}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-400 mb-2">{result.data.your_site?.total_pages || 0}</div>
                  <div className="text-sm text-gray-400">Pages Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-pink-400 mb-2">{result.data.your_site?.avg_seo_score || 0}</div>
                  <div className="text-sm text-gray-400">SEO Score</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400 mb-2">{result.data.your_site?.avg_word_count || 0}</div>
                  <div className="text-sm text-gray-400">Avg Words/Page</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400 mb-2">{result.data.your_site?.avg_alt_coverage || 0}%</div>
                  <div className="text-sm text-gray-400">Alt Text Coverage</div>
                </div>
              </div>
            </div>

            {/* Technical SEO */}
            <div className="glass rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">🔧 Technical SEO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-400">{result.data.your_site?.schema_coverage || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Schema Markup</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400">{result.data.your_site?.mobile_coverage || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Mobile Friendly</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400">{result.data.your_site?.og_coverage || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Open Graph</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-pink-400">{result.data.your_site?.total_pages || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">Total Pages</div>
                </div>
              </div>
            </div>

            {/* Issues & Recommendations */}
            {result.data.your_site?.issues && result.data.your_site.issues.length > 0 && (
              <div className="glass rounded-2xl p-8 border-l-4 border-yellow-500">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  Issues Found
                </h3>
                <div className="space-y-3">
                  {result.data.your_site.issues.map((issue: string, idx: number) => (
                    <div key={idx} className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                      <div className="text-yellow-300">{issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.data.your_site?.recommendations && result.data.your_site.recommendations.length > 0 && (
              <div className="glass rounded-2xl p-8 border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-white mb-6">💡 Recommendations</h3>
                <div className="space-y-3">
                  {result.data.your_site.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                      <div className="text-green-300">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Details */}
            {result.data.your_site?.pages && result.data.your_site.pages.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">📄 Page-by-Page Analysis</h3>
                <div className="space-y-3">
                  {result.data.your_site.pages.map((page: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div 
                        className="p-5 cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between"
                        onClick={() => togglePage(idx)}
                      >
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1">{page.analysis?.title?.text || page.url}</div>
                          <div className="text-sm text-gray-400">{page.url}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400">{page.analysis?.overall_score || 0}</div>
                            <div className="text-xs text-gray-400">SEO Score</div>
                          </div>
                          {expandedPages.has(idx) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                      
                      {expandedPages.has(idx) && page.analysis && (
                        <div className="p-5 bg-white/5 border-t border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-400">Words</div>
                              <div className="text-xl font-bold text-white">{page.analysis.content?.word_count || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Images</div>
                              <div className="text-xl font-bold text-white">{page.analysis.images?.total || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Alt Coverage</div>
                              <div className="text-xl font-bold text-white">{page.analysis.images?.alt_coverage || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Internal Links</div>
                              <div className="text-xl font-bold text-white">{page.analysis.links?.internal || 0}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-400">Title:</span>
                              <span className="text-white ml-2">{page.analysis.title?.text}</span>
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${page.analysis.title?.score === 100 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {page.analysis.title?.length} chars
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">H1 Tags:</span>
                              <span className="text-white ml-2">{page.analysis.headers?.h1_count || 0}</span>
                              {page.analysis.headers?.h1_texts && page.analysis.headers.h1_texts.map((h1: string, i: number) => (
                                <div key={i} className="text-sm text-gray-300 ml-6 mt-1">• {h1}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitors */}
            {result.data.competitors && Object.keys(result.data.competitors).length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">⚔️ Competitors Comparison</h3>
                <div className="space-y-4">
                  {Object.entries(result.data.competitors).map(([compDomain, data]: [string, any]) => (
                    <div key={compDomain} className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h4 className="font-bold text-xl text-white mb-4">{compDomain}</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{data.total_pages || 0}</div>
                          <div className="text-xs text-gray-400">Pages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-400">{data.avg_seo_score || 0}</div>
                          <div className="text-xs text-gray-400">SEO</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{data.avg_word_count || 0}</div>
                          <div className="text-xs text-gray-400">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{data.avg_alt_coverage || 0}%</div>
                          <div className="text-xs text-gray-400">Alt</div>
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
