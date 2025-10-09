'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, TrendingUp } from 'lucide-react';

export default function Sentiment() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/language/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
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
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Sentiment Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">AI-powered emotion detection</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-purple-300">Text to Analyze</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text for sentiment analysis..."
              rows={6}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyze}
            disabled={loading || !text}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><MessageSquare className="w-5 h-5" />Analyze Sentiment</>}
          </button>
        </div>

        {results?.success && (
          <div className="glass rounded-2xl p-8 border-2 border-green-400/50">
            <div className="flex items-center gap-6 mb-6">
              <TrendingUp className="w-12 h-12 text-green-400" />
              <div>
                <div className="text-4xl font-bold text-white">{results.sentiment.label}</div>
                <div className="text-gray-300">Score: {results.sentiment.score}</div>
              </div>
            </div>

            {results.entities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Key Entities</h3>
                <div className="space-y-2">
                  {results.entities.map((entity: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl">
                      <div className="font-bold text-white">{entity.name}</div>
                      <div className="text-sm text-gray-400">Type: {entity.type}</div>
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
