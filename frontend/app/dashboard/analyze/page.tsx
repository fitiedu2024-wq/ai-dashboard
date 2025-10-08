'use client';

import { useState } from 'react';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startAnalysis = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/deep-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain,
          competitors: competitorList
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobId(data.job_id);
        checkStatus(data.job_id);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const checkStatus = async (id: string) => {
    const token = localStorage.getItem('token');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://ai-dashboard-backend-7dha.onrender.com/api/job-status/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        setStatus(data.data);
        
        if (data.data.status === 'completed') {
          clearInterval(interval);
          setResult(data.data.result);
          setLoading(false);
        } else if (data.data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Deep Analysis</h1>
      
      <div className="glass rounded-2xl p-8 mb-8">
        <div className="space-y-4">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Your domain"
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white"
            disabled={loading}
          />
          
          <input
            type="text"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="Competitors (comma-separated)"
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={startAnalysis}
          disabled={loading || !domain}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:shadow-2xl disabled:opacity-50 font-bold"
        >
          {loading ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </div>

      {status && (
        <div className="glass rounded-xl p-6 mb-8 text-white">
          <div>Status: {status.status}</div>
        </div>
      )}

      {result && (
        <div className="glass rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
