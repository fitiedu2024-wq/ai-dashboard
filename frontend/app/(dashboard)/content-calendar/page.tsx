'use client';

import { useState } from 'react';
import { Calendar, Loader2, FileText, Users, Target, TrendingUp, Info } from 'lucide-react';
import { useToast } from '../../lib/toast';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS', icon: '💻' },
  { value: 'ecom', label: 'E-Commerce', icon: '🛍️' },
  { value: 'local', label: 'Local Business', icon: '🏪' },
  { value: 'agency', label: 'Agency', icon: '🎨' },
  { value: 'course', label: 'Course Creator', icon: '📚' },
  { value: 'general', label: 'General', icon: '🌐' }
];

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'blue' },
  { key: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'sky' },
  { key: 'instagram', name: 'Instagram', icon: '📸', color: 'pink' },
  { key: 'tiktok', name: 'TikTok', icon: '🎵', color: 'purple' },
  { key: 'facebook', name: 'Facebook', icon: '👥', color: 'indigo' }
];

export default function ContentCalendar() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content-calendar`, {
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
        const calendarData = data.data?.data || data.data || data;
        setResults(calendarData);
        success('Calendar Generated', '90-day content plan created successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to generate content calendar');
    }
    setLoading(false);
  };

  const calendar = results?.calendar;

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
          Content Calendar
        </h1>
        <p className="text-gray-200 text-lg mb-8">90-day content strategy with social posts and ad concepts</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-orange-400/30 bg-orange-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What You'll Get</h3>
              <p className="text-gray-300 mb-3">
                A complete 90-day content marketing plan tailored to your business, including content pillars,
                funnel-optimized content ideas, social media posts for 5 platforms, and ad concepts.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <div className="font-bold text-blue-300 mb-1">📚 Content Pillars</div>
                  <div className="text-gray-400 text-xs">4 core themes</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <div className="font-bold text-green-300 mb-1">🎯 Content Funnel</div>
                  <div className="text-gray-400 text-xs">15 ideas (ToFu/MoFu/BoFu)</div>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <div className="font-bold text-purple-300 mb-1">📱 Social Posts</div>
                  <div className="text-gray-400 text-xs">25 posts (5 platforms)</div>
                </div>
                <div className="bg-pink-500/10 p-3 rounded-xl border border-pink-500/20">
                  <div className="font-bold text-pink-300 mb-1">💰 Ad Concepts</div>
                  <div className="text-gray-400 text-xs">5 ready-to-use ads</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-orange-300">Business Type</label>
            <div className="flex flex-wrap gap-3 mb-6">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setBusinessType(type.value)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    businessType === type.value
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-white/20 bg-white/5 hover:border-orange-400/50'
                  }`}
                  disabled={loading}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-white text-sm font-bold">{type.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-3 text-orange-300">Website Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !domain}
            className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Calendar...</> : <><Calendar className="w-5 h-5" />Generate Calendar</>}
          </button>
        </div>

        {/* Results */}
        {calendar && (
          <div className="space-y-6">
            {/* Content Pillars */}
            {calendar.pillars && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">Content Pillars</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calendar.pillars.map((pillar: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
                      <div className="text-2xl font-bold text-white mb-2">{pillar.name}</div>
                      <div className="text-gray-300 mb-3">{pillar.description}</div>
                      <div className="flex flex-wrap gap-2">
                        {pillar.keywords?.map((kw: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Funnel */}
            {calendar.contentFunnel && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-bold text-white">Content Funnel</h2>
                </div>
                
                {['tofu', 'mofu', 'bofu'].map((stage) => {
                  const stageData = calendar.contentFunnel[stage];
                  if (!stageData || stageData.length === 0) return null;
                  
                  const stageInfo = {
                    tofu: { title: 'Top of Funnel (Awareness)', color: 'blue', icon: '🎯' },
                    mofu: { title: 'Middle of Funnel (Consideration)', color: 'yellow', icon: '🤔' },
                    bofu: { title: 'Bottom of Funnel (Conversion)', color: 'green', icon: '💰' }
                  }[stage];

                  return (
                    <div key={stage} className="mb-6">
                      <h3 className={`text-xl font-bold text-${stageInfo?.color}-400 mb-4`}>
                        {stageInfo?.icon} {stageInfo?.title}
                      </h3>
                      <div className="space-y-3">
                        {stageData.map((content: any, idx: number) => (
                          <div key={idx} className="bg-white/5 p-4 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="text-lg font-bold text-white mb-1">{content.title}</div>
                                <div className="text-sm text-gray-400 mb-2">{content.type}</div>
                                <div className="text-sm text-gray-300 mb-2">{content.description}</div>
                                {content.viralHook && (
                                  <div className="text-sm text-green-400 mb-1">🎣 Hook: {content.viralHook}</div>
                                )}
                                {content.emotionalTrigger && (
                                  <div className="text-sm text-purple-400">💜 Trigger: {content.emotionalTrigger}</div>
                                )}
                              </div>
                              {content.estimatedTraffic && (
                                <div className="ml-4 text-right">
                                  <div className="text-2xl font-bold text-blue-400">{content.estimatedTraffic}</div>
                                  <div className="text-xs text-gray-400">Est. Traffic</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Social Media Posts */}
            {calendar.socialPosts && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-pink-400" />
                  <h2 className="text-3xl font-bold text-white">Social Media Posts</h2>
                </div>
                
                <div className="space-y-6">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const posts = calendar.socialPosts[platform.key];
                    if (!posts || posts.length === 0) return null;

                    return (
                      <div key={platform.key}>
                        <h3 className={`text-xl font-bold text-${platform.color}-400 mb-4 flex items-center gap-2`}>
                          <span>{platform.icon}</span>
                          <span>{platform.name}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {posts.slice(0, 5).map((post: any, idx: number) => (
                            <div key={idx} className={`bg-${platform.color}-500/10 p-4 rounded-xl border border-${platform.color}-500/20`}>
                              {post.hook && (
                                <div className="text-sm font-bold text-white mb-2">🎣 {post.hook}</div>
                              )}
                              <div className="text-gray-300 mb-3 whitespace-pre-wrap">{post.content}</div>
                              {post.hashtags && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {post.hashtags.map((tag: string, i: number) => (
                                    <span key={i} className={`text-${platform.color}-400 text-xs`}>#{tag}</span>
                                  ))}
                                </div>
                              )}
                              {post.bestTime && (
                                <div className="text-xs text-gray-400">⏰ Best time: {post.bestTime}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ad Concepts */}
            {calendar.adConcepts && calendar.adConcepts.length > 0 && (
              <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Ad Concepts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calendar.adConcepts.map((ad: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-bold">
                          {ad.platform}
                        </span>
                        <span className="text-green-400 text-sm">{ad.expectedCtr}</span>
                      </div>
                      <div className="text-xl font-bold text-white mb-2">{ad.headline}</div>
                      <div className="text-gray-300 mb-3">{ad.description}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">👥 {ad.targetAudience}</span>
                        <span className="text-blue-400 font-bold">{ad.budget}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 90-Day Schedule */}
            {calendar.schedule && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-cyan-400" />
                  <h2 className="text-3xl font-bold text-white">90-Day Schedule</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['month1', 'month2', 'month3'].map((month, idx) => {
                    const monthData = calendar.schedule[month];
                    if (!monthData || monthData.length === 0) return null;

                    return (
                      <div key={month} className="bg-white/5 p-6 rounded-xl">
                        <div className="text-2xl font-bold text-white mb-4">Month {idx + 1}</div>
                        <div className="space-y-2">
                          {monthData.map((item: string, i: number) => (
                            <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-cyan-400">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
