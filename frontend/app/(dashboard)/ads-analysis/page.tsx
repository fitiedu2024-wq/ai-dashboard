'use client';

import { useState } from 'react';

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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Competitor Ads Analysis</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="nike.com"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Nike"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <button
          onClick={analyzeAds}
          disabled={loading || !domain}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Ads'}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Meta (Facebook/Instagram)</h2>
            {results.data?.platforms?.meta?.status === 'success' ? (
              <div>
                <p className="mb-4">Total Ads: {results.data.platforms.meta.total_ads}</p>
                <div className="space-y-3">
                  {results.data.platforms.meta.ads?.slice(0, 5).map((ad: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded">
                      <p className="font-medium">{ad.page_name}</p>
                      <p className="text-sm text-gray-600">Started: {ad.start_date}</p>
                      {ad.preview_url && (
                        <a href={ad.preview_url} target="_blank" className="text-blue-600 text-sm">
                          View Ad
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{results.data?.platforms?.meta?.message || 'No data'}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">TikTok</h2>
            {results.data?.platforms?.tiktok?.url && (
              <a 
                href={results.data.platforms.tiktok.url}
                target="_blank"
                className="text-blue-600 underline"
              >
                View TikTok Ads Library
              </a>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Google Ads</h2>
            {results.data?.platforms?.google?.url && (
              <a 
                href={results.data.platforms.google.url}
                target="_blank"
                className="text-blue-600 underline"
              >
                View Google Ads Transparency
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
