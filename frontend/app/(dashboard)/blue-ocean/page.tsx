'use client';

import { useState } from 'react';
import { Waves, Loader2, TrendingUp, Target, Lightbulb, Info } from 'lucide-react';
import { useToast } from '../../lib/toast';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS', icon: '💻' },
  { value: 'ecom', label: 'E-Commerce', icon: '🛍️' },
  { value: 'local', label: 'Local Business', icon: '🏪' },
  { value: 'agency', label: 'Agency', icon: '🎨' },
  { value: 'course', label: 'Course Creator', icon: '📚' },
  { value: 'general', label: 'General', icon: '🌐' }
];

export default function BlueOcean() {
  const [domain, setDomain] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [industry, setIndustry] = useState('');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blue-ocean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, business_type: businessType, industry: industry || undefined })
      });

      const data = await response.json();
      
      if (data.error) {
        showError('Error', data.error);
      } else {
        const blueOceanData = data.data?.data || data.data || data;
        setResults(blueOceanData);
        success('Analysis Complete', 'Blue Ocean Strategy generated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to generate Blue Ocean Strategy');
    }
    setLoading(false);
  };

  const strategy = results?.blueOcean;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Blue Ocean Strategy
        </h1>
        <p className="text-gray-200 text-lg mb-8">Find uncontested market space and make competition irrelevant</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-cyan-400/30 bg-cyan-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What is Blue Ocean Strategy?</h3>
              <p className="text-gray-300 mb-4">
                Blue Ocean Strategy is about creating new market space (blue ocean) instead of competing in existing markets (red ocean).
                It uses the Four Actions Framework to systematically create value innovation.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <div className="font-bold text-red-300 mb-1">❌ ELIMINATE</div>
                  <div className="text-gray-400 text-xs">Remove industry standards</div>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                  <div className="font-bold text-yellow-300 mb-1">⬇️ REDUCE</div>
                  <div className="text-gray-400 text-xs">Below industry level</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <div className="font-bold text-green-300 mb-1">⬆️ RAISE</div>
                  <div className="text-gray-400 text-xs">Above industry level</div>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <div className="font-bold text-blue-300 mb-1">✨ CREATE</div>
                  <div className="text-gray-400 text-xs">Never offered before</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-cyan-300">Business Type</label>
            <div className="flex flex-wrap gap-3 mb-6">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBusinessType(type.value)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    businessType === type.value
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/20 bg-white/5 hover:border-cyan-400/50'
                  }`}
                  disabled={loading}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-white text-sm font-bold">{type.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-cyan-300">Website Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none mb-4"
              disabled={loading}
            />

            <label className="block text-sm font-bold mb-3 text-cyan-300">Industry (Optional)</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., SaaS, E-commerce, Healthcare"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Waves className="w-5 h-5" />Find Blue Ocean</>}
          </button>
        </div>

        {/* Results */}
        {strategy && (
          <div className="space-y-6">
            {/* Red Ocean vs Blue Ocean */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Red Ocean */}
              {strategy.currentRedOcean && (
                <div className="glass rounded-2xl p-8 border-2 border-red-400/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🔴</div>
                    <h2 className="text-3xl font-bold text-white">Current Red Ocean</h2>
                  </div>
                  <div className="text-gray-300 mb-4">{strategy.currentRedOcean.description}</div>
                  {strategy.currentRedOcean.painPoints && (
                    <div>
                      <div className="text-sm font-bold text-red-400 mb-2">Pain Points:</div>
                      <div className="space-y-2">
                        {strategy.currentRedOcean.painPoints.map((pain: string, idx: number) => (
                          <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{pain}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strategy.currentRedOcean.competitiveIntensity && (
                    <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl inline-block">
                      <span className="text-red-300 font-bold">Competition: {strategy.currentRedOcean.competitiveIntensity}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Blue Ocean */}
              {strategy.potentialBlueOcean && (
                <div className="glass rounded-2xl p-8 border-2 border-blue-400/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🔵</div>
                    <h2 className="text-3xl font-bold text-white">Potential Blue Ocean</h2>
                  </div>
                  <div className="text-gray-300 mb-4">{strategy.potentialBlueOcean.description}</div>
                  {strategy.potentialBlueOcean.whyUnderserved && (
                    <div className="mb-4">
                      <div className="text-sm font-bold text-blue-400 mb-2">Why Underserved:</div>
                      <div className="text-sm text-gray-300">{strategy.potentialBlueOcean.whyUnderserved}</div>
                    </div>
                  )}
                  {strategy.potentialBlueOcean.marketSize && (
                    <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl inline-block">
                      <span className="text-blue-300 font-bold">Market Size: {strategy.potentialBlueOcean.marketSize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Four Actions Framework */}
            {strategy.fourActions && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Four Actions Framework</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Eliminate */}
                  <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                    <h3 className="text-2xl font-bold text-red-400 mb-4">❌ ELIMINATE</h3>
                    <p className="text-sm text-gray-400 mb-3">Factors the industry takes for granted</p>
                    <div className="space-y-2">
                      {strategy.fourActions.eliminate?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reduce */}
                  <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">⬇️ REDUCE</h3>
                    <p className="text-sm text-gray-400 mb-3">Below industry standard</p>
                    <div className="space-y-2">
                      {strategy.fourActions.reduce?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raise */}
                  <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                    <h3 className="text-2xl font-bold text-green-400 mb-4">⬆️ RAISE</h3>
                    <p className="text-sm text-gray-400 mb-3">Above industry standard</p>
                    <div className="space-y-2">
                      {strategy.fourActions.raise?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create */}
                  <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">✨ CREATE</h3>
                    <p className="text-sm text-gray-400 mb-3">Never offered before</p>
                    <div className="space-y-2">
                      {strategy.fourActions.create?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Move */}
            {strategy.strategicMove && (
              <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Strategic Move</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30 mb-6">
                  <div className="text-gray-300 mb-4">{strategy.strategicMove.actionPlan}</div>
                  {strategy.strategicMove.timeline && (
                    <div className="text-sm text-purple-400 mb-3">⏱️ Timeline: {strategy.strategicMove.timeline}</div>
                  )}
                </div>
                
                {strategy.strategicMove.milestones && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">Milestones</h3>
                    <div className="space-y-2">
                      {strategy.strategicMove.milestones.map((milestone: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-purple-400">✓</span>
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.strategicMove.expectedOutcomes && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Expected Outcomes</h3>
                    <div className="space-y-2">
                      {strategy.strategicMove.expectedOutcomes.map((outcome: string, idx: number) => (
                        <div key={idx} className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-green-300 text-sm">
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Positioning */}
            {strategy.positioning && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                  <h2 className="text-3xl font-bold text-white">Competitive Positioning</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 p-6 rounded-xl">
                    <div className="text-sm text-gray-400 mb-2">Current Position</div>
                    <div className="text-white">{strategy.positioning.currentPosition}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl">
                    <div className="text-sm text-gray-400 mb-2">Target Position</div>
                    <div className="text-white">{strategy.positioning.targetPosition}</div>
                  </div>
                </div>
                
                {strategy.positioning.differentiators && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">Key Differentiators</h3>
                    <div className="flex flex-wrap gap-2">
                      {strategy.positioning.differentiators.map((diff: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm">
                          {diff}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.positioning.positioningStatement && (
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 rounded-xl border border-cyan-500/30">
                    <div className="text-sm text-gray-400 mb-2">Positioning Statement</div>
                    <div className="text-xl text-white font-bold">{strategy.positioning.positioningStatement}</div>
                  </div>
                )}
              </div>
            )}

            {/* Market Gaps */}
            {strategy.marketGaps && strategy.marketGaps.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">Market Gaps & Opportunities</h2>
                </div>
                <div className="space-y-4">
                  {strategy.marketGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-white mb-2">{gap.description}</div>
                          <div className="text-sm text-gray-300 mb-2">{gap.howToExploit}</div>
                          {gap.estimatedImpact && (
                            <div className="text-sm text-green-400">💰 Impact: {gap.estimatedImpact}</div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          gap.opportunityLevel === 'High' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          gap.opportunityLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {gap.opportunityLevel}
                        </span>
                      </div>
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
