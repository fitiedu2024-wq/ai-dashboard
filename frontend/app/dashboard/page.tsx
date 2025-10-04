'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

const MARKETING_QUOTES = [
  { quote: "The aim of marketing is to know and understand the customer so well the product or service fits them and sells itself.", author: "Philip Kotler" },
  { quote: "Content is fire. Social media is gasoline.", author: "Jay Baer" },
  { quote: "Marketing is no longer about the stuff that you make, but about the stories you tell.", author: "Seth Godin" },
  { quote: "Don't be afraid to get creative and experiment with your marketing.", author: "Mike Volpe" },
  { quote: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
]

interface User {
  id: number
  email: string
  full_name?: string
  role: string
  quota: number
}

interface Job {
  id: number
  domain: string
  status: string
  created_at: string
  completed_at?: string
  results?: any
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [quote] = useState(() => MARKETING_QUOTES[Math.floor(Math.random() * MARKETING_QUOTES.length)])
  const router = useRouter()

  const fetchJobs = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setUser(data)
        if (data.role === 'admin') {
          router.push('/admin')
        }
        setLoading(false)
        fetchJobs(token)
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    setAnalyzing(true)

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: domain.trim() }),
      })

      if (res.ok) {
        alert('Analysis completed successfully!')
        setDomain('')
        
        const userRes = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        
        fetchJobs(token)
      } else {
        const error = await res.json()
        alert(error.detail || 'Analysis failed')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getQuotaPercentage = () => Math.min((user?.quota || 0) / 999 * 100, 100)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-blue-900">
        <Logo className="w-24 h-24 animate-pulse mb-4" />
        <p className="text-white text-lg mt-6">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-white">Grinners.ai</h1>
                <p className="text-sm text-purple-300">Crafting Smiles through Marketing</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/login')
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium shadow-lg transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-2">
            {getGreeting()}, {user?.full_name || user?.email.split('@')[0]}!
          </h2>
          <p className="text-purple-200 text-lg mb-6">Ready to revolutionize your marketing?</p>

          <div className="p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border-l-4 border-purple-400">
            <p className="text-white text-xl italic mb-4">{quote.quote}</p>
            <p className="text-purple-300 font-bold text-right">— {quote.author}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-400/30">
            <p className="text-purple-200 text-sm uppercase mb-2">Quota</p>
            <p className="text-5xl font-bold text-white">{user?.quota}</p>
            <div className="mt-4 h-3 bg-black/30 rounded-full">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${getQuotaPercentage()}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-400/30">
            <p className="text-green-200 text-sm uppercase mb-2">Total</p>
            <p className="text-5xl font-bold text-white">{jobs.length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-blue-400/30">
            <p className="text-blue-200 text-sm uppercase mb-2">Completed</p>
            <p className="text-5xl font-bold text-white">{jobs.filter(j => j.status === 'completed').length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-6">Launch Analysis</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., fitiedu.com)"
              className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-purple-200 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || user?.quota === 0}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-2xl transition transform hover:scale-105 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-6">Analysis History</h3>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎯</span>
              <p className="text-purple-200 text-lg">No analyses yet. Launch your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {job.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white">{job.domain}</h4>
                        <p className="text-sm text-purple-300">{new Date(job.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-5 py-2 rounded-full text-sm font-bold ${
                        job.status === 'completed' 
                          ? 'bg-green-500/20 text-green-300 border border-green-400/50' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                      }`}>
                        {job.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                      </span>
                      {job.results && (
                        <button
                          onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
                        >
                          {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {job.results && job.results.scores && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-purple-300 text-sm mb-1">SEO Score</p>
                          <p className="text-3xl font-bold text-white">{job.results.scores.seo_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm mb-1">Performance</p>
                          <p className="text-3xl font-bold text-white">{job.results.scores.performance_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm mb-1">Marketing</p>
                          <p className="text-3xl font-bold text-white">{job.results.scores.marketing_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm mb-1">Overall</p>
                          <p className="text-3xl font-bold text-white">{job.results.scores.overall_score}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob?.id === job.id && job.results && (
                    <div className="mt-6 space-y-6">
                      {job.results.platform && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <h5 className="text-lg font-bold text-white mb-3">🏗️ Platform Detection</h5>
                          <p className="text-purple-200 mb-2">
                            <span className="font-semibold">Primary Platform:</span> {job.results.platform.primary_platform}
                          </p>
                          {job.results.platform.detected_platforms.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {job.results.platform.detected_platforms.map((p: string) => (
                                <span key={p} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {job.results.trackers && job.results.trackers.active_count > 0 && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <h5 className="text-lg font-bold text-white mb-3">📊 Marketing Trackers ({job.results.trackers.active_count})</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(job.results.trackers.trackers || {}).map(([name, data]: [string, any]) => {
                              if (!data.active) return null
                              return (
                                <div key={name} className="p-4 bg-purple-700/30 rounded-lg border border-purple-500/30">
                                  <p className="text-white font-semibold mb-2 capitalize">{name.replace(/_/g, ' ')}</p>
                                  {data.ids && data.ids.length > 0 ? (
                                    <div className="space-y-1">
                                      {data.ids.map((id: string, idx: number) => (
                                        <code key={idx} className="block text-xs bg-black/40 px-3 py-1.5 rounded text-green-300 font-mono">
                                          {id}
                                        </code>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400">ID not detected</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {job.results.competitors && job.results.competitors.length > 0 && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <h5 className="text-lg font-bold text-white mb-4">🏢 Competitors ({job.results.competitors.length})</h5>
                          <div className="space-y-4">
                            {job.results.competitors.map((comp: any, idx: number) => (
                              <div key={idx} className="p-5 bg-gradient-to-r from-purple-700/20 to-blue-700/20 rounded-lg border border-purple-500/30">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-lg hover:text-purple-300">
                                      {comp.domain}
                                    </a>
                                    <p className="text-purple-200 text-sm mt-1">{comp.title}</p>
                                  </div>
                                  {comp.relevance_score && (
                                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold ml-4">
                                      Score: {comp.relevance_score}
                                    </span>
                                  )}
                                </div>
                                {comp.snippet && <p className="text-gray-300 text-sm mb-3 italic">{comp.snippet}</p>}
                                {comp.pages && comp.pages.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-purple-500/30">
                                    <p className="text-xs text-purple-300 font-semibold mb-3">Analyzed Pages:</p>
                                    <div className="space-y-2">
                                      {comp.pages.map((page: any, pidx: number) => (
                                        <div key={pidx} className="p-3 bg-black/30 rounded border border-white/10">
                                          <p className="text-white font-medium text-sm">{page.title}</p>
                                          {page.h1 && <p className="text-purple-300 text-xs mt-1">H1: {page.h1}</p>}
                                          {page.description && <p className="text-gray-400 text-xs mt-2">{page.description.substring(0, 120)}...</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.results.recommendations && job.results.recommendations.length > 0 && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <h5 className="text-lg font-bold text-white mb-4">💡 AI Recommendations</h5>
                          <div className="space-y-3">
                            {job.results.recommendations.map((rec: any, idx: number) => (
                              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                                rec.priority === 'critical' ? 'bg-red-500/10 border-red-500' :
                                rec.priority === 'high' ? 'bg-orange-500/10 border-orange-500' :
                                'bg-blue-500/10 border-blue-500'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-bold text-purple-300">{rec.category}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    rec.priority === 'critical' ? 'bg-red-500 text-white' :
                                    rec.priority === 'high' ? 'bg-orange-500 text-white' :
                                    'bg-blue-500 text-white'
                                  }`}>
                                    {rec.priority}
                                  </span>
                                </div>
                                <p className="text-white font-semibold mb-1">{rec.issue}</p>
                                <p className="text-purple-200 text-sm mb-2">{rec.recommendation}</p>
                                <p className="text-green-300 text-xs">Impact: {rec.impact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
