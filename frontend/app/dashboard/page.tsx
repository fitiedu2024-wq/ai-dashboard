'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

interface User {
  email: string
  full_name?: string
  quota: number
  role: string
}

interface Job {
  id: string
  domain: string
  status: string
  created_at: string
  progress: number
  pages_analyzed: number
  insights?: {
    total_pages: number
    seo_score: number
    performance_score: number
    accessibility_score: number
    keywords: string[]
    recommendations: string[]
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  const fetchJobs = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (err) {
      console.error('Failed to fetch jobs')
    }
  }

  useEffect(() => {
    fetchUser().then(() => {
      fetchJobs()
      setLoading(false)
    })
    
    const interval = setInterval(fetchJobs, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleAnalyze = async () => {
    if (!domain) return
    setAnalyzing(true)
    
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain, max_pages: 150 }),
      })
      
      if (res.ok) {
        setDomain('')
        await fetchJobs()
        await fetchUser()
      }
    } catch (err) {
      alert('Failed to create job')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">AI Marketing Dashboard</h1>
            <p className="text-sm text-gray-600">{user?.role === 'admin' ? '👑 Admin' : 'User'}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              router.push('/login')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Quota Remaining</h3>
            <p className="text-3xl font-bold text-blue-600">{user?.quota}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Total Jobs</h3>
            <p className="text-3xl font-bold text-green-600">{jobs.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">
              {jobs.filter(j => j.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="font-semibold mb-4 text-lg">Create New Analysis</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., fitiedu.com)"
              className="flex-1 px-4 py-3 border rounded-lg"
              disabled={analyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !domain}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {analyzing ? 'Creating...' : 'Analyze'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Analysis History</h3>
          </div>
          
          <div className="divide-y">
            {jobs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No analysis yet. Create your first one above!
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{job.domain}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {job.status === 'processing' && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {job.pages_analyzed} / 150 pages analyzed
                      </p>
                    </div>
                  )}

                  {job.insights && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-gray-600">SEO Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {job.insights.seo_score}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Performance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {job.insights.performance_score}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Accessibility</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {job.insights.accessibility_score}
                        </p>
                      </div>
                      
                      <div className="col-span-3 mt-4">
                        <h5 className="font-semibold mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {job.insights.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
