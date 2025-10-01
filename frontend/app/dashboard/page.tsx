'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

const MARKETING_QUOTES = [
  { quote: "The aim of marketing is to know and understand the customer so well the product or service fits them and sells itself.", author: "Philip Kotler" },
  { quote: "Content is fire. Social media is gasoline.", author: "Jay Baer" },
  { quote: "Marketing is no longer about the stuff that you make, but about the stories you tell.", author: "Seth Godin" },
  { quote: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { quote: "Good marketing makes the company look smart. Great marketing makes the customer feel smart.", author: "Joe Chernov" },
  { quote: "Marketing is really just about sharing your passion.", author: "Michael Hyatt" },
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
                <h1 className="text-2xl font-bold text-white">AI Grinners</h1>
                <p className="text-sm text-purple-300">Marketing Intelligence</p>
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
      </div>
    </div>
  )
}
