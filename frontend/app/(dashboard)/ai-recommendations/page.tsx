'use client';

import { Sparkles } from 'lucide-react';

export default function AIRecommendations() {
  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          AI Recommendations
        </h1>
        <p className="text-gray-200 text-lg mb-8">Intelligent marketing strategies & action plans</p>
        
        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="text-center py-16">
            <Sparkles className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-300">AI-powered recommendations will aggregate all your reports and provide actionable insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
