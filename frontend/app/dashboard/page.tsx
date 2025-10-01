'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  { quote: "Customers don't care about your solution. They care about their problems.", author: "Dave McClure" },
  { quote: "Marketing without data is like driving with your eyes closed.", author: "Dan Zarrella" },
  { quote: "Traditional marketing talks at people. Content marketing talks with them.", author: "Doug Kessler" },
  { quote: "Stop selling. Start helping.", author: "Zig Ziglar" },
  { quote: "People do not buy goods and services. They buy relations, stories and magic.", author: "Seth Godin" },
  { quote: "The consumer is not a moron. She's your wife.", author: "David Ogilvy" },
  { quote: "Content builds relationships. Relationships are built on trust. Trust drives revenue.", author: "Andrew Davis" },
  { quote: "Marketing is telling the world you're a rock star. Content Marketing is showing the world you are one.", author: "Robert Rose" },
  { quote: "Don't push people to where you want to be; meet them where they are.", author: "Meghan Keaney Anderson" },
  { quote: "Build something 100 people love, not something 1 million people kind of like.", author: "Brian Chesky" },
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
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [quote] = useState(() => MARKETING_QUOTES[Math.floor(Math.random() * MARKETING_QUOTES.length)])
  const router = useRouter()

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
      })
      .catch(() => router.push('/login'))

    setJobs([])
  }, [router])

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain')
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      alert('Analysis feature coming soon!')
      setAnalyzing(false)
    }, 2000)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getQuotaPercentage = () => {
    const maxQuota = 999
    return Math.min((user?.quota || 0) / maxQuota * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-blue-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-white opacity-20"></div>
        </div>
        <p className="text-white text-lg mt-6 animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-2xl font-bold text-white">AG</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Grinners</h1>
                <p className="text-sm text-purple-300">Marketing Intelligence Platform</p>
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
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-2">
                {getGreeting()}, {user?.full_name || user?.email.split('@')[0]}! 👋
              </h2>
              <p className="text-purple-200 text-lg">Ready to revolutionize your marketing strategy?</p>
            </div>
            {user?.role === 'admin' && (
              <span className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                👑 ADMIN
              </span>
            )}
          </div>

          <div className="mt-6 p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border-l-4 border-purple-400 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="text-6xl text-purple-400 opacity-30">"</span>
              <div className="flex-1 pl-4">
                <p className="text-white text-xl leading-relaxed font-light italic mb-4">
                  {quote.quote}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-400"></div>
                  <p className="text-purple-300 font-bold text-lg">— {quote.author}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-2">Quota Remaining</p>
                <p className="text-5xl font-bold text-white">{user?.quota}</p>
                <p className="text-purple-300 text-sm mt-1">analyses available</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
            <div className="mt-4 h-3 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: `${getQuotaPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-wider mb-2">Total Analyses</p>
                <p className="text-5xl font-bold text-white">{jobs.length}</p>
                <p className="text-green-300 text-sm mt-1">completed & pending</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:-rotate-12 transition-all duration-300">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Completed</p>
                <p className="text-5xl font-bold text-white">{jobs.filter(j => j.status === 'completed').length}</p>
                <p className="text-blue-300 text-sm mt-1">successful analyses</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-3xl font-bold text-white">Launch New Analysis</h3>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter your domain (e.g., fitiedu.com)"
              className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-200 text-lg backdrop-blur-sm transition-all"
              disabled={analyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || user?.quota === 0}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-2xl transition-all transform hover:scale-105 text-lg"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
          {user?.quota === 0 && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-sm font-semibold">⚠️ Quota limit reached. Contact administrator for more analyses.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-3xl font-bold text-white">Analysis History</h3>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block animate-bounce mb-6">
                <span className="text-8xl">🎯</span>
              </div>
              <p className="text-purple-200 text-xl font-light">No analyses yet. Launch your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {job.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white">{job.domain.toUpperCase()}</h4>
                        <p className="text-sm text-purple-300 mt-1">{new Date(job.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-lg ${
                      job.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/50' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                    }`}>
                      {job.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
