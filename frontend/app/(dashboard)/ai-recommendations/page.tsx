'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Target, Lightbulb, ArrowRight } from 'lucide-react';

export default function AIRecommendations() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // In future: fetch user's reports and generate recommendations
    generateMockRecommendations();
  }, []);

  const generateMockRecommendations = () => {
    // Mock recommendations based on typical analysis
    setReports([
      {
        category: 'SEO Optimization',
        priority: 'high',
        recommendations: [
          'Add schema markup to 80% of your pages to improve SERP visibility',
          'Increase average content length to 1,500+ words for better rankings',
          'Optimize image alt text coverage to 95%+ for accessibility and SEO'
        ]
      },
      {
        category: 'Content Strategy',
        priority: 'high',
        recommendations: [
          'Target 5 high-priority keywords with low competition',
          'Create long-form content addressing user pain points',
          'Develop a content calendar for consistent publishing'
        ]
      },
      {
        category: 'Technical SEO',
        priority: 'medium',
        recommendations: [
          'Implement canonical tags across all pages',
          'Improve mobile responsiveness on product pages',
          'Reduce page load time by optimizing images and scripts'
        ]
      },
      {
        category: 'Competitive Analysis',
        priority: 'medium',
        recommendations: [
          'Study competitor backlink profiles for link-building opportunities',
          'Analyze competitor content gaps and fill them',
          'Monitor competitor ad strategies on Google and Facebook'
        ]
      }
    ]);
  };

  const priorityColors = {
    high: 'border-red-500 bg-red-500/10',
    medium: 'border-yellow-500 bg-yellow-500/10',
    low: 'border-green-500 bg-green-500/10'
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            AI Recommendations
          </h1>
          <p className="text-gray-200 text-lg">Intelligent strategies based on your analysis data</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Target className="w-8 h-8 text-red-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">12</div>
            <div className="text-sm text-gray-400">High Priority Actions</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">8</div>
            <div className="text-sm text-gray-400">Quick Wins Identified</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20">
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">24</div>
            <div className="text-sm text-gray-400">Total Recommendations</div>
          </div>
        </div>

        {/* Recommendations by Category */}
        <div className="space-y-6">
          {reports.map((report, idx) => (
            <div 
              key={idx} 
              className={`glass rounded-2xl p-8 border-l-4 ${priorityColors[report.priority as keyof typeof priorityColors]}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Lightbulb className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">{report.category}</h3>
                    <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
                      report.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {report.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {report.recommendations.map((rec: string, recIdx: number) => (
                  <div key={recIdx} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all">
                    <ArrowRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-200">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Plan */}
        <div className="mt-8 glass rounded-2xl p-8 border-2 border-purple-400/50">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Recommended Action Plan
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">1</div>
              <div>Start with high-priority SEO optimizations (schema markup, alt text)</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">2</div>
              <div>Develop content strategy focusing on identified keyword gaps</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">3</div>
              <div>Implement technical SEO improvements for better crawlability</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">4</div>
              <div>Monitor competitor strategies and adjust your approach accordingly</div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300">
            💡 <strong>Note:</strong> These recommendations are generated based on typical SEO best practices. 
            In the future, this will analyze your specific reports to provide personalized AI-driven strategies.
          </p>
        </div>
      </div>
    </div>
  );
}
