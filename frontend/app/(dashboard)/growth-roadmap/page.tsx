'use client';

import { useState } from 'react';
import { Rocket, Loader2, Target, TrendingUp, Zap, Calendar, DollarSign, Info } from 'lucide-react';
import { useToast } from '../../lib/toast';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS', icon: '💻' },
  { value: 'ecom', label: 'E-Commerce', icon: '🛍️' },
  { value: 'local', label: 'Local Business', icon: '🏪' },
  { value: 'agency', label: 'Agency', icon: '🎨' },
  { value: 'course', label: 'Course Creator', icon: '📚' },
  { value: 'general', label: 'General', icon: '🌐' }
];

export default function GrowthRoadmap() {
  const [domain, setDomain] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [companySize, setCompanySize] = useState('SMB');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { error: showError, success } = useToast();

  const analyze = async () => {
    if (!domain) {
      showError('Error', 'Please enter a domain');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/growth-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, business_type: businessType, company_size: companySize })
      });

      const data = await response.json();
      
      if (data.error) {
        showError('Error', data.error);
      } else {
        const roadmapData = data.data?.data || data.data || data;
        setResults(roadmapData);
        success('Roadmap Generated', '90-day growth plan created successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to generate growth roadmap');
    }
    setLoading(false);
  };

  const roadmap = results?.roadmap;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Growth Roadmap
        </h1>
        <p className="text-gray-200 text-lg mb-8">90-day strategic growth plan with OKRs and experiments</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-purple-400/30 bg-purple-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What is a Growth Roadmap?</h3>
              <p className="text-gray-300 mb-3">
                A data-driven 90-day strategic plan that identifies your North Star Metric, sets measurable OKRs,
                and provides prioritized growth experiments using ICE scoring (Impact × Confidence × Ease).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <div className="font-bold text-blue-300 mb-1">🎯 North Star</div>
                  <div className="text-gray-400 text-xs">Key metric to focus on</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <div className="font-bold text-green-300 mb-1">📊 OKRs</div>
                  <div className="text-gray-400 text-xs">3 objectives + 9 key results</div>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <div className="font-bold text-purple-300 mb-1">🧪 Experiments</div>
                  <div className="text-gray-400 text-xs">10 growth tests with ICE</div>
                </div>
                <div className="bg-pink-500/10 p-3 rounded-xl border border-pink-500/20">
                  <div className="font-bold text-pink-300 mb-1">📅 Timeline</div>
                  <div className="text-gray-400 text-xs">3-month execution plan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-purple-300">Business Type</label>
            <div className="flex flex-wrap gap-3 mb-6">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBusinessType(type.value)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    businessType === type.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:border-purple-400/50'
                  }`}
                  disabled={loading}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-white text-sm font-bold">{type.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-purple-300">Company Size</label>
            <div className="flex gap-3 mb-6">
              {['Startup', 'SMB', 'Enterprise'].map((size) => (
                <button
                  key={size}
                  onClick={() => setCompanySize(size)}
                  className={`px-6 py-2 rounded-xl border-2 transition-all ${
                    companySize === size
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-400 hover:border-purple-400/50'
                  }`}
                  disabled={loading}
                >
                  {size}
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-purple-300">Website Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Roadmap...</> : <><Rocket className="w-5 h-5" />Generate Roadmap</>}
          </button>
        </div>

        {/* Results */}
        {roadmap && (
          <div className="space-y-6">
            {/* North Star Metric */}
            {roadmap.northStarMetric && (
              <div className="glass rounded-2xl p-8 border-2 border-yellow-400/50">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">North Star Metric</h2>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
                  <div className="text-4xl font-bold text-white mb-3">{roadmap.northStarMetric.metric}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Current Value</div>
                      <div className="text-2xl font-bold text-red-400">{roadmap.northStarMetric.currentValue}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Target (90 days)</div>
                      <div className="text-2xl font-bold text-green-400">{roadmap.northStarMetric.targetValue}</div>
                    </div>
                  </div>
                  <div className="text-gray-300">{roadmap.northStarMetric.reasoning}</div>
                </div>
              </div>
            )}

            {/* OKRs */}
            {roadmap.okrs && roadmap.okrs.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">OKRs (Objectives & Key Results)</h2>
                </div>
                <div className="space-y-6">
                  {roadmap.okrs.map((okr: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/20">
                      <div className="text-2xl font-bold text-white mb-4">
                        {idx + 1}. {okr.objective}
                      </div>
                      <div className="space-y-3">
                        {okr.keyResults?.map((kr: any, krIdx: number) => (
                          <div key={krIdx} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-white font-bold mb-1">{kr.description}</div>
                              <div className="text-sm text-gray-400">Target: {kr.target}</div>
                            </div>
                            {kr.current && (
                              <div className="ml-4 text-right">
                                <div className="text-lg font-bold text-blue-400">{kr.current}</div>
                                <div className="text-xs text-gray-400">Current</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Experiments */}
            {roadmap.experiments && roadmap.experiments.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Growth Experiments (ICE Scoring)</h2>
                </div>
                <div className="space-y-3">
                  {roadmap.experiments
                    .sort((a: any, b: any) => (b.iceScore || 0) - (a.iceScore || 0))
                    .map((exp: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                exp.category === 'Acquisition' ? 'bg-blue-500/20 text-blue-300' :
                                exp.category === 'Activation' ? 'bg-green-500/20 text-green-300' :
                                exp.category === 'Retention' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-pink-500/20 text-pink-300'
                              }`}>
                                {exp.category}
                              </span>
                              <span className="text-xs text-gray-400">{exp.timeline}</span>
                            </div>
                            <div className="text-lg font-bold text-white mb-2">{exp.hypothesis}</div>
                            <div className="text-sm text-gray-300 mb-2">{exp.description}</div>
                            <div className="text-sm text-green-400 mb-2">✅ Success: {exp.successCriteria}</div>
                            <div className="flex gap-4 text-sm">
                              <span className="text-blue-400">Impact: {exp.impact}/10</span>
                              <span className="text-green-400">Confidence: {exp.confidence}/10</span>
                              <span className="text-yellow-400">Ease: {exp.ease}/10</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-4xl font-bold text-purple-400">{exp.iceScore}</div>
                            <div className="text-xs text-gray-400">ICE Score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 90-Day Roadmap */}
            {roadmap.roadmap && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-cyan-400" />
                  <h2 className="text-3xl font-bold text-white">90-Day Execution Plan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['month1', 'month2', 'month3'].map((month, idx) => {
                    const monthData = roadmap.roadmap[month];
                    if (!monthData) return null;

                    return (
                      <div key={month} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/20">
                        <div className="text-2xl font-bold text-white mb-2">Month {idx + 1}</div>
                        <div className="text-sm text-cyan-400 mb-4">{monthData.theme}</div>
                        <div className="space-y-2">
                          {monthData.milestones?.map((milestone: string, i: number) => (
                            <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-cyan-400">✓</span>
                              <span>{milestone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resources */}
            {roadmap.resources && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">Resource Allocation</h2>
                </div>
                
                {roadmap.resources.budgetBreakdown && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">💰 Budget Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {roadmap.resources.budgetBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">{item.channel}</div>
                          <div className="text-2xl font-bold text-green-400">{item.amount}</div>
                          <div className="text-xs text-gray-500">{item.percentage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roadmap.resources.teamNeeds && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">👥 Team Needs</h3>
                      <div className="space-y-2">
                        {roadmap.resources.teamNeeds.map((need: string, idx: number) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                            {need}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {roadmap.resources.toolsRequired && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">🛠️ Tools Required</h3>
                      <div className="space-y-2">
                        {roadmap.resources.toolsRequired.map((tool: string, idx: number) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                            {tool}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
