'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

export default function Login() {
  const [email, setEmail] = useState('3ayoty@gmail.com')
  const [password, setPassword] = useState('ALI@TIA@20')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // OAuth2 expects form data, not JSON
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      router.push('/dashboard')
    } catch (err) {
      setError('Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Grinners</h1>
          <p className="text-gray-600 text-sm mt-1">Marketing Dashboard</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          Admin credentials pre-filled
        </p>
      </div>
    </div>
  )
}
