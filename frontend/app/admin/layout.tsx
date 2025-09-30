'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
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
      .then(user => {
        if (user.role !== 'admin') {
          router.push('/dashboard')
        } else {
          setLoading(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">AI Grinners - Admin Panel</h1>
              <p className="text-purple-100 text-sm">System Management</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/login')
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <Link href="/admin" className="px-4 py-3 border-b-2 border-purple-600 font-medium text-purple-600">
              Dashboard
            </Link>
            <Link href="/admin/users" className="px-4 py-3 border-b-2 border-transparent hover:border-purple-300 font-medium text-gray-600 hover:text-purple-600">
              Users
            </Link>
            <Link href="/admin/activity" className="px-4 py-3 border-b-2 border-transparent hover:border-purple-300 font-medium text-gray-600 hover:text-purple-600">
              Activity Logs
            </Link>
            <Link href="/dashboard" className="px-4 py-3 border-b-2 border-transparent hover:border-purple-300 font-medium text-gray-600 hover:text-purple-600">
              User View
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
