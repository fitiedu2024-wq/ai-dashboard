'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Building2, Users, Target, Lightbulb, TrendingUp, Info } from 'lucide-react';
import { useToast } from '../../lib/toast';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS', icon: '💻', description: 'Software as a Service' },
  { value: 'ecom', label: 'E-Commerce', icon: '🛍️', description: 'Online Store' },
  { value: 'local', label: 'Local Business', icon: '🏪', description: 'Local Services' },
  { value: 'agency', label: 'Agency', icon: '🎨', description: 'Marketing/Design Agency' },
  { value: 'course', label: 'Course Creator', icon: '📚', description: 'Online Education' },
  { value: 'general', label: 'General', icon: '🌐', description: 'Other Business' }
];

export default function BusinessIntel() {
  const [domain, setDomain] = useState('');
  const [businessType, setBusinessType] = useState('general');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business-intel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, business_type: businessType })
      });

      const data = await response.json();
      
      if (data.error) {
        showError('Error', data.error);
      } else {
        const analysisData = data.data?.data || data.data || data;
        setResults(analysisData);
        success('Analysis Complete', 'Business intelligence generated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to analyze business');
    }
    setLoading(false);
  };

  const analysis = results?.analysis;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Business Intelligence
        </h1>
        <p className="text-gray-200 text-lg mb-8">Deep business analysis with brand archetypes and buyer personas</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-blue-400/30 bg-blue-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What is Business Intelligence Analysis?</h3>
              <p className="text-gray-300 mb-3">
                This AI-powered analysis provides deep insights into your business, including brand archetype identification,
                psychographic profiling, Jobs to Be Done framework, and detailed buyer personas tailored to your industry.
              </p>
              <div className="text-sm text-gray-400 space-y-2">
                <div><strong className="text-green-400">You'll Get:</strong></div>
                <ul className="ml-4 space-y-1">
                  <li>🎭 Brand Archetype Analysis (12 archetypes)</li>
                  <li>🧠 Psychographic Profiling (values, fears, desires)</li>
                  <li>🎯 Jobs to Be Done Framework</li>
                  <li>👥 3 Detailed Buyer Personas</li>
                  <li>💡 Strategic Insights & Quick Wins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-blue-300">Business Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBusinessType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    businessType === type.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-blue-400/50'
                  }`}
                  disabled={loading}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-bold text-white text-sm">{type.label}</div>
                  <div className="text-xs text-gray-400">{type.description}</div>
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-blue-300">Website Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Sparkles className="w-5 h-5" />Analyze Business</>}
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Company Profile */}
            {analysis.profile && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-8 h-8 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">Company Profile</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Company Name</div>
                    <div className="text-white font-bold">{analysis.profile.name}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Industry</div>
                    <div className="text-white font-bold">{analysis.profile.industry}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Business Model</div>
                    <div className="text-white font-bold">{analysis.profile.businessModel}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Target Audience</div>
                    <div className="text-white font-bold">{analysis.profile.targetAudience}</div>
                  </div>
                </div>
                <div className="mt-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                  <div className="text-sm text-gray-400 mb-2">Unique Value Proposition</div>
                  <div className="text-white">{analysis.profile.uniqueValueProposition}</div>
                </div>
              </div>
            )}

            {/* Brand Archetype */}
            {analysis.brandArchetype && (
              <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Brand Archetype</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30 mb-6">
                  <div className="text-4xl font-bold text-white mb-2">{analysis.brandArchetype.primary}</div>
                  <div className="text-gray-300">{analysis.brandArchetype.reasoning}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">✅ Messaging Dos</h3>
                    <div className="space-y-2">
                      {analysis.brandArchetype.messagingDos?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">❌ Messaging Don'ts</h3>
                    <div className="space-y-2">
                      {analysis.brandArchetype.messagingDonts?.map((item: string, idx: number) => (
                        <div key={idx} className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-gray-300 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Psychographics */}
            {analysis.psychographics && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">Psychographic Profile</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">💎 Core Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.psychographics.coreValues?.map((value: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">😰 Hidden Fears</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.psychographics.hiddenFears?.map((fear: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm">
                          {fear}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">✨ Deep Desires</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.psychographics.deepDesires?.map((desire: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                          {desire}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">🎯 Buying Triggers</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.psychographics.buyingTriggers?.map((trigger: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs to Be Done */}
            {analysis.jobsToBeDone && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">Jobs to Be Done</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">⚙️ Functional Jobs</h3>
                    <div className="space-y-2">
                      {analysis.jobsToBeDone.functional?.map((job: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {job}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">❤️ Emotional Jobs</h3>
                    <div className="space-y-2">
                      {analysis.jobsToBeDone.emotional?.map((job: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {job}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">👥 Social Jobs</h3>
                    <div className="space-y-2">
                      {analysis.jobsToBeDone.social?.map((job: string, idx: number) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl text-gray-300 text-sm">
                          {job}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Personas */}
            {analysis.buyerPersonas && analysis.buyerPersonas.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-pink-400" />
                  <h2 className="text-3xl font-bold text-white">Buyer Personas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analysis.buyerPersonas.map((persona: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6 rounded-xl border border-pink-500/20">
                      <div className="text-2xl font-bold text-white mb-2">{persona.name}</div>
                      <div className="text-sm text-gray-400 mb-4">{persona.role}</div>
                      <div className="text-sm text-gray-300 mb-4">{persona.demographics}</div>
                      
                      <div className="mb-3">
                        <div className="text-xs font-bold text-green-400 mb-2">Goals:</div>
                        <div className="space-y-1">
                          {persona.goals?.slice(0, 3).map((goal: string, i: number) => (
                            <div key={i} className="text-xs text-gray-300">• {goal}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs font-bold text-red-400 mb-2">Challenges:</div>
                        <div className="space-y-1">
                          {persona.challenges?.slice(0, 3).map((challenge: string, i: number) => (
                            <div key={i} className="text-xs text-gray-300">• {challenge}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {analysis.insights?.quickWins && (
              <div className="glass rounded-2xl p-8 border-2 border-green-400/50">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">Quick Wins (ICE Scoring)</h2>
                </div>
                <div className="space-y-3">
                  {analysis.insights.quickWins.map((win: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-bold mb-1">{win.description}</div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-400">Impact: {win.impact}/10</span>
                          <span className="text-green-400">Confidence: {win.confidence}/10</span>
                          <span className="text-yellow-400">Ease: {win.ease}/10</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">{win.iceScore}</div>
                        <div className="text-xs text-gray-400">ICE Score</div>
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
