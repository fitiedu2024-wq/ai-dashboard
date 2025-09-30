'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  full_name?: string
  quota: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

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
          <h1 className="text-xl font-bold">AI Marketing Dashboard</h1>
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
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Welcome, {user?.full_name || user?.email}
          </h2>
          <p className="text-gray-600">
            You have <span className="font-bold text-blue-600">{user?.quota}</span> jobs available
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Create New Job</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter domain name"
              className="flex-1 px-4 py-2 border rounded"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Analyze
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
