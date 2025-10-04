'use client';

import { useState } from 'react';

export default function KeywordAnalysis() {
  const [yourDomain, setYourDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeKeywords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/keyword-analysis', {
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
      <h1 className="text-3xl font-bold mb-8">Keyword Gap Analysis</h1>
      
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
            <label className="block text-sm font-medium mb-2">Competitors</label>
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
          onClick={analyzeKeywords}
          disabled={loading || !yourDomain || !competitors}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Keywords'}
        </button>
      </div>

      {results?.data && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Keyword Gaps</h2>
            <div className="space-y-2">
              {results.data.keyword_gaps?.slice(0, 20).map((gap: string, idx: number) => (
                <div key={idx} className="p-3 border rounded hover:bg-gray-50">
                  {gap}
                </div>
              ))}
            </div>
          </div>

          {results.data.opportunities?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">High-Value Opportunities</h2>
              <div className="space-y-3">
                {results.data.opportunities.map((opp: any, idx: number) => (
                  <div key={idx} className="p-4 border-l-4 border-green-500 bg-green-50">
                    <div className="font-medium">{opp.keyword}</div>
                    <div className="text-sm text-gray-600">
                      Used by {opp.competitor_usage} competitors - {opp.priority} priority
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
