'use client';

import { useState } from 'react';
import { Eye, Upload, Loader2 } from 'lucide-react';

export default function VisionAI() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeImage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/vision/detect-brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image_url: imageUrl })
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
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Vision AI
        </h1>
        <p className="text-gray-200 text-lg mb-8">Logo & Brand Detection</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-blue-300">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyzeImage}
            disabled={loading || !imageUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Eye className="w-5 h-5" />Detect Brands</>}
          </button>
        </div>

        {results?.success && (
          <div className="space-y-6">
            {results.data.logos.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">🏷️ Detected Logos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {results.data.logos.map((logo: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-xl">
                      <div className="font-bold text-white">{logo.name}</div>
                      <div className="text-sm text-green-400">{logo.confidence}% confident</div>
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
