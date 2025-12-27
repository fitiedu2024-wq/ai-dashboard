'use client';

import { useState } from 'react';
import { Key, Loader2, TrendingUp, Target, Download, FileText, Search, AlertCircle } from 'lucide-react';
import { analysisAPI } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { KeywordAnalysisResult } from '../../lib/types';
import { exportKeywordsToCSV, exportToPDF } from '../../lib/export';
import { AnalysisResultSkeleton } from '../../lib/components/Skeleton';

export default function KeywordAnalysis() {
  const { success, error: showError, info } = useToast();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordAnalysisResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const analyze = async () => {
    if (!domain.trim()) {
      showError('Error', 'Please enter a domain');
      return;
    }

    setLoading(true);
    info('Analyzing', `Extracting keywords from ${domain}...`);

    const { data, error } = await analysisAPI.keywordAnalysis(domain.trim());

    if (error) {
      showError('Analysis Failed', error);
      setResults(null);
    } else if (data) {
      setResults(data);
      success('Analysis Complete', `Found ${data.data?.keywords?.length || 0} keywords`);
    }

    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!results?.data?.keywords) return;
    exportKeywordsToCSV(results.data.keywords, domain);
    success('Exported', 'Keywords CSV downloaded');
  };

  const handleExportPDF = () => {
    if (!results?.data?.keywords) return;

    const keywordsHTML = results.data.keywords.slice(0, 30).map((kw: any) => `
      <tr>
        <td>${kw.term}</td>
        <td>${kw.priority}</td>
        <td>${kw.difficulty}</td>
        <td>${kw.volume}</td>
      </tr>
    `).join('');

    const content = `
      <h2>Domain: ${domain}</h2>
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div class="metric">
          <div class="metric-value">${results.data.keywords.length}</div>
          <div class="metric-label">Total Keywords</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.data.keywords.filter((k: any) => k.priority === 'high').length}</div>
          <div class="metric-label">High Priority</div>
        </div>
      </div>
      <h2>Top Keywords</h2>
      <table>
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Priority</th>
            <th>Difficulty</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          ${keywordsHTML}
        </tbody>
      </table>
      ${results.data.recommendations?.length > 0 ? `
        <h2>Recommendations</h2>
        ${results.data.recommendations.map((rec: string) => `<div class="recommendation">${rec}</div>`).join('')}
      ` : ''}
    `;

    exportToPDF(`Keyword Analysis - ${domain}`, content, `keywords-${domain}`);
    success('Report Generated', 'PDF opened in new tab');
  };

  // Filter and search keywords
  const filteredKeywords = results?.data?.keywords?.filter((kw: any) => {
    const matchesFilter = filter === 'all' || kw.priority === filter;
    const matchesSearch = !searchTerm || kw.term.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Keyword Analysis
          </h1>
          <p className="text-gray-200 text-lg">Find untapped keyword opportunities</p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 lg:p-8 mb-8 border border-white/20">
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
              onKeyDown={(e) => e.key === 'Enter' && !loading && analyze()}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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

        {/* Loading */}
        {loading && <AnalysisResultSkeleton />}

        {/* Results */}
        {results?.data && !loading && (
          <div className="space-y-6">
            {/* Export & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all border border-green-500/30"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/30"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm w-48"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:border-orange-400 focus:outline-none text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-red-400" />
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
                  <div className="text-sm text-gray-400">Pages Analyzed</div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {results.data.site_analysis?.total_pages || 0}
                </div>
              </div>
            </div>

            {/* Keywords List */}
            <div className="glass rounded-2xl p-6 lg:p-8 border border-white/20">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-orange-400" />
                Keyword Opportunities
                <span className="text-sm font-normal text-gray-400">
                  ({filteredKeywords.length} results)
                </span>
              </h3>

              {filteredKeywords.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No keywords match your filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredKeywords.slice(0, 30).map((keyword: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 lg:p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-lg text-white">{keyword.term}</div>
                          <div className="text-sm text-gray-400 mt-1 flex flex-wrap gap-4">
                            <span>Volume: {keyword.volume || 'N/A'}</span>
                            <span>Difficulty: {keyword.difficulty || 'Medium'}</span>
                            <span>CPC: {keyword.cpc || 'N/A'}</span>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold self-start ${
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
              )}
            </div>

            {/* Recommendations */}
            {results.data.recommendations?.length > 0 && (
              <div className="glass rounded-2xl p-6 lg:p-8 border-l-4 border-blue-500">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {results.data.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-blue-300">
                      {rec}
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
