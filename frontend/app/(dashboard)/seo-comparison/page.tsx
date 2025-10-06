'use client';

import { useState } from 'react';

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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">SEO Comparison</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Domain</label>
            <input
              type="text"
              value={yourDomain}
              onChange={(e) => setYourDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Competitors (comma-separated)</label>
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="competitor1.com, competitor2.com"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <button
          onClick={compareSEO}
          disabled={loading || !yourDomain || !competitors}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare SEO'}
        </button>
      </div>

      {results?.data && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Your Site: {yourDomain}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded">
                <div className="text-2xl font-bold text-blue-600">{results.data.your_site?.seo_score}</div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-2xl font-bold">{results.data.your_site?.title_length}</div>
                <div className="text-sm text-gray-600">Title Length</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-2xl font-bold">{results.data.your_site?.h1_count}</div>
                <div className="text-sm text-gray-600">H1 Tags</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-2xl font-bold">{results.data.your_site?.alt_coverage}%</div>
                <div className="text-sm text-gray-600">Alt Coverage</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Competitors</h2>
            <div className="space-y-4">
              {Object.entries(results.data.competitors || {}).map(([domain, data]: [string, any]) => (
                <div key={domain} className="border p-4 rounded">
                  <h3 className="font-medium mb-3">{domain}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">SEO Score: </span>
                      <span className="font-medium">{data.seo_score}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Title: </span>
                      <span className="font-medium">{data.title_length} chars</span>
                    </div>
                    <div>
                      <span className="text-gray-600">H1: </span>
                      <span className="font-medium">{data.h1_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Alt: </span>
                      <span className="font-medium">{data.alt_coverage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {results.data.insights?.length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Insights</h2>
              <ul className="space-y-2">
                {results.data.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
