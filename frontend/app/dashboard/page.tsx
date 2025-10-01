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
  { quote: "Make your marketing so useful people would pay for it.", author: "Jay Baer" },
  { quote: "Good marketing makes the company look smart. Great marketing makes the customer feel smart.", author: "Joe Chernov" },
  { quote: "Social media is not just an activity; it is an investment of valuable time and resources.", author: "Sean Gardner" },
  { quote: "Your brand is what other people say about you when you're not in the room.", author: "Jeff Bezos" },
  { quote: "Marketing is really just about sharing your passion.", author: "Michael Hyatt" },
  { quote: "If you make customers unhappy in the physical world, they might each tell 6 friends. If you make customers unhappy on the Internet, they can each tell 6,000 friends.", author: "Jeff Bezos" },
  { quote: "Customers don't care about your solution. They care about their problems.", author: "Dave McClure" },
  { quote: "Marketing without data is like driving with your eyes closed.", author: "Dan Zarrella" },
  { quote: "Traditional marketing talks at people. Content marketing talks with them.", author: "Doug Kessler" },
  { quote: "Stop selling. Start helping.", author: "Zig Ziglar" },
  { quote: "People do not buy goods and services. They buy relations, stories and magic.", author: "Seth Godin" },
  { quote: "Marketing is a contest for people's attention.", author: "Seth Godin" },
  { quote: "The consumer is not a moron. She's your wife.", author: "David Ogilvy" },
  { quote: "I notice increasing reluctance on the part of marketing executives to use judgment; they are coming to rely too much on research, and they use it as a drunkard uses a lamp post for support, rather than for illumination.", author: "David Ogilvy" },
  { quote: "On the average, five times as many people read the headline as read the body copy. When you have written your headline, you have spent eighty cents out of your dollar.", author: "David Ogilvy" },
  { quote: "If it doesn't sell, it isn't creative.", author: "David Ogilvy" },
  { quote: "Advertising is what you pay for, publicity is what you pray for.", author: "Unknown" },
  { quote: "Content builds relationships. Relationships are built on trust. Trust drives revenue.", author: "Andrew Davis" },
  { quote: "Marketing is telling the world you're a rock star. Content Marketing is showing the world you are one.", author: "Robert Rose" },
  { quote: "The best way to engage honestly with the marketplace via Twitter is to never use the words 'engage,' 'honestly,' or 'marketplace.'", author: "Jeffrey Zeldman" },
  { quote: "Don't push people to where you want to be; meet them where they are.", author: "Meghan Keaney Anderson" },
  { quote: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
  { quote: "Build something 100 people love, not something 1 million people kind of like.", author: "Brian Chesky" },
  { quote: "Ideas are commodity. Execution of them is not.", author: "Michael Dell" },
  { quote: "Know what your customers want most and what your company does best. Focus on where those two meet.", author: "Kevin Stirtz" },
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
        const data = await res.json()
        alert('Analysis started successfully!')
        setDomain('')
        
        // Refresh user data and jobs
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
          {user?.quota === 0 && (
            <p className="text-red-300 text-sm mt-3">Quota limit reached. Contact admin for more.</p>
          )}
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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {job.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white">{job.domain}</h4>
                        <p className="text-sm text-purple-300">{new Date(job.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-full text-sm font-bold ${
                      job.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/50' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                    }`}>
                      {job.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                    </span>
                  </div>
                  {job.results && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-purple-300 text-sm">SEO Score</p>
                          <p className="text-2xl font-bold text-white">{job.results.seo_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm">Performance</p>
                          <p className="text-2xl font-bold text-white">{job.results.performance_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm">Content</p>
                          <p className="text-2xl font-bold text-white">{job.results.content_quality}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-300 text-sm">Social</p>
                          <p className="text-2xl font-bold text-white">{job.results.social_presence}</p>
                        </div>
                      </div>
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
