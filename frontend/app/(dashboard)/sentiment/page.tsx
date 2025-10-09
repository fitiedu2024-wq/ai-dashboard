'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, TrendingUp, Info } from 'lucide-react';

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
        <p className="text-gray-200 text-lg mb-8">Analyze customer emotions and opinions from text</p>

        {/* Explanation Section */}
        <div className="glass rounded-2xl p-6 mb-8 border border-blue-400/30 bg-blue-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What is Sentiment Analysis?</h3>
              <p className="text-gray-300 mb-3">
                Sentiment analysis uses AI to detect emotions and opinions in text. It helps you understand how customers 
                feel about your brand, products, or services.
              </p>
              <div className="text-sm text-gray-400 space-y-2">
                <div><strong className="text-green-400">✓ Best Use Cases:</strong></div>
                <ul className="ml-4 space-y-1">
                  <li>• Analyze customer reviews and feedback</li>
                  <li>• Monitor social media mentions and comments</li>
                  <li>• Evaluate marketing copy and messaging tone</li>
                  <li>• Track brand reputation over time</li>
                  <li>• Identify unhappy customers for proactive support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-purple-300">Text to Analyze</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste customer reviews, social media comments, or any text to analyze..."
              rows={6}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
              disabled={loading}
            />
            <div className="text-xs text-gray-400 mt-2">
              Example: "This product is amazing! Best purchase I've ever made. Highly recommend!"
            </div>
          </div>
          
          <button
            onClick={analyze}
            disabled={loading || !text}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><MessageSquare className="w-5 h-5" />Analyze Sentiment</>}
          </button>
        </div>

        {results?.success && (
          <div className="glass rounded-2xl p-8 border-2 border-green-400/50">
            <div className="flex items-center gap-6 mb-6">
              <TrendingUp className="w-12 h-12 text-green-400" />
              <div>
                <div className="text-4xl font-bold text-white mb-1">{results.sentiment.label}</div>
                <div className="text-gray-300">Confidence Score: {Math.abs(results.sentiment.score * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-white/5 p-6 rounded-xl mb-6">
              <h4 className="font-bold text-white mb-3">📊 Interpretation</h4>
              <p className="text-gray-300">
                {results.sentiment.label === 'Positive' && 
                  'The text expresses positive emotions and satisfaction. This is great feedback that indicates customer happiness.'}
                {results.sentiment.label === 'Negative' && 
                  'The text contains negative emotions or dissatisfaction. Consider addressing these concerns promptly.'}
                {results.sentiment.label === 'Neutral' && 
                  'The text is objective or factual without strong emotional indicators.'}
              </p>
            </div>

            {/* Actionable Insights */}
            <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
              <h4 className="font-bold text-white mb-3">💡 Actionable Insights</h4>
              <div className="space-y-2 text-sm text-gray-300">
                {results.sentiment.label === 'Positive' && (
                  <>
                    <div>• Share this positive feedback with your team for motivation</div>
                    <div>• Consider using as a testimonial (with permission)</div>
                    <div>• Identify what made this customer happy and replicate it</div>
                  </>
                )}
                {results.sentiment.label === 'Negative' && (
                  <>
                    <div>• Respond quickly to address concerns</div>
                    <div>• Investigate root causes to prevent future issues</div>
                    <div>• Follow up to ensure satisfaction</div>
                  </>
                )}
              </div>
            </div>

            {results.entities && results.entities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Key Entities Mentioned</h3>
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
